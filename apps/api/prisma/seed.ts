/**
 * Seed script — creates a demo tenant + admin user for local development.
 * Run: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'RealFlow Demo Org',
      slug: 'demo',
      plan: 'GROWTH',
      isActive: true,
      settings: {},
      features: {},
    },
  });
  console.log('✅ Tenant created:', tenant.name, '| ID:', tenant.id);

  // ── Admin User ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'RealFlow',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ── Sales User ────────────────────────────────────────────────────────────
  const salesHash = await bcrypt.hash('Sales@123', 12);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@demo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'sales@demo.com',
      passwordHash: salesHash,
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: 'SALES',
      isActive: true,
    },
  });
  console.log('✅ Sales user created:', sales.email);

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Login credentials:');
  console.log('  Email   : admin@demo.com');
  console.log('  Password: Admin@123');
  console.log('  Tenant  : demo');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
