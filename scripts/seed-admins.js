const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminEmails = [
  { email: "mdamanullahsheikhapon@gmail.com", name: "Md. Amanullah Sheikh Apon" },
  { email: "seratul.alim@gmail.com", name: "Seratul Alim" },
  { email: "seratulalimkhanrhythm@gmail.com", name: "Seratul Alim Khan Rhythm" },
  { email: "admin@aihaat.com", name: "Admin" },
];

async function main() {
  for (const admin of adminEmails) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: admin.email },
          { email: admin.email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "ADMIN",
        },
      });
      console.log(`✓ Updated existing user ${admin.email} to ADMIN:`, updated.id);
    } else {
      const created = await prisma.user.create({
        data: {
          email: admin.email.toLowerCase().trim(),
          name: admin.name,
          role: "ADMIN",
          walletBalanceBDT: 0,
        },
      });
      console.log(`✓ Created new ADMIN user ${admin.email}:`, created.id);
    }
  }

  const allAdmins = await prisma.user.findMany({
    where: { role: "ADMIN" },
  });
  console.log("\nCurrent ADMIN users in DB:");
  console.table(allAdmins.map(a => ({ id: a.id, name: a.name, email: a.email, role: a.role, balance: a.walletBalanceBDT })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
