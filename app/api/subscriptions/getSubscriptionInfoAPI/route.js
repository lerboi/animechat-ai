// app/api/subscriptions/getSubscriptionInfoAPI/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                subscriptions: {
                    where: { status: { in: ['ACTIVE', 'CANCELED', 'PAST_DUE', 'INACTIVE'] } },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const activeSub = user.subscriptions[0];

        const billingInfo = activeSub ? {
            subscriptionId: activeSub.id,
            tier: activeSub.tier,
            status: activeSub.status,
            startDate: activeSub.startDate,
            endDate: activeSub.endDate,
            paymentMethod: activeSub.paymentMethod,
            cardLastFour: activeSub.cardLastFour,
            cardBrand: activeSub.cardBrand,
            billingAddress: activeSub.billingAddress,
        } : null;

        return NextResponse.json({ billingInfo });
    } catch (error) {
        console.error('Error fetching billing info:', error);
        return NextResponse.json({ error: 'Failed to fetch billing info' }, { status: 500 });
    }
}