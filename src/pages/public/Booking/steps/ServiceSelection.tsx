import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serviceData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { useBooking } from '../BookingContext';

interface ServiceSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = () => {
  const { selectedServices, setSelectedServices } = useBooking();

  // Group services by category
  const groupedServices = serviceData.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof serviceData>);

  const handleServiceToggle = (service: typeof serviceData[0]) => {
    setSelectedServices(
      selectedServices.some(s => s.id === service.id)
        ? selectedServices.filter(s => s.id !== service.id)
        : [...selectedServices, service]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Services</h2>
        <p className="text-muted-foreground">
          Select one or more services you'd like to book
        </p>
      </div>

      <motion.div 
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        {Object.entries(groupedServices).map(([category, services]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedServices.some(s => s.id === service.id)
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {formatCurrency(service.price)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-4 w-4 mr-1" />
                          4.9
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BadgeCheck className="h-4 w-4 mr-1" />
                          Popular
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background border-t p-4 mt-8"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <div className="font-medium">Selected Services ({selectedServices.length})</div>
              <div className="text-sm text-muted-foreground">
                Total: {formatCurrency(selectedServices.reduce((sum, service) => sum + service.price, 0))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};