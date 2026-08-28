const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ""
    }
  }
});

const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

const gateways = [
  {
    gateway_id: 'gw_bkash_01',
    slug: 'bkash-personal',
    name: 'bKash Personal',
    display: 'bKash',
    logo: 'assets/logo.jpg',
    currency: 'BDT',
    min_allow: '1.00000000',
    max_allow: '50000.00000000',
    primary_color: '#D12053',
    text_color: '#FFFFFF',
    btn_color: '#D12053',
    btn_text_color: '#FFFFFF',
    tab: 'mfs',
    status: 'active',
    mobile: '01712345678',
  },
  {
    gateway_id: 'gw_nagad_01',
    slug: 'nagad-personal',
    name: 'Nagad Personal',
    display: 'Nagad',
    logo: 'assets/logo.jpg',
    currency: 'BDT',
    min_allow: '1.00000000',
    max_allow: '50000.00000000',
    primary_color: '#ed1c24',
    text_color: '#FFFFFF',
    btn_color: '#ed1c24',
    btn_text_color: '#FFFFFF',
    tab: 'mfs',
    status: 'active',
    mobile: '01712345678',
  },
  {
    gateway_id: 'gw_rocket_01',
    slug: 'rocket-personal',
    name: 'Rocket Personal',
    display: 'Rocket',
    logo: 'assets/logo.jpg',
    currency: 'BDT',
    min_allow: '1.00000000',
    max_allow: '50000.00000000',
    primary_color: '#8C3494',
    text_color: '#FFFFFF',
    btn_color: '#8C3494',
    btn_text_color: '#FFFFFF',
    tab: 'mfs',
    status: 'active',
    mobile: '01712345678',
  },
  {
    gateway_id: 'gw_upay_01',
    slug: 'upay-personal',
    name: 'Upay Personal',
    display: 'Upay',
    logo: 'assets/logo.jpg',
    currency: 'BDT',
    min_allow: '1.00000000',
    max_allow: '50000.00000000',
    primary_color: '#002D62',
    text_color: '#FFFFFF',
    btn_color: '#002D62',
    btn_text_color: '#FFFFFF',
    tab: 'mfs',
    status: 'active',
    mobile: '01712345678',
  },
];

async function main() {
  try {
    const brands = ['6936211549', 'b_9c034ffa97d2'];

    for (const brand_id of brands) {
      for (const gw of gateways) {
        const fullGwId = `${gw.gateway_id}_${brand_id.slice(-4)}`;

        // Check if exists
        const existing = await prisma.$queryRawUnsafe(
          `SELECT id FROM pp_gateways WHERE gateway_id = '${fullGwId}' AND brand_id = '${brand_id}'`
        );

        if (!existing || existing.length === 0) {
          await prisma.$queryRawUnsafe(`
            INSERT INTO pp_gateways (
              gateway_id, brand_id, slug, name, display, logo, currency,
              min_allow, max_allow, fixed_discount, percentage_discount,
              fixed_charge, percentage_charge, primary_color, text_color,
              btn_color, btn_text_color, tab, status, created_date, updated_date
            ) VALUES (
              '${fullGwId}', '${brand_id}', '${gw.slug}', '${gw.name}', '${gw.display}', '${gw.logo}', '${gw.currency}',
              ${gw.min_allow}, ${gw.max_allow}, 0, 0,
              0, 0, '${gw.primary_color}', '${gw.text_color}',
              '${gw.btn_color}', '${gw.btn_text_color}', '${gw.tab}', '${gw.status}', '${now}', '${now}'
            )
          `);

          // Insert parameters
          await prisma.$queryRawUnsafe(`
            INSERT INTO pp_gateways_parameter (brand_id, gateway_id, option_name, value, created_date, updated_date)
            VALUES 
            ('${brand_id}', '${fullGwId}', 'mobile_number', '${gw.mobile}', '${now}', '${now}'),
            ('${brand_id}', '${fullGwId}', 'pending_payment', 'enable', '${now}', '${now}')
          `);

          console.log(`Inserted ${gw.name} for brand ${brand_id}`);
        } else {
          console.log(`${gw.name} already exists for brand ${brand_id}`);
        }
      }
    }

    console.log('All gateways successfully registered in PipraPay database!');
  } catch (err) {
    console.error('Error registering gateways:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
