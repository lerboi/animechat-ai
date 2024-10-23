'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Billing() {
  const [billingInfo, setBillingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '', action: null });
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: '', description: '' });

  useEffect(() => {
    async function fetchBillingInfo() {
      if (session) {
        try {
          const response = await fetch('/api/subscriptions/getSubscriptionInfoAPI', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setBillingInfo(data.billingInfo);
          }
        } catch (error) {
          console.error('Error fetching billing info:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchBillingInfo();
  }, [session]);

  async function handleCancelSubscription() {
    setDialogContent({
      title: 'Cancel Subscription',
      description: 'Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing cycle.',
      action: async () => {
        try {
          const response = await fetch('/api/subscriptions/cancelSubAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            setInfoDialogContent({
              title: 'Subscription Cancelled',
              description: 'Your subscription has been cancelled successfully. It will end at the end of the current billing cycle.'
            });
            setIsInfoDialogOpen(true);
            fetchBillingInfo();
          } else {
            console.error('Failed to cancel subscription');
          }
        } catch (error) {
          console.error('Error cancelling subscription:', error);
        }
        setIsDialogOpen(false);
      }
    });
    setIsDialogOpen(true);
  }

  async function handleUpgradeSubscription() {
    const nextTier = billingInfo.tier === 'FREE' ? 'PLUS' : 'PREMIUM';
    setDialogContent({
      title: 'Upgrade Subscription',
      description: `Are you sure you want to upgrade to the ${nextTier} tier?`,
      action: async () => {
        try {
          const response = await fetch('/api/subscriptions/upgradeSubAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newTier: nextTier }),
          });
          if (response.ok) {
            const data = await response.json();
            router.push(data.checkoutUrl);
          } else {
            console.error('Failed to initiate subscription upgrade');
          }
        } catch (error) {
          console.error('Error upgrading subscription:', error);
        }
        setIsDialogOpen(false);
      }
    });
    setIsDialogOpen(true);
  }

  async function handleDowngradeSubscription() {
    const nextTier = billingInfo.tier === 'PREMIUM' ? 'PLUS' : 'FREE';
    setDialogContent({
      title: 'Downgrade Subscription',
      description: `Are you sure you want to downgrade to the ${nextTier} tier? Your current subscription will remain active until the end of the billing cycle, then switch to the new tier.`,
      action: async () => {
        try {
          const response = await fetch('/api/subscriptions/downgradeSubAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newTier: nextTier }),
          });
          if (response.ok) {
            setInfoDialogContent({
              title: 'Subscription Downgrade Scheduled',
              description: 'Your subscription downgrade has been scheduled successfully. It will take effect at the end of your current billing cycle.'
            });
            setIsInfoDialogOpen(true);
            fetchBillingInfo();
          } else {
            console.error('Failed to downgrade subscription');
          }
        } catch (error) {
          console.error('Error downgrading subscription:', error);
        }
        setIsDialogOpen(false);
      }
    });
    setIsDialogOpen(true);
  }

  async function handleRenewSubscription() {
    const tier = billingInfo.tier
    let priceId = ""
    if (tier === "PLUS") {
      priceId = "price_1QCF5tCoZlAUNSElrMZu2AfC"
    }
    if (tier === "PREMIUM"){
      priceId = "price_1QCF66CoZlAUNSElYNbnJzHD"
    }
    setDialogContent({
      title: `Renew ${tier} Subscription`,
      description: 'Are you sure you want to renew your subscription?',
      action: async () => {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId: priceId
            })
          });
          const { sessionId } = await response.json()
          const stripe = await stripePromise
          const { error } = await stripe.redirectToCheckout({ sessionId })

          if (error) {
            console.error('Error:', error)
            alert('An error occurred. Please try again.')
          }
        } catch (error) {
          console.error('Error renewing subscription:', error);
        }
        setIsDialogOpen(false);
      }
    });
    setIsDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-lg font-semibold text-gray-200">Getting Billing Information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Billing Information</h1>
      {billingInfo ? (
        <Card className="mb-6 bg-slate-90 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Current Subscription</CardTitle>
            <CardDescription className="text-gray-400">Your current billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Current Tier:</span>
              <Badge variant="secondary" className="bg-gray-700 text-gray-200">{billingInfo.tier}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span>
              <Badge 
                variant={billingInfo.status === 'active' ? 'success' : 'warning'} 
                className={`${billingInfo.status === 'active' ? 'bg-green-700' : 'bg-yellow-700'} text-gray-200`}
              >
                {billingInfo.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Start Date:</span>
              <span>{new Date(billingInfo.startDate).toLocaleDateString()}</span>
            </div>
            {billingInfo.endDate && (
              <div className="flex justify-between items-center">
                <span className="font-semibold">End Date:</span>
                <span>{new Date(billingInfo.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {billingInfo.status === 'active' ? (
              <>
                <Button variant="destructive" onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700 text-white">Cancel Subscription</Button>
                <div className="space-x-2">
                  {billingInfo.tier !== 'PREMIUM' && (
                    <Button onClick={handleUpgradeSubscription} className="bg-blue-600 hover:bg-blue-700 text-white">Upgrade Subscription</Button>
                  )}
                  {billingInfo.tier !== 'FREE' && (
                    <Button variant="outline" onClick={handleDowngradeSubscription} className="border-gray-600 text-gray-300 hover:bg-gray-700">Downgrade Subscription</Button>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={handleRenewSubscription} className="bg-green-600 hover:bg-green-700 text-white">Renew Subscription</Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-center text-gray-300">No billing information available.</p>
          </CardContent>
        </Card>
      )}

      {billingInfo && billingInfo.nextSubscription && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Upcoming Change</CardTitle>
            <CardDescription className="text-gray-400">Your subscription will change soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Your subscription will change to <Badge className="bg-gray-700 text-gray-200">{billingInfo.nextSubscription.tier}</Badge> on {new Date(billingInfo.nextSubscription.startDate).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100">{dialogContent.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</Button>
            <Button onClick={dialogContent.action} className="bg-blue-600 hover:bg-blue-700 text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="bg-gray-900 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-100">{infoDialogContent.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {infoDialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsInfoDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}