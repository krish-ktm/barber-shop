import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Search,
  Trash,
  Percent,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staffData, serviceData, customerData, gstRatesData } from '@/mocks';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Define steps for the invoice creation process
type Step = 'customer' | 'services' | 'staff' | 'payment' | 'summary';

const formSchema = z.object({
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  staffId: z.string().min(1, 'Please select a staff member'),
  discountType: z.enum(['none', 'percentage', 'fixed']).default('none'),
  discountValue: z.number().min(0, 'Discount cannot be negative').default(0),
  tipAmount: z.number().min(0, 'Tip cannot be negative').default(0),
  paymentMethod: z.enum(['cash', 'card', 'mobile']).default('cash'),
  gstRates: z.array(z.string()).min(1, 'Please select at least one GST rate'),
  notes: z.string().optional(),
});

const newCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

// Define a type for the invoice data
export interface InvoiceFormData {
  id?: string;
  customerPhone: string;
  staffId: string;
  discountType: 'none' | 'percentage' | 'fixed';
  discountValue: number;
  tipAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  gstRates: string[];
  notes?: string;
  services: Array<{ id: string; serviceId: string }>;
  customerName: string;
  isNewCustomer: boolean;
  customerDetails?: {
    name: string;
    email?: string;
    phone: string;
  };
}

interface StepWiseInvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
}

export const StepWiseInvoiceForm: React.FC<StepWiseInvoiceFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [services, setServices] = useState<Array<{ id: string; serviceId: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Get default active GST rate
  const defaultGstRate = gstRatesData.find(rate => rate.isActive)?.id || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      staffId: '',
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

  // Handle navigation between steps
  const nextStep = () => {
    switch (currentStep) {
      case 'customer':
        // Validate customer info before proceeding
        if (!selectedCustomer && !isNewCustomer) {
          toast({
            title: 'Customer required',
            description: 'Please search for a customer or create a new one.',
            variant: 'destructive',
          });
          return;
        }
        
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
        
        setCurrentStep('services');
        break;
      case 'services':
        // Validate services selection before proceeding
        if (services.length === 0) {
          toast({
            title: 'Services required',
            description: 'Please select at least one service.',
            variant: 'destructive',
          });
          return;
        }
        
        setCurrentStep('staff');
        break;
      case 'staff':
        // Validate staff selection before proceeding
        if (!form.getValues('staffId')) {
          toast({
            title: 'Staff required',
            description: 'Please select a staff member.',
            variant: 'destructive',
          });
          return;
        }
        
        setCurrentStep('payment');
        break;
      case 'payment':
        setCurrentStep('summary');
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'services':
        setCurrentStep('customer');
        break;
      case 'staff':
        setCurrentStep('services');
        break;
      case 'payment':
        setCurrentStep('staff');
        break;
      case 'summary':
        setCurrentStep('payment');
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    const values = form.getValues();
    onSubmit({
      ...values,
      services,
      customerName: selectedCustomer?.name || newCustomerForm.getValues().name,
      isNewCustomer,
      customerDetails: isNewCustomer ? {
        name: newCustomerForm.getValues().name,
        email: newCustomerForm.getValues().email,
        phone: values.customerPhone,
      } : undefined,
    });
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: Step[] = ['customer', 'services', 'staff', 'payment', 'summary'];
    const stepLabels: Record<Step, string> = {
      customer: 'Customer',
      services: 'Services',
      staff: 'Staff',
      payment: 'Payment',
      summary: 'Summary'
    };
    
    return (
      <div className="flex items-center justify-between mb-2 px-2 mt-4">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step 
                    ? 'bg-primary text-primary-foreground' 
                    : steps.indexOf(currentStep) > index
                      ? 'bg-primary/80 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {steps.indexOf(currentStep) > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 ${currentStep === step ? 'font-medium' : 'text-muted-foreground'}`}>
                {stepLabels[step]}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`h-[2px] flex-1 ${
                  steps.indexOf(currentStep) > index ? 'bg-primary/80' : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {renderStepIndicator()}

      <ScrollArea className="flex-grow pr-4 mb-16">
        <Form {...form}>
          <form className="space-y-6 py-6 px-4">
            {/* Step 1: Customer Information */}
            {currentStep === 'customer' && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Customer Information</h3>
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
            )}

            {/* Step 2: Services Selection - restore collapsible UI */}
            {currentStep === 'services' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Services</h3>
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
            )}

            {/* Step 3: Staff Selection */}
            {currentStep === 'staff' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Staff Member</h3>
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

                {/* Display selected services for reference */}
                {services.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium">Selected Services</h4>
                    <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
                      {services.map((service) => {
                        const selectedService = serviceData.find(s => s.id === service.serviceId);
                        if (!selectedService) return null;
                        
                        return (
                          <div key={service.id} className="flex justify-between">
                            <span>{selectedService.name}</span>
                            <span className="font-medium">{formatCurrency(selectedService.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Payment Information */}
            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Payment Details</h3>
                
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
                        </SelectContent>
                      </Select>
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
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === 'none') {
                              form.setValue('discountValue', 0);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Discount Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Discount</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step={form.watch('discountType') === 'percentage' ? '1' : '0.01'}
                              disabled={form.watch('discountType') === 'none'}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className={form.watch('discountType') === 'percentage' ? 'pr-8' : ''}
                            />
                            {form.watch('discountType') === 'percentage' && (
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
              </div>
            )}

            {/* Step 5: Review & Summary */}
            {currentStep === 'summary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Invoice</h3>
                
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Customer</h4>
                    <p>{selectedCustomer?.name || newCustomerForm.getValues().name}</p>
                    <p>{formatPhoneNumber(form.getValues().customerPhone)}</p>
                    {(selectedCustomer?.email || newCustomerForm.getValues().email) && (
                      <p>{selectedCustomer?.email || newCustomerForm.getValues().email}</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Services</h4>
                    {services.map((service) => {
                      const selectedService = serviceData.find(s => s.id === service.serviceId);
                      if (!selectedService) return null;
                      
                      return (
                        <div key={service.id} className="flex justify-between">
                          <span>{selectedService.name}</span>
                          <span>{formatCurrency(selectedService.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment</h4>
                    <div className="flex justify-between">
                      <span>Staff</span>
                      <span>{staffData.find(s => s.id === form.getValues().staffId)?.name || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <span>{form.getValues().paymentMethod.charAt(0).toUpperCase() + form.getValues().paymentMethod.slice(1)}</span>
                    </div>
                    {form.getValues().discountType !== 'none' && (
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span>
                          {form.getValues().discountType === 'percentage' 
                            ? `${form.getValues().discountValue}%` 
                            : formatCurrency(form.getValues().discountValue)}
                        </span>
                      </div>
                    )}
                    {form.getValues().tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tip</span>
                        <span>{formatCurrency(form.getValues().tipAmount)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(
                      services.reduce((sum, service) => {
                        const selectedService = serviceData.find(s => s.id === service.serviceId);
                        return sum + (selectedService?.price || 0);
                      }, 0)
                    )}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </ScrollArea>

      <div className="flex justify-between border-t pt-4 px-6 py-4 absolute bottom-0 left-0 right-0 bg-background shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
        <Button 
          variant="outline" 
          onClick={currentStep === 'customer' ? onCancel : prevStep}
        >
          {currentStep === 'customer' ? 'Cancel' : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </>
          )}
        </Button>
        
        {currentStep === 'summary' ? (
          <Button onClick={handleSubmit}>
            Create Invoice
            <Check className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
