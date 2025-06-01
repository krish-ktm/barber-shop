import React from 'react';
import { format } from 'date-fns';
import { Copy, Download } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleDownload = () => {
    toast({
      title: 'Download started',
      description: 'Customer details PDF will be downloaded shortly.',
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
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No invoices found for this customer
                        </TableCell>
                      </TableRow>
                    ) : (
                      customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate cursor-help">
                                    {invoice.services.map(s => s.serviceName).join(', ')}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-[300px]">
                                  <div className="space-y-1 text-sm">
                                    {invoice.services.map((service, idx) => (
                                      <div key={idx} className="flex justify-between gap-4">
                                        <span>
                                          {service.serviceName}
                                          {service.quantity > 1 && <span className="text-muted-foreground"> × {service.quantity}</span>}
                                        </span>
                                        <span className="font-medium">{formatCurrency(service.total)}</span>
                                      </div>
                                    ))}
                                    {invoice.notes && (
                                      <div className="pt-1 mt-1 border-t text-muted-foreground">
                                        <span className="font-medium">Notes: </span>
                                        {invoice.notes}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{getPaymentMethodBadge(invoice.paymentMethod)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 