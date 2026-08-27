const nodemailer = require('nodemailer');

async function testSMTP() {
  const host = "smtp.hostinger.com";
  const port = 465;
  const user = "delivery@aihaat.shop";
  const pass = "Rk#delivery@aihaat.sh0p";

  console.log(`Connecting to SMTP server ${host}:${port} with user ${user}...`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("✓ Transporter verified successfully!");

    console.log("Sending test email to mdamanullahsheikhapon@gmail.com...");
    const info = await transporter.sendMail({
      from: '"AI Haat Delivery" <delivery@aihaat.shop>',
      to: "mdamanullahsheikhapon@gmail.com",
      subject: "Test Delivery Email from AI Haat",
      text: "This is a test email sent directly from AI Haat SMTP configuration.",
      html: "<h3>AI Haat Delivery Test</h3><p>Your SMTP is working properly!</p>",
    });

    console.log("✓ Test email sent successfully! Message ID:", info.messageId);
    console.log("Envelope:", info.envelope);
    console.log("Accepted:", info.accepted);
  } catch (err) {
    console.error("❌ SMTP Error:", err);
  }
}

testSMTP();
