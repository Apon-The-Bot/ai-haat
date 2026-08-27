const nodemailer = require('nodemailer');

async function testSend() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'delivery@aihaat.shop',
      pass: 'Rk#delivery@aihaat.sh0p',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"AI Haat Official" <delivery@aihaat.shop>',
    to: 'seratulalimkhanrhythm@gmail.com',
    subject: 'AI Haat Test Delivery Notification - Order #AH-98211',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 12px; max-width: 600px; margin: auto;">
        <h2 style="color: #FC5C03;">AI Haat Order Delivery</h2>
        <p>Dear Customer, your digital subscription has been delivered!</p>
        <div style="background: #FFF9F5; padding: 15px; border-radius: 8px; border: 1px solid #FFE4D6;">
          <strong>Product:</strong> ChatGPT Plus 1 Month<br/>
          <strong>Login Email:</strong> test@aihaat.shop<br/>
          <strong>Password:</strong> AiHaat#2026!Pass
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">AI Haat - Bangladesh's #1 Digital Marketplace</p>
      </div>
    `,
  });

  console.log('✓ Email successfully delivered! Message ID:', info.messageId);
}

testSend().catch(console.error);
