import "dotenv/config";
import { prisma } from "../db/prisma";
async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npm run admin:promote -- user@example.test (existing account only)");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Register the account before promoting it");
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true, betaMember: true, status: "approved" } });
  console.log("Administrator access granted to the specified account");
}
main().catch(() => { console.error("Administrator promotion failed; verify the account and database configuration"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
