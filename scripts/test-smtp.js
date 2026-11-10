const nodemailer = require("nodemailer");

async function run() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("SMTP configuration required");
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.verify();
  console.log("SMTP connection verified");
}

run().catch(() => {
  console.error("SMTP verification failed");
  process.exitCode = 1;
});
