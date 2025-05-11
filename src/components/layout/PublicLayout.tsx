import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Scissors, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Scissors className="h-5 w-5" />
              <span>Barber Shop</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80">Home</Link>
              <Link to="/book" className="transition-colors hover:text-foreground/80">Book Appointment</Link>
              <Link to="#" className="transition-colors hover:text-foreground/80">Services</Link>
              <Link to="#" className="transition-colors hover:text-foreground/80">About Us</Link>
              <Link to="#" className="transition-colors hover:text-foreground/80">Contact</Link>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/admin">
                <Button variant="default" size="sm">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b py-4">
                  <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <Scissors className="h-5 w-5" />
                    <span>Barber Shop</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 py-8">
                  <div className="flex flex-col space-y-4 text-base font-medium">
                    <Link 
                      to="/" 
                      className="py-2 transition-colors hover:text-foreground/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/book" 
                      className="py-2 transition-colors hover:text-foreground/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Book Appointment
                    </Link>
                    <Link 
                      to="#" 
                      className="py-2 transition-colors hover:text-foreground/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>
                    <Link 
                      to="#" 
                      className="py-2 transition-colors hover:text-foreground/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link 
                      to="#" 
                      className="py-2 transition-colors hover:text-foreground/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </nav>
                <div className="border-t py-4 flex items-center justify-between">
                  <ThemeToggle />
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="default" size="sm">
                      Admin Login
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Barber Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}