import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
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
            select: { textTokens: true, imageTokens: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ textTokens: user.textTokens, imageTokens: user.imageTokens })
    } catch (error) {
        console.error('Error fetching tokens:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}