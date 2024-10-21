import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const activeSub = user.subscriptions[0]
        return NextResponse.json({
            tier: activeSub ? activeSub.tier : 'FREE',
            subscriptionId: activeSub ? activeSub.id : null,
            status: activeSub ? activeSub.status : null,
            startDate: activeSub ? activeSub.startDate : null,
            endDate: activeSub ? activeSub.endDate : null,
        })
    } catch (error) {
        console.error('Error fetching user tier:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}