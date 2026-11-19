import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Navbar } from "@/components/navbar/app-navbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full overflow-hidden">
        {/* Header untuk Navbar */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4">
          <SidebarTrigger />
          <Navbar /> {/* <--- PANGGIL NAVBAR DI SINI */}
        </header>
        
        {/* Area Konten */}
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}