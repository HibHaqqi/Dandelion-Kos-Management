import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEmailColumn() {
  try {
    console.log('Adding email column to Customer table...');

    // Execute raw SQL to add the column
    await prisma.$executeRaw`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "email" TEXT;
    `;

    console.log('✅ Email column added successfully!');

    // Verify the column exists
    const result = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Customer'
      AND column_name = 'email'
    `;

    if (result) {
      console.log('✅ Column verified in database');
    }
  } catch (error) {
    console.error('❌ Error adding email column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addEmailColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
