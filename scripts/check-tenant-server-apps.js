const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServerApps() {
  try {
    const apps = await prisma.tenantServerApp.findMany({
      orderBy: { name: 'asc' },
      include: {
        tenant: {
          include: {
            customer: true,
          },
        },
      },
    });

    console.log('Total Tenant Server Apps:', apps.length);
    console.log('\nApps:');
    apps.forEach((app) => {
      console.log(`- ${app.name} (${app.appId})`);
      console.log(`  Tenant: ${app.tenant.customer.name}`);
      console.log(`  URL: ${app.url}`);
      console.log(`  Active: ${app.isActive}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServerApps();
