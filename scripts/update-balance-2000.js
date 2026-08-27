const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBalance() {
  const email = 'mdamanullahsheikhapon@gmail.com';
  try {
    const updated = await prisma.user.update({
      where: { email },
      data: { walletBalanceBDT: 2000 }
    });
    console.log('✓ Successfully updated user wallet balance in MySQL to:', updated.walletBalanceBDT);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateBalance();
