import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../BookingContext';
import { Button } from '@/components/ui/button';
import { serviceData } from '@/mocks';
import { ChevronDown, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingServices, getStaffServices, BookingService } from '@/api/services/bookingService';
import { Service } from '@/types';

interface ServiceSelectionProps {
  hideHeading?: boolean;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ hideHeading = false }) => {
  const { selectedServices, setSelectedServices, selectedStaffId, bookingFlow } = useBooking();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [services, setServices] = useState<Record<string, BookingService[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  
  // Handle service toggle without triggering re-renders
  const handleServiceToggle = (service: Service | BookingService) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove the service if it's already selected
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      // Add the service if it's not selected
      setSelectedServices([...selectedServices, service as Service]);
    }
  };

  // Fetch services from API only once on initial load or when dependencies change
  useEffect(() => {
    const fetchServices = async () => {
      if (hasFetchedRef.current && !selectedStaffId) {
        return; // Skip fetching if we've already fetched and staff ID hasn't changed
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        
        // If we're in staff-first flow and have selected a staff member, get services for that staff
        if (bookingFlow === 'staff-first' && selectedStaffId) {
          response = await getStaffServices(selectedStaffId);
        } else {
          // Otherwise get all services
          response = await getBookingServices();
        }
        
        if (response.success) {
          console.log('Services data:', response.services);
          setServices(response.services);
          
          // Initialize open categories
          const initialOpenState = Object.keys(response.services).reduce((acc, category) => {
            acc[category] = true; // Set all categories to open by default
            return acc;
          }, {} as Record<string, boolean>);
          
          setOpenCategories(initialOpenState);
        } else {
          setError('Failed to load services');
          // Fallback to mock data
          const groupedMockServices = serviceData.reduce((acc, service) => {
            if (!acc[service.category]) {
              acc[service.category] = [];
            }
            acc[service.category].push(service);
            return acc;
          }, {} as Record<string, typeof serviceData>);
          
          setServices(groupedMockServices as unknown as Record<string, BookingService[]>);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        
        // Fallback to mock data
        const groupedMockServices = serviceData.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = [];
          }
          acc[service.category].push(service);
          return acc;
        }, {} as Record<string, typeof serviceData>);
        
        setServices(groupedMockServices as unknown as Record<string, BookingService[]>);
      } finally {
        setIsLoading(false);
        hasFetchedRef.current = true;
      }
    };

    fetchServices();
  }, [bookingFlow, selectedStaffId]);

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const getSelectedServicesCount = useCallback((category: string) => {
    return selectedServices.filter(service => service.category === category).length;
  }, [selectedServices]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {!hideHeading && (
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Your Services</h2>
          <p className="text-muted-foreground">
            Select one or more services you'd like to book
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {Object.keys(services).length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No services available for the selected staff member.
            Please choose a different staff member.
          </p>
        </div>
      ) : (
        Object.entries(services).map(([category, categoryServices]) => {
          const selectedCount = getSelectedServicesCount(category);
          return (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
              className="border rounded-lg"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  {selectedCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {openCategories[category] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  {categoryServices.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <Button
                        key={`service-${service.id}`}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full p-3 h-auto text-left flex flex-col ${isSelected ? "" : "hover:border-primary/50"}`}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default button behavior
                          e.stopPropagation(); // Stop event propagation
                          handleServiceToggle(service);
                        }}
                        type="button" // Explicitly set type to button
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[180px] sm:max-w-[250px]">{service.name}</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground">{service.duration} min</span>
                            </div>
                          </div>
                          <span className={`text-base font-medium shrink-0 ${isSelected ? "text-primary-foreground" : ""}`}>
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
    </motion.div>
  );
};