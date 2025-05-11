import { cn } from '@/lib/utils';
import { 
  Scissors, 
  User, 
  CalendarDays, 
  Clock,
  UserCircle, 
  CheckCircle 
} from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
}

const steps = [
  { 
    id: 1, 
    name: 'Service', 
    icon: Scissors 
  },
  { 
    id: 2, 
    name: 'Barber', 
    icon: User 
  },
  { 
    id: 3, 
    name: 'Date', 
    icon: CalendarDays 
  },
  { 
    id: 4, 
    name: 'Time', 
    icon: Clock 
  },
  { 
    id: 5, 
    name: 'Details', 
    icon: UserCircle 
  },
  { 
    id: 6, 
    name: 'Confirm', 
    icon: CheckCircle 
  },
];

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <div className="hidden md:flex justify-between">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <div 
            key={step.id} 
            className={cn(
              "flex flex-col items-center space-y-2 relative w-full",
              isActive ? "text-primary" : (isCompleted ? "text-muted-foreground" : "text-muted-foreground/60")
            )}
          >
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute top-5 w-full border-t",
                  isCompleted ? "border-primary" : "border-muted"
                )}
              />
            )}
            
            {/* Circle with icon */}
            <div 
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
                isActive ? "bg-primary text-primary-foreground" : 
                (isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/60")
              )}
            >
              <step.icon className="h-5 w-5" />
            </div>
            
            {/* Step name */}
            <span className="text-xs font-medium">{step.name}</span>
          </div>
        );
      })}
    </div>
  );
}