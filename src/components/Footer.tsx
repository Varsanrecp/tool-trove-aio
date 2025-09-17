// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-12">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <img src="/toolexpo-high-resolution-logo-transparent (2).png" alt="logo" className="h-8 mb-4" />
          <p className="text-sm text-muted-foreground max-w-md">
            AI Tool Collector — discover, save, and learn AI tools. Built for users and Micro-SaaS founders.
          </p>
        </div>

        <div className="flex gap-6">
          <div>
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tools">Tools</Link></li>
              <li><Link to="/submit">Submit</Link></li>
              <li><Link to="/learn-ai">Learn AI</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Get in touch</h4>
          <p className="text-sm text-muted-foreground">moneymindsmastery@gmail.com</p>
          <p className="text-xs text-muted-foreground mt-4">© {new Date().getFullYear()} AI Tool Collector. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
