import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.ADMIN_SESSION_SECRET;
if (!secretKey) {
  throw new Error("ADMIN_SESSION_SECRET belum diisi di file .env");
}
const secret = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  console.log("[proxy]", pathname, "ada cookie session:", !!token);

  let loggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      loggedIn = true;
    } catch (e) {
      console.error("Verifikasi sesi gagal:", e);
    }
  }

  // belum login -> tidak boleh masuk /admin
  if (pathname.startsWith("/admin") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // sudah login -> tidak perlu melihat halaman login lagi
  if (pathname === "/login" && loggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};