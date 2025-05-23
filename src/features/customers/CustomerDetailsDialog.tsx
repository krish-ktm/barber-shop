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
import { Customer, Invoice } from '@/types';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { invoiceData } from '@/mocks';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  customer,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  if (!customer) return null;

  // Get customer's invoice history
  const customerInvoices = invoiceData
    .filter(invoice => invoice.customerId === customer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const getPaymentMethodBadge = (method: Invoice['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>;
      case 'card':
        return <Badge variant="outline">Card</Badge>;
      case 'mobile':
        return <Badge variant="outline">Mobile</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    toast({
      title: 'Copied to clipboard',
      description: `Phone number has been copied.`,
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
      description: 'Customer details PDF will be downloaded shortly.',
    });
  };

  const handleSendEmail = () => {
    if (!customer.email) {
      toast({
        title: 'No email address',
        description: 'This customer does not have an email address.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Email sent',
      description: 'Customer details have been sent to their email.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="font-medium">{formatPhoneNumber(customer.phone)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyPhone}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {customer.email && (
                  <div className="text-sm text-muted-foreground">
                    Email: {customer.email}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Member since: {format(new Date(customer.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Total Visits</div>
                  <div className="text-2xl font-bold">{customer.visitCount}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Total Spent</div>
                  <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice History */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Invoice History</h4>
              <div className="space-y-4">
                {customerInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invoice.id}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(invoice.date), 'MMMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(invoice.total)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodBadge(invoice.paymentMethod)}
                        </div>
                      </div>
                    </div>

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

                    {invoice.notes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes: </span>
                        {invoice.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
          {customer.email && (
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 