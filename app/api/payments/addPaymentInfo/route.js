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

        // Get the latest invoice for this subscription
        const invoice = await stripe.invoices.retrieve(stripeSubscription.latest_invoice);

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

        // Use upsert to create or update the subscription
        const subscription = await prisma.subscription.upsert({
            where: { stripeSubscriptionId: stripeSubscription.id },
            update: {
                status: stripeSubscription.status.toUpperCase(),
                tier,
                startDate,
                endDate,
                priceId: stripeSubscription.items.data[0].price.id,
                paymentMethod: stripeSubscription.default_payment_method ? 'card' : 'unknown',
            },
            create: {
                userId: session.user.id,
                stripeSubscriptionId: stripeSubscription.id,
                status: stripeSubscription.status.toUpperCase(),
                tier,
                startDate,
                endDate,
                priceId: stripeSubscription.items.data[0].price.id,
                paymentMethod: stripeSubscription.default_payment_method ? 'card' : 'unknown',
            },
        });

        // Create the payment record
        const payment = await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                userId: session.user.id,
                amount: invoice.amount_paid / 100, // Convert from cents to dollars
                status: invoice.status,
            },
        });

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        console.error('Error adding payment info:', error);
        return NextResponse.json({ error: 'Failed to add payment info' }, { status: 500 });
    }
}