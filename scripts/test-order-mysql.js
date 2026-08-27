async function test() {
  const orderNum = 'AH-TEST-' + Math.floor(10000 + Math.random() * 90000);
  console.log('1. Creating test order:', orderNum);

  const createRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderNum,
      orderNumber: orderNum,
      customerName: 'Seratul alim Khan',
      customerEmail: 'seratulalimkhanrhythm@gmail.com',
      customerPhone: '+8801700000000',
      items: [
        {
          productId: 'prod_chatgpt',
          productName: 'ChatGPT Plus 1 Month',
          variationName: 'Shared Profile',
          priceBDT: 290,
          quantity: 1,
        },
      ],
      totalBDT: 290,
      subtotalBDT: 290,
      paymentMethod: 'gateway',
      senderNumber: '01712345678',
      trxId: 'DHQ2TEYT7O',
      notes: 'Test live order placement',
    }),
  });

  const createData = await createRes.json();
  console.log('Order created response:', createData);

  console.log('\n2. Fetching orders for user: seratulalimkhanrhythm@gmail.com');
  const getRes = await fetch('http://localhost:3000/api/orders?email=seratulalimkhanrhythm@gmail.com');
  const getData = await getRes.json();
  console.log('Orders found for user:', getData.orders?.length);
  console.log('User orders:', getData.orders);

  console.log('\n3. Fetching all orders for Admin:');
  const adminRes = await fetch('http://localhost:3000/api/orders');
  const adminData = await adminRes.json();
  console.log('Total Admin orders found:', adminData.orders?.length);
}

test().catch(console.error);
