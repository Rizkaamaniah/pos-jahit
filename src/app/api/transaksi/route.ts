// src/app/api/transaksi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNo } from '@/lib/utils'
import { z } from 'zod'

const txSchema = z.object({
  customerId: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'TRANSFER']).default('CASH'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paidAmount: z.number().positive(),
  items: z.array(
    z.object({
      productId: z.string(),
      qty: z.number().int().positive(),
      priceSell: z.number().positive(),
      discountItem: z.number().min(0).default(0),
    }),
  ),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED',
      ...(dateFrom && dateTo && {
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo + 'T23:59:59'),
        },
      }),
    },
    include: {
      user: { select: { name: true } },
      customer: { select: { name: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = txSchema.parse(body)

  // Calculate totals
  let subtotal = 0
  for (const item of data.items) {
    const itemSubtotal = item.qty * item.priceSell - item.discountItem
    subtotal += itemSubtotal
  }

  const total = subtotal - data.discount + data.tax
  const changeAmount = data.paidAmount - total

  if (changeAmount < 0) {
    return NextResponse.json({ error: 'Uang bayar kurang' }, { status: 400 })
  }

  // Check stock availability
  for (const item of data.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product || product.stockQty < item.qty) {
      return NextResponse.json(
        { error: `Stok tidak cukup untuk: ${product?.name ?? item.productId}` },
        { status: 400 },
      )
    }
  }

  // Create transaction in a database transaction
  const transaction = await prisma.$transaction(async tx => {
    const newTx = await tx.transaction.create({
      data: {
        userId: session.user.id,
        customerId: data.customerId || null,
        invoiceNo: generateInvoiceNo(),
        paymentMethod: data.paymentMethod,
        subtotal,
        discount: data.discount,
        tax: data.tax,
        total,
        paidAmount: data.paidAmount,
        changeAmount,
        status: 'COMPLETED',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            priceSell: item.priceSell,
            discountItem: item.discountItem,
            subtotal: item.qty * item.priceSell - item.discountItem,
          })),
        },
      },
      include: { items: true },
    })

    // Update stock and record movements
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) continue

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.qty } },
      })

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          userId: session.user.id,
          type: 'SALE',
          qtyBefore: product.stockQty,
          qtyChange: -item.qty,
          qtyAfter: product.stockQty - item.qty,
          note: `Transaksi ${newTx.invoiceNo}`,
        },
      })
    }

    // Update customer total spend
    if (data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalSpend: { increment: total } },
      })
    }

    return newTx
  })

  return NextResponse.json(transaction, { status: 201 })
}
