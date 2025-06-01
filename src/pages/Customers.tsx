import React, { useState } from 'react';
import { format, isAfter, isBefore, parseISO, subDays } from 'date-fns';
import {
  Download,
  Filter,
  Plus,
  Search,
  SortAsc,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { customerData } from '@/mocks';
import { Customer } from '@/types';
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
  SheetFooter,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { AddCustomerDialog } from '@/features/customers/AddCustomerDialog';
import { CustomerDetailsDialog } from '@/features/customers/CustomerDetailsDialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

export const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('lastVisit');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Advanced filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [spendingRange, setSpendingRange] = useState<[number, number]>([0, 5000]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [customerSince, setCustomerSince] = useState<Date | undefined>(undefined);
  const [minVisits, setMinVisits] = useState<number>(0);

  // Computed values
  const maxSpending = Math.max(...customerData.map(c => c.totalSpent), 5000);
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Regular', value: 'regular' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'New', value: 'new' }
  ];

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== 'lastVisit') count++;
    if (selectedStatuses.length > 0) count++;
    if (spendingRange[0] > 0 || spendingRange[1] < maxSpending) count++;
    if (dateRange) count++;
    if (customerSince) count++;
    if (minVisits > 0) count++;
    return count;
  };

  // Filter and sort customers
  const filteredCustomers = customerData
    .filter(customer => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchQuery);
      if (!matchesSearch) return false;
      
      // Status filter
      if (selectedStatuses.length > 0) {
        const customerStatus = getCustomerStatus(customer).value;
        if (!selectedStatuses.includes(customerStatus)) return false;
      }
      
      // Spending range
      if (customer.totalSpent < spendingRange[0] || customer.totalSpent > spendingRange[1]) return false;
      
      // Update visit date range filtering
      if (dateRange?.from && customer.lastVisit && isBefore(parseISO(customer.lastVisit), dateRange.from)) return false;
      if (dateRange?.to && customer.lastVisit && isAfter(parseISO(customer.lastVisit), dateRange.to)) return false;
      
      // Customer since
      if (customerSince && isAfter(parseISO(customer.createdAt), customerSince)) return false;
      
      // Minimum visits
      if (customer.visitCount < minVisits) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'visitCount':
          return b.visitCount - a.visitCount;
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'lastVisit':
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('lastVisit');
    setSelectedStatuses([]);
    setSpendingRange([0, maxSpending]);
    setDateRange(undefined);
    setCustomerSince(undefined);
    setMinVisits(0);
  };

  const getCustomerStatus = (customer: Customer) => {
    if (!customer.lastVisit) return { label: 'New', className: 'bg-blue-100 text-blue-800', value: 'new' };
    
    const lastVisitDate = new Date(customer.lastVisit);
    const today = new Date();
    const daysSinceLastVisit = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit <= 30) {
      return { label: 'Active', className: 'bg-green-100 text-green-800', value: 'active' };
    } else if (daysSinceLastVisit <= 90) {
      return { label: 'Regular', className: 'bg-yellow-100 text-yellow-800', value: 'regular' };
    } else {
      return { label: 'Inactive', className: 'bg-red-100 text-red-800', value: 'inactive' };
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(value)) {
        return prev.filter(s => s !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Date picker formatter
  const formatShortDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Customers"
        description="View and manage your customer database"
        action={{
          label: "Add Customer",
          onClick: () => setShowAddDialog(true),
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
                placeholder="Search customers..."
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
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="visitCount">Visit Count</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
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
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-md">
                <SheetHeader className="mb-6">
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastVisit">Last Visit</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="visitCount">Visit Count</SelectItem>
                        <SelectItem value="totalSpent">Total Spent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map(status => (
                        <div key={status.value} className="flex items-center gap-2">
                          <Checkbox 
                            id={`status-${status.value}`} 
                            checked={selectedStatuses.includes(status.value)}
                            onCheckedChange={() => handleStatusChange(status.value)}
                          />
                          <Label htmlFor={`status-${status.value}`} className="cursor-pointer">
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Total Spending Range</label>
                    <div className="px-1">
                      <Slider
                        defaultValue={[0, maxSpending]}
                        min={0}
                        max={maxSpending}
                        step={100}
                        value={spendingRange}
                        onValueChange={(value) => setSpendingRange(value as [number, number])}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>{formatCurrency(spendingRange[0])}</div>
                      <div>{formatCurrency(spendingRange[1])}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Visits</label>
                    <Input
                      type="number"
                      min={0}
                      value={minVisits}
                      onChange={(e) => setMinVisits(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Last Visit Date Range</label>
                    <div className="flex flex-col space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              "Select date range"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                          />
                          <div className="p-3 border-t border-border flex justify-between items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setDateRange(undefined)}
                            >
                              Clear
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const today = new Date();
                                  setDateRange({
                                    from: subDays(today, 7),
                                    to: today
                                  });
                                }}
                              >
                                Last 7 days
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const today = new Date();
                                  setDateRange({
                                    from: subDays(today, 30),
                                    to: today
                                  });
                                }}
                              >
                                Last 30 days
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Since</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customerSince && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customerSince ? formatShortDate(customerSince) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={customerSince}
                          onSelect={setCustomerSince}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => {
                        // Set last 30 days filter
                        setDateRange({
                          from: subDays(new Date(), 30),
                          to: new Date()
                        });
                      }}>
                        Last 30 Days
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // Set active customers filter
                        setSelectedStatuses(['active']);
                      }}>
                        Active Only
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // Set high-value customers
                        setSpendingRange([1000, maxSpending]);
                      }}>
                        High Value
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // Set new customers
                        setSelectedStatuses(['new']);
                      }}>
                        New Customers
                      </Button>
                    </div>
                  </div>
                </div>

                <SheetFooter className="flex justify-between pt-4 mt-4 border-t">
                  <Button variant="outline" onClick={clearFilters}>
                    Reset filters
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Visit Count</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found matching the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const status = getCustomerStatus(customer);
                  return (
                    <TableRow 
                      key={customer.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {customer.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email || formatPhoneNumber(customer.phone)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.lastVisit ? (
                          format(new Date(customer.lastVisit), 'MMM d, yyyy')
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{customer.visitCount}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      />
    </div>
  );
};