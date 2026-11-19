"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form/login-form"; // sesuaikan path dan nama file LoginForm-mu
import { LayoutDashboard, LogIn, X } from "lucide-react";

export function MenuLandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  // State untuk mengontrol apakah popup login sedang terbuka atau tertutup
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Popup bisa ditutup dengan tombol Escape
  useEffect(() => {
    if (!isLoginOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLoginOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoginOpen]);

  // Kalau sudah login, tampilkan tombol menuju dashboard (bukan popup)
  if (isLoggedIn) {
    return (
      <div className="flex items-center">
        <Link
          href="/admin"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-full transition-all"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <Button
          onClick={() => setIsLoginOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition-all"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>

      {/* --- POPUP MODAL LOGIN --- */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsLoginOpen(false)} // klik area gelap = tutup
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // klik di dalam form tidak menutup
          >
            {/* Tombol Close (X) */}
            <button
              onClick={() => setIsLoginOpen(false)}
              aria-label="Tutup"
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Form login asli: memanggil /api/auth/login lalu pindah ke /admin */}
            <LoginForm />
          </div>
        </div>
      )}
    </>
  );
}