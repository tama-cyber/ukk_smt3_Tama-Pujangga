import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// Fungsi POST untuk menambahkan user baru (Mengatasi error 405)
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

    // Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        password, // Catatan: Jika ingin di-hash, bisa tambahkan bcrypt di sini
        role: role || 'admin',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Berhasil menambahkan user!',
      data: newUser,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error POST users:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan user ke database.' },
      { status: 500 }
    )
  }
}