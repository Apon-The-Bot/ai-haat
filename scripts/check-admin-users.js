const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { security: true }
  });
  console.log('Total users in DB:', users.length);
  users.forEach(u => {
    console.log(`User: ${u.email} | Name: ${u.name} | Role: ${u.role} | Wallet: ${u.walletBalanceBDT} | Security:`, u.security);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
