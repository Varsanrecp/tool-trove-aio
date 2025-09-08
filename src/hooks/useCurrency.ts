// src/hooks/useCurrency.ts
import { useEffect, useState } from "react";

export function useCurrency() {
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [premiumPrice, setPremiumPrice] = useState<string>("$2");
  const [premiumPriceNumber, setPremiumPriceNumber] = useState<number>(2);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("geo lookup failed");
        const data = await res.json();

        if (!mounted) return;

        if (data?.country === "IN") {
          setCurrencySymbol("₹");
          setPremiumPrice("₹10");
          setPremiumPriceNumber(10);
        } else {
          setCurrencySymbol("$");
          setPremiumPrice("$2");
          setPremiumPriceNumber(2);
        }
      } catch (err) {
        // fallback to USD
        if (!mounted) return;
        setCurrencySymbol("$");
        setPremiumPrice("$2");
        setPremiumPriceNumber(2);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { currencySymbol, premiumPrice, premiumPriceNumber };
}
