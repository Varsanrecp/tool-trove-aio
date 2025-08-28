// src/hooks/usePaymentHandler.ts
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const usePaymentHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn, user } = useAuth();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const userId = (user as any)?.id ?? null;

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  };

  const handleFreeSignup = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to continue with free plan');
      return;
    }
    try {
      const subscriptionData = {
        email: userEmail,
        plan_type: 'free',
        status: 'active',
        amount: 0,
        currency: 'INR',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const { error } = await supabase.from('subscriptions').insert([subscriptionData]);
      if (error) throw error;
      toast.success('Successfully signed up for free plan');
      navigate('/tools');
    } catch (error: any) {
      toast.error('Failed to sign up for free plan');
      console.error(error);
    }
  };

  const handlePremiumSignup = useCallback(async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to continue with premium plan');
      return;
    }

    try {
      setIsProcessing(true);
      await loadRazorpayScript();

      // Create order server-side and pass user info for notes
      const orderResponse = await supabase.functions.invoke('create-order', {
        body: { amount: 10, currency: 'INR', user_id: userId, email: userEmail },
      });

      if (!orderResponse.data || orderResponse.error) {
        console.error('create-order error', orderResponse.error);
        throw new Error(orderResponse.error?.message || 'Failed to create payment order');
      }

      const order = orderResponse.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Tool Collector',
        description: 'Premium Plan Subscription',
        handler: async (response: any) => {
          try {
            // Call server-side verification function
            const verifyResponse = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyResponse.error || !verifyResponse.data) {
              console.error('verify-payment error', verifyResponse.error);
              toast.error('Payment verification failed. Please contact support.');
              return;
            }

            if (verifyResponse.data?.ok) {
              toast.success('Payment successful! Welcome to Premium');
              navigate('/tools');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err: any) {
            console.error('Verification invoke failed', err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: userEmail,
          contact: (user as any)?.phoneNumbers?.[0]?.phoneNumber ?? undefined,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  }, [isSignedIn, user, userId, userEmail, navigate]);

  return {
    handleFreeSignup,
    handlePremiumSignup,
  };
};
