// app/api/subscriptions/addSubscriptionInfo/route.js

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
        const { sessionId } = await req.json();

        // Retrieve the Stripe session
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

        // Retrieve the subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSession.subscription);

        const startDate = new Date(stripeSubscription.current_period_start * 1000);
        const endDate = new Date(stripeSubscription.current_period_end * 1000);

        // Determine the tier based on the price ID
        let tier;
        switch (stripeSubscription.items.data[0].price.id) {
            case 'price_1QCF5tCoZlAUNSElrMZu2AfC':
                tier = 'PLUS';
                break;
            case 'price_1QCF66CoZlAUNSElYNbnJzHD':
                tier = 'PREMIUM';
                break;
            default:
                tier = 'FREE';
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { activeSubscription: true },
        });

        // If there's an active subscription, deactivate it
        if (user.activeSubscription) {
            await prisma.subscription.update({
                where: { id: user.activeSubscription.id },
                data: { isActive: false, endDate: startDate },
            });
        }

        // Create the new subscription
        const newSubscription = await prisma.subscription.create({
            data: {
                userId: session.user.id,
                stripeSubscriptionId: stripeSubscription.id,
                status: stripeSubscription.status.toUpperCase(),
                tier,
                startDate,
                endDate,
                priceId: stripeSubscription.items.data[0].price.id,
                paymentMethod: stripeSubscription.default_payment_method ? 'card' : 'unknown',
                isActive: true,
            },
        });

        // Update the user's active subscription
        await prisma.user.update({
            where: { id: session.user.id },
            data: { activeSubscription: { connect: { id: newSubscription.id } } },
        });

        // If a payment method is available, update card details
        if (stripeSubscription.default_payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(stripeSubscription.default_payment_method);
            await prisma.subscription.update({
                where: { id: newSubscription.id },
                data: {
                    cardLastFour: paymentMethod.card.last4,
                    cardBrand: paymentMethod.card.brand,
                },
            });
        }

        return NextResponse.json({ success: true, subscription: newSubscription });
    } catch (error) {
        console.error('Error adding subscription info:', error);
        return NextResponse.json({ error: 'Failed to add subscription info' }, { status: 500 });
    }
}