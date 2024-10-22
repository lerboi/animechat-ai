'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';

export default function Billing() {
  const [billingInfo, setBillingInfo] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '', action: null });

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
            alert('Subscription cancelled successfully. It will end at the end of the current billing cycle.');
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
            alert('Subscription downgrade scheduled successfully. It will take effect at the end of your current billing cycle.');
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Billing Information</h1>
      {billingInfo ? (
        <div className="space-y-4">
          <p>Current Tier: {billingInfo.tier}</p>
          <p>Status: {billingInfo.status}</p>
          <p>Start Date: {new Date(billingInfo.startDate).toLocaleDateString()}</p>
          {billingInfo.endDate && <p>End Date: {new Date(billingInfo.endDate).toLocaleDateString()}</p>}
          
          <div className="space-x-4 mt-6">
            <Button variant="destructive" onClick={handleCancelSubscription}>Cancel Subscription</Button>

            {billingInfo.tier !== 'PREMIUM' && (
              <Button onClick={handleUpgradeSubscription}>Upgrade Subscription</Button>
            )}

            {billingInfo.tier !== 'FREE' && (
              <Button variant="outline" onClick={handleDowngradeSubscription}>Downgrade Subscription</Button>
            )}
          </div>

          {billingInfo.nextSubscription && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold">Upcoming Change</h2>
              <p>Your subscription will change to {billingInfo.nextSubscription.tier} on {new Date(billingInfo.nextSubscription.startDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      ) : (
        <p>No billing information available.</p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={dialogContent.action}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}