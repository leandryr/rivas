'use client';

import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  clientSecret: string;
}

export default function SetupForm({ onSuccess, clientSecret }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe is not loaded.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement | null;
    if (!cardElement) {
      setError('Card element not found.');
      setLoading(false);
      return;
    }

    const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Something went wrong');
    } else if (setupIntent && setupIntent.status === 'succeeded') {
      onSuccess();

      // 👇 Agregado: guarda el payment method en el backend
      await fetch('/api/users/save-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }),
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded p-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: '16px', color: '#374151', '::placeholder': { color: '#9ca3af' } },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : 'Save Payment Method'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
