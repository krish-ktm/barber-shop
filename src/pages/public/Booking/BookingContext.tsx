import React, { createContext, useContext, useState } from 'react';
import { Service, Staff } from '@/types';

interface BookingContextType {
  selectedServices: Service[];
  selectedStaffId: string | null;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  firstSelection: 'service' | 'staff' | null;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  totalDuration: number;
  totalPrice: number;
  setSelectedServices: (services: Service[]) => void;
  setSelectedStaffId: (staffId: string | null) => void;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string | null) => void;
  setFirstSelection: (type: 'service' | 'staff' | null) => void;
  setCustomerDetails: (details: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [firstSelection, setFirstSelection] = useState<'service' | 'staff' | null>(null);
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
        firstSelection,
        customerDetails,
        totalDuration,
        totalPrice,
        setSelectedServices,
        setSelectedStaffId,
        setSelectedDate,
        setSelectedTime,
        setFirstSelection,
        setCustomerDetails,
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