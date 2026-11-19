import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs' // Wajib import bcrypt untuk keamanan password

// Fungsi GET untuk mengambil daftar user (Paginasi & List)
export async function GET(request: Request) {
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
      kodeUser: user.kodeUser, // <-- Tambahkan ini agar kode ADM/STF tampil di UI
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
    // LOGIKA AUTO NUMBER (ADM / STF)
    // ==========================================
    const userRole = role || 'admin' // Default ke admin jika role kosong
    const prefix = userRole === 'admin' ? 'ADM' : 'STF'

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
      const lastNumberString = lastUser.kodeUser.replace(prefix, '')
      nextNumber = parseInt(lastNumberString, 10) + 1
    }

    // 3. Format menjadi string 6 digit (contoh: ADM000001)
    const kodeUserBaru = `${prefix}${nextNumber.toString().padStart(6, '0')}`
    // ==========================================

    // 4. Hash password sebelum disimpan (SANGAT PENTING!)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        kodeUser: kodeUserBaru, // Masukkan kode yang sudah dibuat
        fullname,
        email,
        password: hashedPassword, // Simpan password yang sudah di-hash
        role: userRole,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Berhasil menambahkan user!',
      data: {
        id: newUser.id,
        kodeUser: newUser.kodeUser,
        fullname: newUser.fullname,
        role: newUser.role
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error POST users:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan user ke database.' },
      { status: 500 }
    )
  }
}