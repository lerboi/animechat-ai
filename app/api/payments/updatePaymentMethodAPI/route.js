// app/api/payments/updatePaymentMethodAPI/route.js
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
        const { cardNumber, expiryDate, cvv } = await req.json();

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

        // Create a new payment method in Stripe
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: cardNumber,
                exp_month: parseInt(expiryDate.split('/')[0]),
                exp_year: parseInt(expiryDate.split('/')[1]),
                
                cvc: cvv,
            },
        });

        // Attach the new payment method to the customer
        await stripe.paymentMethods.attach(paymentMethod.id, {
            customer: activeSubscription.stripeSubscriptionId.split('_')[0],
        });

        // Update the default payment method for the subscription
        await stripe.subscriptions.update(activeSubscription.stripeSubscriptionId, {
            default_payment_method: paymentMethod.id,
        });

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