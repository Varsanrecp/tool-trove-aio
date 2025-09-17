// src/components/home/PricingHero.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  audience: "user" | "dev";
  onChangeAudience: (a: "user" | "dev") => void;
  currencySymbol: string;
  premiumPriceNumber: number;
}

const PricingHero: React.FC<Props> = ({ audience, onChangeAudience, currencySymbol, premiumPriceNumber }) => {
  return (
    <section className="rounded-2xl border bg-card p-8 md:p-12 text-center max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold">Simple pricing, designed to help you grow</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
        One premium plan that helps both active users and Micro-SaaS builders get more done — faster.
      </p>

      <div className="mt-6 inline-flex rounded-full bg-background/40 p-1">
        <button
          className={`px-4 py-2 rounded-full font-medium ${audience === "user" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => onChangeAudience("user")}
        >
          User
        </button>
        <button
          className={`px-4 py-2 rounded-full font-medium ${audience === "dev" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => onChangeAudience("dev")}
        >
          Micro-SaaS Developer
        </button>
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{currencySymbol}{premiumPriceNumber}</div>
          <div className="text-sm text-muted-foreground">/month</div>
        </div>
        <div className="max-w-xl text-sm text-muted-foreground">
          {audience === "user" ? (
            <>
              <p><strong>Recommended for active users:</strong> save favorite tools, quick discovery, and curated recommendations.</p>
            </>
          ) : (
            <>
              <p><strong>Recommended for Micro-SaaS founders:</strong> submit your tool, get early testers & feedback, featured placement, and promotional visibility.</p>
              <p className="mt-2">Problems we solve: low early traffic, slow feedback loops, and discoverability. This plan helps you get initial users and useful feedback faster.</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => (window.location.href = "/pricing")}>See plans</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/contact")}>Contact Sales</Button>
      </div>
    </section>
  );
};

export default PricingHero;
