const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInfoFeature() {
  try {
    console.log('🧪 Testing Building & Room Information Feature\n');

    // Test 1: Fetch all building info
    console.log('1️⃣ Testing: Fetch all building info');
    const buildingInfo = await prisma.buildingInfo.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    console.log(`✅ Found ${buildingInfo.length} building info items`);
    buildingInfo.forEach(item => {
      console.log(`   - ${item.key}: ${item.value} (${item.category})`);
    });

    // Test 2: Fetch active building info only
    console.log('\n2️⃣ Testing: Fetch active building info only');
    const activeInfo = await prisma.buildingInfo.findMany({
      where: { isActive: true },
    });
    console.log(`✅ Found ${activeInfo.length} active items`);

    // Test 3: Test upsert
    console.log('\n3️⃣ Testing: Upsert building info');
    const upsertResult = await prisma.buildingInfo.upsert({
      where: { key: 'wifi_password' },
      update: {
        value: 'newPassword123',
        updatedAt: new Date(),
      },
      create: {
        key: 'test_key',
        value: 'test_value',
        category: 'general',
        isActive: true,
      },
    });
    console.log(`✅ Upsert successful: ${upsertResult.key} = ${upsertResult.value}`);

    // Test 4: Restore original value
    await prisma.buildingInfo.update({
      where: { key: 'wifi_password' },
      data: { value: 'kos123456' },
    });
    console.log('✅ Restored original value');

    // Test 5: Test RoomInfo
    console.log('\n4️⃣ Testing: Room info operations');
    const roomInfo = await prisma.roomInfo.create({
      data: {
        roomNumber: 'TEST01',
        key: 'electricity_token',
        value: '1234-5678-9012',
        category: 'utilities',
        description: 'Test electricity token',
      },
    });
    console.log(`✅ Created room info: ${roomInfo.roomNumber} - ${roomInfo.key}`);

    // Clean up test data
    await prisma.roomInfo.delete({
      where: {
        id: roomInfo.id,
      },
    });
    console.log('✅ Cleaned up test room info');

    console.log('\n✅ All tests passed! The feature is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Access /admin/info to manage information');
    console.log('   2. Access /tenant/dashboard to view information as tenant');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testInfoFeature();
