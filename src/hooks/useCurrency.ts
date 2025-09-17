// src/hooks/useCurrency.ts
import { useEffect, useState } from "react";

type CurrencyInfo = {
  country?: string;
  currencySymbol: string;
  premiumPrice: string; // e.g. "₹10" or "$2"
  premiumPriceNumber: number; // numeric price for logic (10 or 2)
  originalPrice: string; // e.g. "₹100" or "$10" (for strikes)
};

const CACHE_KEY = "tm_currency_info_v1";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours cache

async function tryProviders(): Promise<string | null> {
  // List of providers (try in order). Some may fail due to CORS/rate-limit.
  const providers = [
    { url: "https://ipapi.co/json/", countryField: "country" },
    { url: "https://ipwhois.app/json/", countryField: "country" },
    { url: "https://geolocation-db.com/json/", countryField: "country_code" },
  ];

  for (const p of providers) {
    try {
      const resp = await fetch(p.url, { cache: "no-store" });
      if (!resp.ok) continue;
      const json = await resp.json();
      // different providers return different fields
      const code =
        (json as any)[p.countryField] ||
        (json as any).country ||
        (json as any).countryCode ||
        (json as any).country_code;
      if (typeof code === "string" && code.length > 0) return code.toUpperCase();
    } catch (err) {
      // ignore and continue to next provider
      // console.debug("provider failed", p.url, err);
    }
  }
  return null;
}

function pickCurrencyForCountry(countryCode?: string): CurrencyInfo {
  if (countryCode === "IN") {
    return {
      country: "IN",
      currencySymbol: "₹",
      premiumPrice: "₹10",
      premiumPriceNumber: 10,
      originalPrice: "₹100",
    };
  }

  // default / all others -> USD values
  return {
    country: countryCode,
    currencySymbol: "$",
    premiumPrice: "$2",
    premiumPriceNumber: 2,
    originalPrice: "$10",
  };
}

export function useCurrency() {
  const [info, setInfo] = useState<CurrencyInfo>(() =>
    // try read cached
    (() => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return pickCurrencyForCountry(undefined);
        const parsed = JSON.parse(raw);
        if (Date.now() - (parsed._ts || 0) > CACHE_TTL) return pickCurrencyForCountry(undefined);
        return {
          country: parsed.country,
          currencySymbol: parsed.currencySymbol,
          premiumPrice: parsed.premiumPrice,
          premiumPriceNumber: parsed.premiumPriceNumber,
          originalPrice: parsed.originalPrice,
        } as CurrencyInfo;
      } catch {
        return pickCurrencyForCountry(undefined);
      }
    })()
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const country = await tryProviders();
        if (cancelled) return;

        let chosen = pickCurrencyForCountry(country ?? undefined);

        // final fallback: try using navigator.language if no provider worked
        if (!country) {
          const nav = navigator.language || (navigator as any).userLanguage || "en-US";
          // common heuristic
          if (nav.toLowerCase().includes("in") || nav.toLowerCase().includes("hi")) {
            chosen = pickCurrencyForCountry("IN");
          } else {
            chosen = pickCurrencyForCountry(undefined);
          }
        }

        setInfo(chosen);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ...chosen, _ts: Date.now() })
          );
        } catch {
          // ignore
        }
      } catch (err) {
        // ignore — don't break app
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    currencySymbol: info.currencySymbol,
    premiumPrice: info.premiumPrice,
    premiumPriceNumber: info.premiumPriceNumber,
    originalPrice: info.originalPrice,
    country: info.country,
  };
}
