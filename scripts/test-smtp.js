const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing SMTP connection to Hostinger...');
  
  // Try port 465 SSL
  const transporterSSL = nodemailer.createTransport({
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

  try {
    const verified = await transporterSSL.verify();
    console.log('✓ Hostinger SMTP SSL 465 Verified:', verified);
  } catch (err) {
    console.log('✗ Port 465 failed:', err.message);
  }

  // Try port 587 TLS
  const transporterTLS = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
      user: 'delivery@aihaat.shop',
      pass: 'Rk#delivery@aihaat.sh0p',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const verifiedTLS = await transporterTLS.verify();
    console.log('✓ Hostinger SMTP TLS 587 Verified:', verifiedTLS);
  } catch (err) {
    console.log('✗ Port 587 failed:', err.message);
  }
}

testSMTP().catch(console.error);
