
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Bookmark, Mail, Plus } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const Header = () => {
  const location = useLocation();
  const { isSignedIn } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-auto py-4">
        <h1 className="text-2xl font-bold text-primary">AI TOOL COLLECTOR</h1>
        
        <nav className="flex items-center justify-center flex-1 space-x-6 text-sm font-medium">
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-2 transition-colors hover:text-primary",
              isActive('/') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
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
        
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  );
};
