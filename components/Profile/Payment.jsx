'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
        } finally {
          setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p className="text-lg font-semibold text-gray-200">Getting Payment Information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Payment Information</h1>
      
      {paymentMethod && (
        <Card className="bg-slate-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Current Payment Method</CardTitle>
            <CardDescription className="text-gray-400">Your active payment method details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Payment Method:</span>
              <Badge variant="secondary" className="bg-gray-700 text-gray-200">{paymentMethod.type}</Badge>
            </div>
            {paymentMethod.cardLastFour && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Card:</span>
                  <span>**** **** **** {paymentMethod.cardLastFour}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Brand:</span>
                  <span>{paymentMethod.cardBrand}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Expires:</span>
                  <span>{paymentMethod.expirationMonth}/{paymentMethod.expirationYear}</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <form onSubmit={handleUpdatePaymentMethod} className="w-full space-y-4">
              <h3 className="text-xl font-semibold text-gray-100">Update Payment Method</h3>
              <div>
                <Label htmlFor="cardNumber" className="text-gray-300">Card Number</Label>
                <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="expiryDate" className="text-gray-300">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" required className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                  
                  <Input id="cvv" name="cvv" placeholder="123" required className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Update Payment Method</Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Recent Payments</CardTitle>
          <CardDescription className="text-gray-400">Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <ul className="space-y-4">
              {payments.map((payment) => (
                <li key={payment.id} className="border border-gray-700 p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Date:</span>
                    <span className="text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-gray-300">Amount:</span>
                    <span className="text-gray-400">${payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-gray-300">Status:</span>
                    <Badge variant={payment.status === 'successful' ? 'success' : 'warning'} className={payment.status === 'successful' ? 'bg-green-700 text-gray-200' : 'bg-yellow-700 text-gray-200'}>{payment.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-4 text-gray-400">No recent payments found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}