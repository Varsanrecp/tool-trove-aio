// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Bookmark, Mail, Plus, Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const Header: React.FC = () => {
  const location = useLocation();
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex items-center gap-4 py-4">
          <Link to="/" onClick={handleHomeClick} className="flex items-center">
            <img
              src="/toolexpo-high-resolution-logo-transparent (2).png"
              alt="Tool Expo Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-6 text-sm font-medium">
            <Link
              to="/"
              onClick={handleHomeClick}
              className={cn(
                "flex items-center space-x-2 transition-colors hover:text-primary",
                isActive('/') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/learn-ai"
              className={cn("transition-colors hover:text-primary", isActive('/learn-ai') ? "text-primary" : "text-muted-foreground")}
            >
              Learn AI
            </Link>

            <Link
              to="/tools"
              className={cn(
                "flex items-center space-x-2 transition-colors hover:text-primary",
                isActive('/tools') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Wrench className="h-4 w-4" />
              <span>Tools</span>
            </Link>

            {isSignedIn && (
              <>
                <Link
                  to="/saved"
                  className={cn(
                    "flex items-center space-x-2 transition-colors hover:text-primary",
                    isActive('/saved') ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Saved Tools</span>
                </Link>

                <Link
                  to="/submit"
                  className={cn(
                    "flex items-center space-x-2 transition-colors hover:text-primary",
                    isActive('/submit') ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Tool</span>
                </Link>
              </>
            )}

            <Link
              to="/contact"
              className={cn(
                "flex items-center space-x-2 transition-colors hover:text-primary",
                isActive('/contact') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* right actions (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm">Sign Up</Button>
                </SignUpButton>
              </>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>

          {/* mobile hamburger */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-md hover:bg-white/5"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          {/* solid background matching site card color */}
          <div
            className="absolute inset-0 bg-card p-6 overflow-auto"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 container max-w-lg mx-auto py-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" onClick={() => { setMenuOpen(false); handleHomeClick(); }}>
                  <img
                    src="/toolexpo-high-resolution-logo-transparent (2).png"
                    alt="Tool Expo Logo"
                    className="h-8 w-auto"
                  />
                </Link>
                <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2 rounded-md hover:bg-white/5">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <nav className="flex flex-col space-y-3 mb-6">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={cn("flex items-center space-x-2", isActive('/') ? "text-primary" : "text-muted-foreground")}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <Link to="/learn-ai" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-primary">Learn AI</Link>

                <Link to="/tools" onClick={() => setMenuOpen(false)} className={cn(isActive('/tools') ? "text-primary" : "text-muted-foreground")}>
                  Tools
                </Link>

                {isSignedIn && (
                  <>
                    <Link to="/saved" onClick={() => setMenuOpen(false)} className={cn(isActive('/saved') ? "text-primary" : "text-muted-foreground")}>
                      Saved Tools
                    </Link>
                    <Link to="/submit" onClick={() => setMenuOpen(false)} className={cn(isActive('/submit') ? "text-primary" : "text-muted-foreground")}>
                      Submit Tool
                    </Link>
                  </>
                )}

                <Link to="/contact" onClick={() => setMenuOpen(false)} className={cn(isActive('/contact') ? "text-primary" : "text-muted-foreground")}>
                  Contact
                </Link>
              </nav>

              <div className="flex flex-col gap-3">
                {!isSignedIn ? (
                  <div className="flex gap-3">
                    <SignInButton mode="modal">
                      <Button className="flex-1">Sign In</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="outline" className="flex-1">Sign Up</Button>
                    </SignUpButton>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
