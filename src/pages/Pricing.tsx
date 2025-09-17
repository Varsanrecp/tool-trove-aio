// src/pages/Pricing.tsx
import React from "react";
import { usePaymentHandler } from "@/hooks/usePaymentHandler";
import { PricingCard } from "@/components/pricing/PricingCard";
import PricingHero from "@/components/home/PricingHero";
import OfferBanner from "@/components/home/OfferBanner";
import { useCurrency } from "@/hooks/useCurrency";
import { useUser } from "@clerk/clerk-react";

const PricingPage: React.FC = () => {
  const { handleFreeSignup, handlePremiumSignup } = usePaymentHandler();
  const currency = (useCurrency() as any) ?? { currencySymbol: "$", premiumPriceNumber: 2 };
  const currencySymbol = currency.currencySymbol ?? "$";
  const premiumPriceNumber = Number(currency.premiumPriceNumber ?? 2);

  const { isSignedIn } = useUser();

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

  const handlePremium = () => {
    if (!isSignedIn) {
      (document.querySelector<HTMLButtonElement>('[data-clerk-trigger]') as HTMLButtonElement | null)?.click();
      return;
    }
    handlePremiumSignup();
  };

  const handleFree = () => {
    if (!isSignedIn) {
      (document.querySelector<HTMLButtonElement>('[data-clerk-trigger]') as HTMLButtonElement | null)?.click();
      return;
    }
    handleFreeSignup();
  };

  return (
    <main className="container py-12">
      <OfferBanner place="pricing" />
      <PricingHero
        audience="user"
        onChangeAudience={() => {}}
        currencySymbol={currencySymbol}
        premiumPriceNumber={premiumPriceNumber}
      />

      <div className="mt-10 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <PricingCard
          title="Free Plan"
          price="0"
          currency={currencySymbol}
          features={freeFeatures}
          buttonText="Get Started"
          onSubscribe={handleFree}
        />

        <PricingCard
          title="Premium Plan"
          price={String(premiumPriceNumber)}
          currency={currencySymbol}
          features={premiumFeatures}
          buttonText="Upgrade Now"
          onSubscribe={handlePremium}
          variant="premium"
        />
      </div>
    </main>
  );
};

export default PricingPage;
