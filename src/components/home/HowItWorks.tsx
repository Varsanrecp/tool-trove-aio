// src/components/home/HowItWorks.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const [mode, setMode] = useState<"user" | "dev">("user");
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const submitButton = isSignedIn ? (
    <Button onClick={() => navigate("/submit")}>Submit your tool</Button>
  ) : (
    <SignInButton mode="modal">
      <Button>Submit your tool</Button>
    </SignInButton>
  );

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <p className="mt-2 text-muted-foreground">Choose your path and see how Tool Expo helps you.</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${mode === "user" ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}
          onClick={() => setMode("user")}
        >
          I'm a user
        </button>
        <button
          className={`px-4 py-2 rounded-md ${mode === "dev" ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}
          onClick={() => setMode("dev")}
        >
          I build Micro-SaaS
        </button>
      </div>

      <div className="space-y-4">
        {mode === "user" ? (
          <div>
            <h3 className="font-semibold">For users</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
              <li>Discover and compare AI tools in one place.</li>
              <li>Save favorite tools and revisit them quickly.</li>
              <li>See quick reviews and featured picks.</li>
            </ul>
            <div className="mt-4">{submitButton}</div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold">For Micro-SaaS developers</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
              <li>Submit your tool to reach early users and testers.</li>
              <li>Get featured placement and feedback to improve quickly.</li>
              <li>Use promotion and listing to get your first visitors and signups.</li>
            </ul>
            <div className="mt-4">{submitButton}</div>
          </div>
        )}
      </div>
    </section>
  );
}
