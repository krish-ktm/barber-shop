export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM (24-hour format)
  duration: number; // minutes
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  createdAt: string; // ISO date string
  notes?: string;
  cancellationReason?: string;
}

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate 50 random bookings
export const generateBookings = (): Booking[] => {
  const statuses: Booking['status'][] = ['confirmed', 'cancelled', 'completed', 'no-show'];
  const result: Booking[] = [];
  
  const today = new Date();
  const pastStart = new Date(today);
  pastStart.setDate(today.getDate() - 30);
  
  const futureEnd = new Date(today);
  futureEnd.setDate(today.getDate() + 30);
  
  for (let i = 1; i <= 50; i++) {
    const date = randomDate(pastStart, futureEnd);
    const isPast = date < today;
    
    // Past bookings are more likely to be completed or cancelled
    let status: Booking['status'];
    if (isPast) {
      const rand = Math.random();
      if (rand < 0.7) status = 'completed';
      else if (rand < 0.9) status = 'cancelled';
      else status = 'no-show';
    } else {
      status = 'confirmed'; // Future bookings are always confirmed
    }
    
    const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
    const mins = Math.random() < 0.5 ? '00' : '30'; // Only 00 or 30 minute slots
    const timeSlot = `${hours.toString().padStart(2, '0')}:${mins}`;
    
    const createdDate = new Date(date);
    createdDate.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Created 0-7 days before appointment
    
    const serviceId = `s${Math.floor(Math.random() * 8) + 1}`;
    const serviceName = ['Classic Haircut', 'Beard Trim', 'Full Shave', 'Haircut & Beard Combo', 
                         'Premium Haircut', 'Kid\'s Haircut', 'Head Shave', 'Hair Coloring'][parseInt(serviceId.slice(1)) - 1];
    
    const barberId = `b${Math.floor(Math.random() * 5) + 1}`;
    const barberName = ['James Wilson', 'Michael Rodriguez', 'Robert Johnson', 'David Thompson', 'John Adams'][parseInt(barberId.slice(1)) - 1];
    
    const duration = [30, 15, 30, 45, 45, 20, 30, 90][parseInt(serviceId.slice(1)) - 1];
    
    result.push({
      id: `bk${i.toString().padStart(3, '0')}`,
      customerId: `c${Math.floor(Math.random() * 20) + 1}`,
      customerName: `Customer ${Math.floor(Math.random() * 20) + 1}`,
      customerPhone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      customerEmail: Math.random() > 0.3 ? `customer${Math.floor(Math.random() * 20) + 1}@example.com` : undefined,
      serviceId,
      serviceName,
      barberId,
      barberName,
      date: date.toISOString().split('T')[0],
      timeSlot,
      duration,
      status,
      createdAt: createdDate.toISOString(),
      notes: Math.random() > 0.7 ? `Customer note ${i}` : undefined,
      cancellationReason: status === 'cancelled' ? 'Customer requested cancellation' : undefined
    });
  }
  
  return result;
};

export const bookings = generateBookings();

// Function to get today's bookings
export const getTodayBookings = () => {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(booking => booking.date === today);
};

// Function to get bookings for a specific barber
export const getBarberBookings = (barberId: string) => {
  return bookings.filter(booking => booking.barberId === barberId);
};

// Function to get upcoming bookings
export const getUpcomingBookings = () => {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(booking => 
    booking.date >= today && booking.status === 'confirmed'
  ).sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
};