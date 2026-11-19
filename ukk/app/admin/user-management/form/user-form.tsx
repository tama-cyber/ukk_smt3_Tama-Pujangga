// Menandai komponen ini sebagai Client Component di Next.js (berjalan di sisi browser)
'use client'

// Mengimpor hook dan fungsi bawaan dari React dan Next.js
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mendefinisikan tipe data untuk props komponen UserForm
interface UserFormProps {
  userId?: string // Bersifat opsional, hanya ada jika dalam mode edit
}

export function UserForm({ userId }: UserFormProps) {
  // Inisialisasi router Next.js untuk navigasi halaman
  const router = useRouter()
  
  // Menentukan apakah form berada dalam mode edit berdasarkan ada atau tidaknya userId
  const isEditMode = Boolean(userId)

  // State untuk menyimpan nilai input form
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("staff")
  
  // State untuk mengatur status loading saat mengambil data (jika edit) atau saat menyimpan
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  
  // State untuk menyimpan pesan error jika terjadi kegagalan
  const [error, setError] = useState("")

  // useEffect untuk mengambil data user dari API jika berada dalam mode Edit
  useEffect(() => {
    // Jika tidak ada userId, hentikan proses
    if (!userId) return

    let isActive = true // Flag untuk mencegah memory leak / state update pada komponen yang sudah unmount
    
    async function loadUser() {
      try {
        // Melakukan fetch data user berdasarkan ID
        const response = await fetch(`/api/users/${userId}`)
        const result = await response.json()
        
        // Jika response gagal, lemparkan error
        if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.")
        
        // Jika komponen masih aktif, masukkan data ke state form
        if (isActive) {
          setFullname(result.user.fullname)
          setEmail(result.user.email)
          setRole(result.user.role)
        }
      } catch (err) {
        // Tangkap dan simpan pesan error ke state
        if (isActive) setError(err instanceof Error ? err.message : "Gagal memuat data.")
      } finally {
        // Matikan status loading setelah selesai
        if (isActive) setIsLoading(false)
      }
    }
    
    void loadUser()
    
    // Cleanup function untuk mengubah flag saat komponen unmount
    return () => { isActive = false }
  }, [userId])

  // Fungsi yang dijalankan saat form disubmit (untuk Tambah atau Edit)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Mencegah reload halaman default browser
    setIsSaving(true)      // Mengaktifkan status loading tombol simpan
    setError("")           // Mereset pesan error

    try {
      // Menentukan URL dan Method HTTP (PATCH untuk edit, POST untuk tambah)
      const url = isEditMode ? `/api/users/${userId}` : "/api/users"
      const method = isEditMode ? "PATCH" : "POST"

      // Mengirim data ke API
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          ...(password ? { password } : {}), // Password hanya dikirim jika diisi oleh pengguna
          role,
        }),
      })

      const result = await response.json()
      
      // Jika response gagal, lemparkan error
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan data.")

      // Jika sukses, arahkan kembali ke halaman manajemen user dan refresh data cache
      router.push("/admin/user-management")
      router.refresh()
    } catch (err) {
      // Tangkap error dan tampilkan di UI
      setError(err instanceof Error ? err.message : "Gagal menyimpan data.")
    } finally {
      // Matikan status loading simpan
      setIsSaving(false)
    }
  }

  // Tampilan saat data user masih dimuat (mode edit)
  if (isLoading) return <div className="p-6 text-center text-gray-500">Memuat data user...</div>

  return (
    // Kontainer utama dengan lebar penuh (w-full)
    <div className="w-full"> 
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 md:p-8">
        
        {/* Bagian Header Form (Judul dan Tombol Kembali) */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit User" : "Tambah User Baru"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode ? "Perbarui informasi pengguna di bawah ini." : "Masukkan detail pengguna baru."}
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/admin/user-management")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>

        {/* Kotak Pesan Error (Muncul jika state error tidak kosong) */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Elemen Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Input Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <input
                type="text"
                required
                maxLength={191}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                maxLength={191}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="nama@email.com"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password {isEditMode && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                required={!isEditMode} // Wajib diisi saat tambah user, opsional saat edit
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder={isEditMode ? "Password baru (min. 8 karakter)" : "Minimal 8 karakter"}
              />
            </div>

            {/* Pilihan Role (Staff / Admin) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Tombol Simpan / Aksi Submit */}
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving} // Tombol dinonaktifkan saat proses simpan berjalan
              className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]"
            >
              {isSaving ? "Menyimpan..." : (
                <>
                  <Save className="mr-2 h-4 w-4" /> 
                  {isEditMode ? "Simpan Perubahan" : "Buat User"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}