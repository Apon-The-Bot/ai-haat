const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay'
    }
  }
});

async function main() {
  try {
    // 1. Update Brand Logo & Favicon
    await prisma.$queryRawUnsafe(`
      UPDATE pp_brands 
      SET 
        logo = 'https://aihaat.shop/images/logo.png',
        favicon = 'https://aihaat.shop/images/logo.png',
        name = 'AI Haat'
    `);
    console.log('Brand logos updated!');

    // 2. Update Gateway Logos
    await prisma.$queryRawUnsafe(`
      UPDATE pp_gateways 
      SET logo = 'https://aihaat.shop/images/payments/bkash.png'
      WHERE slug LIKE '%bkash%'
    `);

    await prisma.$queryRawUnsafe(`
      UPDATE pp_gateways 
      SET logo = 'https://aihaat.shop/images/payments/nagad.png'
      WHERE slug LIKE '%nagad%'
    `);

    await prisma.$queryRawUnsafe(`
      UPDATE pp_gateways 
      SET logo = 'https://aihaat.shop/images/payments/rocket.png'
      WHERE slug LIKE '%rocket%'
    `);

    await prisma.$queryRawUnsafe(`
      UPDATE pp_gateways 
      SET logo = 'https://aihaat.shop/images/payments/upay.png'
      WHERE slug LIKE '%upay%'
    `);

    console.log('All gateway logos updated to official PNGs!');

    // Check results
    const gws = await prisma.$queryRawUnsafe(`SELECT gateway_id, name, display, logo FROM pp_gateways`);
    console.log('Gateways in DB:', gws);

    const brands = await prisma.$queryRawUnsafe(`SELECT brand_id, name, logo, favicon FROM pp_brands`);
    console.log('Brands in DB:', brands);

  } catch (err) {
    console.error('Error updating logos:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
