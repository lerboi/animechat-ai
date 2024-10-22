// app/api/payments/getPaymentsAPI/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const activeSubscription = user.subscriptions[0];

        let paymentMethod = null;
        if (activeSubscription && activeSubscription.stripeSubscriptionId) {
            const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.stripeSubscriptionId);
            const stripePaymentMethod = await stripe.paymentMethods.retrieve(stripeSubscription.default_payment_method);

            paymentMethod = {
                type: stripePaymentMethod.type,
                cardLastFour: stripePaymentMethod.card?.last4,
                cardBrand: stripePaymentMethod.card?.brand,
                expirationMonth: stripePaymentMethod.card?.exp_month,
                expirationYear: stripePaymentMethod.card?.exp_year,
            };
        }

        return NextResponse.json({
            payments: user.payments,
            paymentMethod,
        });
    } catch (error) {
        console.error('Error fetching payment info:', error);
        return NextResponse.json({ error: 'Failed to fetch payment info' }, { status: 500 });
    }
}