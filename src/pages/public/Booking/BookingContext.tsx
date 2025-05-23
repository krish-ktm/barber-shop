import React, { createContext, useContext, useState } from 'react';
import { Service, Staff } from '@/types';

interface BookingContextType {
  selectedServices: Service[];
  selectedStaffId: string | null;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  totalDuration: number;
  totalPrice: number;
  bookingFlow: 'service-first' | 'staff-first';
  setSelectedServices: (services: Service[]) => void;
  setSelectedStaffId: (staffId: string | null) => void;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string | null) => void;
  setCustomerDetails: (details: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
  setBookingFlow: (flow: 'service-first' | 'staff-first') => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingFlow, setBookingFlow] = useState<'service-first' | 'staff-first'>('service-first');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Calculate total duration and price
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <BookingContext.Provider
      value={{
        selectedServices,
        selectedStaffId,
        selectedDate,
        selectedTime,
        customerDetails,
        totalDuration,
        totalPrice,
        bookingFlow,
        setSelectedServices,
        setSelectedStaffId,
        setSelectedDate,
        setSelectedTime,
        setCustomerDetails,
        setBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};