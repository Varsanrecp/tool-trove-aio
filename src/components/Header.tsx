
import { NavLink } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <NavLink to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">AI Tools Hub</span>
          </NavLink>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-foreground" : "text-foreground/60"
              }
            >
              Tools
            </NavLink>
            <NavLink
              to="/saved"
              className={({ isActive }) =>
                isActive ? "text-foreground" : "text-foreground/60"
              }
            >
              Saved
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "text-foreground" : "text-foreground/60"
              }
            >
              Contact
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};
