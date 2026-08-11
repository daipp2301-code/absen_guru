import { PrismaClient } from "@prisma/client";
// MariaDB adapter for Prisma 7
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter: new PrismaMariaDb({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "absensi_guru",
      connectionLimit: 5,
    }),
    log: process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.prisma = prisma;
}
