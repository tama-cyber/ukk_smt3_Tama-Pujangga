import { Hero } from "./landing-page-hero/Hero";
// Kita panggil dari folder app/landing-page-menu/Menu.tsx
import { MenuLandingPage } from "./landing-page-menu/Menu";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      
      {/* Navbar Landing Page */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo di kiri */}
          <div className="font-bold text-xl text-blue-800">UKK SMT4</div>
          
          {/* Tombol Login di kanan */}
          <MenuLandingPage />
          
        </div>
      </header>

      {/* Konten Utama */}
      <Hero />
      
    </main>
  );
}