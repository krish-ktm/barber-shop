import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy, Download, Mail, Printer, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Invoice } from '@/api/services/invoiceService';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { sendInvoice } from '@/api/services/invoiceService';
import { useApi } from '@/hooks/useApi';

interface InvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated?: () => void;
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onInvoiceUpdated,
}) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // API hook for sending invoice by email
  const {
    loading: isSendingEmail,
    execute: executeSendInvoice
  } = useApi(sendInvoice);

  if (!invoice) return null;

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.id);
    toast({
      title: 'Copied to clipboard',
      description: `Invoice number ${invoice.id} has been copied.`,
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate printing delay
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      toast({
        title: 'Print requested',
        description: 'Print dialog opened.',
      });
    }, 500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: 'Download started',
        description: 'Your invoice PDF will be downloaded shortly.',
      });
    }, 1000);
  };

  const handleSendEmail = async () => {
    try {
      const response = await executeSendInvoice(invoice.id);
      if (response.success) {
        toast({
          title: 'Email sent',
          description: response.message || 'Invoice has been sent to the customer\'s email.',
        });
        
        // Call the update callback if provided
        if (onInvoiceUpdated) {
          onInvoiceUpdated();
        }
      }
    } catch (err) {
      console.error('Error sending email:', err);
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <div className="absolute right-12 top-6">
          {getStatusBadge(invoice.status)}
        </div>
        
        <DialogHeader className="pb-2">
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{invoice.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyInvoiceNumber}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Date: {format(new Date(invoice.date), 'MMMM d, yyyy')}
              </div>
              {invoice.appointment_id && (
                <div className="text-sm text-muted-foreground">
                  Appointment: #{invoice.appointment_id}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Payment Method: {invoice.payment_method.charAt(0).toUpperCase() + invoice.payment_method.slice(1)}
              </div>
              {invoice.created_at && (
                <div className="text-sm text-muted-foreground">
                  Created: {format(new Date(invoice.created_at), 'MMMM d, yyyy, h:mm a')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Customer</h4>
                <div className="text-sm">{invoice.customer_name}</div>
              </div>

              {/* Staff Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Staff</h4>
                <div className="text-sm">{invoice.staff_name}</div>
              </div>
            </div>

            <Separator />

            {/* Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Services</h4>
              <div className="space-y-2">
                {invoice.services.map((service, index) => (
                  <div
                    key={`${service.service_id}-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{service.service_name}</span>
                      {service.quantity > 1 && (
                        <span className="text-muted-foreground"> × {service.quantity}</span>
                      )}
                    </div>
                    <span>{formatCurrency(service.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>

              {invoice.discount_amount && invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Discount
                    {invoice.discount_type === 'percentage' && invoice.discount_value
                      ? ` (${invoice.discount_value}%)`
                      : ''}
                  </span>
                  <span>-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}

              {invoice.tip_amount && invoice.tip_amount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tip</span>
                  <span>{formatCurrency(invoice.tip_amount)}</span>
                </div>
              )}

              {/* Display individual tax components if available */}
              {invoice.tax_components && invoice.tax_components.length > 0 ? (
                invoice.tax_components.map((component, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{component.name} ({component.rate}%)</span>
                    <span>{formatCurrency(component.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({invoice.tax}%)</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {invoice.notes && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Notes: </span>
                {invoice.notes}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail} disabled={isSendingEmail}>
            {isSendingEmail ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};