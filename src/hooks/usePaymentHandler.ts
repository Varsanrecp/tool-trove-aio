import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const usePaymentHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn, user, getToken } = useAuth();
  const userDetails = user?.primaryEmailAddress?.emailAddress;

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
      toast.error("Please sign in to continue with free plan");
      return;
    }

    try {
      const token = await getToken();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) throw new Error("User not found");
      const subscriptionData = {
        user_id: user.id,
        plan_type: 'free',
        status: 'active',
        amount: 0,
        currency: 'INR',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData], { headers: { Authorization: `Bearer ${token}` } });

      if (error) throw error;
      toast.success("Successfully signed up for free plan");
      navigate('/tools');
    } catch (error) {
      toast.error("Failed to sign up for free plan");
      console.error(error);
    }
  };

  const handlePremiumSignup = useCallback(async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue with premium plan");
      return;
    }

    let razorpay: any;

    try {
      setIsProcessing(true);
      await loadRazorpayScript();

      // Get Clerk session token
      const token = await getToken();

      const orderResponse = await supabase.functions.invoke('create-order', {
        body: { amount: 10, currency: 'INR' },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!orderResponse.data || orderResponse.error) {
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
            const { data: { user } } = await supabase.auth.getUser(token);
            if (!user) throw new Error("User not found");

            const subscriptionData = {
              user_id: user.id,
              plan_type: 'premium',
              status: 'active',
              amount: 10,
              currency: 'INR',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            await supabase
              .from('subscriptions')
              .insert([subscriptionData], { headers: { Authorization: `Bearer ${token}` } });

            toast.success("Payment successful! Welcome to Premium");
            navigate('/tools');
          } catch (error) {
            console.error('Error saving subscription:', error);
            toast.error("Failed to save subscription. Please contact support.");
          }
        },
        prefill: {
          email: userDetails,
          contact: user?.phoneNumbers?.[0]?.phoneNumber
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled");
          }
        }
      };

      razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setIsProcessing(false);
    }
  }, [isSignedIn, user, navigate, getToken, userDetails]);

  return {
    handleFreeSignup,
    handlePremiumSignup
  };
};