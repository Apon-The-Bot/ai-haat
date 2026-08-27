const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log('All Users count:', users.length);
  console.log('Users:', users);

  // If user doesn't exist, create user record and credit
  const email = 'mdamanullahsheikhapon@gmail.com';
  let targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email: email,
        name: 'Md. Amanullah Sheikh Apon',
        role: 'ADMIN',
        walletBalanceBDT: 500,
      }
    });
    console.log('✓ Created user and credited ৳500:', targetUser);
  } else {
    targetUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { walletBalanceBDT: { increment: 500 } }
    });
    console.log('✓ Credited ৳500 to existing user:', targetUser);
  }

  await prisma.walletTransaction.create({
    data: {
      userId: targetUser.id,
      amountBDT: 500,
      type: 'DEPOSIT',
      method: 'gateway',
      senderNumber: 'GATEWAY',
      trxId: '598614988923587181908033796',
      status: 'APPROVED',
      note: 'Automated Gateway Top-up'
    }
  });

  await prisma.$disconnect();
}

listUsers();
