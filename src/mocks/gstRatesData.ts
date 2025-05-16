import { GSTRate } from '@/types';

// Mock GST rates data
export const gstRatesData: GSTRate[] = [
  { 
    id: '1', 
    name: 'Standard GST (7.5%)', 
    components: [
      { id: 'comp-1', name: 'GST', rate: 7.5 }
    ],
    isActive: true,
    totalRate: 7.5
  },
  { 
    id: '2', 
    name: 'Reduced GST (5%)', 
    components: [
      { id: 'comp-2', name: 'GST', rate: 5 }
    ],
    isActive: false,
    totalRate: 5
  },
  { 
    id: '3', 
    name: 'India GST (18%)', 
    components: [
      { id: 'comp-3', name: 'CGST', rate: 9 },
      { id: 'comp-4', name: 'SGST', rate: 9 }
    ],
    isActive: false,
    totalRate: 18
  },
  { 
    id: '4', 
    name: 'India GST (12%)', 
    components: [
      { id: 'comp-5', name: 'CGST', rate: 6 },
      { id: 'comp-6', name: 'SGST', rate: 6 }
    ],
    isActive: false,
    totalRate: 12
  },
  { 
    id: '5', 
    name: 'India GST (5%)', 
    components: [
      { id: 'comp-7', name: 'CGST', rate: 2.5 },
      { id: 'comp-8', name: 'SGST', rate: 2.5 }
    ],
    isActive: false,
    totalRate: 5
  }
]; 