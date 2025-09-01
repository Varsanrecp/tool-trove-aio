// src/components/home/Testimonials.tsx
import { useInView } from "./hooks";

const TESTIMONIALS = [
  {
    name: "Raghav Krishna",
    role: "Early user",
    quote:
      "I will use 3 AI tools daily I could save them here and visit often.",
  },
  {
    name: "Masum Parvej",
    role: "Micro-SaaS builder",
    quote:
      "Submitted my tool and got first testers the same week. Exactly what I needed.",
  },
  {
    name: "Shahriar Hasan",
    role: "Micro-SaaS builder",
    quote:
      "I built my first Micro-SaaS and this tool helped me get traffic like about 20 visitors in a day.",
  },
];

export default function Testimonials() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">People are finding value</h2>
        <p className="mt-2 text-muted-foreground">
          A few words from early users and creators.
        </p>
      </div>

      <div ref={ref} className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={t.name}
            className={`rounded-2xl border bg-card p-6 transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                {t.name[0]}
              </div>
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-6">“{t.quote}”</p>
          </div>
        ))}
      </div>
    </section>
  );
}
