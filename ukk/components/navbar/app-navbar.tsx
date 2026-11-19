"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        // Muat ulang halaman penuh supaya status sesi langsung diperbarui
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat logout:", error)
    }
  }

  return (
    <div className="grid w-full grid-cols-3 items-center gap-4">
      {/* 1. KOLOM KIRI: Logo */}
      <div className="flex justify-start text-lg font-bold text-black dark:text-white">
        UKK SMT4
      </div>

      {/* 2. KOLOM TENGAH: Search Bar */}
      <div className="flex w-full justify-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="w-full pl-9"
          />
        </div>
      </div>

      {/* 3. KOLOM KANAN: hanya tombol Logout */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}