import { PrismaClient } from "../../prisma/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __db: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.__db) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  global.__db = new PrismaClient({ adapter });
}

prisma = global.__db;

export { prisma };
