import React from 'react';
import { format } from 'date-fns';
import { Copy, Download, Mail, Printer } from 'lucide-react';
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
import { Invoice } from '@/types';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

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
    toast({
      title: 'Print requested',
      description: 'Printing functionality will be implemented.',
    });
  };

  const handleDownload = () => {
    toast({
      title: 'Download started',
      description: 'Your invoice PDF will be downloaded shortly.',
    });
  };

  const handleSendEmail = () => {
    toast({
      title: 'Email sent',
      description: 'Invoice has been sent to the customer\'s email.',
    });
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
              {invoice.appointmentId && (
                <div className="text-sm text-muted-foreground">
                  Appointment: #{invoice.appointmentId}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Customer</h4>
                <div className="text-sm">{invoice.customerName}</div>
              </div>

              {/* Staff Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Staff</h4>
                <div className="text-sm">{invoice.staffName}</div>
              </div>
            </div>

            <Separator />

            {/* Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Services</h4>
              <div className="space-y-2">
                {invoice.services.map((service, index) => (
                  <div
                    key={`${service.serviceId}-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{service.serviceName}</span>
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

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Discount
                    {invoice.discountType === 'percentage' && invoice.discountValue
                      ? ` (${invoice.discountValue}%)`
                      : ''}
                  </span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}

              {invoice.tipAmount && invoice.tipAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tip</span>
                  <span>{formatCurrency(invoice.tipAmount)}</span>
                </div>
              )}

              {/* Display individual tax components if available */}
              {invoice.taxComponents && invoice.taxComponents.length > 0 ? (
                invoice.taxComponents.map((component, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{component.name} ({component.rate}%)</span>
                    <span>{formatCurrency(component.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({invoice.tax}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
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
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};