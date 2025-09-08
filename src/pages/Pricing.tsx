// src/pages/Pricing.tsx
import React from "react";
import { usePaymentHandler } from "@/hooks/usePaymentHandler";
import { PricingCard } from "@/components/pricing/PricingCard";
import { useCurrency } from "@/hooks/useCurrency";

const PricingPage: React.FC = () => {
  // read display currency & price
  const { currencySymbol, premiumPriceNumber } = useCurrency();

  // keep using your existing payment handler (unchanged behavior)
  // NOTE: payment handler still uses the backend / Razorpay flow you already have
  const { handleFreeSignup, handlePremiumSignup } = usePaymentHandler();

  const freeFeatures = [
    "Access to all AI tools",
    "Basic search functionality",
    "Save favorite tools",
  ];

  const premiumFeatures = [
    "All Free Plan features",
    "Featured in recommendations",
    "Priority support",
    "Early access to new features",
  ];

  return (
    <main className="container py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start exploring AI tools today
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <PricingCard
          title="Free Plan"
          price="0"
          currency={currencySymbol}
          features={freeFeatures}
          buttonText="Get Started"
          onSubscribe={handleFreeSignup}
        />

        <PricingCard
          title="Premium Plan"
          price={String(premiumPriceNumber)}
          currency={currencySymbol}
          features={premiumFeatures}
          buttonText="Upgrade Now"
          onSubscribe={handlePremiumSignup}
          variant="premium"
        />
      </div>
    </main>
  );
};

export default PricingPage;
