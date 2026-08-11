// prisma/seed.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

// Parse DATABASE_URL to extract connection details
const dbUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace(/^\//, ""),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Check if admin profile exists
  const existing = await prisma.profile.findUnique({
    where: { username: "Admin" },
  });

  if (!existing) {
    const hashed = await bcrypt.hash("Admin1234", 10);
    const adminProfile = await prisma.profile.create({
      data: {
        username: "Admin",
        password_hash: hashed,
        nama_lengkap: "Admin",
        // other optional fields can stay null/default
      },
    });

    // Create role entry for admin
    await prisma.userRole.create({
      data: {
        user_id: adminProfile.id,
        role: "admin",
      },
    });
    console.log("✅ Admin user created");
  } else {
    // Ensure admin role exists without using upsert (user_id is not unique)
    const existingRole = await prisma.userRole.findFirst({
      where: { user_id: existing.id },
    });

    if (existingRole) {
      await prisma.userRole.update({
        where: { id: existingRole.id },
        data: { role: "admin" },
      });
    } else {
      await prisma.userRole.create({
        data: { user_id: existing.id, role: "admin" },
      });
    }
    console.log("✅ Admin user already existed, role ensured");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
