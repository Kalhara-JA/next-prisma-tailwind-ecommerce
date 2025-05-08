import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = await params

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { orders: true, addresses: true, payments: true },
    })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(user)
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = await params
    const data = await req.json()
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            isBanned: data.isBanned,
        },
    })
    return NextResponse.json(user)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = await params
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
}
