// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayTx, totalProducts, lowStockProducts, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: today, lt: tomorrow },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({
      where: {
        isActive: true,
        stockQty: { lte: prisma.product.fields.stockMin },
      },
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
  ])

  // Low stock - direct query
  const lowStock = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Product" 
    WHERE "isActive" = true AND "stockQty" <= "stockMin"
  `

  return NextResponse.json({
    todayRevenue: Number(todayTx._sum.total ?? 0),
    todayTransactions: todayTx._count,
    lowStockCount: Number(lowStock[0]?.count ?? 0),
    totalProducts,
    recentTransactions,
  })
}
