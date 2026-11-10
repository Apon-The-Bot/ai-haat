const nodemailer = require("nodemailer");

async function run() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  const recipient = process.argv[2];
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !recipient) {
    throw new Error("SMTP settings and an explicit test recipient are required");
  }
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: recipient,
    subject: "AI Haat delivery email test",
    text: "This test verifies delivery mail routing.",
  });
  console.log("Test message accepted");
}

run().catch(() => {
  console.error("SMTP delivery test failed");
  process.exitCode = 1;
});
