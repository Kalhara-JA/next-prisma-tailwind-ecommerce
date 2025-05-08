import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const users = await prisma.user.findMany({
    include: { orders: true },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      // add other fields as needed
    },
  })
  return NextResponse.json(user)
} 