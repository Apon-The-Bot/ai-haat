const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay'
    }
  }
});

const uploadUrl = 'https://srv1497-files.hstgr.io/rest/de4cc4fdc854438a/api/tus';
const authKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJsb2NhbGUiOiJlbl9VUyIsInZpZXdNb2RlIjoibGlzdCIsInNpbmdsZUNsaWNrIjpmYWxzZSwicmVkaXJlY3RBZnRlckNvcHlNb3ZlIjpmYWxzZSwicGVybSI6eyJhZG1pbiI6ZmFsc2UsImV4ZWN1dGUiOmZhbHNlLCJjcmVhdGUiOnRydWUsInJlbmFtZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWUsInNoYXJlIjpmYWxzZSwiZG93bmxvYWQiOnRydWV9LCJjb21tYW5kcyI6W10sImxvY2tQYXNzd29yZCI6dHJ1ZSwiaGlkZURvdGZpbGVzIjpmYWxzZSwiZGF0ZUZvcm1hdCI6ZmFsc2UsInVzZXJuYW1lIjoidTI5ODk4MDA4NCIsImFjZUVkaXRvclRoZW1lIjoiIn0sImlzcyI6IkZpbGUgQnJvd3NlciIsImV4cCI6MTc4Nzg2MzIzNywiaWF0IjoxNzg3ODQxNjM3fQ.QhSrT5fmmiaZ-fxunbfl0LpaICxS8EqUN0mI9UdXcFg';
const restAuthKey = '65ec7fb7cf014be8f5bcf7981cf009a0c96adbe3126982ef1b507418598a0f4d-de4cc4fdc854438a';

async function uploadFile(localPath, remoteRelativePath) {
  const content = fs.readFileSync(localPath);
  const size = content.length;
  const target = `${uploadUrl}/${remoteRelativePath}?override=true`;

  console.log(`Uploading ${remoteRelativePath} (${size} bytes)...`);

  // Step 1: POST to create upload
  const postRes = await fetch(target, {
    method: 'POST',
    headers: {
      'X-Auth': authKey,
      'X-Auth-Rest': restAuthKey,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(size),
      'Upload-Offset': '0',
    },
  });

  if (postRes.status !== 201 && postRes.status !== 200 && postRes.status !== 204) {
    const txt = await postRes.text();
    throw new Error(`POST failed with ${postRes.status}: ${txt}`);
  }

  // Step 2: PATCH to send file content
  const patchRes = await fetch(target, {
    method: 'PATCH',
    headers: {
      'X-Auth': authKey,
      'X-Auth-Rest': restAuthKey,
      'Tus-Resumable': '1.0.0',
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': '0',
    },
    body: content,
  });

  if (patchRes.status !== 204 && patchRes.status !== 200 && patchRes.status !== 201) {
    const txt = await patchRes.text();
    throw new Error(`PATCH failed with ${patchRes.status}: ${txt}`);
  }

  console.log(`✓ Uploaded ${remoteRelativePath}`);
}

async function main() {
  const paymentsDir = 'c:/Users/mdama/OneDrive/Desktop/Ai Haat/public/images/payments';
  const logoPath = 'c:/Users/mdama/OneDrive/Desktop/Ai Haat/public/images/logo.png';

  // Upload logo
  await uploadFile(logoPath, 'assets/images/logo.png');

  // Upload payment icons
  await uploadFile(path.join(paymentsDir, 'bkash.png'), 'assets/images/payments/bkash.png');
  await uploadFile(path.join(paymentsDir, 'nagad.png'), 'assets/images/payments/nagad.png');
  await uploadFile(path.join(paymentsDir, 'rocket.png'), 'assets/images/payments/rocket.png');
  await uploadFile(path.join(paymentsDir, 'upay.png'), 'assets/images/payments/upay.png');

  console.log('All images uploaded to pay.aihaat.shop/assets/images/');

  // Update DB records
  await prisma.$queryRawUnsafe(`
    UPDATE pp_brands 
    SET 
      logo = 'https://pay.aihaat.shop/assets/images/logo.png',
      favicon = 'https://pay.aihaat.shop/assets/images/logo.png'
  `);

  await prisma.$queryRawUnsafe(`
    UPDATE pp_gateways 
    SET logo = 'https://pay.aihaat.shop/assets/images/payments/bkash.png'
    WHERE slug LIKE '%bkash%'
  `);

  await prisma.$queryRawUnsafe(`
    UPDATE pp_gateways 
    SET logo = 'https://pay.aihaat.shop/assets/images/payments/nagad.png'
    WHERE slug LIKE '%nagad%'
  `);

  await prisma.$queryRawUnsafe(`
    UPDATE pp_gateways 
    SET logo = 'https://pay.aihaat.shop/assets/images/payments/rocket.png'
    WHERE slug LIKE '%rocket%'
  `);

  await prisma.$queryRawUnsafe(`
    UPDATE pp_gateways 
    SET logo = 'https://pay.aihaat.shop/assets/images/payments/upay.png'
    WHERE slug LIKE '%upay%'
  `);

  console.log('Database URLs updated to https://pay.aihaat.shop/assets/images/...');
  await prisma.$disconnect();
}

main().catch(console.error);
