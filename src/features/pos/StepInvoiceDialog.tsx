import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm, InvoiceFormData } from './StepWiseInvoiceForm';
import { useApi } from '@/hooks/useApi';
import { createInvoice } from '@/api/services/invoiceService';
import { serviceData, gstRatesData, staffData } from '@/mocks';
import { Customer } from '@/types';

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
  
  // Use the API hook for creating invoices
  const {
    loading,
    execute: executeCreateInvoice
  } = useApi(createInvoice);

  const handleSubmit = async (formData: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      
      // If we received a selected customer in the form data, update our state
      if (formData.selectedCustomer) {
        setSelectedCustomer(formData.selectedCustomer);
      }
      
      // Calculate the services details by getting the actual data from serviceData mock
      // In a real implementation, this calculation should be done on the server
      const servicesWithDetails = formData.services.map(service => {
        const serviceDetails = serviceData.find(s => s.id === service.serviceId);
        return {
          service_id: service.serviceId,
          service_name: serviceDetails?.name || '',
          price: serviceDetails?.price || 0,
          quantity: 1,
          total: serviceDetails?.price || 0
        };
      });
      
      // Calculate subtotal
      const subtotal = servicesWithDetails.reduce((sum, service) => sum + service.total, 0);
      
      // Get the GST rate data
      const gstRateData = gstRatesData.find(rate => rate.id === formData.gstRates[0]);
      const taxRate = gstRateData?.totalRate || 7.5;
      
      // Calculate discount amount
      let discountAmount = 0;
      if (formData.discountType === 'percentage' && formData.discountValue > 0) {
        discountAmount = (subtotal * formData.discountValue) / 100;
      } else if (formData.discountType === 'fixed' && formData.discountValue > 0) {
        discountAmount = formData.discountValue;
      }
      
      // Calculate tax amount
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;
      
      // Calculate total
      const tipAmount = formData.tipAmount || 0;
      const total = taxableAmount + taxAmount + tipAmount;
      
      // Get staff name
      const selectedStaff = staffData.find(staff => staff.id === formData.staffId);
      const staffName = selectedStaff ? selectedStaff.name : '';
      
      // IMPORTANT: Use a real customer ID from your database
      // The error shows that mock IDs like 'cust-1' do not exist in your database
      // Use the admin user ID which we know exists
      
      let customerId;
      let customerName;

      if (formData.isGuestUser || !selectedCustomer) {
        // For guest or when no customer is selected, use the admin ID
        customerId = '9197ef59-839a-4564-9168-110cb86db65e'; // Admin ID from the token
        customerName = 'Guest Customer';
      } else {
        // Use selected customer
        customerId = selectedCustomer.id;
        customerName = selectedCustomer.name;
      }
      
      // Transform form data to match API structure exactly as required
      const invoiceData = {
        customer_id: customerId,
        customer_name: customerName,
        staff_id: formData.staffId,
        staff_name: staffName,
        date: new Date().toISOString().split('T')[0],
        services: servicesWithDetails,
        subtotal: subtotal,
        tax: taxRate,
        tax_amount: taxAmount,
        total: total,
        payment_method: formData.paymentMethod,
        status: 'paid', // Invoice is created as paid
        notes: formData.notes || ''
      } as const; // Use const assertion instead of individual property assertion
      
      // Only add discount fields if a discount is applied
      if (formData.discountType !== 'none') {
        Object.assign(invoiceData, {
          discount_type: formData.discountType,
          discount_value: formData.discountValue,
          discount_amount: discountAmount
        });
      }
      
      // Only add tip if one is provided
      if (formData.tipAmount > 0) {
        Object.assign(invoiceData, {
          tip_amount: formData.tipAmount
        });
      }
      
      // Add tax components if we have GST rate details
      if (gstRateData && gstRateData.components && gstRateData.components.length > 0) {
        const taxComponents = gstRateData.components.map(comp => ({
          name: comp.name,
          rate: comp.rate,
          amount: (taxableAmount * comp.rate) / 100
        }));
        
        Object.assign(invoiceData, {
          tax_components: taxComponents
        });
      }
      
      console.log('Sending invoice data:', JSON.stringify(invoiceData));
      
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
    } catch (err) {
      console.error('Error creating invoice:', err);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="relative h-[calc(100%-80px)]">
          <StepWiseInvoiceForm 
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={loading || isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}; 