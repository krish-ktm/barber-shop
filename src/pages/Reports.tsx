import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, Filter, BarChart3, ChevronDown, RefreshCcw, X } from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  revenueData, 
  servicePerformanceData, 
  staffPerformanceData,
  staffData,
  serviceData 
} from '@/mocks';

// Date range presets
const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'custom', label: 'Custom range' },
];

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// Comparison options
const COMPARISON_OPTIONS = [
  { value: 'none', label: 'No comparison' },
  { value: 'previousPeriod', label: 'Previous period' },
  { value: 'samePeroidLastYear', label: 'Same period last year' },
];

// Export formats
const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom'>('last7days');
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7)); // Default to last 7 days
  const [toDate, setToDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('revenue');
  const [showFilters, setShowFilters] = useState(false);
  const [compareWith, setCompareWith] = useState('none');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>(['cash', 'card', 'mobile']);
  const [showComparisonData, setShowComparisonData] = useState(false);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);

  // Extract service categories from service data
  const serviceCategories = Array.from(
    new Set(serviceData.map((service) => service.category))
  );

  // Handle date range preset selection
  const handleDateRangeChange = (preset: string) => {
    setDateRange(preset as any);
    const today = new Date();
    
    switch(preset) {
      case 'today':
        setFromDate(today);
        setToDate(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setFromDate(yesterday);
        setToDate(yesterday);
        break;
      case 'last7days':
        setFromDate(subDays(today, 7));
        setToDate(today);
        break;
      case 'last30days':
        setFromDate(subDays(today, 30));
        setToDate(today);
        break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(firstDayOfMonth);
        setToDate(today);
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFromDate(firstDayLastMonth);
        setToDate(lastDayLastMonth);
        break;
      case 'custom':
        // Keep current date selection for custom
        break;
    }
  };

  // Toggle staff selection
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Toggle service selection
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Toggle service category selection
  const toggleServiceCategorySelection = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Toggle payment method filter
  const togglePaymentMethod = (method: string) => {
    setPaymentFilter(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setDateRange('last7days');
    setFromDate(subDays(new Date(), 7));
    setToDate(new Date());
    setSelectedStaff([]);
    setSelectedServices([]);
    setSelectedServiceCategories([]);
    setPaymentFilter(['cash', 'card', 'mobile']);
    setCompareWith('none');
    setShowComparisonData(false);
  };

  // Apply filters (in a real app, this would fetch filtered data)
  const applyFilters = () => {
    // In the actual implementation, this would trigger API calls with filters
    setShowFilters(false);
    // For prototype, just simulate with a delay
    setTimeout(() => {
      alert('Filters applied successfully!');
    }, 300);
  };

  const handleExport = (format: string) => {
    // In a real app, this would generate the actual export
    alert(`Exporting data as ${format.toUpperCase()}. This would trigger a download in a real implementation.`);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== 'custom') {
      return DATE_PRESETS.find(preset => preset.value === dateRange)?.label || '';
    }
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="View detailed business performance metrics"
        action={null}
      />
      
      {/* Control panel with filters and export options */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
                <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                  {(selectedStaff.length > 0 ? 1 : 0) + 
                   (selectedServices.length > 0 || selectedServiceCategories.length > 0 ? 1 : 0) +
                   (compareWith !== 'none' ? 1 : 0) +
                   (dateRange !== 'last7days' ? 1 : 0)}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
              
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Date Range Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select value={dateRange} onValueChange={handleDateRangeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {dateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <label className="text-xs">From</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left text-xs font-normal h-8"
                            >
                              {format(fromDate, 'PP')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fromDate}
                              onSelect={(date) => date && setFromDate(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">To</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left text-xs font-normal h-8"
                            >
                              {format(toDate, 'PP')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={toDate}
                              onSelect={(date) => date && setToDate(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Comparison Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compare with</label>
                  <Select value={compareWith} onValueChange={setCompareWith}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPARISON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Staff Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Staff</label>
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                    {staffData.map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`staff-${staff.id}`}
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={() => toggleStaffSelection(staff.id)}
                        />
                        <label 
                          htmlFor={`staff-${staff.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {staff.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Categories Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Categories</label>
                  <div className="max-h-[120px] overflow-y-auto border rounded-md p-2">
                    {serviceCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedServiceCategories.includes(category)}
                          onCheckedChange={() => toggleServiceCategorySelection(category)}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="flex flex-wrap gap-2">
                    {['cash', 'card', 'mobile'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`payment-${method}`}
                          checked={paymentFilter.includes(method)}
                          onCheckedChange={() => togglePaymentMethod(method)}
                        />
                        <label 
                          htmlFor={`payment-${method}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {method}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/20 border-t flex justify-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Active filters display */}
          {((selectedStaff.length > 0) || 
           (selectedServices.length > 0) || 
           (selectedServiceCategories.length > 0) || 
           (dateRange !== 'last7days') ||
           (compareWith !== 'none')) && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {dateRange !== 'last7days' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  {getDisplayDateRange()}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setDateRange('last7days');
                      setFromDate(subDays(new Date(), 7));
                      setToDate(new Date());
                    }}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {compareWith !== 'none' && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  {COMPARISON_OPTIONS.find(c => c.value === compareWith)?.label}
                  <Button 
                    variant="ghost" 
                    onClick={() => setCompareWith('none')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedStaff.length > 0 && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  {selectedStaff.length} staff
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedStaff([])}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedServiceCategories.length > 0 && (
                <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                  {selectedServiceCategories.length} categories
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedServiceCategories([])}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Export dropdown */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {EXPORT_FORMATS.map((format) => (
                <DropdownMenuItem 
                  key={format.value}
                  onClick={() => handleExport(format.value)}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-auto">
              <TabsList className="w-full justify-start inline-flex h-auto p-1 whitespace-nowrap">
                <TabsTrigger value="revenue" className="flex-shrink-0">
                  <BarChart3 className="h-4 w-4 mr-1 opacity-70" />
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex-shrink-0">Staff Performance</TabsTrigger>
                <TabsTrigger value="services" className="flex-shrink-0">Service Analytics</TabsTrigger>
                <TabsTrigger value="customers" className="flex-shrink-0">Customer Insights</TabsTrigger>
                <TabsTrigger value="appointments" className="flex-shrink-0">Appointments</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue Trends</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()} {compareWith !== 'none' && `vs ${COMPARISON_OPTIONS.find(c => c.value === compareWith)?.label}`}
                      </CardDescription>
                    </div>
                    <Select defaultValue="daily" onValueChange={setReportType}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="View by" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px]">
                    <RevenueChart title="" data={revenueData} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$245.75</div>
                    <p className="text-sm text-muted-foreground">
                      +12.5% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$1,720.25</div>
                    <p className="text-sm text-muted-foreground">
                      +5.2% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Monthly Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$7,450.00</div>
                    <p className="text-sm text-muted-foreground">
                      Based on current trends
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-md">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cash</span>
                        <span>35%</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Card</span>
                        <span>55%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mobile</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Staff Performance</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()}
                      </CardDescription>
                    </div>
                    {/* Staff specific filters could go here */}
                    <Input placeholder="Search staff" className="w-[200px]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-w-[600px] overflow-auto">
                    <PerformanceTable
                      title=""
                      data={staffPerformanceData}
                      type="staff"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Analytics</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()}
                      </CardDescription>
                    </div>
                    {/* Service specific filters */}
                    <Select defaultValue="bookings">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookings">Most Booked</SelectItem>
                        <SelectItem value="revenue">Highest Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-w-[600px] overflow-auto">
                    <PerformanceTable
                      title=""
                      data={servicePerformanceData}
                      type="service"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Insights</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()}
                      </CardDescription>
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="new">New Customers</SelectItem>
                        <SelectItem value="returning">Returning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">New Customers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-sm text-muted-foreground">
                          This month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Returning Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-sm text-muted-foreground">
                          Last 30 days
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Average Spend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$45.50</div>
                        <p className="text-sm text-muted-foreground">
                          Per visit
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Satisfaction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.8/5.0</div>
                        <p className="text-sm text-muted-foreground">
                          Based on feedback
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="sm:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-base">Customer Growth</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[180px]">
                        {/* This would be a chart in a real implementation */}
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Customer Growth Chart (Placeholder)
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Appointment Analytics</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()}
                      </CardDescription>
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No-show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Total Appointments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">87</div>
                        <p className="text-sm text-muted-foreground">
                          In selected period
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">92%</div>
                        <p className="text-sm text-muted-foreground">
                          +2% from last period
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cancellation Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">5%</div>
                        <p className="text-sm text-muted-foreground">
                          -1% from last period
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">No-show Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3%</div>
                        <p className="text-sm text-muted-foreground">
                          -0.5% from last period
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-base">Daily Appointment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                      {/* This would be a chart in a real implementation */}
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Appointment Distribution Chart (Placeholder)
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};