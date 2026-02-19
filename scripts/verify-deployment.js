const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDeployment() {
  console.log('🔍 Verifying Deployment...\n');

  const checks = [];

  // 1. Check if all new models exist
  console.log('📊 Checking database models...');
  try {
    const tenantCount = await prisma.tenant.count();
    checks.push({ name: 'Tenant Model', status: '✅ OK', count: tenantCount });
    console.log(`  ✅ Tenant model exists (${tenantCount} records)`);
  } catch (error) {
    checks.push({ name: 'Tenant Model', status: '❌ ERROR', error: error.message });
    console.log(`  ❌ Tenant model error: ${error.message}`);
  }

  try {
    const complaintCount = await prisma.complaint.count();
    checks.push({ name: 'Complaint Model', status: '✅ OK', count: complaintCount });
    console.log(`  ✅ Complaint model exists (${complaintCount} records)`);
  } catch (error) {
    checks.push({ name: 'Complaint Model', status: '❌ ERROR', error: error.message });
    console.log(`  ❌ Complaint model error: ${error.message}`);
  }

  try {
    const buildingInfoCount = await prisma.buildingInfo.count();
    checks.push({ name: 'BuildingInfo Model', status: '✅ OK', count: buildingInfoCount });
    console.log(`  ✅ BuildingInfo model exists (${buildingInfoCount} records)`);
  } catch (error) {
    checks.push({ name: 'BuildingInfo Model', status: '❌ ERROR', error: error.message });
    console.log(`  ❌ BuildingInfo model error: ${error.message}`);
  }

  try {
    const roomInfoCount = await prisma.roomInfo.count();
    checks.push({ name: 'RoomInfo Model', status: '✅ OK', count: roomInfoCount });
    console.log(`  ✅ RoomInfo model exists (${roomInfoCount} records)`);
  } catch (error) {
    checks.push({ name: 'RoomInfo Model', status: '❌ ERROR', error: error.message });
    console.log(`  ❌ RoomInfo model error: ${error.message}`);
  }

  try {
    const tenantServerAppCount = await prisma.tenantServerApp.count();
    checks.push({ name: 'TenantServerApp Model', status: '✅ OK', count: tenantServerAppCount });
    console.log(`  ✅ TenantServerApp model exists (${tenantServerAppCount} records)`);
  } catch (error) {
    checks.push({ name: 'TenantServerApp Model', status: '❌ ERROR', error: error.message });
    console.log(`  ❌ TenantServerApp model error: ${error.message}`);
  }

  // 2. Check if Transaction model has new fields
  console.log('\n📝 Checking Transaction model updates...');
  try {
    const sampleTransaction = await prisma.transaction.findFirst();
    if (sampleTransaction) {
      const hasReceiptUrl = Object.keys(sampleTransaction).includes('receiptUrl');
      const hasStatus = Object.keys(sampleTransaction).includes('status');
      const hasRejectionReason = Object.keys(sampleTransaction).includes('rejectionReason');

      if (hasReceiptUrl && hasStatus && hasRejectionReason) {
        console.log('  ✅ Transaction model has tenant payment fields');
        checks.push({ name: 'Transaction Fields', status: '✅ OK' });
      } else {
        console.log('  ⚠️  Transaction model missing some tenant payment fields');
        checks.push({ name: 'Transaction Fields', status: '⚠️  WARNING' });
      }
    } else {
      console.log('  ⚠️  No transactions found to verify');
      checks.push({ name: 'Transaction Fields', status: '⚠️  NO DATA' });
    }
  } catch (error) {
    console.log(`  ❌ Error checking Transaction model: ${error.message}`);
    checks.push({ name: 'Transaction Fields', status: '❌ ERROR', error: error.message });
  }

  // 3. Check if Customer model has Tenant relation
  console.log('\n🔗 Checking Customer-Tenant relation...');
  try {
    const customerWithTenant = await prisma.customer.findFirst({
      where: { Tenant: { isNot: null } },
      include: { Tenant: true },
    });

    if (customerWithTenant) {
      console.log(`  ✅ Customer-Tenant relation exists (${customerWithTenant.name} linked)`);
      checks.push({ name: 'Customer-Tenant Relation', status: '✅ OK' });
    } else {
      console.log('  ⚠️  No customers linked to tenants yet');
      checks.push({ name: 'Customer-Tenant Relation', status: '⚠️  NO DATA' });
    }
  } catch (error) {
    console.log(`  ❌ Error checking Customer-Tenant relation: ${error.message}`);
    checks.push({ name: 'Customer-Tenant Relation', status: '❌ ERROR', error: error.message });
  }

  // 4. Check if User model has Tenant relation
  console.log('\n👤 Checking User-Tenant relation...');
  try {
    const userWithTenant = await prisma.user.findFirst({
      where: { tenantProfile: { isNot: null } },
      include: { tenantProfile: true },
    });

    if (userWithTenant) {
      console.log(`  ✅ User-Tenant relation exists (${userWithTenant.name} linked)`);
      checks.push({ name: 'User-Tenant Relation', status: '✅ OK' });
    } else {
      console.log('  ⚠️  No users linked to tenants yet');
      checks.push({ name: 'User-Tenant Relation', status: '⚠️  NO DATA' });
    }
  } catch (error) {
    console.log(`  ❌ Error checking User-Tenant relation: ${error.message}`);
    checks.push({ name: 'User-Tenant Relation', status: '❌ ERROR', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 VERIFICATION SUMMARY');
  console.log('='.repeat(50));

  const ok = checks.filter(c => c.status === '✅ OK').length;
  const warnings = checks.filter(c => c.status.includes('⚠️')).length;
  const errors = checks.filter(c => c.status === '❌ ERROR').length;

  console.log(`✅ Passed: ${ok}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);

  if (errors === 0) {
    console.log('\n🎉 Deployment verification PASSED!');
    console.log('✅ Ready to deploy to production.\n');
  } else {
    console.log('\n❌ Deployment verification FAILED!');
    console.log('⚠️  Please fix the errors above before deploying.\n');
  }

  await prisma.$disconnect();
}

verifyDeployment().catch(console.error);
