// src/app/api/kas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get active drawer for current user
  const activeDrawer = await prisma.cashDrawer.findFirst({
    where: { userId: session.user.id, status: 'OPEN' },
    orderBy: { openedAt: 'desc' },
  })

  const history = await prisma.cashDrawer.findMany({
    where: { userId: session.user.id },
    orderBy: { openedAt: 'desc' },
    take: 20,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json({ activeDrawer, history })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, openingBalance, closingBalance } = await req.json()

  if (action === 'open') {
    const drawer = await prisma.cashDrawer.create({
      data: {
        userId: session.user.id,
        openingBalance,
        status: 'OPEN',
      },
    })
    return NextResponse.json(drawer, { status: 201 })
  }

  if (action === 'close') {
    const drawer = await prisma.cashDrawer.findFirst({
      where: { userId: session.user.id, status: 'OPEN' },
    })
    if (!drawer) return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 404 })

    const updated = await prisma.cashDrawer.update({
      where: { id: drawer.id },
      data: { closingBalance, closedAt: new Date(), status: 'CLOSED' },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
}
