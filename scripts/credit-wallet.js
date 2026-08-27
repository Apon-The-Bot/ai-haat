const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function creditUser() {
  const email = 'mdamanullahsheikhapon@gmail.com';
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { walletBalanceBDT: { increment: 500 } },
      });

      await prisma.walletTransaction.create({
        data: {
          userId: user.id,
          amountBDT: 500,
          type: 'DEPOSIT',
          method: 'gateway',
          senderNumber: 'GATEWAY',
          trxId: '598614988923587181908033796',
          status: 'APPROVED',
          note: 'Automated Gateway Top-up (598614988923587181908033796)',
        },
      });

      console.log('✓ Successfully credited 500 BDT to:', updated.email, 'New balance: ৳' + updated.walletBalanceBDT);
    } else {
      console.log('User not found for email:', email);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

creditUser();
