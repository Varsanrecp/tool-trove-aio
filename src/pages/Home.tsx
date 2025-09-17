// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedTools from "@/components/home/FeaturedTools";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import OfferBanner from "@/components/home/OfferBanner";
import HowItWorks from "@/components/home/HowItWorks";

const Home: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main className="container py-8 md:py-10 space-y-10 md:space-y-14">
      <Hero />
      <Stats />
      <OfferBanner />
      <HowItWorks />
      <FeaturedTools />
      <Testimonials />
      <FAQ />
      <CTASection />
    </main>
  );
};

export default Home;
