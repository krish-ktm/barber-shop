import { bookings } from './bookings';
import { invoices, getTotalRevenue, getRevenueByBarber } from './invoices';
import { barbers } from './barbers';
import { services } from './services';

// Get today's date
const today = new Date();
const todayISO = today.toISOString().split('T')[0];

// Get dates for last 7 days, 30 days
const last7Days = new Date(today);
last7Days.setDate(today.getDate() - 7);
const last7DaysISO = last7Days.toISOString().split('T')[0];

const last30Days = new Date(today);
last30Days.setDate(today.getDate() - 30);
const last30DaysISO = last30Days.toISOString().split('T')[0];

// Bookings statistics
export const bookingStats = {
  total: bookings.length,
  today: bookings.filter(booking => booking.date === todayISO).length,
  last7Days: bookings.filter(booking => booking.date >= last7DaysISO).length,
  last30Days: bookings.filter(booking => booking.date >= last30DaysISO).length,
  upcoming: bookings.filter(booking => booking.date >= todayISO && booking.status === 'confirmed').length,
  completed: bookings.filter(booking => booking.status === 'completed').length,
  cancelled: bookings.filter(booking => booking.status === 'cancelled').length,
  noShow: bookings.filter(booking => booking.status === 'no-show').length,
};

// Revenue statistics
export const revenueStats = {
  total: getTotalRevenue(),
  today: invoices
    .filter(invoice => invoice.date.startsWith(todayISO) && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0),
  last7Days: invoices
    .filter(invoice => new Date(invoice.date) >= last7Days && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0),
  last30Days: invoices
    .filter(invoice => new Date(invoice.date) >= last30Days && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0),
  byBarber: getRevenueByBarber(),
  averageTicket: getTotalRevenue() / invoices.filter(invoice => invoice.status === 'paid').length,
};

// Staff statistics
export const staffStats = {
  total: barbers.length,
  active: barbers.filter(barber => barber.active).length,
  mostBookings: (() => {
    const barberBookings: Record<string, number> = {};
    
    bookings.forEach(booking => {
      if (!barberBookings[booking.barberName]) {
        barberBookings[booking.barberName] = 0;
      }
      barberBookings[booking.barberName]++;
    });
    
    // Find barber with most bookings
    let maxBookings = 0;
    let topBarber = '';
    
    Object.entries(barberBookings).forEach(([name, count]) => {
      if (count > maxBookings) {
        maxBookings = count;
        topBarber = name;
      }
    });
    
    return { name: topBarber, bookings: maxBookings };
  })(),
};

// Service statistics
export const serviceStats = {
  total: services.length,
  mostPopular: (() => {
    const serviceCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
      if (!serviceCounts[booking.serviceName]) {
        serviceCounts[booking.serviceName] = 0;
      }
      serviceCounts[booking.serviceName]++;
    });
    
    // Find most popular service
    let maxCount = 0;
    let topService = '';
    
    Object.entries(serviceCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topService = name;
      }
    });
    
    return { name: topService, count: maxCount };
  })(),
  avgPrice: services.reduce((sum, service) => sum + service.price, 0) / services.length,
};

// Daily data for charts
export const dailyStats = (() => {
  const result = [];
  
  // Generate data for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateISO = date.toISOString().split('T')[0];
    
    // Count bookings for this day
    const dayBookings = bookings.filter(booking => booking.date === dateISO);
    
    // Calculate revenue for this day
    const dayRevenue = invoices
      .filter(invoice => invoice.date.startsWith(dateISO) && invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    result.push({
      date: dateISO,
      bookings: dayBookings.length,
      revenue: dayRevenue,
      completed: dayBookings.filter(booking => booking.status === 'completed').length,
      cancelled: dayBookings.filter(booking => booking.status === 'cancelled').length,
    });
  }
  
  return result.reverse();
})();

// Service popularity data
export const servicePopularity = (() => {
  const serviceCounts: Record<string, number> = {};
  
  bookings.forEach(booking => {
    if (!serviceCounts[booking.serviceName]) {
      serviceCounts[booking.serviceName] = 0;
    }
    serviceCounts[booking.serviceName]++;
  });
  
  return Object.entries(serviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
})();

// Payment method distribution
export const paymentMethodStats = (() => {
  const methods: Record<string, number> = {
    cash: 0,
    credit: 0,
    debit: 0,
    mobile: 0,
  };
  
  invoices.forEach(invoice => {
    methods[invoice.paymentMethod]++;
  });
  
  return Object.entries(methods)
    .map(([name, value]) => ({ name, value }));
})();