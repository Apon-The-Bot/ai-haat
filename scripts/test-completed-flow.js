const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ""
    }
  }
});

async function testCompletedFlow() {
  const email = 'mdamanullahsheikhapon@gmail.com';
  const beforeUser = await prisma.user.findFirst({ where: { email } });
  console.log("Balance before test:", beforeUser?.walletBalanceBDT);

  // Test webhook with successful payment
  const webhookRes = await fetch("http://localhost:3000/api/payment/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: "WT-KKQ3TEYT7D",
      status: "completed",
      transaction_id: "KKQ3TEYT7D",
      amount: 2000,
      email_address: email,
    })
  });

  const webhookData = await webhookRes.json();
  console.log("Webhook result:", webhookData);

  const afterUser = await prisma.user.findFirst({ where: { email } });
  console.log("Balance after test:", afterUser?.walletBalanceBDT);

  const txs = await prisma.walletTransaction.findMany({
    where: { userId: afterUser.id },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("Recent wallet transactions in DB:", txs);

  await prisma.$disconnect();
}

testCompletedFlow().catch(console.error);
