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
            where: { email: session.user.email },
            select: { tier: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ tier: user.tier })
    } catch (error) {
        console.error('Error fetching user tier:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}