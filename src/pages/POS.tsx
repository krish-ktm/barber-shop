import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Download,
  Filter,
  Plus,
  Search,
  SortAsc,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { invoiceData } from '@/mocks';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';
import { InvoiceDialog } from '@/features/pos/InvoiceDialog';
import { StepInvoiceDialog } from '@/features/pos/StepInvoiceDialog';

export const POS: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);

  // Filter and sort invoices
  const filteredInvoices = invoiceData
    .filter(invoice => {
      const searchLower = searchQuery.toLowerCase();
      return searchQuery === '' || 
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.id.toLowerCase().includes(searchLower) ||
        invoice.staffName.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.total - a.total;
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'staff':
          return a.staffName.localeCompare(b.staffName);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('date');
  };

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

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="POS & Invoices"
        description="Create and manage invoices"
        action={{
          label: "New Invoice",
          onClick: () => setShowNewInvoiceDialog(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {(searchQuery || sortBy !== 'date') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="sm:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(searchQuery || sortBy !== 'date') && (
                    <Badge variant="secondary" className="ml-2">
                      {(searchQuery ? 1 : 0) + (sortBy !== 'date' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => {
                      setSortBy(value);
                      setShowFilters(false);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters}>
                      Reset filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply filters</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow 
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">
                    {invoice.id}
                    {invoice.appointmentId && (
                      <div className="text-xs text-muted-foreground">
                        Appointment #{invoice.appointmentId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{invoice.staffName}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(invoice.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.total)}
                    {invoice.tipAmount && invoice.tipAmount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Tip: {formatCurrency(invoice.tipAmount)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {showInvoiceDialog && selectedInvoice && (
        <InvoiceDialog
          invoice={selectedInvoice}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
        />
      )}

      <StepInvoiceDialog
        open={showNewInvoiceDialog}
        onOpenChange={setShowNewInvoiceDialog}
      />
    </div>
  );
};