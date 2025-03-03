
import { useUser } from "@clerk/clerk-react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleFreeSignup = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue with free plan");
      return;
    }
    // TODO: Implement free plan signup
    toast.success("Successfully signed up for free plan");
  };

  const handlePremiumSignup = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue with premium plan");
      return;
    }
    // TODO: Implement Razorpay integration
    toast.success("Payment integration coming soon!");
  };

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
