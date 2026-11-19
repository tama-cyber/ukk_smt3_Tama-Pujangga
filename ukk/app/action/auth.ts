"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

type FormState = { error?: string } | undefined;

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullname = String(formData.get("fullname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullname || !email || password.length < 8) {
    return { error: "Nama, email, dan password (minimal 8 karakter) wajib diisi." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email sudah terdaftar." };

  const user = await prisma.user.create({
    data: { fullname, email, password: await bcrypt.hash(password, 10) },
  });

  await createSession({ userId: user.id, role: user.role });
  redirect("/admin"); // ganti sesuai tujuan setelah register
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!user || !valid) return { error: "Email atau password salah." };

  await createSession({ userId: user.id, role: user.role });
  redirect("/admin"); // ganti sesuai tujuan setelah login
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}