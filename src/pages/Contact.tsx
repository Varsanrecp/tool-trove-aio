// src/pages/Contact.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const SUPPORT_EMAIL = "moneymindsmastery@gmail.com";

const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleMailTo = () => {
    const subject = encodeURIComponent("Feedback for AI TOOL Collector");
    const body = encodeURIComponent(
      `Hi,\n\nI'm excited to share feedback about your AI TOOL Collector project:\n\n`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore silently - clipboard may be blocked
      setCopied(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-start sm:items-center">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

          {/* Page header */}
          <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              We'd love to hear from you. Reach out via email — I read every message.
            </p>
          </header>

          {/* Email card */}
          <section className="w-full">
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-md bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Email</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    For feedback, suggestions or collaboration, email:
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-2 inline-block text-primary underline text-sm"
                    aria-label={`Email ${SUPPORT_EMAIL}`}
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              {/* Actions (centered) */}
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onClick={handleMailTo}
                  className="px-4 py-2"
                  aria-label="Open mail client to send feedback"
                >
                  Email Me
                </Button>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="px-4 py-2"
                  aria-label="Copy email address"
                >
                  {copied ? "Copied!" : "Copy Email"}
                </Button>
              </div>

              {/* small hint below actions */}
              <div className="text-xs text-muted-foreground mt-2">
                I usually read messages and will reply as soon as I can — looking forward to hearing from you.
              </div>
            </div>
          </section>

          {/* Why feedback matters */}
          <section className="w-full">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Why your feedback is valuable</h3>

              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Shape the product:</strong> Your input helps decide which features to build next.
                </li>
                <li>
                  <strong>Find real issues:</strong> Real-user reports help me spot and fix bugs faster.
                </li>
                <li>
                  <strong>Improve the experience:</strong> Tell me what’s confusing so I can make the UI clearer.
                </li>
                <li>
                  <strong>Inform pricing & priorities:</strong> Your use-cases show what should be free vs premium.
                </li>
                <li>
                  <strong>Early collaboration:</strong> If you want to help build or test, mention your role and I’ll reach out.
                </li>
              </ul>

              <div className="mt-4 text-sm text-muted-foreground">
                This is my first micro-SaaS — every message helps me iterate quickly and build something people actually love. Thanks for taking the time to share!
              </div>
            </div>
          </section>

          {/* Footer-like small line */}
          <footer className="text-center text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} AI TOOL Collector — Built with care.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Contact;
