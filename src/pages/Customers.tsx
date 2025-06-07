import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore, parseISO, subDays } from 'date-fns';
import {
  Download,
  Filter,
  Plus,
  Search,
  SortAsc,
  X,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
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
import { useApi } from '@/hooks/useApi';
import { 
  getAllCustomers, 
  createCustomer, 
  updateCustomer, 
  Customer 
} from '@/api/services/customerService';
import { useToast } from '@/hooks/use-toast';

export const Customers: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('lastVisit');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(100); // Get more customers to allow client-side filtering
  
  // Advanced filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [spendingRange, setSpendingRange] = useState<[number, number]>([0, 5000]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [customerSince, setCustomerSince] = useState<Date | undefined>(undefined);
  const [minVisits, setMinVisits] = useState<number>(0);

  // API Hooks
  const {
    data: customersData,
    loading: isLoading,
    error: customersError,
    execute: fetchCustomers
  } = useApi(getAllCustomers);
  
  const {
    execute: saveCustomer
  } = useApi(createCustomer);
  
  const {
    execute: executeUpdateCustomer
  } = useApi(updateCustomer);

  useEffect(() => {
    // Convert sort state to API parameter format
    let sortParam = '';
    switch (sortBy) {
      case 'name':
        sortParam = 'name_asc';
        break;
      case 'visitCount':
        sortParam = 'visit_count_desc';
        break;
      case 'totalSpent':
        sortParam = 'total_spent_desc';
        break;
      case 'lastVisit':
        sortParam = 'last_visit_desc';
        break;
      default:
        sortParam = 'last_visit_desc';
    }
    
    fetchCustomers(page, limit, sortParam, searchQuery || undefined);
  }, [fetchCustomers, page, limit, sortBy]);

  // Error handling
  useEffect(() => {
    if (customersError) {
      toast({
        title: "Error loading customers",
        description: customersError.message,
        variant: "destructive"
      });
    }
  }, [customersError, toast]);

  // Set up customers data from API
  const customers = customersData?.customers || [];
  const maxSpending = Math.max(...customers.map(c => c.total_spent || 0), 5000);
  
  // Status options
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

  // Filter customers
  const filteredCustomers = customers
    .filter(customer => {
      // Filter by status
      if (selectedStatuses.length > 0) {
        const customerStatus = getCustomerStatus(customer).value;
        if (!selectedStatuses.includes(customerStatus)) return false;
      }
      
      // Spending range
      if ((customer.total_spent || 0) < spendingRange[0] || (customer.total_spent || 0) > spendingRange[1]) return false;
      
      // Update visit date range filtering
      if (dateRange?.from && customer.last_visit && isBefore(parseISO(customer.last_visit), dateRange.from)) return false;
      if (dateRange?.to && customer.last_visit && isAfter(parseISO(customer.last_visit), dateRange.to)) return false;
      
      // Customer since
      if (customerSince && customer.created_at && isAfter(parseISO(customer.created_at), customerSince)) return false;
      
      // Minimum visits
      if ((customer.visit_count || 0) < minVisits) return false;
      
      return true;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('lastVisit');
    setSelectedStatuses([]);
    setSpendingRange([0, maxSpending]);
    setDateRange(undefined);
    setCustomerSince(undefined);
    setMinVisits(0);
    
    // Reset search parameter for API
    fetchCustomers(page, limit);
  };

  const getCustomerStatus = (customer: Customer) => {
    if (!customer.last_visit) return { label: 'New', className: 'bg-blue-100 text-blue-800', value: 'new' };
    
    const lastVisitDate = new Date(customer.last_visit);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search queries to API
    const timer = setTimeout(() => {
      fetchCustomers(page, limit, 'last_visit_desc', value || undefined);
    }, 500);
    
    return () => clearTimeout(timer);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      await saveCustomer(customerData);
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      fetchCustomers(page, limit);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };
  
  const handleUpdateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await executeUpdateCustomer(id, customerData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      fetchCustomers(page, limit);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
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
                onChange={handleSearch}
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="visitCount">Visit Count</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
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
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Visit Count</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
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
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {customer.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.phone ? formatPhoneNumber(customer.phone) : 'No phone'}
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
                          {customer.last_visit ? format(new Date(customer.last_visit), 'MMM d, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell>{customer.visit_count || 0}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.total_spent || 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>Filter Customers</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="visitCount">Visit Count</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
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
              <label className="text-sm font-medium">Total Spent Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxSpending]}
                  min={0}
                  max={maxSpending}
                  step={50}
                  value={spendingRange}
                  onValueChange={(value) => setSpendingRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{formatCurrency(spendingRange[0])}</div>
                <div>{formatCurrency(spendingRange[1])}</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Last Visit Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
                          {formatShortDate(dateRange.from)} - {formatShortDate(dateRange.to)}
                        </>
                      ) : (
                        formatShortDate(dateRange.from)
                      )
                    ) : (
                      "Any date range"
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
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  className="h-8 col-span-1"
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 30),
                    to: new Date()
                  })}
                >
                  Last 30 days
                </Button>
                <Button 
                  variant="outline" 
                  className="h-8 col-span-1"
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 90),
                    to: new Date()
                  })}
                >
                  Last 90 days
                </Button>
                <Button 
                  variant="outline" 
                  className="h-8 col-span-1"
                  onClick={() => setDateRange(undefined)}
                >
                  Any time
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Minimum Visit Count</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0]}
                  min={0}
                  max={20}
                  step={1}
                  value={[minVisits]}
                  onValueChange={(value) => setMinVisits(value[0])}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {minVisits} or more visits
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

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        onUpdate={handleUpdateCustomer}
      />

      <AddCustomerDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};