'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function Billing() {
  const [billingInfo, setBillingInfo] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchBillingInfo() {
      if (session) {
        try {
          const response = await fetch('/api/getBillingInfoAPI', {
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

  const handleCancelSubscription = async () => {
    // Implement subscription cancellation logic here
  }

  const handleUpgradeSubscription = async () => {
    // Implement subscription upgrade logic here
  }

  const handleDowngradeSubscription = async () => {
    // Implement subscription downgrade logic here
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
          <p>Price: ${billingInfo.price}/month</p>
          
          <div className="space-x-4 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Cancel Subscription</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to cancel your subscription?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. You will lose access to premium features at the end of your current billing cycle.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={handleCancelSubscription}>Confirm Cancellation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {billingInfo.tier !== 'PREMIUM' && (
              <Button onClick={handleUpgradeSubscription}>Upgrade Subscription</Button>
            )}

            {billingInfo.tier !== 'FREE' && (
              <Button variant="outline" onClick={handleDowngradeSubscription}>Downgrade Subscription</Button>
            )}
          </div>
        </div>
      ) : (
        <p>No billing information available.</p>
      )}
    </div>
  );
}