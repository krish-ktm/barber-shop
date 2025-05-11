export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  barberName: string;
  barberId: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    reason?: string;
  };
  discountAmount: number;
  tip?: number;
  tax: number;
  taxRate: number;
  total: number;
  date: string; // ISO date string
  paymentMethod: 'cash' | 'credit' | 'debit' | 'mobile';
  status: 'paid' | 'pending' | 'refunded';
  notes?: string;
  bookingId?: string;
}

// Generate 30 random invoices
export const generateInvoices = (): Invoice[] => {
  const result: Invoice[] = [];
  const paymentMethods: Invoice['paymentMethod'][] = ['cash', 'credit', 'debit', 'mobile'];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 60);
  
  for (let i = 1; i <= 50; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.floor(Math.random() * 60));
    
    const barberId = `b${Math.floor(Math.random() * 5) + 1}`;
    const barberName = ['James Wilson', 'Michael Rodriguez', 'Robert Johnson', 'David Thompson', 'John Adams'][parseInt(barberId.slice(1)) - 1];
    
    // Create 1-3 items per invoice
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items: InvoiceItem[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const serviceId = Math.floor(Math.random() * 8) + 1;
      const serviceName = ['Classic Haircut', 'Beard Trim', 'Full Shave', 'Haircut & Beard Combo', 
                           'Premium Haircut', 'Kid\'s Haircut', 'Head Shave', 'Hair Coloring'][serviceId - 1];
      const servicePrice = [35, 20, 30, 50, 45, 25, 30, 70][serviceId - 1];
      const qty = 1;
      
      items.push({
        id: `item${j + 1}`,
        description: serviceName,
        quantity: qty,
        price: servicePrice,
        total: qty * servicePrice
      });
      
      subtotal += qty * servicePrice;
    }
    
    // Randomly add product items
    if (Math.random() > 0.7) {
      const productItems = [
        {name: 'Styling Pomade', price: 18},
        {name: 'Beard Oil', price: 22},
        {name: 'Shampoo', price: 15},
        {name: 'Hair Wax', price: 20}
      ];
      
      const product = productItems[Math.floor(Math.random() * productItems.length)];
      items.push({
        id: `item${items.length + 1}`,
        description: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      });
      
      subtotal += product.price;
    }
    
    // Apply discount on some invoices
    let discount = undefined;
    let discountAmount = 0;
    
    if (Math.random() > 0.7) {
      const isPercentage = Math.random() > 0.5;
      const discountValue = isPercentage ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10) + 5;
      
      discount = {
        type: isPercentage ? 'percentage' : 'fixed',
        value: discountValue,
        reason: Math.random() > 0.5 ? 'Loyalty discount' : 'First-time customer'
      };
      
      discountAmount = isPercentage ? (subtotal * (discountValue / 100)) : discountValue;
    }
    
    const taxRate = 0.07; // 7% tax
    const tax = (subtotal - discountAmount) * taxRate;
    
    // Add tip on some invoices
    const tip = Math.random() > 0.3 ? Math.round(subtotal * (Math.floor(Math.random() * 15) + 10) / 100) : undefined;
    
    const total = subtotal - discountAmount + tax + (tip || 0);
    
    result.push({
      id: `INV-${i.toString().padStart(4, '0')}`,
      customerId: Math.random() > 0.2 ? `c${Math.floor(Math.random() * 20) + 1}` : undefined,
      customerName: `Customer ${Math.floor(Math.random() * 20) + 1}`,
      customerEmail: Math.random() > 0.5 ? `customer${Math.floor(Math.random() * 20) + 1}@example.com` : undefined,
      barberName,
      barberId,
      items,
      subtotal,
      discount,
      discountAmount,
      tip,
      tax,
      taxRate,
      total,
      date: date.toISOString(),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: Math.random() > 0.1 ? 'paid' : (Math.random() > 0.5 ? 'pending' : 'refunded'),
      notes: Math.random() > 0.8 ? 'Customer was very satisfied' : undefined,
      bookingId: Math.random() > 0.5 ? `bk${Math.floor(Math.random() * 50) + 1}`.padStart(5, '0') : undefined
    });
  }
  
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const invoices = generateInvoices();

// Get recent invoices (last 7 days)
export const getRecentInvoices = () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return invoices.filter(invoice => new Date(invoice.date) >= sevenDaysAgo);
};

// Calculate total revenue
export const getTotalRevenue = () => {
  return invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
};

// Get revenue by barber
export const getRevenueByBarber = () => {
  const result: Record<string, number> = {};
  
  invoices
    .filter(invoice => invoice.status === 'paid')
    .forEach(invoice => {
      if (!result[invoice.barberName]) {
        result[invoice.barberName] = 0;
      }
      result[invoice.barberName] += invoice.total;
    });
  
  return Object.entries(result).map(([name, total]) => ({ name, total }));
};