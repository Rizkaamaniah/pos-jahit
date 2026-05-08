// src/app/api/laporan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'daily'
  const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().slice(0, 10)
  const dateTo = searchParams.get('dateTo') || new Date().toISOString().slice(0, 10)

  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo + 'T23:59:59'),
      },
    },
    include: {
      items: {
        include: {
          product: { select: { priceBuy: true, name: true, sku: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Build daily summary
  const dailyMap = new Map<string, { revenue: number; transactions: number; hpp: number }>()

  for (const tx of transactions) {
    const date = tx.createdAt.toISOString().slice(0, 10)
    const existing = dailyMap.get(date) ?? { revenue: 0, transactions: 0, hpp: 0 }

    let hpp = 0
    for (const item of tx.items) {
      hpp += Number(item.product.priceBuy) * item.qty
    }

    dailyMap.set(date, {
      revenue: existing.revenue + Number(tx.total),
      transactions: existing.transactions + 1,
      hpp: existing.hpp + hpp,
    })
  }

  const dailyData = Array.from(dailyMap.entries()).map(([date, d]) => ({
    date,
    revenue: d.revenue,
    transactions: d.transactions,
    hpp: d.hpp,
    profit: d.revenue - d.hpp,
  }))

  // Totals
  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0)
  const totalHpp = dailyData.reduce((s, d) => s + d.hpp, 0)
  const totalProfit = totalRevenue - totalHpp
  const totalTransactions = dailyData.reduce((s, d) => s + d.transactions, 0)

  // Top products
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>()
  for (const tx of transactions) {
    for (const item of tx.items) {
      const existing = productMap.get(item.productId) ?? { name: item.product.name, qty: 0, revenue: 0 }
      productMap.set(item.productId, {
        name: existing.name,
        qty: existing.qty + item.qty,
        revenue: existing.revenue + Number(item.subtotal),
      })
    }
  }
  const topProducts = Array.from(productMap.entries())
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return NextResponse.json({
    dailyData,
    totalRevenue,
    totalHpp,
    totalProfit,
    totalTransactions,
    topProducts,
  })
}
