import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipe Context untuk Next.js 15+ (params berupa Promise)
type RouteContext = {
  params: Promise<{ id: string }>
}

// 1. GET: Mengambil detail satu user berdasarkan ID
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID user tidak valid.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user, // Menyediakan properti 'user' & 'data' agar cocok dengan berbagai versi form
      data: user,
    })
  } catch (error) {
    console.error('Error GET user by ID:', error)
    return NextResponse.json({ error: 'Gagal memuat detail user.' }, { status: 500 })
  }
}

// Fungsi bersama untuk menangani update (PUT & PATCH)
async function handleUpdateUser(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID user tidak valid.' }, { status: 400 })
    }

    const body = await request.json()
    const { fullname, email, password, role } = body

    if (!fullname || !email) {
      return NextResponse.json(
        { error: 'Nama lengkap dan email wajib diisi!' },
        { status: 400 }
      )
    }

    const updateData: {
      fullname: string
      email: string
      role?: string
      password?: string
    } = {
      fullname,
      email,
      role,
    }

    if (password && password.trim() !== '') {
      updateData.password = password
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Berhasil memperbarui data user!',
      user: updatedUser,
      data: updatedUser,
    })
  } catch (error: any) {
    console.error('Error Update user:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mengedit user ke database.' },
      { status: 500 }
    )
  }
}

// 2. PUT & PATCH: Mendukung kedua metode HTTP untuk edit
export async function PUT(request: Request, context: RouteContext) {
  return handleUpdateUser(request, context)
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleUpdateUser(request, context)
}

// 3. DELETE: Menghapus user berdasarkan ID
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID user tidak valid.' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Berhasil menghapus user!',
    })
  } catch (error) {
    console.error('Error DELETE user:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus user dari database.' },
      { status: 500 }
    )
  }
}