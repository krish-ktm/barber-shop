import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash, Percent } from 'lucide-react';
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

const formSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  staffId: z.string().min(1, 'Please select a staff member'),
  services: z.array(z.object({
    serviceId: z.string().min(1, 'Please select a service'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Add at least one service'),
  discountType: z.enum(['none', 'percentage', 'fixed']).default('none'),
  discountValue: z.number().min(0, 'Discount cannot be negative').default(0),
  tipAmount: z.number().min(0, 'Tip cannot be negative'),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'pending']).default('cash'),
  gstRateId: z.string().min(1, 'Please select a GST rate'),
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
  const [services, setServices] = useState([{ id: '1', serviceId: '', quantity: 1 }]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Get default active GST rate
  const defaultGstRate = gstRatesData.find(rate => rate.isActive)?.id || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      staffId: '',
      services: [{ serviceId: '', quantity: 1 }],
      discountType: 'none',
      discountValue: 0,
      tipAmount: 0,
      paymentMethod: 'cash',
      gstRateId: defaultGstRate,
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
    return services.reduce((total, service) => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return total + (selectedService?.price || 0) * service.quantity;
    }, 0);
  };

  const handleAddService = () => {
    setServices([...services, { id: Date.now().toString(), serviceId: '', quantity: 1 }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
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
    const selectedGstRate = gstRatesData.find(rate => rate.id === values.gstRateId);
    
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
        quantity: service.quantity,
        total: selectedService.price * service.quantity
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
      services: formattedServices
    };

    console.log('Submitting invoice:', invoiceData);
    
    toast({
      title: 'Invoice created',
      description: 'New invoice has been created successfully.',
    });
    onOpenChange(false);
    form.reset();
    setServices([{ id: '1', serviceId: '', quantity: 1 }]);
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setActiveTab('search');
    newCustomerForm.reset();
  };

  const subtotal = calculateSubtotal();
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue') || 0;
  const gstRateId = form.watch('gstRateId');
  
  const discountAmount = 
    discountType === 'percentage' 
      ? (subtotal * (discountValue / 100)) 
      : discountType === 'fixed' 
        ? discountValue 
        : 0;
        
  const subtotalAfterDiscount = subtotal - discountAmount;
  const selectedGstRate = gstRatesData.find(rate => rate.id === gstRateId);
  
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Services</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddService}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                {services.map((service, index) => (
                  <div key={service.id} className="space-y-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <FormLabel className="text-sm">Service</FormLabel>
                        <Select
                          value={service.serviceId}
                          onValueChange={(value) => {
                            const newServices = [...services];
                            newServices[index].serviceId = value;
                            setServices(newServices);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceData.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} - {formatCurrency(s.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24">
                        <FormLabel className="text-sm">Quantity</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => {
                            const newServices = [...services];
                            newServices[index].quantity = parseInt(e.target.value) || 1;
                            setServices(newServices);
                          }}
                        />
                      </div>

                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveService(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {service.serviceId && (
                      <div className="text-sm text-right text-muted-foreground">
                        {formatCurrency(
                          (serviceData.find(s => s.id === service.serviceId)?.price || 0) *
                          service.quantity
                        )}
                      </div>
                    )}

                    {index < services.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>

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

              <div className="space-y-4">
                <FormLabel>Discount</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
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
                      </FormItem>
                    )}
                  />

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
                  <div className="text-sm text-right text-muted-foreground">
                    Discount: -{formatCurrency(discountAmount)}
                  </div>
                )}
              </div>

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
                name="gstRateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Rate</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select GST rate" />
                        </SelectTrigger>
                      </FormControl>
                                              <SelectContent>
                          {gstRatesData.map((gstRate) => (
                            <SelectItem key={gstRate.id} value={gstRate.id}>
                              {gstRate.name} ({gstRate.totalRate}%)
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
                
                {/* Display each tax component */}
                {taxComponents.map((component, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{component.name} ({component.rate}%):</span>
                    <span>{formatCurrency(component.amount)}</span>
                  </div>
                ))}
                
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