// app/api/subscription/upgrade/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { newTier } = await req.json();

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

        // Get the new price ID based on the new tier
        const newPriceId = getNewPriceId(newTier);

        // Update the subscription in Stripe
        const updatedStripeSubscription = await stripe.subscriptions.update(
            activeSubscription.stripeSubscriptionId,
            {
                items: [
                    {
                        id: activeSubscription.stripeSubscriptionId,
                        price: newPriceId,
                    },
                ],
            }
        );

        // Update the subscription in the database
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                tier: newTier,
                priceId: newPriceId,
            },
        });

        return NextResponse.json({ message: 'Subscription upgraded successfully' });
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
    }
}

function getNewPriceId(tier) {
    // Replace these with your actual Stripe price IDs
    const priceTiers = {
        PLUS: 'price_plus_id',
        PREMIUM: 'price_premium_id',
    };
    return priceTiers[tier];
}