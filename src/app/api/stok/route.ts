// src/app/api/stok/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const stockSchema = z.object({
  productId: z.string(),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN']),
  qtyChange: z.number().int(),
  note: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId') || undefined

  const movements = await prisma.stockMovement.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(movements)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const data = stockSchema.parse(body)

  const product = await prisma.product.findUnique({ where: { id: data.productId } })
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

  const qtyAfter = product.stockQty + data.qtyChange
  if (qtyAfter < 0) return NextResponse.json({ error: 'Stok tidak boleh negatif' }, { status: 400 })

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: data.productId,
        userId: session.user.id,
        type: data.type,
        qtyBefore: product.stockQty,
        qtyChange: data.qtyChange,
        qtyAfter,
        note: data.note,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { stockQty: qtyAfter },
    }),
  ])

  return NextResponse.json(movement, { status: 201 })
}
