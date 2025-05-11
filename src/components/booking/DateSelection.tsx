import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { barbers } from '@/data/barbers';
import { ArrowRight } from 'lucide-react';

interface DateSelectionProps {
  onSelectDate: (date: Date) => void;
  barberId?: string;
}

export default function DateSelection({ onSelectDate, barberId }: DateSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Get barber details for displaying working days
  const barber = barbers.find(b => b.id === barberId);
  
  // Convert working days to day numbers (0 = Sunday, 1 = Monday, etc.)
  const workingDayNumbers = barber?.workingDays.map(day => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
  }) || [];
  
  // Disable dates in the past and non-working days
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable dates in the past
    if (date < today) {
      return true;
    }
    
    // Disable non-working days
    if (!workingDayNumbers.includes(date.getDay())) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select a Date</h2>
        <p className="text-muted-foreground">
          Choose a date for your appointment with {barber?.name}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={isDateDisabled}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Barber Schedule</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {barber?.name} works on the following days:
              </p>
              
              <div className="grid grid-cols-7 gap-1 mb-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                  const isWorkingDay = workingDayNumbers.includes(index);
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center justify-center rounded-full w-8 h-8 text-xs
                        ${isWorkingDay ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              
              <p className="text-sm mb-2">Working hours:</p>
              <p className="font-medium">{barber?.workHours.start} - {barber?.workHours.end}</p>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Button 
              onClick={() => date && onSelectDate(date)}
              disabled={!date}
              className="w-full"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}