import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Percent,
  ChevronDown,
  ChevronRight,
  UserCircle2,
  Info,
  Edit,
  Plus,
  Loader2,
  DollarSign
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { formatCurrency, formatPhoneNumber } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { Customer, getCustomerByPhone } from '@/api/services/customerService';

// Guest user handled directly in component, no need for a constant

// Define steps for the invoice creation process
type Step = 'customer' | 'services' | 'staff' | 'payment' | 'summary';

const formSchema = z.object({
  customerPhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number cannot exceed 10 digits'),
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
  products: Array<{ id: string; productId: string }>;
  customerName: string;
  isNewCustomer: boolean;
  isGuestUser: boolean;
  selectedCustomer?: Customer;
  customerDetails?: {
    name: string;
    email?: string;
    phone: string;
  };
}

interface StepWiseInvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  staffData?: Array<{
    id: string;
    name: string;
    position: string;
    image: string;
  }>;
  isLoadingStaff?: boolean;
  serviceData?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
    description?: string;
  }>;
  isLoadingServices?: boolean;
  productData?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
  }>;
  isLoadingProducts?: boolean;
  gstRatesData?: Array<{
    id: string;
    name: string;
    components: Array<{ id: string; name: string; rate: number }>;
    isActive: boolean;
    totalRate: number;
  }>;
}

export const StepWiseInvoiceForm: React.FC<StepWiseInvoiceFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  staffData = [],
  isLoadingStaff = false,
  serviceData = [],
  isLoadingServices = false,
  productData = [],
  isLoadingProducts = false,
  gstRatesData = []
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [services, setServices] = useState<Array<{ id: string; serviceId: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; productId: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  // We'll manage our own search state for UI, but use the API state for actual loading
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'new'>('search');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [showGstOptions, setShowGstOptions] = useState(false);
  const [customGstRate, setCustomGstRate] = useState<string>('');
  const [customGstValue, setCustomGstValue] = useState<number>(0);
  
  // API hook for customer search
  const {
    execute: executeCustomerSearch
  } = useApi(getCustomerByPhone);

  // Get default active GST rate
  const defaultGstRate = gstRatesData.length > 0 ? gstRatesData.find(rate => rate.isActive) || gstRatesData[0] : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      staffId: '',
      discountType: 'none',
      discountValue: 0,
      tipAmount: 0,
      paymentMethod: 'cash',
      gstRates: defaultGstRate ? [defaultGstRate.id] : [],
      notes: '',
    },
  });

  // Set default GST rate automatically when form loads or when gstRatesData changes
  React.useEffect(() => {
    // Find the active/default GST rate
    if (defaultGstRate) {
      form.setValue('gstRates', [defaultGstRate.id]);
      setCustomGstRate(`${defaultGstRate.name} - Custom`);
    } else if (gstRatesData.length > 0) {
      // If no active rate, use the first one
      form.setValue('gstRates', [gstRatesData[0].id]);
      setCustomGstRate(`${gstRatesData[0].name} - Custom`);
    }
  }, [gstRatesData]);

  const newCustomerForm = useForm<z.infer<typeof newCustomerSchema>>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Keep track of the last phone number we searched for to avoid duplicate calls
  const lastSearchedPhoneRef = React.useRef<string>('');

  // Automatically trigger customer search when exactly 10 digits are entered
  const customerPhoneValue = form.watch('customerPhone');
  React.useEffect(() => {
    // Only auto-search in the "search" tab
    if (activeTab !== 'search') return;

    const digitsOnly = customerPhoneValue.replace(/\D/g, '');
    if (digitsOnly.length === 10 && digitsOnly !== lastSearchedPhoneRef.current) {
      handleSearchCustomer(customerPhoneValue);
      lastSearchedPhoneRef.current = digitsOnly;
    }

    // Reset the last searched phone if the input becomes shorter than 10 digits
    if (digitsOnly.length < 10) {
      lastSearchedPhoneRef.current = '';
    }
  }, [customerPhoneValue, activeTab]);

  const handleSearchCustomer = (phone: string) => {
    if (!phone || phone.length < 10) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number with at least 10 digits.',
        variant: 'destructive',
      });
      return;
    }

    // Use both local and API loading states for UI feedback
    setIsSearching(true);
    
    // Format the phone for API query (remove non-digits)
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Use the API to search for customer
    executeCustomerSearch(formattedPhone)
      .then(response => {
        if (response.success && response.customer) {
          setSelectedCustomer(response.customer);
          setIsNewCustomer(false);
          toast({
            title: 'Customer found',
            description: `Found customer: ${response.customer.name}`,
          });
        } else {
          setSelectedCustomer(undefined);
          setIsNewCustomer(true);
          setActiveTab('new');
          // Pre-fill the phone number in the form
          form.setValue('customerPhone', phone);
          toast({
            description: 'No customer found. Please provide customer details.',
          });
        }
      })
      .catch(error => {
        console.error('Error searching for customer:', error);
        toast({
          title: 'Error',
          description: 'Failed to search for customer. Please try again.',
          variant: 'destructive',
        });
        setSelectedCustomer(undefined);
        setIsNewCustomer(true);
        setActiveTab('new');
      })
      .finally(() => {
        setIsSearching(false);
      });
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

  const handleProductSelection = (productId: string) => {
    const isSelected = products.some(p => p.productId === productId);
    if (isSelected) {
      setProducts(products.filter(p => p.productId !== productId));
    } else {
      setProducts([...products, { id: Date.now().toString(), productId }]);
    }
  };

  const getSelectedServicesCount = (category: string) => {
    return services.filter(service => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return selectedService?.category === category;
    }).length;
  };

  const getSelectedProductsCount = (category: string) => {
    return products.filter(product => {
      const selectedProduct = productData.find(p => p.id === product.productId);
      return selectedProduct?.category === category;
    }).length;
  };

  // Get unique categories from services
  const categories = Array.from(new Set(serviceData.map(service => service.category)));
  const productCategories = Array.from(new Set(productData.map(product => product.category)));

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
        // Check if there's any customer info provided
        if (activeTab === 'search') {
          if (!selectedCustomer && !isGuestUser) {
            // No customer selected in search tab - use guest user
            setIsGuestUser(true);
            setIsNewCustomer(false);
            setCurrentStep('services');
          } else {
            // Existing customer selected
            setIsGuestUser(false);
            setIsNewCustomer(false);
            setCurrentStep('services');
          }
        } else if (activeTab === 'new') {
          // Validate new customer data
          const newCustomerData = newCustomerForm.getValues();
          if (!newCustomerData.name) {
            toast({
              title: 'Customer details required',
              description: 'Please provide customer name.',
              variant: 'destructive',
            });
            return;
          }
          // Ensure we're using new customer mode, not guest
          setIsGuestUser(false);
          setIsNewCustomer(true);
          setCurrentStep('services');
        }
        break;
      case 'services':
        // Validate services or products selection before proceeding
        if (services.length === 0 && products.length === 0) {
          toast({
            title: 'Selection required',
            description: 'Please select at least one service or product.',
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
    // Don't process if we're already submitting
    if (isSubmitting) return;
    
    // Variables needed in switch cases
    let customerResult, staffResult, formValues, newCustomerValues, customerDetails;
    
    // Validate current step first
    switch(currentStep) {
      case 'customer':
        if (activeTab === 'search') {
          if (!selectedCustomer && !isGuestUser) {
            toast({
              title: 'Customer required',
              description: 'Please select a customer or create a new one.',
              variant: 'destructive',
            });
            return;
          }
        } else if (activeTab === 'new') {
          customerResult = newCustomerForm.trigger();
          if (!customerResult) return;
        }
        nextStep();
        break;
      case 'services':
        if (services.length === 0 && products.length === 0) {
          toast({
            title: 'Selection required',
            description: 'Please select at least one service or product.',
            variant: 'destructive',
          });
          return;
        }
        nextStep();
        break;
      case 'staff':
        staffResult = form.trigger('staffId');
        if (!staffResult) return;
        nextStep();
        break;
      case 'payment':
        nextStep();
        break;
      case 'summary':
        // Submit the final form data
        formValues = form.getValues();
        
        // Prepare customer details based on whether it's a new or existing customer
        if (isGuestUser) {
          customerDetails = {
            name: 'Guest',
            phone: formValues.customerPhone || '',
          };
        } else if (isNewCustomer) {
          newCustomerValues = newCustomerForm.getValues();
          customerDetails = {
            name: newCustomerValues.name,
            email: newCustomerValues.email,
            phone: formValues.customerPhone,
          };
        }
        
        console.log('Services being submitted from StepWiseInvoiceForm:', JSON.stringify(services, null, 2));
        console.log('Service count:', services.length);
        
        // Make sure services array is not empty
        if (services.length === 0) {
          toast({
            title: 'Services required',
            description: 'Please select at least one service before submitting.',
            variant: 'destructive',
          });
          return;
        }
        
        onSubmit({
          ...formValues,
          services,
          products,
          customerName: selectedCustomer?.name || customerDetails?.name || 'Guest',
          isNewCustomer,
          isGuestUser,
          selectedCustomer: selectedCustomer,
          customerDetails,
        });
        break;
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between border-t py-4 px-6">
        <div className="flex gap-1 overflow-x-auto flex-wrap max-w-full">
          {['customer', 'services', 'staff', 'payment', 'summary'].map((step, index) => (
            <React.Fragment key={step}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              )}
              <div
                className={`text-xs font-medium ${
                  currentStep === step ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render the customer step
  const renderCustomerStep = () => {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Customer Information</h3>
        <Tabs value={activeTab} onValueChange={(value) => {
          const newTab = value as 'search' | 'new';
          setActiveTab(newTab);
          if (newTab === 'new') {
            setIsNewCustomer(true);
            setIsGuestUser(false);
          }
        }}>
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
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter phone number"
                        {...field}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          field.onChange(digitsOnly);
                          setSelectedCustomer(undefined);
                          setIsNewCustomer(false);
                          setIsGuestUser(false);
                        }}
                        className="pr-10"
                      />
                      {isSearching && (
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </FormControl>
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
                      setSelectedCustomer(undefined);
                      setIsNewCustomer(false);
                      setIsGuestUser(false);
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
                  {selectedCustomer.visit_count !== undefined && (
                    <p><span className="font-medium">Total Visits:</span> {selectedCustomer.visit_count}</p>
                  )}
                  {selectedCustomer.total_spent !== undefined && (
                    <p><span className="font-medium">Total Spent:</span> {formatCurrency(selectedCustomer.total_spent)}</p>
                  )}
                </div>
              </div>
            )}

            {isGuestUser && (
              <div className="rounded-lg border border-primary/30 p-4 bg-primary/5">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Guest User Selected</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You are proceeding with a guest user. No customer information will be saved.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press "Continue" without searching to proceed as guest
            </p>
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
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter phone number" 
                    value={form.watch('customerPhone')} 
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      form.setValue('customerPhone', digitsOnly);
                    }}
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
    );
  };

  // Render the staff step
  const renderStaffStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Select Staff Member</h3>
        
        {isLoadingStaff ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : staffData.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/30">
            <p>No staff members found. Please contact the administrator.</p>
          </div>
        ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staffData?.map((staff) => (
              <div 
                key={staff.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${form.watch('staffId') === staff.id ? 
                    'border-primary bg-primary/5 shadow-sm' : 
                    'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
                onClick={() => form.setValue('staffId', staff.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={staff.image} alt={staff.name} />
                    <AvatarFallback>
                      {staff.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-base font-medium">{staff.name}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{staff.position}</p>
                  {form.watch('staffId') === staff.id && (
                    <Badge className="mt-2">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {form.formState.errors.staffId && (
          <p className="text-destructive text-sm">{form.formState.errors.staffId.message}</p>
        )}

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
    );
  };

  // Render the payment step with enhanced UI for tips and discounts
  const renderPaymentStep = () => {
    // Calculate subtotal including products
    const subtotalServices = services.reduce((sum, service) => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return sum + (Number(selectedService?.price) || 0);
    }, 0);

    const subtotalProducts = products.reduce((sum, product) => {
      const selectedProduct = productData.find(p => p.id === product.productId);
      return sum + (Number(selectedProduct?.price) || 0);
    }, 0);

    const subtotal = subtotalServices + subtotalProducts;
    
    // Calculate discount amount
    let discountAmount = 0;
    const discountType = form.watch('discountType');
    const discountValue = Number(form.watch('discountValue')) || 0;
    
    if (discountType === 'percentage' && !isNaN(discountValue) && subtotal > 0) {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && !isNaN(discountValue)) {
      discountAmount = discountValue;
    }
    
    // Ensure discount amount is a valid number
    discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
    
    // Get tip amount
    const tipAmount = Number(form.watch('tipAmount')) || 0;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Payment Details</h3>
        
        {/* Payment Method + Discount in a single card */}
        <Card className="p-4 space-y-6">
          {/* Payment Method Section */}
          <div className="space-y-4">
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
          </div>

          <Separator />

          {/* Discount Section */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium flex items-center mb-2">
                <Percent className="h-4 w-4 mr-2 text-blue-600" /> Discount
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Apply a discount to this invoice
              </p>
            </div>
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
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
                        type="text"
                        inputMode="decimal"
                        min="0"
                        placeholder="0"
                        disabled={form.watch('discountType') === 'none'}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
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

            {/* Discount summary */}
            {discountType !== 'none' && discountValue > 0 && (
              <div className="p-3 bg-blue-50 rounded-md mt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Discount amount:</span>
                  <span className="font-medium">{formatCurrency(discountAmount)}</span>
                </div>
                {subtotal > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {((discountAmount / subtotal) * 100).toFixed(1)}% of subtotal
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
        
        {/* Tip Section */}
        <Card>
          <div className="p-4 border-b">
            <h4 className="font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Tip
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Add a tip to this invoice
            </p>
          </div>
          <div className="p-4">
            <FormField
              control={form.control}
              name="tipAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      min="0"
                      placeholder="0"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tip summary */}
            {tipAmount > 0 && (
              <div className="p-3 bg-green-50 rounded-md mt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Tip amount:</span>
                  <span className="font-medium">{formatCurrency(tipAmount)}</span>
                </div>
                {subtotal > 0 && discountAmount <= subtotal && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {(((tipAmount || 0) / Math.max(subtotal - discountAmount, 0.01)) * 100).toFixed(1)}% of post-discount total
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
        
        {/* GST Rate Selection */}
        {renderGSTRateSelection()}
      </div>
    );
  };

  // Render the summary step
  const renderSummaryStep = () => {
    const selectedGstRateId = form.getValues().gstRates[0];
    const selectedGstRate = gstRatesData.find(rate => rate.id === selectedGstRateId);
    
    // Calculate subtotal including products
    const subtotalServices = services.reduce((sum, service) => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return sum + (Number(selectedService?.price) || 0);
    }, 0);

    const subtotalProducts = products.reduce((sum, product) => {
      const selectedProduct = productData.find(p => p.id === product.productId);
      return sum + (Number(selectedProduct?.price) || 0);
    }, 0);

    const subtotal = subtotalServices + subtotalProducts;
    
    // Calculate discount
    let discountAmount = 0;
    const discountType = form.getValues().discountType;
    const discountValue = Number(form.getValues().discountValue) || 0;
    
    if (discountType === 'percentage' && !isNaN(discountValue) && subtotal > 0) {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && !isNaN(discountValue)) {
      discountAmount = discountValue;
    }
    
    // Ensure discount amount is a valid number
    discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
    
    // Calculate tax
    const taxRate = Number(selectedGstRate?.totalRate) || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    
    // Ensure tax amount is a valid number
    const validTaxAmount = isNaN(taxAmount) ? 0 : taxAmount;
    
    // Calculate total
    const tipAmount = Number(form.getValues().tipAmount) || 0;
    const total = taxableAmount + validTaxAmount + tipAmount;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review Invoice</h3>
        
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Customer</h4>
            {isGuestUser ? (
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                <p>Guest User</p>
              </div>
            ) : (
              <>
                <p>{selectedCustomer?.name || newCustomerForm.getValues().name}</p>
                <p>{formatPhoneNumber(form.getValues().customerPhone)}</p>
                {(selectedCustomer?.email || newCustomerForm.getValues().email) && (
                  <p>{selectedCustomer?.email || newCustomerForm.getValues().email}</p>
                )}
              </>
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
                  <span>{formatCurrency(Number(selectedService.price) || 0)}</span>
                </div>
              );
            })}
            
            <div className="flex justify-between font-medium pt-2">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotalServices)}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Products</h4>
            {products.map((product) => {
              const selectedProduct = productData.find(p => p.id === product.productId);
              if (!selectedProduct) return null;
              
              return (
                <div key={product.id} className="flex justify-between">
                  <span>{selectedProduct.name}</span>
                  <span>{formatCurrency(Number(selectedProduct.price) || 0)}</span>
                </div>
              );
            })}
            
            <div className="flex justify-between font-medium pt-2">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotalProducts)}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Payment</h4>
            <div className="flex justify-between">
              <span>Staff</span>
              <span>{staffData?.find(s => s.id === form.getValues().staffId)?.name || 'No staff selected'}</span>
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
                    ? `${form.getValues().discountValue}% (${formatCurrency(discountAmount)})` 
                    : formatCurrency(form.getValues().discountValue)}
                </span>
              </div>
            )}
            
            {/* GST Details */}
            {selectedGstRate && (
              <div className="pt-2">
                <div className="flex justify-between">
                  <span>Tax Rate</span>
                  <span>{selectedGstRate.name}</span>
                </div>
                {selectedGstRate.components.map(comp => (
                  <div key={comp.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{comp.name} ({comp.rate}%)</span>
                    <span>{formatCurrency((taxableAmount * Number(comp.rate)) / 100)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium">
                  <span>Total Tax</span>
                  <span>{formatCurrency(validTaxAmount)}</span>
                </div>
              </div>
            )}
            
            {form.getValues().tipAmount > 0 && (
              <div className="flex justify-between pt-2">
                <span>Tip</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Add GST Rate selection to payment step with compact design
  const renderGSTRateSelection = () => {
    const selectedGstRateId = form.watch('gstRates')[0];
    const selectedGstRate = gstRatesData.find(rate => rate.id === selectedGstRateId) || defaultGstRate;
    
    // Pre-populate with default GST name if custom name is empty
    const handleCustomGstAdd = () => {
      // Ensure customGstValue is a valid number
      const rateValue = Number(customGstValue) || 0;
      
      if (!customGstRate || rateValue <= 0 || isNaN(rateValue)) {
        toast({
          title: 'Invalid custom GST',
          description: 'Please provide a name and a positive rate value',
          variant: 'destructive'
        });
        return;
      }
      
      // Create a temporary custom GST rate
      const customRate = {
        id: `custom-${Date.now()}`,
        name: customGstRate,
        components: [{ id: `comp-custom-${Date.now()}`, name: 'Custom', rate: rateValue }],
        isActive: false,
        totalRate: rateValue
      };
      
      // Update the form with the custom rate
      form.setValue('gstRates', [customRate.id]);
      
      // Add to the local gstRatesData (would be server-side in real implementation)
      gstRatesData.push(customRate);
      
      // Reset custom inputs and close the panel
      setCustomGstRate('');
      setCustomGstValue(0);
      setShowGstOptions(false);
      
      toast({
        title: 'Custom GST added',
        description: `Using custom rate: ${customRate.name} (${customRate.totalRate}%)`
      });
    };
    
    // Reset the form when opening the panel
    const handleOpenGstOptions = () => {
      // Pre-populate with default GST name and a blank value
      if (defaultGstRate && !customGstRate) {
        setCustomGstRate(`${defaultGstRate.name} - Custom`);
      }
      setShowGstOptions(!showGstOptions);
    };

    return (
      <FormField
        control={form.control}
        name="gstRates"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="flex items-center gap-2">
              GST Rate
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Choose the applicable GST rate for this invoice</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            
            <div className="border rounded-lg p-3">
              {/* Current selected GST display */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center">
                    {selectedGstRate?.name} 
                    {selectedGstRate?.isActive && 
                      <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rate: {selectedGstRate?.totalRate}%
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  type="button"
                  onClick={handleOpenGstOptions}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
              
              {/* Collapsible GST selection panel */}
              <Collapsible open={showGstOptions} onOpenChange={setShowGstOptions}>
                <CollapsibleContent className="mt-3 pt-3 border-t">
                  <RadioGroup
                    value={field.value[0]}
                    onValueChange={(value) => field.onChange([value])}
                    className="space-y-2 mb-3"
                  >
                    {gstRatesData.map((rate) => (
                      <div 
                        key={rate.id} 
                        className={`
                          flex items-center space-x-2 border rounded-lg p-2 cursor-pointer
                          ${field.value.includes(rate.id) ? 
                            'border-primary bg-primary/5' : 
                            'border-border hover:border-primary/50 hover:bg-muted/30'
                          }
                        `}
                        onClick={() => field.onChange([rate.id])}
                      >
                        <RadioGroupItem value={rate.id} id={`gst-${rate.id}`} className="ml-2" />
                        <div className="flex-1 overflow-hidden pl-1">
                          <div className="flex items-center">
                            <label 
                              htmlFor={`gst-${rate.id}`} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer truncate"
                            >
                              {rate.name}
                            </label>
                            {rate.isActive && <Badge variant="outline" className="text-xs ml-2">Default</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total Rate: {rate.totalRate}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Custom GST Rate
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input 
                        placeholder={defaultGstRate ? `${defaultGstRate.name} - Custom` : "Rate Name"} 
                        value={customGstRate}
                        onChange={(e) => setCustomGstRate(e.target.value)}
                        className="text-sm"
                      />
                      <div className="relative">
                        <Input 
                          type="text"
                          inputMode="decimal"
                          placeholder="Rate %" 
                          value={customGstValue === 0 ? '' : customGstValue}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            setCustomGstValue(value);
                          }}
                          className="text-sm pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="w-full"
                      onClick={handleCustomGstAdd}
                    >
                      Add Custom Rate
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {renderStepIndicator()}

      <ScrollArea className="flex-grow pr-4 mb-16">
        <Form {...form}>
          <form className="space-y-6 py-6 px-4">
            {/* Step 1: Customer Information */}
            {currentStep === 'customer' && renderCustomerStep()}

            {/* Step 2: Services Selection */}
            {currentStep === 'services' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Services</h3>
                {isLoadingServices ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : serviceData.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg bg-muted/30">
                    <p>No services found. Please contact the administrator.</p>
                  </div>
                ) : (
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
                                      {formatCurrency(Number(s.price) || 0)}
                                    </span>
                                    </Button>
                                  );
                                })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                    
                    {/* Product Categories */}
                    {productCategories.length > 0 && (
                      <>
                        <h3 className="text-lg font-medium pt-4">Select Products</h3>
                        {isLoadingProducts ? (
                          <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          productCategories.map((category) => {
                            const selectedCount = getSelectedProductsCount(category);
                            return (
                              <Collapsible
                                key={`product-${category}`}
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
                                    {productData
                                      .filter(p => p.category === category)
                                      .map((p) => {
                                        const isSelected = products.some(product => product.productId === p.id);
                                        return (
                                          <Button
                                            key={p.id}
                                            type="button"
                                            variant={isSelected ? "default" : "outline"}
                                            className="w-full justify-between group"
                                            onClick={() => handleProductSelection(p.id)}
                                          >
                                            <span>{p.name}</span>
                                            <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
                                              {formatCurrency(Number(p.price) || 0)}
                                            </span>
                                          </Button>
                                        );
                                      })}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Staff Selection */}
            {currentStep === 'staff' && renderStaffStep()}

            {/* Step 4: Payment Information */}
            {currentStep === 'payment' && renderPaymentStep()}

            {/* Step 5: Review & Summary */}
            {currentStep === 'summary' && renderSummaryStep()}
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Create Invoice
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
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
