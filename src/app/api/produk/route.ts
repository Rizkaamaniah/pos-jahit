// src/app/api/produk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  categoryId: z.string(),
  supplierId: z.string().optional().nullable(),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  priceBuy: z.number().positive(),
  priceSell: z.number().positive(),
  stockQty: z.number().int().min(0),
  stockMin: z.number().int().min(0),
  unit: z.string().default('pcs'),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || undefined
  const lowStock = searchParams.get('lowStock') === '1'

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(lowStock && { stockQty: { lte: prisma.product.fields.stockMin } }),
    },
    include: {
      category: true,
      supplier: true,
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const data = productSchema.parse(body)

  const product = await prisma.product.create({ data })
  return NextResponse.json(product, { status: 201 })
}
