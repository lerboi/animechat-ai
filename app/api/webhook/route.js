import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const checkoutSession = event.data.object;
                await handleCheckoutSessionCompleted(checkoutSession);
                break;
            case 'invoice.paid':
                const invoice = event.data.object;
                await handleInvoicePaid(invoice);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error(`Error processing webhook: ${error.message}`);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session) {
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;

    if (!userId) {
        throw new Error('No userId found in session');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }

    // Create or update Billing entry
    const billing = await prisma.billing.upsert({
        where: {
            userId_subscriptionId: {
                userId: userId,
                subscriptionId: subscriptionId,
            },
        },
        update: {
            isActive: true,
            paymentMethod: 'card',
            updatedAt: new Date(),
        },
        create: {
            userId: userId,
            subscriptionId: subscriptionId,
            paymentMethod: 'card',
            isActive: true,
        },
    });

    // Create Payment entry
    await prisma.payment.create({
        data: {
            billingId: billing.id,
            amount: session.amount_total / 100,
            status: 'succeeded',
        },
    });

    // Update user's tier based on the product purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const productId = lineItems.data[0].price.product;
    const product = await stripe.products.retrieve(productId);
    let newTier;

    switch (product.name.toUpperCase()) {
        case 'PLUS':
            newTier = 'PLUS';
            break;
        case 'PREMIUM':
            newTier = 'PREMIUM';
            break;
        default:
            newTier = 'FREE';
    }

    await prisma.user.update({
        where: { id: userId },
        data: { tier: newTier },
    });
}

async function handleInvoicePaid(invoice) {
    const subscriptionId = invoice.subscription;
    const billing = await prisma.billing.findFirst({
        where: { subscriptionId: subscriptionId },
    });

    if (billing) {
        await prisma.payment.create({
            data: {
                billingId: billing.id,
                amount: invoice.amount_paid / 100,
                status: 'succeeded',
            },
        });
    } else {
        console.error(`No billing found for subscription ${subscriptionId}`);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};