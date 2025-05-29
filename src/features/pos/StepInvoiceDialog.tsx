import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm, InvoiceFormData } from './StepWiseInvoiceForm';

interface StepInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StepInvoiceDialog: React.FC<StepInvoiceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const handleSubmit = (invoiceData: InvoiceFormData) => {
    console.log('Submitting invoice:', invoiceData);
    
    toast({
      title: 'Invoice created',
      description: 'New invoice has been created successfully.',
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}; 