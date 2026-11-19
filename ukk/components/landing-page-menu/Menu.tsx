"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter()

  // Fungsi Logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat logout:', error)
    }
  }

  return (
    <div className="grid grid-cols-3 items-center w-full gap-4 px-4 py-3 border-b">
      
      {/* 1. KOLOM KIRI: Logo */}
      <div className="flex justify-start font-bold text-lg text-black dark:text-white">
        UKK SMT4 TESTT
      </div>

      {/* 2. KOLOM TENGAH: Search Bar */}
      <div className="flex justify-center w-full">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 w-full" 
          />
        </div>
      </div>

      {/* 3. KOLOM KANAN: Menu, Login (Link), & Logout */}
      <div className="flex justify-end items-center gap-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/admin" className={navigationMenuTriggerStyle()}>
                Dashboard
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Tombol Login diarahkan langsung ke halaman /login */}
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Login
        </Link>

        {/* Tombol Logout */}
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  )
}