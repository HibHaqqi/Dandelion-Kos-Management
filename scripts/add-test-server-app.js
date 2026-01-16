const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestApp() {
  try {
    // First, get the tenant ID
    const tenant = await prisma.tenant.findFirst({
      include: { customer: true },
    });

    if (!tenant) {
      console.log('No tenant found!');
      return;
    }

    console.log('Using tenant:', tenant.customer.name);

    // Try to add Jellyseerr
    const app = await prisma.tenantServerApp.upsert({
      where: {
        tenantId_appId: {
          tenantId: tenant.id,
          appId: 'jellyseerr',
        },
      },
      update: {
        name: 'Jellyseerr',
        url: 'https://jellyseerr.3devnest.site/',
        icon: '🎬',
        description: 'Movie & Show Requests',
        category: 'media',
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        appId: 'jellyseerr',
        name: 'Jellyseerr',
        url: 'https://jellyseerr.3devnest.site/',
        icon: '🎬',
        description: 'Movie & Show Requests',
        category: 'media',
        isActive: true,
      },
    });

    console.log('App saved successfully:', app.name);
    console.log('ID:', app.id);
    console.log('AppId:', app.appId);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestApp();
