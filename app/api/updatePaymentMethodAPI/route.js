// app/api/payment/update-method/route.js
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
        const { paymentMethodId } = await req.json();

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

        // Update the payment method in Stripe
        await stripe.subscriptions.update(activeSubscription.stripeSubscriptionId, {
            default_payment_method: paymentMethodId,
        });

        // Get the updated payment method details
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        // Update the subscription in the database
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                paymentMethod: paymentMethod.type,
                cardLastFour: paymentMethod.card.last4,
                cardBrand: paymentMethod.card.brand,
            },
        });

        return NextResponse.json({ message: 'Payment method updated successfully' });
    } catch (error) {
        console.error('Error updating payment method:', error);
        return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
    }
}