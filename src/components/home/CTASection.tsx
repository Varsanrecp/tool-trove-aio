// src/components/home/CTASection.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h3 className="text-2xl font-semibold">Building a Micro-SaaS?</h3>
        <p className="mt-2 text-muted-foreground">
          Submit your tool to reach early adopters and gather real feedback fast.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={() => navigate("/submit")}>Submit your tool</Button>
          <Button variant="outline" onClick={() => navigate("/tools")}>
            Explore directory
          </Button>
        </div>
      </div>
    </section>
  );
}
