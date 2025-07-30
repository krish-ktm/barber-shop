import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm, InvoiceFormData } from './StepWiseInvoiceForm';
import { useApi } from '@/hooks/useApi';
import { createInvoice } from '@/api/services/invoiceService';
import { getAllStaff } from '@/api/services/staffService';
import { getAllServices } from '@/api/services/serviceService';
import { getAllProducts } from '@/api/services/productService';
import { getGSTRates } from '@/api/services/settingsService';
import { Customer } from '@/api/services/customerService';
import { Loader2 } from 'lucide-react';

// Type for a GST rate
interface GSTRate {
  id: string;
  name: string;
  components: { id: string; name: string; rate: number }[];
  isActive: boolean;
  totalRate: number;
}

interface StepInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
}

export const StepInvoiceDialog: React.FC<StepInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onInvoiceCreated,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [staffMembers, setStaffMembers] = useState<Array<{
    id: string;
    name: string;
    position: string;
    image: string;
  }>>([]);
  const [serviceItems, setServiceItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
    description?: string;
  }>>([]);
  const [productItems, setProductItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    description?: string;
  }>>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Use the API hook for creating invoices and fetching data
  const {
    loading,
    execute: executeCreateInvoice
  } = useApi(createInvoice);
  
  const {
    execute: fetchStaff
  } = useApi(getAllStaff);
  
  const {
    execute: fetchServices
  } = useApi(getAllServices);

  const {
    execute: fetchProducts
  } = useApi(getAllProducts);

  // Add API hook for creating customers
  const {
    loading: isCreatingCustomer
  } = useApi(() => Promise.resolve({ success: true }));
  
  // Add API hook for fetching GST rates
  const {
    data: gstRatesResponse,
    loading: isLoadingGSTRates,
    error: gstRatesError,
    execute: fetchGSTRates
  } = useApi(getGSTRates);
  
  // State to hold the fetched GST rates
  const [gstRates, setGSTRates] = useState<GSTRate[]>([]);
  
  // Fetch staff members and services when dialog opens
  useEffect(() => {
    if (!open) return;

    // Fetch staff only if we don't already have data
    if (staffMembers.length === 0 && !isLoadingStaff) {
      setIsLoadingStaff(true);
      fetchStaff(1, 100, 'name_asc', undefined, 'available')
        .then(response => {
          if (response.success && response.staff) {
            const formattedStaff = response.staff.map(member => ({
              id: member.id,
              name: member.user?.name || 'Unknown',
              position: member.bio ? member.bio.split('.')[0] : 'Staff Member',
              image: member.image || member.user?.image || '',
            }));
            setStaffMembers(formattedStaff);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load staff members',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching staff:', error);
          toast({
            title: 'Error',
            description: 'Failed to load staff members',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingStaff(false));
    }

    // Fetch services only if not already cached
    if (serviceItems.length === 0 && !isLoadingServices) {
      setIsLoadingServices(true);
      fetchServices(1, 100, 'name_asc')
        .then(response => {
          if (response.success && response.services) {
            setServiceItems(response.services);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load services',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching services:', error);
          toast({
            title: 'Error',
            description: 'Failed to load services',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingServices(false));
    }

    // Fetch products only if not already cached
    if (productItems.length === 0 && !isLoadingProducts) {
      setIsLoadingProducts(true);
      fetchProducts(1, 100, 'name_asc')
        .then(response => {
          if (response.success && response.products) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped = response.products.map((p: any) => {
              let img = p.image || p.image_url || p.imageUrl || p.photo || '';
              if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                img = `data:image/jpeg;base64,${img}`;
              }
              return {
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description,
                image: img,
              };
            });
            setProductItems(mapped);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load products',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          toast({
            title: 'Error',
            description: 'Failed to load products',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingProducts(false));
    }
  }, [open, staffMembers.length, serviceItems.length, isLoadingStaff, isLoadingServices, fetchStaff, fetchServices, fetchProducts, toast]);

  // Add a useEffect to fetch GST rates on component mount
  useEffect(() => {
    fetchGSTRates();
  }, [fetchGSTRates]);
  
  // Update GST rates state when API data is loaded
  useEffect(() => {
    if (gstRatesResponse?.gstRates) {
      // Map API GST rates to the format our component expects
      const mappedRates: GSTRate[] = gstRatesResponse.gstRates.map(rate => ({
        id: rate.id || '',
        name: rate.name,
        isActive: rate.is_active,
        totalRate: rate.total_rate || 0,
        components: rate.components.map(comp => ({
          id: comp.id || '',
          name: comp.name,
          rate: comp.rate
        }))
      }));
      
      setGSTRates(mappedRates);
    }
  }, [gstRatesResponse]);
  
  // Handle GST rates error
  useEffect(() => {
    if (gstRatesError) {
      toast({
        title: 'Error loading GST rates',
        description: gstRatesError.message,
        variant: 'destructive',
      });
    }
  }, [gstRatesError, toast]);

  const handleSubmit = async (formData: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      
      // If we received a selected customer in the form data, update our state
      if (formData.selectedCustomer) {
        setSelectedCustomer(formData.selectedCustomer);
      }
      
      // Prepare services data
      console.log('Original services data from form:', JSON.stringify(formData.services, null, 2));
      
      if (!formData.services || formData.services.length === 0) {
        console.error('WARNING: No services received from form data!');
        toast({
          title: 'Error',
          description: 'No services selected. Please select at least one service.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const servicesWithDetails = formData.services.map(service => {
        // First, try to find the service in our loaded service items
        const serviceDetails = serviceItems.find(s => s.id === service.serviceId);
        
        if (serviceDetails) {
          // If we have the service details, use them
          return {
            service_id: serviceDetails.id,
            service_name: serviceDetails.name,
            price: serviceDetails.price,
            quantity: 1,
            total: serviceDetails.price
          };
        } else {
          // If we don't have the service details, use what we have in the form data
          // This is a fallback to prevent errors when the service ID doesn't match the database
          console.warn(`Service not found in local cache: ${service.serviceId}. Using fallback.`);
          return {
            service_id: service.serviceId,
            service_name: service.id || 'Unknown Service',
            price: 0, // We don't know the price, will need to be calculated on server
            quantity: 1,
            total: 0
          };
        }
      });
      
      // Prepare products data
      const productsWithDetails = (formData.products || []).map(product => {
        const productDetails = productItems.find(p => p.id === product.productId);

        if (productDetails) {
          return {
            product_id: productDetails.id,
            product_name: productDetails.name,
            price: productDetails.price,
            quantity: 1,
            total: productDetails.price
          };
        } else {
          return {
            product_id: product.productId,
            product_name: 'Unknown Product',
            price: 0,
            quantity: 1,
            total: 0
          };
        }
      });
      
      // Calculate subtotal - ensure values are numbers
      const subtotalServices = servicesWithDetails.reduce((sum, service) => sum + (Number(service.total) || 0), 0);
      const subtotalProducts = productsWithDetails.reduce((sum, product) => sum + (Number(product.total) || 0), 0);
      const subtotal = subtotalServices + subtotalProducts;
      
      // Get the GST rate data
      const gstRateData = gstRates.find(rate => rate.id === formData.gstRates[0]);
      const taxRate = Number(gstRateData?.totalRate) || 7.5;
      
      // Calculate discount amount
      let discountAmount = 0;
      const discountValue = Number(formData.discountValue) || 0;
      
      if (formData.discountType === 'percentage' && discountValue > 0) {
        discountAmount = (subtotal * discountValue) / 100;
      } else if (formData.discountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
      }
      
      // Calculate tax amount
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;
      
      // Calculate total
      const tipAmount = Number(formData.tipAmount) || 0;
      const total = taxableAmount + taxAmount + tipAmount;
      
      // Get staff details (if available)
      const selectedStaff = staffMembers.find(staff => staff.id === formData.staffId);
      const staffId = formData.staffId; // Use the ID from the form regardless
      const staffName = selectedStaff?.name || 'Staff Member'; // Use name if available, otherwise generic name
      
      // If we don't have staff details and this is not a mock ID starting with "staff-", show a warning
      if (!selectedStaff && !formData.staffId.startsWith('staff-')) {
        console.warn(`Staff member not found in local cache: ${formData.staffId}. Using original ID.`);
      }
      
      // Handle customer data based on form input
      let customerId;
      let customerName;
      let isNewCustomer = false;
      let customerDetails = null;

      console.log('Form data customer info:', {
        isNewCustomer: formData.isNewCustomer,
        isGuestUser: formData.isGuestUser,
        hasSelectedCustomer: !!formData.selectedCustomer,
        hasCustomerDetails: !!formData.customerDetails
      });

      // Check if this is a new customer that needs to be created
      if (formData.isNewCustomer && formData.customerDetails) {
        // Set flag for backend to create customer
        isNewCustomer = true;
        customerDetails = formData.customerDetails;
        
        // Use temporary ID and name for the request
        customerId = 'pending-creation';
        customerName = formData.customerDetails.name;
        
        console.log('New customer will be created on the server:', customerDetails);
      } else if (formData.isGuestUser) {
        // For guest user, use the guest-user ID
        customerId = 'guest-user'; // Guest customer ID that exists in the database
        customerName = 'Guest Customer';
      } else if (formData.selectedCustomer) {
        // Use the customer passed from the form
        customerId = formData.selectedCustomer.id;
        customerName = formData.selectedCustomer.name;
      } else if (selectedCustomer) {
        // Use our local state if available
        customerId = selectedCustomer.id;
        customerName = selectedCustomer.name;
      } else {
        // Fallback to guest if we somehow don't have customer information
        customerId = 'guest-user';
        customerName = 'Guest Customer';
        console.warn('No customer selected, using guest user as fallback');
      }
      
      // Transform form data to match API structure exactly as required
      const invoiceData = {
        customer_id: customerId,
        customer_name: customerName,
        staff_id: staffId, // Use the ID from the form
        staff_name: staffName, // Use the name we determined above
        date: new Date().toISOString().split('T')[0],
        services: servicesWithDetails, // Keep for backward compatibility
        invoiceServices: servicesWithDetails, // Use the correct property name to match backend alias
        products: productsWithDetails,
        invoiceProducts: productsWithDetails,
        subtotal: subtotal,
        tax: taxRate,
        tax_amount: taxAmount,
        total: total,
        payment_method: formData.paymentMethod,
        status: 'paid', // Invoice is created as paid
        notes: formData.notes || '',
        tip_amount: tipAmount || 0, // Always include tip_amount even if 0
        // Add customer creation fields
        is_new_customer: isNewCustomer,
        customer_details: customerDetails
      } as const; // Use const assertion instead of individual property assertion
      
      // Always include discount fields even if no discount
      Object.assign(invoiceData, {
        discount_type: formData.discountType,
        discount_value: formData.discountValue || 0,
        discount_amount: discountAmount
      });
      
      // Tip amount is already included in the invoiceData object
      
      // Add tax components if we have GST rate details
      if (gstRateData && gstRateData.components && gstRateData.components.length > 0) {
        const taxComponents = gstRateData.components.map(comp => ({
          name: comp.name,
          rate: Number(comp.rate) || 0,
          amount: (taxableAmount * Number(comp.rate) || 0) / 100
        }));
        
        Object.assign(invoiceData, {
          tax_components: taxComponents
        });
      } else {
        // Add default tax component if none exists
        Object.assign(invoiceData, {
          tax_components: [{
            name: 'Standard GST',
            rate: taxRate,
            amount: taxAmount
          }]
        });
      }
      
      console.log('Sending invoice data:', JSON.stringify(invoiceData, null, 2));
      console.log('Services being sent:', JSON.stringify(servicesWithDetails, null, 2));
      console.log('Products being sent:', JSON.stringify(productsWithDetails, null, 2));
      console.log('Services array length:', servicesWithDetails.length);
      console.log('First service:', servicesWithDetails[0] ? JSON.stringify(servicesWithDetails[0], null, 2) : 'No services found');
      
      // Log any services that don't match our local cache
      const mismatchedServices = formData.services.filter(service => 
        !serviceItems.some(s => s.id === service.serviceId)
      );
      
      if (mismatchedServices.length > 0) {
        console.warn('Warning: Some services don\'t exist in local cache:', 
          mismatchedServices.map(s => s.serviceId).join(', ')
        );
      }
      
      // Send data to the API
      const response = await executeCreateInvoice(invoiceData);
      
      if (response.success) {
        toast({
          title: 'Invoice created',
          description: 'New invoice has been created successfully.',
        });
        
        onOpenChange(false);
        
        // Call the onInvoiceCreated callback if provided
        if (onInvoiceCreated) {
          onInvoiceCreated();
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error creating invoice:', error);
      
      // Check if it's a foreign key constraint error
      if (error.message && error.message.includes('foreign key constraint fails')) {
        if (error.message.includes('customer_id')) {
          toast({
            title: 'Customer Error',
            description: 'Failed to create invoice: The customer ID does not exist in the database.',
            variant: 'destructive',
          });
        } else if (error.message.includes('staff_id')) {
          toast({
            title: 'Staff Error',
            description: 'Failed to create invoice: The staff ID does not exist in the database.',
            variant: 'destructive',
          });
        } else if (error.message.includes('service_id')) {
          // Handle service ID errors specifically
          let serviceId = '';
          try {
            // Try to extract the service ID from the error message
            const match = error.message.match(/parameters.*service-\d+/);
            if (match && match[0]) {
              serviceId = match[0].split(',').find(p => p.trim().includes('service-'))?.trim() || '';
            }
          } catch (e) {
            console.error('Failed to extract service ID from error:', e);
          }
          
          toast({
            title: 'Service Error',
            description: `Failed to create invoice: Service ID ${serviceId || ''} does not exist in the database. Please refresh the page to get the latest services.`,
            variant: 'destructive',
          });
          
          // Refresh the services list to get the latest data
          fetchServices(1, 100, 'name_asc')
            .then(response => {
              if (response.success && response.services) {
                setServiceItems(response.services);
              }
            })
            .catch(e => console.error('Error refreshing services:', e));
            
        } else {
          toast({
            title: 'Database Error',
            description: 'Failed to create invoice: A database constraint error occurred.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: `Failed to create invoice: ${error.message || 'Please try again.'}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global loading state while fetching initial data
  const isInitialLoading = isLoadingStaff || isLoadingServices || isLoadingGSTRates;
  const isInitialLoadingAll = isInitialLoading || isLoadingProducts;

  return (
    <Sheet open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <SheetHeader>
            <SheetTitle>Create New Invoice</SheetTitle>
            <SheetDescription>
              Create a new invoice by following these steps.
            </SheetDescription>
          </SheetHeader>
        </div>

        {isInitialLoadingAll ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)]">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : staffMembers.length === 0 || serviceItems.length === 0 || gstRates.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)]">
            <div className="text-center max-w-md p-6">
              <h3 className="text-lg font-medium mb-2">Cannot Create Invoice</h3>
              <p className="text-muted-foreground mb-4">
                {staffMembers.length === 0 
                  ? 'There are no staff members available. Please add staff members first.'
                  : serviceItems.length === 0
                  ? 'There are no services available. Please add services first.'
                  : 'There are no GST rates configured. Please configure GST rates first.'}
              </p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
        <div className="relative h-[calc(100%-80px)]">
          <StepWiseInvoiceForm 
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={loading || isSubmitting || isCreatingCustomer}
            staffData={staffMembers}
            isLoadingStaff={isLoadingStaff}
            serviceData={serviceItems}
            isLoadingServices={isLoadingServices}
            productData={productItems}
            isLoadingProducts={isLoadingProducts}
            gstRatesData={gstRates}
          />
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
}; 