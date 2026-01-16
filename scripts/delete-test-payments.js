const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTestPayments() {
  try {
    console.log('🔍 Looking for test user "tes"...');

    // Find the test user
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'tes' } },
          { name: { contains: 'tes' } },
          { email: { contains: 'test' } },
          { name: { contains: 'test' } },
        ],
      },
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.name} (${testUser.email})`);
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Role: ${testUser.role}`);

    // Find all transactions from this user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: testUser.id,
      },
      orderBy: { date: 'desc' },
    });

    console.log(`\n📊 Found ${transactions.length} transactions from test user:`);

    if (transactions.length === 0) {
      console.log('   No transactions to delete');
      return;
    }

    // Display transactions
    transactions.forEach((t, index) => {
      console.log(
        `   ${index + 1}. ${t.date.toISOString().split('T')[0]} - Rp ${t.amount.toLocaleString(
          'id-ID'
        )} - ${t.type} - ${t.status}`
      );
    });

    // Delete transactions
    console.log('\n🗑️  Deleting transactions...');

    const deleteResult = await prisma.transaction.deleteMany({
      where: {
        userId: testUser.id,
      },
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} transactions`);

    // Check for tenant profile
    const tenantProfile = await prisma.tenant.findFirst({
      where: {
        userId: testUser.id,
      },
    });

    if (tenantProfile) {
      console.log(`\n🏠 Found tenant profile for test user`);
      console.log(`   Tenant ID: ${tenantProfile.id}`);
      console.log(`   Customer ID: ${tenantProfile.customerId}`);

      // Delete complaints linked to this tenant first
      console.log('\n🗑️  Deleting linked complaints...');
      const complaintDelete = await prisma.complaint.deleteMany({
        where: {
          tenantId: tenantProfile.id,
        },
      });
      console.log(`✅ Deleted ${complaintDelete.count} complaints`);

      // Delete tenant profile
      console.log('\n🗑️  Deleting tenant profile...');
      await prisma.tenant.delete({
        where: {
          id: tenantProfile.id,
        },
      });
      console.log('✅ Tenant profile deleted');
    }

    // Delete the test user
    console.log('\n🗑️  Deleting test user...');
    await prisma.user.delete({
      where: {
        id: testUser.id,
      },
    });
    console.log('✅ Test user deleted');

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error deleting test payments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestPayments();
