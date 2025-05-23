import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Trash, Percent } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { staffData, serviceData, customerData, gstRatesData } from '@/mocks';
import { formatCurrency, formatPhoneNumber, calculateTax } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Import mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Premium Hair Gel',
    category: 'Styling',
    price: 24.99,
    stock: 50,
    status: 'active',
  },
  {
    id: '2',
    name: 'Beard Oil',
    category: 'Beard Care',
    price: 19.99,
    stock: 30,
    status: 'active',
  },
];

const formSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  staffId: z.string().min(1, 'Please select a staff member'),
  services: z.array(z.object({
    serviceId: z.string().min(1, 'Please select a service'),
  })).min(1, 'Add at least one service'),
  discountType: z.enum(['none', 'percentage', 'fixed']).default('none'),
  discountValue: z.number().min(0, 'Discount cannot be negative').default(0),
  tipAmount: z.number().min(0, 'Tip cannot be negative'),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'pending']).default('cash'),
  gstRates: z.array(z.string()).min(1, 'Please select at least one GST rate'),
  notes: z.string().optional(),
});

const newCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Array<{ id: string; serviceId: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; productId: string; quantity: number }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Get default active GST rate
  const defaultGstRate = gstRatesData.find(rate => rate.isActive)?.id || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      staffId: '',
      services: [],
      discountType: 'none',
      discountValue: 0,
      tipAmount: 0,
      paymentMethod: 'cash',
      gstRates: [defaultGstRate],
      notes: '',
    },
  });

  const newCustomerForm = useForm<z.infer<typeof newCustomerSchema>>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSearchCustomer = (phone: string) => {
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const formattedPhone = phone.replace(/\D/g, '');
      const customer = customerData.find(c => c.phone.replace(/\D/g, '') === formattedPhone);
      
      if (customer) {
        setSelectedCustomer(customer);
        setIsNewCustomer(false);
        toast({
          title: 'Customer found',
          description: `Found customer: ${customer.name}`,
        });
      } else {
        setSelectedCustomer(null);
        setIsNewCustomer(true);
        setActiveTab('new');
        // Pre-fill the phone number in the form
        form.setValue('customerPhone', phone);
        toast({
          description: 'No customer found. Please provide customer details.',
        });
      }
      
      setIsSearching(false);
    }, 500);
  };

  const calculateSubtotal = () => {
    const servicesTotal = services.reduce((total, service) => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return total + (selectedService?.price || 0);
    }, 0);

    const productsTotal = products.reduce((sum, product) => {
      const selectedProduct = mockProducts.find(p => p.id === product.productId);
      return sum + ((selectedProduct?.price || 0) * product.quantity);
    }, 0);

    return servicesTotal + productsTotal;
  };

  const handleServiceSelection = (serviceId: string) => {
    const isSelected = services.some(s => s.serviceId === serviceId);
    
    if (isSelected) {
      // Remove service if already selected
      setServices(services.filter(s => s.serviceId !== serviceId));
    } else {
      // Add new service
      setServices([...services, { id: Date.now().toString(), serviceId }]);
    }
  };

  const getSelectedServicesCount = (category: string) => {
    return services.filter(service => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return selectedService?.category === category;
    }).length;
  };

  // Get unique categories from services
  const categories = Array.from(new Set(serviceData.map(service => service.category)));

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleProductSelection = (productId: string) => {
    if (!productId) return;
    
    // Add new product with quantity 1
    setProducts([...products, { id: Date.now().toString(), productId, quantity: 1 }]);
    
    // Reset the selected product
    setSelectedProductId('');
  };

  const handleProductQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove product if quantity is 0 or less
      setProducts(products.filter(p => p.productId !== productId));
    } else {
      // Update quantity
      setProducts(products.map(p => 
        p.productId === productId ? { ...p, quantity } : p
      ));
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.productId !== productId));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedCustomer && !isNewCustomer) {
      toast({
        title: 'Customer required',
        description: 'Please search for a customer first.',
        variant: 'destructive',
      });
      return;
    }

    // If it's a new customer, validate the form
    if (isNewCustomer) {
      const newCustomerData = newCustomerForm.getValues();
      if (!newCustomerData.name) {
        toast({
          title: 'Customer details required',
          description: 'Please provide customer name.',
          variant: 'destructive',
        });
        return;
      }
    }

    const subtotal = calculateSubtotal();
    const discountType = values.discountType !== 'none' ? values.discountType : undefined;
    const discountValue = discountType ? values.discountValue : undefined;
    const discountAmount = 
      discountType === 'percentage' 
        ? (subtotal * (values.discountValue / 100)) 
        : discountType === 'fixed' 
          ? values.discountValue 
          : 0;
    
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Get selected GST rate
    const selectedGstRate = gstRatesData.find(rate => values.gstRates.includes(rate.id));
    
    // Calculate tax components
    const taxComponents = selectedGstRate?.components.map(comp => ({
      name: comp.name,
      rate: comp.rate,
      amount: calculateTax(subtotalAfterDiscount, comp.rate)
    })) || [];
    
    // Calculate total tax amount
    const taxAmount = taxComponents.reduce((sum, comp) => sum + comp.amount, 0);
    const total = subtotalAfterDiscount + taxAmount + (values.tipAmount || 0);
    
    // Get total tax rate for invoice record
    const taxRate = selectedGstRate?.totalRate || 0;

    // Format services to match InvoiceService type
    const formattedServices = services.map(service => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      if (!selectedService) return null;
      
      return {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        quantity: 1,
        total: selectedService.price
      };
    }).filter(Boolean);

    // Format products to match InvoiceProduct type
    const formattedProducts = products.map(product => {
      const selectedProduct = mockProducts.find(p => p.id === product.productId);
      if (!selectedProduct) return null;
      
      return {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: product.quantity,
        price: selectedProduct.price,
        total: selectedProduct.price * product.quantity
      };
    }).filter(Boolean);

    // Get staff name
    const selectedStaff = staffData.find(staff => staff.id === values.staffId);
    const staffName = selectedStaff ? selectedStaff.name : '';
    
    // Generate invoice ID
    const today = new Date();
    const invoiceId = `inv-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Prepare the data to be sent to the server
    const invoiceData = {
      ...values,
      id: invoiceId,
      isNewCustomer,
      customerDetails: isNewCustomer ? {
        name: newCustomerForm.getValues('name'),
        email: newCustomerForm.getValues('email'),
        phone: values.customerPhone,
      } : undefined,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || newCustomerForm.getValues('name'),
      staffName,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      tax: taxRate,
      taxAmount,
      taxComponents,
      total,
      status: 'paid' as const,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      services: formattedServices,
      products: formattedProducts
    };

    console.log('Submitting invoice:', invoiceData);
    
    toast({
      title: 'Invoice created',
      description: 'New invoice has been created successfully.',
    });
    onOpenChange(false);
    form.reset();
    setServices([]);
    setProducts([]);
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setActiveTab('search');
    newCustomerForm.reset();
  };

  const subtotal = calculateSubtotal();
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue') || 0;
  const gstRates = form.watch('gstRates');
  
  const discountAmount = 
    discountType === 'percentage' 
      ? (subtotal * (discountValue / 100)) 
      : discountType === 'fixed' 
        ? discountValue 
        : 0;
        
  const subtotalAfterDiscount = subtotal - discountAmount;
  const selectedGstRate = gstRatesData.find(rate => gstRates.includes(rate.id));
  
  // Calculate tax components
  const taxComponents = selectedGstRate?.components.map(comp => ({
    name: comp.name,
    rate: comp.rate,
    amount: calculateTax(subtotalAfterDiscount, comp.rate)
  })) || [];
  
  // Calculate total tax amount
  const tax = taxComponents.reduce((sum, comp) => sum + comp.amount, 0);
  const total = subtotalAfterDiscount + tax + (form.watch('tipAmount') || 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Create New Invoice</SheetTitle>
          <SheetDescription>
            Create a new invoice by filling in the details below.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6 px-4">
              <Card className="p-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'new')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="search">Search Customer</TabsTrigger>
                    <TabsTrigger value="new">New Customer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedCustomer(null);
                                  setIsNewCustomer(false);
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => handleSearchCustomer(field.value)}
                              disabled={isSearching || !field.value}
                            >
                              {isSearching ? (
                                "Searching..."
                              ) : (
                                <>
                                  <Search className="h-4 w-4 mr-2" />
                                  Search
                                </>
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedCustomer && (
                      <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Customer Details</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setIsNewCustomer(false);
                              form.setValue('customerPhone', '');
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
                          <p><span className="font-medium">Phone:</span> {formatPhoneNumber(selectedCustomer.phone)}</p>
                          {selectedCustomer.email && (
                            <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                          )}
                          <p><span className="font-medium">Total Visits:</span> {selectedCustomer.visitCount}</p>
                          <p><span className="font-medium">Total Spent:</span> {formatCurrency(selectedCustomer.totalSpent)}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="new">
                    <div className="space-y-4">
                      <FormField
                        control={newCustomerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number" 
                            value={form.watch('customerPhone')} 
                            onChange={(e) => form.setValue('customerPhone', e.target.value)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.customerPhone?.message}</FormMessage>
                      </FormItem>

                      <FormField
                        control={newCustomerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Services</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {services.length} service{services.length !== 1 ? 's' : ''} selected
                  </div>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => {
                    const selectedCount = getSelectedServicesCount(category);
                    return (
                      <Collapsible
                        key={category}
                        open={openCategories[category]}
                        onOpenChange={() => toggleCategory(category)}
                        className="border rounded-lg"
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50">
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
                        <CollapsibleContent className="p-2">
                          <div className="grid gap-2">
                            {serviceData
                              .filter(s => s.category === category)
                              .map((s) => {
                                const isSelected = services.some(service => service.serviceId === s.id);
                                return (
                                  <Button
                                    key={s.id}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    className="w-full justify-between group"
                                    onClick={() => handleServiceSelection(s.id)}
                                  >
                                    <span>{s.name}</span>
                                    <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
                                      {formatCurrency(s.price)}
                                    </span>
                                  </Button>
                                );
                              })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>

                {services.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Selected Services</div>
                    {services.map((service) => {
                      const selectedService = serviceData.find(s => s.id === service.serviceId);
                      if (!selectedService) return null;
                      
                      return (
                        <div key={service.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{selectedService.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {selectedService.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                              {formatCurrency(selectedService.price)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleServiceSelection(service.serviceId)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Products</FormLabel>
                  {products.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {products.length} product{products.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select 
                    value={selectedProductId} 
                    onValueChange={(value) => {
                      handleProductSelection(value);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts
                        .filter(product => !products.some(p => p.productId === product.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {products.length > 0 && (
                  <div className="space-y-2">
                    {products.map((product) => {
                      const selectedProduct = mockProducts.find(p => p.id === product.productId);
                      if (!selectedProduct) return null;
                      
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{selectedProduct.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {selectedProduct.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleProductQuantityChange(product.productId, product.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-6 text-center">{product.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleProductQuantityChange(product.productId, product.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(selectedProduct.price * product.quantity)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(product.productId)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffData.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="mobile">Mobile Payment</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add any notes about the invoice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value === 'none') {
                                form.setValue('discountValue', 0);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Discount Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Discount</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>

                        <FormField
                          control={form.control}
                          name="discountValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    step={discountType === 'percentage' ? '1' : '0.01'}
                                    disabled={discountType === 'none'}
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className={discountType === 'percentage' ? 'pr-8' : ''}
                                  />
                                  {discountType === 'percentage' && (
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                      <Percent className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {discountAmount > 0 && (
                        <div className="text-sm text-right text-muted-foreground mt-1">
                          Discount: -{formatCurrency(discountAmount)}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tip Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>GST Rates</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {gstRatesData.map((gstRate) => (
                    <FormField
                      key={gstRate.id}
                      control={form.control}
                      name="gstRates"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={gstRate.id}
                            className="relative"
                          >
                            <FormControl>
                              <label className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2 hover:bg-muted/50 transition-colors cursor-pointer">
                                <Checkbox
                                  checked={field.value?.includes(gstRate.id)}
                                  onCheckedChange={(checked) => {
                                    const currentRates = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentRates, gstRate.id]);
                                    } else {
                                      field.onChange(
                                        currentRates.filter((id) => id !== gstRate.id)
                                      );
                                    }
                                  }}
                                />
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium text-sm">
                                    {gstRate.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {gstRate.totalRate}%
                                  </span>
                                </div>
                              </label>
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Discount
                      {discountType === 'percentage' ? ` (${discountValue}%)` : ''}:
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                {/* Display each tax component from selected GST rates */}
                {gstRates.map((gstRateId) => {
                  const gstRate = gstRatesData.find(rate => rate.id === gstRateId);
                  if (!gstRate) return null;

                  return gstRate.components.map((component, index) => (
                    <div key={`${gstRateId}-${index}`} className="flex justify-between text-sm text-muted-foreground">
                      <span>{component.name} ({component.rate}%):</span>
                      <span>{formatCurrency(calculateTax(subtotalAfterDiscount, component.rate))}</span>
                    </div>
                  ));
                })}
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tip:</span>
                  <span>{formatCurrency(form.watch('tipAmount') || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
            Create Invoice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};