import { useUser } from "@clerk/clerk-react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = "rzp_live_eG4P5xNRvPwZuI";

const PricingPage = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
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
      // Load Razorpay script
      await loadRazorpayScript();

      // Create order
      const orderResponse = await supabase.functions.invoke('create-order', {
        body: { amount: 50, currency: 'INR' }
      });

      if (orderResponse.error) throw orderResponse.error;

      const order = orderResponse.data;

      // Initialize Razorpay payment
      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Tool Collector',
        description: 'Premium Plan Subscription',
        handler: async (response: any) => {
          try {
            const subscriptionData = {
              user_id: user?.id || '',
              plan_type: 'premium',
              status: 'active',
              amount: 50,
              currency: 'INR',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const { error } = await supabase
              .from('subscriptions')
              .insert([subscriptionData]);

            if (error) throw error;

            toast.success("Payment successful! Welcome to Premium");
            navigate('/tools');
          } catch (error) {
            console.error('Error saving subscription:', error);
            toast.error("Failed to save subscription");
          }
        },
        prefill: {
          email: user?.emailAddresses[0]?.emailAddress,
          contact: user?.phoneNumbers?.[0]?.phoneNumber
        },
        theme: {
          color: '#6366f1'
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initialize payment");
    }
  }, [isSignedIn, user, navigate]);

  return (
    <main className="container py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start exploring AI tools today
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-lg border bg-card p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Free Plan</h3>
            <p className="text-3xl font-bold mt-2">
              $0
              <span className="text-muted-foreground font-normal text-base">
                /month
              </span>
            </p>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Access to all AI tools</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Basic search functionality</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Save favorite tools</span>
            </li>
          </ul>

          <Button onClick={handleFreeSignup} variant="outline" className="w-full">
            Get Started
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="rounded-lg border bg-card p-8 space-y-6 relative">
          <div className="absolute -top-3 right-4">
            <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              Popular
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-bold">Premium Plan</h3>
            <p className="text-3xl font-bold mt-2">
              ₹50
              <span className="text-muted-foreground font-normal text-base">
                /month
              </span>
            </p>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>All Free Plan features</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Featured in recommendations</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Early access to new features</span>
            </li>
          </ul>

          <Button onClick={handlePremiumSignup} className="w-full">
            Upgrade Now
          </Button>
        </div>
      </div>
    </main>
  );
};

export default PricingPage;
