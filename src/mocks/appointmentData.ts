import { Appointment } from '@/types';
import { addDays, addMinutes, format, startOfDay, subDays } from 'date-fns';

// Helper function to generate appointments
const createAppointment = (
  id: string,
  customerId: string,
  customerName: string,
  customerPhone: string,
  staffId: string,
  staffName: string,
  dateOffset: number,
  time: string,
  services: { serviceId: string; serviceName: string; price: number; duration: number }[],
  status: Appointment['status'],
  notes?: string
): Appointment => {
  const date = format(addDays(startOfDay(new Date()), dateOffset), 'yyyy-MM-dd');
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes);
  
  // Calculate end time based on service durations
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
  const endTime = addMinutes(startTime, totalDuration);
  
  // Calculate total amount
  const totalAmount = services.reduce((sum, service) => sum + service.price, 0);
  
  return {
    id,
    customerId,
    customerName,
    customerPhone,
    customerEmail: `${customerName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    staffId,
    staffName,
    date,
    time: format(startTime, 'HH:mm'),
    endTime: format(endTime, 'HH:mm'),
    services,
    status,
    totalAmount,
    notes,
    createdAt: format(subDays(startTime, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    updatedAt: format(subDays(startTime, 2), "yyyy-MM-dd'T'HH:mm:ss"),
  };
};

// Generate mock appointment data
export const appointmentData: Appointment[] = [
  // Today's appointments
  createAppointment(
    'apt-1',
    'cust-1',
    'John Smith',
    '(555) 123-4567',
    'staff-1',
    'James Wilson',
    0,
    '09:30',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 },
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'confirmed',
    'Regular customer, prefers scissors over clippers'
  ),
  createAppointment(
    'apt-2',
    'cust-2',
    'Michael Johnson',
    '(555) 234-5678',
    'staff-2',
    'Miguel Rodriguez',
    0,
    '10:00',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-3',
    'cust-3',
    'Robert Davis',
    '(555) 345-6789',
    'staff-3',
    'Sarah Johnson',
    0,
    '11:15',
    [
      { serviceId: 'service-7', serviceName: 'Hair Coloring', price: 60, duration: 90 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-4',
    'cust-4',
    'William Brown',
    '(555) 456-7890',
    'staff-1',
    'James Wilson',
    0,
    '13:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-5',
    'cust-5',
    'James Miller',
    '(555) 567-8901',
    'staff-5',
    'Olivia Brown',
    0,
    '14:30',
    [
      { serviceId: 'service-8', serviceName: 'Deluxe Package', price: 75, duration: 120 }
    ],
    'scheduled',
    'First-time customer'
  ),
  
  // Tomorrow's appointments
  createAppointment(
    'apt-6',
    'cust-6',
    'Richard Wilson',
    '(555) 678-9012',
    'staff-2',
    'Miguel Rodriguez',
    1,
    '09:00',
    [
      { serviceId: 'service-5', serviceName: 'Hair & Beard Combo', price: 40, duration: 60 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-7',
    'cust-7',
    'Thomas Moore',
    '(555) 789-0123',
    'staff-3',
    'Sarah Johnson',
    1,
    '10:30',
    [
      { serviceId: 'service-3', serviceName: 'Hot Towel Shave', price: 35, duration: 45 }
    ],
    'scheduled'
  ),
  
  // Day after tomorrow
  createAppointment(
    'apt-8',
    'cust-8',
    'Daniel Taylor',
    '(555) 890-1234',
    'staff-4',
    'David Lee',
    2,
    '11:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 },
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'scheduled'
  ),
  
  // Previous appointments (completed)
  createAppointment(
    'apt-9',
    'cust-9',
    'Christopher White',
    '(555) 901-2345',
    'staff-1',
    'James Wilson',
    -1,
    '14:00',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-10',
    'cust-10',
    'Matthew Harris',
    '(555) 012-3456',
    'staff-5',
    'Olivia Brown',
    -1,
    '16:30',
    [
      { serviceId: 'service-9', serviceName: 'Hair Treatment', price: 45, duration: 60 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-11',
    'cust-1',
    'John Smith',
    '(555) 123-4567',
    'staff-2',
    'Miguel Rodriguez',
    -2,
    '10:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-12',
    'cust-11',
    'Andrew Clark',
    '(555) 123-7890',
    'staff-3',
    'Sarah Johnson',
    -2,
    '15:00',
    [
      { serviceId: 'service-8', serviceName: 'Deluxe Package', price: 75, duration: 120 }
    ],
    'no-show'
  ),
  createAppointment(
    'apt-13',
    'cust-12',
    'Ryan Phillips',
    '(555) 234-8901',
    'staff-4',
    'David Lee',
    -3,
    '13:30',
    [
      { serviceId: 'service-6', serviceName: 'Kids Haircut', price: 20, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-14',
    'cust-13',
    'Joshua Campbell',
    '(555) 345-9012',
    'staff-1',
    'James Wilson',
    -3,
    '17:00',
    [
      { serviceId: 'service-5', serviceName: 'Hair & Beard Combo', price: 40, duration: 60 }
    ],
    'cancelled',
    'Customer had emergency'
  ),
];