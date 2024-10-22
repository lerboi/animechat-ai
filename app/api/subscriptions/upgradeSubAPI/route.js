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

        // Create a Stripe Checkout session for the upgrade
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: newPriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}`,
            subscription_data: {
                metadata: {
                    oldSubscriptionId: activeSubscription.stripeSubscriptionId,
                },
            },
        });

        return NextResponse.json({ checkoutUrl: checkoutSession.url });
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
    }
}

function getNewPriceId(tier) {
    // Replace these with your actual Stripe price IDs
    const priceTiers = {
        PLUS: `${process.env['PLUS_PRICE_ID']}`,
        PREMIUM: `${process.env['PREMIUM_PRICE_ID']}`,
    };
    return priceTiers[tier];
}