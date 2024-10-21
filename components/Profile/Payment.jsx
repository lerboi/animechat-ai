'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Payment() {
  const [billingInfo, setBillingInfo] = useState(null);
  const [payments, setPayments] = useState([]);
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
            setPayments(data.payments);
          }
        } catch (error) {
          console.error('Error fetching billing info:', error);
        }
      }
    }
    fetchBillingInfo();
  }, [session]);

  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    // Implement update payment method logic here
  }

  const handleUpdateBillingAddress = async (e) => {
    e.preventDefault();
    // Implement update billing address logic here
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Payment Information</h1>
      
      {billingInfo && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Current Payment Method</h2>
          <p>Payment Method: {billingInfo.paymentMethod}</p>
          {billingInfo.cardLastFour && (
            <>
              <p>Card: **** **** **** {billingInfo.cardLastFour}</p>
              <p>Brand: {billingInfo.cardBrand}</p>
            </>
          )}
          
          <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
            <h3 className="text-xl font-semibold">Update Payment Method</h3>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012  3456" required />
            </div>
            <div className="flex space-x-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" placeholder="MM/YY" required />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" required />
              </div>
            </div>
            <Button type="submit">Update Payment Method</Button>
          </form>

          <form onSubmit={handleUpdateBillingAddress} className="space-y-4">
            <h3 className="text-xl font-semibold">Update Billing Address</h3>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" required />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" placeholder="12345" required />
            </div>
            <Button type="submit">Update Billing Address</Button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Payments</h2>
        {payments.length > 0 ? (
          <ul className="space-y-2">
            {payments.map((payment) => (
              <li key={payment.id} className="border p-4 rounded">
                <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                <p>Amount: ${payment.amount}</p>
                <p>Status: {payment.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent payments found.</p>
        )}
      </div>
    </div>
  );
}