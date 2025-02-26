
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <nav className="flex items-center space-x-6 text-sm font-medium">
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
        </nav>
      </div>
    </header>
  );
};
