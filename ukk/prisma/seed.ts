import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "12345678";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: "admin" },
    create: { fullname: "Admin", email, password: hashed, role: "admin" },
  });

  console.log(`User admin siap: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());