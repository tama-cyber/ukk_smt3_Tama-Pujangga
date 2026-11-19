import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs' // Wajib untuk keamanan password

// Fungsi GET untuk mengambil daftar user (Paginasi & List)
export async function GET(request: Request) {
  // Hanya yang sudah login yang boleh melihat daftar user
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const [rawUsers, totalUsers] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.user.count(),
    ])

    const users = rawUsers.map((user) => ({
      id: user.id,
      kodeUser: user.kodeUser, // agar kode ADM/STF tampil di UI
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      hasToken: Boolean(user.token),
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json({
      users,
      pagination: {
        totalUsers,
        page,
        pageSize,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
    })
  } catch (error) {
    console.error('Error GET users:', error)
    return NextResponse.json(
      { error: 'Gagal memuat user dari database.' },
      { status: 500 }
    )
  }
}

// Fungsi POST untuk menambahkan user baru
export async function POST(request: Request) {
  // Hanya admin yang boleh menambah user
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang boleh menambah user.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { fullname, email, password, role } = body

    // Validasi sederhana
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: 'Semua kolom wajib diisi!' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah digunakan oleh akun lain.' },
        { status: 400 }
      )
    }

    // ==========================================
    // LOGIKA AUTO NUMBER (ADM / STF) dengan if else
    // ==========================================
    let userRole: string
    let prefix: string

    if (role === 'admin') {
      // Role admin -> kode ADM
      userRole = 'admin'
      prefix = 'ADM'
    } else {
      // Selain admin (default) -> staff -> kode STF
      userRole = 'staff'
      prefix = 'STF'
    }

    // 1. Cari user terakhir dengan awalan yang sama (ADM atau STF)
    const lastUser = await prisma.user.findFirst({
      where: {
        kodeUser: { startsWith: prefix },
      },
      orderBy: { id: 'desc' },
    })

    // 2. Hitung nomor urut berikutnya
    let nextNumber = 1
    if (lastUser) {
      const lastNumber = parseInt(lastUser.kodeUser.replace(prefix, ''), 10)
      nextNumber = (Number.isNaN(lastNumber) ? 0 : lastNumber) + 1
    }

    // 3. Format menjadi 6 digit (contoh: ADM000001 / STF000001)
    const kodeUserBaru = `${prefix}${nextNumber.toString().padStart(6, '0')}`
    // ==========================================

    // 4. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        kodeUser: kodeUserBaru,
        fullname,
        email,
        password: hashedPassword,
        role: userRole,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Berhasil menambahkan user!',
        data: {
          id: newUser.id,
          kodeUser: newUser.kodeUser,
          fullname: newUser.fullname,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error POST users:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan user ke database.' },
      { status: 500 }
    )
  }
}