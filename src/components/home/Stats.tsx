// src/components/home/Stats.tsx
import React from "react";
import { Rocket, Users, Sparkles, Star } from "lucide-react";
import { useInView, useCountUp } from "./hooks";

const STATS = [
  { icon: Users, label: "Creators onboarded", value: 20 },
  { icon: Rocket, label: "Tools showcased", value: 40 },
  { icon: Sparkles, label: "Monthly searches", value: 250 },
  { icon: Star, label: "Avg. user rating", value: 5 }, // shown as 4.8+
];

export default function Stats() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section ref={ref} className="rounded-2xl border bg-card p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {STATS.map(({ icon: Icon, label, value }, idx) => {
          const isRating = label.toLowerCase().includes("rating");
          const count = useCountUp(value, inView);
          const display = isRating ? "4.8+" : `${count.toLocaleString()}${idx < 2 ? "+" : ""}`;

          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl border bg-background/50 p-3 md:p-4 transition-all duration-700 min-w-0 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="flex-shrink-0 rounded-full bg-primary/15 p-2 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              {/* content container uses min-w-0 to allow text to shrink/truncate properly on small screens */}
              <div className="min-w-0">
                {/* number: responsive sizes, allow wrapping and break words */}
                <div
                  className="text-lg md:text-2xl font-bold leading-tight truncate whitespace-normal break-words"
                  style={{ wordBreak: "break-word" }}
                >
                  {display}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
