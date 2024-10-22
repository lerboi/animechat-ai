// app/api/subscriptions/downgradeSubAPI/route.js

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
                activeSubscription: true,
            },
        });

        if (!user || !user.activeSubscription) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const activeSubscription = user.activeSubscription;

        // Get the new price ID based on the new tier
        const newPriceId = getNewPriceId(newTier);

        // Schedule the update at the end of the current billing period
        const updatedStripeSubscription = await stripe.subscriptions.update(
            activeSubscription.stripeSubscriptionId,
            {
                proration_behavior: 'create_prorations',
                items: [
                    {
                        id: activeSubscription.stripeSubscriptionId,
                        price: newPriceId,
                    },
                ],
                trial_end: 'now',
            }
        );

        // Create a new subscription record for the downgrade
        const newSubscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                stripeSubscriptionId: updatedStripeSubscription.id,
                status: 'SCHEDULED',
                tier: newTier,
                priceId: newPriceId,
                startDate: new Date(updatedStripeSubscription.current_period_end * 1000),
                paymentMethod: activeSubscription.paymentMethod,
                cardLastFour: activeSubscription.cardLastFour,
                cardBrand: activeSubscription.cardBrand,
                isActive: false,
            },
        });

        // Update the current subscription to link to the new one
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                nextSubscription: {
                    connect: { id: newSubscription.id },
                },
            },
        });

        return NextResponse.json({ message: 'Subscription downgrade scheduled successfully' });
    } catch (error) {
        console.error('Error downgrading subscription:', error);
        return NextResponse.json({ error: 'Failed to downgrade subscription' }, { status: 500 });
    }
}

function getNewPriceId(tier) {
    // Replace these with your actual Stripe price IDs
    const priceTiers = {
        FREE: null,
        PLUS: `${process.env['PLUS_PRICE_ID']}`,
    };
    return priceTiers[tier];
}