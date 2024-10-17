import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'micro';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const buf = await buffer(req);
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            const customer = await stripe.customers.retrieve(session.customer);
            const user = await prisma.user.findUnique({
                where: { email: customer.email },
            });

            if (!user) {
                throw new Error('User not found');
            }

            let newTier;
            switch (session.metadata.priceId) {
                case 'plus_plan':
                    newTier = 'PLUS';
                    break;
                case 'premium_plan':
                    newTier = 'PREMIUM';
                    break;
                default:
                    newTier = 'FREE';
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { tier: newTier },
            });

        } catch (error) {
            console.error('Error processing subscription:', error);
            return NextResponse.json({ error: 'Error processing subscription' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

export const config = {
    api: {
        bodyParser: false,
    },
};