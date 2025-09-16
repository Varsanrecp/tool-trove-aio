// src/components/home/Hero.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "./hooks";

export default function Hero() {
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-12"
    >
      {/* subtle gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -right-8 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div
        className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Find the right AI tool. <span className="text-primary">Faster.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore, compare, and save AI tools in one place. Submit your Micro-SaaS and reach early adopters.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button className="w-full sm:w-auto" onClick={() => navigate("/submit")}>
            Submit your tool
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/tools")}>
            Explore tools
          </Button>
        </div>
      </div>
    </section>
  );
}
