const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrder() {
  console.log('Testing Prisma Order Query and Create...');
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, deliveredKeys: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Current DB Orders count:', orders.length);
    console.log('Sample orders:', orders.slice(0, 3));

    // Test creating a sample order
    const orderNum = `AH-TEST-${Date.now().toString().slice(-4)}`;
    const created = await prisma.order.create({
      data: {
        id: orderNum,
        orderNumber: orderNum,
        customerName: 'Test Customer',
        customerEmail: 'rhythmkhan02@gmail.com',
        customerPhone: '01700000000',
        totalBDT: 290,
        subtotalBDT: 290,
        paymentMethod: 'gateway',
        items: {
          create: [{
            productName: 'ChatGPT Plus',
            variationName: '1 Month',
            priceBDT: 290,
            quantity: 1,
          }]
        }
      },
      include: { items: true }
    });
    console.log('✓ Successfully created test order:', created.id);

    // Test querying by email
    const userOrders = await prisma.order.findMany({
      where: {
        OR: [
          { customerEmail: 'rhythmkhan02@gmail.com' },
          { customerEmail: { contains: 'rhythmkhan02' } }
        ]
      },
      include: { items: true }
    });
    console.log('✓ Found user orders for rhythmkhan02@gmail.com:', userOrders.length);
  } catch (err) {
    console.error('✗ Prisma error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testOrder();
