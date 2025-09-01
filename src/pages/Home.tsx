// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedTools from "@/components/home/FeaturedTools";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGrid } from "@/components/CategoryGrid";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pricing geo logic (kept)
  const [priceAmount, setPriceAmount] = useState("₹10");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country === "IN") setPriceAmount("₹10");
        else setPriceAmount("$2");
      })
      .catch(() => setPriceAmount("$2"));
  }, []);

  const handleUpgradeClick = () => navigate("/pricing");

  return (
    <main className="container py-8 md:py-10 space-y-12 md:space-y-16">
      {/* HERO */}
      <Hero />

      {/* STATS */}
      <Stats />



      {/* FEATURED TOOLS (placeholders now) */}
      <FeaturedTools />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTASection />

      {/* PRICING (unchanged, kept at bottom) */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-white text-center">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Free Plan</h3>
              <p className="text-3xl font-bold">
                ₹0
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
                {priceAmount}
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
