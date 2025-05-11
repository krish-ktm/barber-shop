import { Barber } from '@/data/barbers';
import { Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarberListProps {
  barbers: Barber[];
  onSelect: (barberId: string) => void;
  selectedService?: string;
}

export default function BarberList({ barbers, onSelect, selectedService }: BarberListProps) {
  // For a real app, we would filter barbers based on the selected service
  // For now, we'll just display all barbers
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Barber</h2>
        <p className="text-muted-foreground">
          Select from our team of professional barbers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="border rounded-lg overflow-hidden hover:border-primary transition-colors"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Barber image */}
              <div className="w-full sm:w-1/3 h-auto sm:h-full">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-40 sm:h-full object-cover"
                />
              </div>
              
              {/* Barber info */}
              <div className="w-full sm:w-2/3 p-4">
                <h3 className="font-semibold text-lg">{barber.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{barber.title}</p>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 text-yellow-500 fill-yellow-500" 
                    />
                  ))}
                  <span className="ml-2 text-sm">{barber.rating}</span>
                </div>
                
                {/* Experience */}
                <p className="text-sm mb-2">
                  {barber.experience} years experience
                </p>
                
                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {barber.specialties.slice(0, 3).map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-secondary rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                {/* Working days */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];
                    const isWorkingDay = barber.workingDays.includes(fullDay);
                    
                    return (
                      <span 
                        key={day}
                        className={`px-2 py-0.5 rounded-full text-xs
                          ${isWorkingDay ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
                
                <Button 
                  onClick={() => onSelect(barber.id)}
                  className="w-full"
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}