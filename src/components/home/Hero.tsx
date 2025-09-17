// src/components/home/Hero.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "./hooks";
import { SignInButton, useUser } from "@clerk/clerk-react";

export default function Hero() {
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLDivElement>();
  const { isSignedIn } = useUser();

  const submitButton = isSignedIn ? (
    <Button onClick={() => navigate("/submit")}>Submit your tool</Button>
  ) : (
    <SignInButton mode="modal">
      <Button>Submit your tool</Button>
    </SignInButton>
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-14"
    >
      {/* subtle gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div
        className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Find the right AI tool. <span className="text-primary">Faster.</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          Explore, compare, and save AI tools in one place. Submit your Micro-SaaS and reach early adopters.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {submitButton}
          <Button variant="outline" onClick={() => navigate("/tools")}>
            Explore tools
          </Button>
        </div>
      </div>
    </section>
  );
}
