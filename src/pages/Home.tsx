// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedTools from "@/components/home/FeaturedTools";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import { useCurrency } from "@/hooks/useCurrency";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // read display currency & price via hook (falls back inside hook if geo fails)
  const { currencySymbol, premiumPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleUpgradeClick = () => navigate("/pricing");

  return (
    <main className="container py-8 md:py-10 space-y-12 md:space-y-16">
      {/* HERO */}
      <Hero />

      {/* STATS */}
      <Stats />

      {/* FEATURED TOOLS */}
      <FeaturedTools />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTASection />

      {/* PRICING (kept at bottom, now uses currency hook for consistency) */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-white text-center">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Free Plan</h3>
              <p className="text-3xl font-bold">
                {currencySymbol}0
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Access to all AI tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Basic search functionality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Save favorite tools</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                Popular
              </span>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Premium Plan</h3>
              <p className="text-3xl font-bold">
                {premiumPrice}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>All Free Plan features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Featured in recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Early access to new features</span>
                </li>
              </ul>
              <Button className="w-full" onClick={handleUpgradeClick}>
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
