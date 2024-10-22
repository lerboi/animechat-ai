'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchPaymentInfo() {
      if (session) {
        try {
          const response = await fetch('/api/payments/getPaymentsAPI', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setPayments(data.payments);
            setPaymentMethod(data.paymentMethod);
          }
        } catch (error) {
          console.error('Error fetching payment info:', error);
        }
      }
    }
    fetchPaymentInfo();
  }, [session]);

  async function handleUpdatePaymentMethod(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cardData = {
      cardNumber: formData.get('cardNumber'),
      expiryDate: formData.get('expiryDate'),
      cvv: formData.get('cvv'),
    };

    try {
      const response = await fetch('/api/payments/updatePaymentMethodAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        // Refresh payment info after update
        fetchPaymentInfo();
      } else {
        console.error('Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Payment Information</h1>
      
      {paymentMethod && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Current Payment Method</h2>
          <p>Payment Method: {paymentMethod.type}</p>
          {paymentMethod.cardLastFour && (
            <>
              <p>Card: **** **** **** {paymentMethod.cardLastFour}</p>
              <p>Brand: {paymentMethod.cardBrand}</p>
              <p>Expires: {paymentMethod.expirationMonth}/{paymentMethod.expirationYear}</p>
            </>
          )}
          
          <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
            <h3 className="text-xl font-semibold">Update Payment Method</h3>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required />
            </div>
            <div className="flex space-x-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" required />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" name="cvv" placeholder="123" required />
              </div>
            </div>
            <Button type="submit">Update Payment Method</Button>
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
                <p>Amount: ${payment.amount.toFixed(2)}</p>
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