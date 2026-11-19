import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

// Akun admin awal (tidak lagi bergantung pada isi .env)
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678";

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashed, role: "admin" },
    create: {
      kodeUser: "ADM000001",
      fullname: "Admin",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    },
  });

  console.log(`User admin siap: ${ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());