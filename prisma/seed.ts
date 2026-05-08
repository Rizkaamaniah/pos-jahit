// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const kasirPassword = await bcrypt.hash('kasir123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@posjahit.com' },
    update: {},
    create: {
      name: 'Admin Toko',
      email: 'admin@posjahit.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  const kasir = await prisma.user.upsert({
    where: { email: 'kasir@posjahit.com' },
    update: {},
    create: {
      name: 'Kasir 1',
      email: 'kasir@posjahit.com',
      passwordHash: kasirPassword,
      role: UserRole.KASIR,
    },
  })

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-benang' },
      update: {},
      create: { id: 'cat-benang', name: 'Benang', description: 'Benang jahit berbagai jenis' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-jarum' },
      update: {},
      create: { id: 'cat-jarum', name: 'Jarum', description: 'Jarum jahit dan jarum bordir' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-kain' },
      update: {},
      create: { id: 'cat-kain', name: 'Kain', description: 'Kain berbagai jenis dan motif' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-mesin' },
      update: {},
      create: { id: 'cat-mesin', name: 'Mesin Jahit', description: 'Mesin jahit dan spare part' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-aksesoris' },
      update: {},
      create: { id: 'cat-aksesoris', name: 'Aksesoris', description: 'Kancing, resleting, dll' },
    }),
  ])

  // Seed Supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 'sup-001' },
    update: {},
    create: {
      id: 'sup-001',
      name: 'CV. Sumber Jahit',
      phone: '021-5678901',
      address: 'Jl. Tekstil No. 12, Jakarta',
      email: 'info@sumberjahit.com',
    },
  })

  // Seed Products
  const products = [
    { id: 'prd-001', sku: 'BNG-001', name: 'Benang Polyester 40/2 Putih', categoryId: 'cat-benang', priceBuy: 3500, priceSell: 5000, stockQty: 200, unit: 'gulung' },
    { id: 'prd-002', sku: 'BNG-002', name: 'Benang Polyester 40/2 Hitam', categoryId: 'cat-benang', priceBuy: 3500, priceSell: 5000, stockQty: 180, unit: 'gulung' },
    { id: 'prd-003', sku: 'BNG-003', name: 'Benang Bordir Warna-warni', categoryId: 'cat-benang', priceBuy: 5000, priceSell: 8000, stockQty: 50, unit: 'gulung' },
    { id: 'prd-004', sku: 'JRM-001', name: 'Jarum Jahit No. 14 (isi 10)', categoryId: 'cat-jarum', priceBuy: 3000, priceSell: 5000, stockQty: 100, unit: 'pack' },
    { id: 'prd-005', sku: 'JRM-002', name: 'Jarum Tangan Bordir (isi 5)', categoryId: 'cat-jarum', priceBuy: 2500, priceSell: 4000, stockQty: 80, unit: 'pack' },
    { id: 'prd-006', sku: 'KAI-001', name: 'Kain Katun Motif Batik (1m)', categoryId: 'cat-kain', priceBuy: 15000, priceSell: 25000, stockQty: 30, stockMin: 10, unit: 'meter' },
    { id: 'prd-007', sku: 'KAI-002', name: 'Kain Voile Polos Putih (1m)', categoryId: 'cat-kain', priceBuy: 10000, priceSell: 18000, stockQty: 40, unit: 'meter' },
    { id: 'prd-008', sku: 'AKS-001', name: 'Kancing Baju Bulat Putih (isi 50)', categoryId: 'cat-aksesoris', priceBuy: 5000, priceSell: 8000, stockQty: 60, unit: 'pack' },
    { id: 'prd-009', sku: 'AKS-002', name: 'Resleting YKK 20cm', categoryId: 'cat-aksesoris', priceBuy: 4000, priceSell: 7000, stockQty: 3, stockMin: 10, unit: 'pcs' },
    { id: 'prd-010', sku: 'MSN-001', name: 'Gunting Kain 10 inch', categoryId: 'cat-mesin', priceBuy: 25000, priceSell: 45000, stockQty: 15, unit: 'pcs' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        supplierId: 'sup-001',
        priceBuy: p.priceBuy,
        priceSell: p.priceSell,
        stockMin: p.stockMin ?? 5,
      },
    })
  }

  // Seed Customer
  await prisma.customer.upsert({
    where: { id: 'cus-001' },
    update: {},
    create: {
      id: 'cus-001',
      name: 'Ibu Sari Rahayu',
      phone: '081234567890',
      address: 'Jl. Melati No.5, Cikarang',
    },
  })

  console.log('✅ Seeding selesai!')
  console.log('📧 Admin: admin@posjahit.com / admin123')
  console.log('📧 Kasir: kasir@posjahit.com / kasir123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
