// src/components/home/FAQ.tsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is AI Tool Collector?",
    a: "A curated place to explore, compare, and save useful AI tools. Micro-SaaS founders can also submit their tools to reach early users.",
  },
  {
    q: "Is it free to explore tools?",
    a: "Yes. You can browse, search, and save tools for free. A premium plan unlocks priority visibility and early features.",
  },
  {
    q: "Can I submit my own tool?",
    a: "Absolutely. Use the Submit page. We’ll feature quality tools and surface them to interested users.",
  },
  {
    q: "Do you verify tools?",
    a: "We aim to keep the directory high-quality. We review submissions and highlight the best with helpful tags and categories.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="rounded-2xl border bg-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-center">Frequently asked questions</h2>
      <div className="mx-auto mt-6 max-w-3xl divide-y divide-border">
        {FAQS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <button
              key={item.q}
              onClick={() => setOpen(isOpen ? null : idx)}
              className="w-full py-4 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.q}</h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
              <div
                className={`text-sm text-muted-foreground transition-all ${
                  isOpen ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                {item.a}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
