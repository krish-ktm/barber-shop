import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Modern Cuts</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-primary">
              Services
            </Link>
            <Link to="/gallery" className="text-sm font-medium hover:text-primary">
              Gallery
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>

          <Link to="/booking">
            <Button>Book Now</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};