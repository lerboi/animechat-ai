import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        });

        if (!user || user.subscriptions.length === 0) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const activeSubscription = user.subscriptions[0];

        // Cancel the subscription in Stripe at the end of the billing period
        await stripe.subscriptions.update(activeSubscription.stripeSubscriptionId, {
            cancel_at_period_end: true
        });

        // Update the subscription status in the database
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                status: 'CANCELED',
            },
        });

        return NextResponse.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }
}