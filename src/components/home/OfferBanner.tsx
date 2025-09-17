// src/components/home/OfferBanner.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";

const RESET_KEY = "tm_offer_next_reset_v1";
const RESET_INTERVAL = 2 * 24 * 60 * 60 * 1000; // 2 days

function getOrCreateReset() {
  try {
    const raw = localStorage.getItem(RESET_KEY);
    if (raw) {
      const ts = Number(raw);
      if (!isNaN(ts) && ts > Date.now()) return ts;
    }
  } catch {}
  const next = Date.now() + RESET_INTERVAL;
  try {
    localStorage.setItem(RESET_KEY, String(next));
  } catch {}
  return next;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function OfferBanner() {
  const { currencySymbol, premiumPriceNumber, originalPrice } = useCurrency();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // pick display prices
  const isIN = currencySymbol === "₹";
  const original = isIN ? "₹100" : "$10";
  const discounted = isIN ? "₹10" : "$2";
  const percent = isIN ? 90 : 80;

  const [remaining, setRemaining] = useState(() => getOrCreateReset() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const next = getOrCreateReset();
      const rem = next - Date.now();
      setRemaining(rem);
      if (rem <= 0) {
        // reset next automatically
        localStorage.setItem(RESET_KEY, String(Date.now() + RESET_INTERVAL));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onCTA = () => {
    if (isSignedIn) navigate("/pricing");
    else {
      // open clerk modal by delegating to SignInButton - but programmatic click fallback:
      // We'll just navigate to pricing, but also open sign in if not signed in:
      document.querySelector<HTMLButtonElement>("[data-clerk-trigger]")?.click();
    }
  };

  const cta = isSignedIn ? (
    <Button onClick={() => navigate("/pricing")}>Upgrade Now</Button>
  ) : (
    <SignInButton mode="modal">
      <Button>Upgrade Now</Button>
    </SignInButton>
  );

  return (
    <section className="rounded-2xl border bg-card p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-primary font-semibold">Limited-time offer</div>
          <h3 className="text-xl md:text-2xl font-bold mt-1">Premium access — special launch price</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Get featured placement, priority support, and early access. Offer resets every 2 days — hurry!
          </p>

          <div className="mt-3 flex items-baseline gap-3">
            <div className="text-2xl md:text-3xl font-bold">
              <span className="line-through text-muted-foreground mr-2">{original}</span>
              <span className="text-primary">{discounted}</span>
            </div>
            <div className="text-sm text-muted-foreground">Save {percent}%</div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">Offer expires in: {formatRemaining(remaining)}</div>
        </div>

        <div className="flex-shrink-0">{cta}</div>
      </div>
    </section>
  );
}
