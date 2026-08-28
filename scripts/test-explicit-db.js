const { PrismaClient } = require('@prisma/client');

function getDatabaseUrl() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  if (url.includes("Rhythm#Aihaatdb01")) {
    url = url.replace("Rhythm#Aihaatdb01", "Rhythm%23Aihaatdb01");
  }
  return url;
}

async function testPrismaExplicitUrl() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

  try {
    const user = await prisma.user.findFirst({
      where: { email: 'mdamanullahsheikhapon@gmail.com' }
    });
    console.log('✓ Successfully connected with explicit datasource URL! User:', user);
  } catch (err) {
    console.error('Error with explicit datasource URL:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaExplicitUrl();
