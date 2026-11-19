'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

type ManagedUser = {
  id: number
  fullname: string
  email: string
  role: string
  hasToken: boolean
  createdAt: string
}

const PAGE_SIZE = 10

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fungsi untuk memuat data dari API
  async function loadUsers(page = currentPage) {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/users?page=${page}&pageSize=${PAGE_SIZE}`)
      
      let result;
      try {
        // Coba baca respons JSON
        result = await response.json()
      } catch (e) {
        // Jika respons kosong/HTML, lempar pesan error yang mudah dimengerti
        throw new Error(`Koneksi ke server gagal (Status ${response.status}). Pastikan XAMPP menyala dan cek terminal VS Code.`)
      }
      
      if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.")
      
      setUsers(result.users)
      setTotalUsers(result.pagination.totalUsers)
      setCurrentPage(result.pagination.page)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers(1)
  }, [])

  // Fungsi Hapus User
  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Hapus user ${user.fullname}?`)) return
    setError("")
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      
      let result;
      try {
        result = await response.json()
      } catch (e) {
        throw new Error("Gagal menghapus user. Server tidak merespons dengan benar.")
      }

      if (!response.ok) throw new Error(result.error ?? "Gagal menghapus user.")
      
      if (users.length === 1 && currentPage > 1) {
        void loadUsers(currentPage - 1)
      } else {
        void loadUsers(currentPage)
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus user.")
    }
  }

  // Fungsi Format Tanggal
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('id-ID', { 
        day: '2-digit', month: '2-digit', year: 'numeric' 
      }).format(date)
    } catch {
      return "-"
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola akun pengguna.</p>
          </div>
          <Button 
            onClick={() => router.push("/admin/user-management/form/add")}
            className="bg-teal-600 hover:bg-teal-700 text-white w-fit"
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah user
          </Button>
        </div>

        {/* Pesan Error (Jika Ada) */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tabel */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nama lengkap</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-center">JWT</th>
                <th className="px-6 py-4 font-semibold">Dibuat</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Belum ada user.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.id}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">{user.fullname}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.hasToken ? (
                        <span className="flex items-center justify-center text-teal-600 gap-1"><ShieldCheck className="w-4 h-4"/> Tersimpan</span>
                      ) : (
                        <span className="flex items-center justify-center text-gray-400 gap-1"><ShieldAlert className="w-4 h-4"/> Kosong</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => router.push(`/admin/user-management/form/${user.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => void deleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-900 dark:text-white">{totalUsers}</span> user
          </p>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              className="text-gray-500" 
              disabled={currentPage === 1 || isLoading} 
              onClick={() => void loadUsers(currentPage - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center justify-center px-4 bg-teal-50 text-teal-700 rounded-md font-medium text-sm">
              {currentPage}
            </div>
            <Button 
              variant="ghost" 
              className="text-gray-500" 
              disabled={currentPage === totalPages || isLoading} 
              onClick={() => void loadUsers(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}