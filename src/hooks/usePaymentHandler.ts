import { useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RAZORPAY_KEY_ID = "rzp_live_eG4P5xNRvPwZuI";

export const usePaymentHandler = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  const handleFreeSignup = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue with free plan");
      return;
    }

    try {
      const subscriptionData = {
        user_id: user?.id || '',
        plan_type: 'free',
        status: 'active',
        amount: 0,
        currency: 'INR',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData]);

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

    try {
      console.log('Loading Razorpay script...');
      await loadRazorpayScript();
      console.log('Razorpay script loaded successfully');

      console.log('Creating order...');
      const orderResponse = await supabase.functions.invoke('create-order', {
        body: { amount: 10, currency: 'INR' }
      });

      if (!orderResponse.data || orderResponse.error) {
        console.error('Order creation failed:', orderResponse.error || 'No order data received');
        throw new Error(orderResponse.error?.message || 'Failed to create payment order');
      }

      console.log('Order created successfully:', orderResponse.data);
      const order = orderResponse.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Tool Collector',
        description: 'Premium Plan Subscription',
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          try {
            const subscriptionData = {
              user_id: user?.id || '',
              plan_type: 'premium',
              status: 'active',
              amount: 10,
              currency: 'INR',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const { error } = await supabase
              .from('subscriptions')
              .insert([subscriptionData]);

            if (error) {
              console.error('Error saving subscription:', error);
              throw error;
            }

            toast.success("Payment successful! Welcome to Premium");
            navigate('/tools');
          } catch (error) {
            console.error('Error saving subscription:', error);
            toast.error("Failed to save subscription. Please contact support.");
          }
        },
        prefill: {
          email: user?.emailAddresses[0]?.emailAddress,
          contact: user?.phoneNumbers?.[0]?.phoneNumber
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            toast.error("Payment cancelled");
          }
        }
      };

      console.log('Initializing Razorpay payment...');
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error.message || "Failed to initialize payment");
    }
  }, [isSignedIn, user, navigate]);

  return {
    handleFreeSignup,
    handlePremiumSignup
  };
};
