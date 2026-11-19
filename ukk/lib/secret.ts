// Satu tempat untuk membaca kunci rahasia JWT.
// Nama utama: JWT_SECRET. Nama lama tetap dikenali supaya tidak error
// kalau isi .env berbeda-beda antar komputer.
export function getSecretKey() {
  const value =
    process.env.JWT_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET

  if (!value) {
    throw new Error("JWT_SECRET belum diisi di file .env")
  }

  return new TextEncoder().encode(value)
}