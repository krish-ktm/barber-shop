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
import { Invoice, updateInvoice } from '@/api/services/invoiceService';
import { useApi } from '@/hooks/useApi';

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated?: () => void;
}

// Helper to transform existing invoice data into InvoiceFormData structure expected by StepWiseInvoiceForm
const mapInvoiceToFormData = (inv: Invoice): Partial<InvoiceFormData> => {
  // Flatten services and products into simplified arrays for the form.
  const services = (inv.invoiceServices || inv.services || []).map((s, idx) => ({
    id: `svc-${idx}`,
    serviceId: s.service_id,
    quantity: s.quantity,
    staffIds: s.staff_id ? [s.staff_id] : [''],
  }));

  const products = (inv.invoiceProducts || inv.products || []).map((p, idx) => ({
    id: `prd-${idx}`,
    productId: p.product_id,
    quantity: p.quantity,
    staffIds: p.staff_id ? [p.staff_id] : [''],
  }));

  return {
    id: inv.id,
    customerPhone: '', // phone not returned in invoice list; leave blank
    customerName: inv.customer_name,
    staffId: inv.staff_id || '',
    discountType: inv.discount_type || 'none',
    discountValue: inv.discount_value || 0,
    tipAmount: inv.tip_amount || 0,
    paymentMethod: inv.payment_method,
    gstRates: inv.tax_components && inv.tax_components.length ? [inv.tax_components[0].name] : [],
    notes: inv.notes,
    services,
    products,
    isNewCustomer: false,
    isGuestUser: false,
  } as Partial<InvoiceFormData>;
};

export const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onInvoiceUpdated,
}) => {
  const { toast } = useToast();

  const { execute: execUpdate, loading: isSaving } = useApi(updateInvoice);

  if (!invoice) return null;

  const initialData = mapInvoiceToFormData(invoice);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      const response = await execUpdate(invoice.id, data as unknown as Partial<Invoice>);
      if (response.success) {
        toast({ title: 'Invoice updated', description: 'Invoice changes have been saved.' });
        onInvoiceUpdated?.();
        onOpenChange(false);
      } else {
        toast({ title: 'Update failed', description: 'Failed to update invoice.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Unable to update invoice.', variant: 'destructive' });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Invoice #{invoice.id}</SheetTitle>
          <SheetDescription>Modify invoice details and save changes.</SheetDescription>
        </SheetHeader>

        <StepWiseInvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSaving}
        />
      </SheetContent>
    </Sheet>
  );
};