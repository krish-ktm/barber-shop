import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy, Download, Mail, Printer, Loader2, Percent, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold border';
    switch (status) {
      case 'paid':
        return <span className={`${base} border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400`}>Paid</span>;
      case 'pending':
        return <span className={`${base} border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400`}>Pending</span>;
      case 'cancelled':
        return <span className={`${base} border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400`}>Cancelled</span>;
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
      <DialogContent className="h-[90vh] flex flex-col w-[95vw] sm:w-auto sm:max-w-2xl rounded-lg">
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
                {(invoice.invoiceServices || invoice.services || []).map((service, index) => (
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

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent className={`h-4 w-4 mr-1 ${invoice.discount_amount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${invoice.discount_amount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Discount
                    {invoice.discount_type === 'percentage' && invoice.discount_value
                      ? ` (${invoice.discount_value}%)`
                      : ''}
                  </span>
                </div>
                <span className={`text-sm ${invoice.discount_amount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {invoice.discount_amount > 0 ? `-${formatCurrency(invoice.discount_amount)}` : formatCurrency(0)}
                </span>
              </div>

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

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className={`h-4 w-4 mr-1 ${invoice.tip_amount > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${invoice.tip_amount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Tip
                  </span>
                </div>
                <span className={`text-sm ${invoice.tip_amount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {formatCurrency(invoice.tip_amount || 0)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              
              {/* Percentage indicators for tip and discount */}
              {(invoice.tip_amount > 0 || invoice.discount_amount > 0) && (
                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                  {invoice.discount_amount > 0 && invoice.subtotal > 0 && (
                    <div className="flex justify-end">
                      Discount: {((invoice.discount_amount / invoice.subtotal) * 100).toFixed(1)}% of subtotal
                    </div>
                  )}
                  {invoice.tip_amount > 0 && invoice.total > 0 && (
                    <div className="flex justify-end">
                      Tip: {((invoice.tip_amount / invoice.total) * 100).toFixed(1)}% of total
                    </div>
                  )}
                </div>
              )}
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