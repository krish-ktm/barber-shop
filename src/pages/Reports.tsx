import React, { useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { 
  BarChart3, 
  Calendar as CalendarIcon,
  Download, 
  Filter, 
  RefreshCcw,
  X,
  Users,
  Scissors,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  ChevronDown,
  Check as CheckIcon,
  UserPlus,
  Info
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComparisonChart } from '@/components/dashboard/ComparisonChart';
import { PieChartCard } from '@/components/dashboard/PieChartCard';
import { StaffDetailAnalytics } from '@/components/dashboard/StaffDetailAnalytics';
import { cn } from '@/lib/utils';
import { 
  staffData, 
  serviceData,
  revenueComparisonData,
  advancedRevenueMetrics,
  appointmentMetrics,
  customerMetrics,
  advancedStaffPerformance,
  advancedServicePerformance,
  paymentMethodAnalytics
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

// Report types
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
  // State management
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom'>('last7days');
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('revenue');
  const [showFilters, setShowFilters] = useState(false);
  const [compareWith, setCompareWith] = useState('none');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>(['cash', 'card', 'mobile']);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  // Dialog state
  const [selectedStaffMember, setSelectedStaffMember] = useState<string | null>(null);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  // Extract service categories
  const serviceCategories = Array.from(
    new Set(serviceData.map((service) => service.category))
  );

  // Handle date range changes
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
        setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setToDate(today);
        break;
      case 'lastMonth':
        setFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case 'custom':
        // Keep current selection
        break;
    }
  };

  // Toggle selections
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleServiceCategory = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentFilter(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange('last7days');
    setFromDate(subDays(new Date(), 7));
    setToDate(new Date());
    setSelectedStaff([]);
    setSelectedServices([]);
    setSelectedServiceCategories([]);
    setPaymentFilter(['cash', 'card', 'mobile']);
    setCompareWith('none');
  };

  // Export handling
  const handleExport = (format: string) => {
    alert(`Exporting data as ${format}...`);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== 'custom') {
      return DATE_PRESETS.find(preset => preset.value === dateRange)?.label || '';
    }
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange !== 'last7days') count++;
    if (compareWith !== 'none') count++;
    if (selectedStaff.length > 0) count++;
    if (selectedServices.length > 0) count++;
    if (selectedServiceCategories.length > 0) count++;
    if (paymentFilter.length !== 3) count++;
    return count;
  };

  // Payment method distribution data for pie chart
  const paymentMethodData = paymentMethodAnalytics.methods.map(method => ({
    name: method.method,
    value: method.amount,
    percentage: method.percentage,
    color: method.method === 'Cash' ? '#000000' : method.method === 'Card' ? '#666666' : '#999999'
  }));

  // Service category distribution data
  const serviceCategoryData = serviceCategories.map(category => {
    const servicesInCategory = serviceData.filter(service => service.category === category);
    const totalRevenue = servicesInCategory.reduce((sum, service) => sum + service.price, 0);
    return {
      name: category,
      value: totalRevenue,
      color: category === 'haircut' ? '#000000' : category === 'beard' ? '#333333' : '#666666'
    };
  });

  // Handle staff selection
  const handleStaffRowClick = (staffId: string) => {
    setSelectedStaffMember(staffId);
    setShowStaffDialog(true);
  };
  
  // Handle service selection
  const handleServiceRowClick = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowServiceDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive business performance metrics and insights"
      />
      
      {/* Control Panel */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Filters Popover */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
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
                {/* Date Range */}
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

                {/* Comparison */}
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
                  <label className="text-sm font-medium">Staff Members</label>
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

                {/* Service Categories */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Categories</label>
                  <div className="max-h-[120px] overflow-y-auto border rounded-md p-2">
                    {serviceCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedServiceCategories.includes(category)}
                          onCheckedChange={() => toggleServiceCategory(category)}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer flex-1 capitalize"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Methods</label>
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

                {/* Advanced Metrics Toggle */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Advanced Metrics</label>
                    <Switch
                      checked={showAdvancedMetrics}
                      onCheckedChange={setShowAdvancedMetrics}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include detailed performance indicators and trends
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-muted/20 border-t">
                <Button onClick={() => setShowFilters(false)} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {dateRange !== 'last7days' && (
              <Badge variant="outline" className="h-6 px-2 gap-1 text-xs">
                {getDisplayDateRange()}
                <Button 
                  variant="ghost" 
                  onClick={() => handleDateRangeChange('last7days')}
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
                {selectedStaff.length} staff selected
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
        </div>

        {/* Export Options */}
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

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Scissors className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Clock className="h-4 w-4" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {/* Revenue Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${advancedRevenueMetrics.current.monthly.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{advancedRevenueMetrics.current.monthly.percentChange}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Daily
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${advancedRevenueMetrics.current.daily.average.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{advancedRevenueMetrics.current.daily.percentChange}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Projection
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${advancedRevenueMetrics.current.monthly.projection.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on current trends
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenue per Visit
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${customerMetrics.averageSpend.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average transaction value
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="trends" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
                <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                <TabsTrigger value="services">Service Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trends" className="space-y-4 pt-4">
                <Card className="overflow-visible">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Revenue Trends</CardTitle>
                        <CardDescription>
                          {getDisplayDateRange()}
                          {compareWith !== 'none' && 
                            ` vs ${COMPARISON_OPTIONS.find(c => c.value === compareWith)?.label}`
                          }
                        </CardDescription>
                      </div>
                      <Select defaultValue={reportType} onValueChange={setReportType}>
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
                  <CardContent className="pb-6 mb-6">
                    <div className="w-full h-[350px]">
                      <ComparisonChart
                        data={revenueComparisonData}
                        title=""
                        showLegend
                        currentLabel="Current Period"
                        previousLabel="Previous Period"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Revenue Breakdown</CardTitle>
                    <CardDescription>Revenue distribution by day of week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Transactions</TableHead>
                          <TableHead>Avg. Transaction</TableHead>
                          <TableHead>Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                          const value = 1000 + Math.floor(Math.random() * 2000);
                          const transactions = 10 + Math.floor(Math.random() * 30);
                          const change = -10 + Math.floor(Math.random() * 30);
                          
                          return (
                            <TableRow key={day}>
                              <TableCell className="font-medium">{day}</TableCell>
                              <TableCell>${value.toLocaleString()}</TableCell>
                              <TableCell>{transactions}</TableCell>
                              <TableCell>${(value / transactions).toFixed(2)}</TableCell>
                              <TableCell>
                                <span className={change > 0 ? "text-green-600" : "text-red-600"}>
                                  {change > 0 ? "+" : ""}{change}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4 pt-4">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="md:col-span-1 overflow-visible">
                    <CardHeader>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Distribution of payment methods
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="w-full h-[350px]">
                        <PieChartCard
                          data={paymentMethodData}
                          title=""
                          showLegend
                          showLabels={false}
                          innerRadius={60}
                          outerRadius={80}
                          className="border-none shadow-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Payment Method Analytics</CardTitle>
                      <CardDescription>Detailed payment method analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Change</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentMethodAnalytics.methods.map((method) => (
                            <TableRow key={method.method}>
                              <TableCell className="font-medium">{method.method}</TableCell>
                              <TableCell>${method.amount.toLocaleString()}</TableCell>
                              <TableCell>{method.percentage}%</TableCell>
                              <TableCell>
                                <span className={method.trend === 'up' ? "text-green-600" : "text-red-600"}>
                                  {method.trend === 'up' ? '+' : ''}{method.changePercent}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={method.trend === 'up' ? "default" : "secondary"}>
                                  {method.trend === 'up' ? "Increasing" : "Decreasing"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4 pt-4">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="md:col-span-1 overflow-visible">
                    <CardHeader>
                      <CardTitle>Service Categories</CardTitle>
                      <CardDescription>
                        Revenue by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="w-full h-[350px]">
                        <PieChartCard
                          data={serviceCategoryData}
                          title=""
                          showLegend
                          showLabels={false}
                          innerRadius={60}
                          outerRadius={80}
                          className="border-none shadow-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Category Performance</CardTitle>
                      <CardDescription>Revenue and performance by service category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead>Avg. Price</TableHead>
                            <TableHead>Growth</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceCategories.map((category) => {
                            const servicesInCategory = serviceData.filter(service => service.category === category);
                            const totalRevenue = servicesInCategory.reduce((sum, service) => sum + service.price, 0);
                            const avgPrice = totalRevenue / servicesInCategory.length;
                            const growth = -5 + Math.floor(Math.random() * 25);
                            
                            return (
                              <TableRow key={category}>
                                <TableCell className="font-medium capitalize">{category}</TableCell>
                                <TableCell>${totalRevenue.toLocaleString()}</TableCell>
                                <TableCell>{servicesInCategory.length}</TableCell>
                                <TableCell>${avgPrice.toFixed(2)}</TableCell>
                                <TableCell>
                                  <span className={growth > 0 ? "text-green-600" : "text-red-600"}>
                                    {growth > 0 ? "+" : ""}{growth}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            {/* Staff Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Staff
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active staff members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Commission
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(advancedStaffPerformance.reduce((sum, staff) => 
                      sum + staff.commissionEarned, 0) / staffData.length).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per staff member
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Utilization Rate
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(advancedStaffPerformance.reduce((sum, staff) => 
                      sum + staff.utilization, 0) / staffData.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average across all staff
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Customer Satisfaction
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(advancedStaffPerformance.reduce((sum, staff) => 
                      sum + Number(staff.customerSatisfaction), 0) / staffData.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average rating out of 5
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Staff Performance Table */}
            <Card>
              <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                    <CardDescription>
                  Click on a row to view detailed performance metrics
                    </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advancedStaffPerformance.map((staff, index) => {
                      const staffInfo = staffData.find(s => s.name === staff.name);
                      return (
                        <TableRow 
                      key={index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleStaffRowClick(staffInfo?.id || `staff-${index}`)}
                        >
                          <TableCell className="font-medium">{staff.name}</TableCell>
                          <TableCell>{staffInfo?.position || '-'}</TableCell>
                          <TableCell>{staff.appointments}</TableCell>
                          <TableCell>${staff.revenue.toLocaleString()}</TableCell>
                          <TableCell>{staff.customerSatisfaction}/5.0</TableCell>
                          <TableCell>{staff.utilization}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Staff Detail Dialog */}
            <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Staff Performance Details</DialogTitle>
                  <DialogDescription>
                    Detailed performance metrics and analysis
                  </DialogDescription>
                </DialogHeader>
                {selectedStaffMember && (
                  <div className="mt-4">
                    {advancedStaffPerformance
                      .filter((staff, index) => {
                        const staffInfo = staffData.find(s => s.id === selectedStaffMember);
                        // Only match one record, either by name or by index
                        if (staffInfo && staffInfo.name === staff.name) return true;
                        if (!staffInfo && selectedStaffMember === `staff-${index}`) return true;
                        return false;
                      })
                      .slice(0, 1) // Ensure only one record is displayed
                      .map((staff, index) => {
                        const staffInfo = staffData.find(s => s.name === staff.name);
                        return (
                          <div key={index} className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {staffInfo?.image ? (
                                  <img src={staffInfo.image} alt={staff.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xl font-semibold">{staff.name.charAt(0)}</span>
                                )}
                </div>
                              <div>
                                <h2 className="text-xl font-bold">{staff.name}</h2>
                                <p className="text-muted-foreground">{staffInfo?.position || 'Staff Member'}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Appointments</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">{staff.appointments}</p>
              </CardContent>
            </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Revenue</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">${staff.revenue.toLocaleString()}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Commission</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">${staff.commissionEarned.toLocaleString()}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Utilization</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">{staff.utilization}%</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Tabs defaultValue="metrics" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                                <TabsTrigger value="services">Top Services</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="metrics" className="space-y-4 pt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Metric</TableHead>
                                      <TableHead>Value</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Appointment Completion</TableCell>
                                      <TableCell>{staff.appointmentCompletionRate}%</TableCell>
                                      <TableCell>
                                        <Badge variant={staff.appointmentCompletionRate > 90 ? "default" : staff.appointmentCompletionRate > 75 ? "secondary" : "outline"}>
                                          {staff.appointmentCompletionRate > 90 ? "Excellent" : staff.appointmentCompletionRate > 75 ? "Good" : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Customer Satisfaction</TableCell>
                                      <TableCell>{staff.customerSatisfaction}/5.0</TableCell>
                                      <TableCell>
                                        <Badge variant={Number(staff.customerSatisfaction) > 4.5 ? "default" : Number(staff.customerSatisfaction) > 4.0 ? "secondary" : "outline"}>
                                          {Number(staff.customerSatisfaction) > 4.5 ? "Excellent" : Number(staff.customerSatisfaction) > 4.0 ? "Good" : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Utilization Rate</TableCell>
                                      <TableCell>{staff.utilization}%</TableCell>
                                      <TableCell>
                                        <Badge variant={staff.utilization > 85 ? "default" : staff.utilization > 70 ? "secondary" : "outline"}>
                                          {staff.utilization > 85 ? "High" : staff.utilization > 70 ? "Good" : "Low"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Services Per Appointment</TableCell>
                                      <TableCell>{staff.averageServicesPerAppointment}</TableCell>
                                      <TableCell>
                                        <Badge variant={Number(staff.averageServicesPerAppointment) > 1.5 ? "default" : "secondary"}>
                                          {Number(staff.averageServicesPerAppointment) > 1.5 ? "High" : "Average"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>
                              
                              <TabsContent value="services" className="space-y-4 pt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Service</TableHead>
                                      <TableHead>Bookings</TableHead>
                                      <TableHead>Performance</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {staff.topServices.map((service, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="font-medium">{service.name}</TableCell>
                                        <TableCell>{service.count}</TableCell>
                                        <TableCell>
                                          <Badge variant="secondary">{idx === 0 ? "Most Popular" : idx === 1 ? "Popular" : "Regular"}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TabsContent>
                            </Tabs>
                          </div>
                        );
                      })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {/* Service Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Services
                  </CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serviceData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available services
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Price
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(serviceData.reduce((sum, service) => 
                      sum + service.price, 0) / serviceData.length).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per service
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Popular
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Classic Haircut</div>
                  <p className="text-xs text-muted-foreground">
                    124 bookings this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Categories
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serviceCategories.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Service categories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Service Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>
                  Click on a row to view detailed service metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Satisfaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advancedServicePerformance.map((service, index) => {
                      const serviceInfo = serviceData.find(s => s.name === service.name);
                      return (
                        <TableRow 
                          key={index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleServiceRowClick(serviceInfo?.id || `service-${index}`)}
                        >
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{serviceInfo?.category || '-'}</TableCell>
                          <TableCell>{service.bookings}</TableCell>
                          <TableCell>${service.revenue.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={parseInt(service.growthRate) > 0 ? "text-green-600" : "text-red-600"}>
                              {parseInt(service.growthRate) > 0 ? '+' : ''}{service.growthRate}%
                            </span>
                          </TableCell>
                          <TableCell>{service.customerSatisfaction}/5.0</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Service Detail Dialog */}
            <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Service Details</DialogTitle>
                  <DialogDescription>
                    Detailed service performance metrics
                  </DialogDescription>
                </DialogHeader>
                {selectedService && (
                  <div className="mt-4 space-y-6">
                    {advancedServicePerformance
                      .filter((service, index) => {
                        const serviceInfo = serviceData.find(s => s.id === selectedService);
                        // Only match one record, either by name or by index
                        if (serviceInfo && serviceInfo.name === service.name) return true;
                        if (!serviceInfo && selectedService === `service-${index}`) return true;
                        return false;
                      })
                      .slice(0, 1) // Ensure only one record is displayed
                      .map((service, index) => {
                        const serviceInfo = serviceData.find(s => s.name === service.name);
                        return (
                          <div key={index} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                                <h2 className="text-xl font-bold">{service.name}</h2>
                                <p className="text-muted-foreground">
                                  {serviceInfo?.category || 'General'} • {service.avgDuration} minutes
                          </p>
                        </div>
                              <Badge variant={parseInt(service.growthRate) > 0 ? "default" : "secondary"}>
                                {parseInt(service.growthRate) > 0 ? '+' : ''}{service.growthRate}% growth
                        </Badge>
                      </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Bookings</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">{service.bookings}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Revenue</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">${service.revenue.toLocaleString()}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Profit Margin</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">{service.profitMargin}%</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Rating</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">{service.customerSatisfaction}/5.0</p>
                                </CardContent>
                              </Card>
                      </div>

                            <Tabs defaultValue="metrics" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="metrics">Performance</TabsTrigger>
                                <TabsTrigger value="staff">Top Performers</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="metrics" className="space-y-4 pt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Metric</TableHead>
                                      <TableHead>Value</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Popularity</TableCell>
                                      <TableCell>{service.popularity}%</TableCell>
                                      <TableCell>
                                        <Badge variant={service.popularity > 75 ? "default" : service.popularity > 50 ? "secondary" : "outline"}>
                                          {service.popularity > 75 ? "High Demand" : service.popularity > 50 ? "Popular" : "Low Demand"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Customer Satisfaction</TableCell>
                                      <TableCell>{service.customerSatisfaction}/5.0</TableCell>
                                      <TableCell>
                                        <Badge variant={Number(service.customerSatisfaction) > 4.5 ? "default" : Number(service.customerSatisfaction) > 4.0 ? "secondary" : "outline"}>
                                          {Number(service.customerSatisfaction) > 4.5 ? "Excellent" : Number(service.customerSatisfaction) > 4.0 ? "Good" : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Profit Margin</TableCell>
                                      <TableCell>{service.profitMargin}%</TableCell>
                                      <TableCell>
                                        <Badge variant={service.profitMargin > 70 ? "default" : service.profitMargin > 50 ? "secondary" : "outline"}>
                                          {service.profitMargin > 70 ? "High" : service.profitMargin > 50 ? "Good" : "Low"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Growth Rate</TableCell>
                                      <TableCell>{service.growthRate}%</TableCell>
                                      <TableCell>
                                        <Badge variant={parseInt(service.growthRate) > 10 ? "default" : parseInt(service.growthRate) > 0 ? "secondary" : "outline"}>
                                          {parseInt(service.growthRate) > 10 ? "Strong Growth" : parseInt(service.growthRate) > 0 ? "Growing" : "Declining"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>
                              
                              <TabsContent value="staff" className="space-y-4 pt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Staff Member</TableHead>
                                      <TableHead>Success Rate</TableHead>
                                      <TableHead>Performance</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {service.preferredByStaff.map((staffName, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="font-medium">{staffName}</TableCell>
                                        <TableCell>{Math.round(70 + Math.random() * 20)}%</TableCell>
                                        <TableCell>
                                          <Badge variant={idx < 2 ? "default" : "secondary"}>
                                            {idx === 0 ? "Top Performer" : idx === 1 ? "Specialist" : "Competent"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TabsContent>
                            </Tabs>
                </div>
                        );
                      })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            {/* Appointment Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Appointments
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentMetrics.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <CheckIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentMetrics.completionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed appointments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cancellation Rate
                  </CardTitle>
                  <X className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentMetrics.cancellationRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cancelled appointments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    No-show Rate
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointmentMetrics.noShowRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No-show appointments
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Weekly Analysis */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Weekly Appointment Analysis</CardTitle>
                <CardDescription>
                  Appointment trends and distribution by day of week
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="w-full h-[350px] mb-6">
                  <ComparisonChart
                    data={appointmentMetrics.distributionByDay.map(day => ({
                      date: day.day,
                      current: day.appointments,
                      previous: day.utilization
                    }))}
                    title=""
                    showLegend
                    currentLabel="Appointments"
                    previousLabel="Utilization %"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Distribution Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daily Distribution</CardTitle>
                    <CardDescription>Appointments by day of week</CardDescription>
                  </div>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointmentMetrics.distributionByDay.map((day) => (
                        <TableRow key={day.day}>
                          <TableCell className="font-medium">{day.day}</TableCell>
                          <TableCell>{day.appointments}</TableCell>
                          <TableCell>{day.utilization}%</TableCell>
                          <TableCell>
                            <Badge variant={day.utilization > 80 ? "default" : day.utilization > 50 ? "secondary" : "outline"}>
                              {day.utilization > 80 ? "High" : day.utilization > 50 ? "Medium" : "Low"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>Time Distribution</CardTitle>
                    <CardDescription>Appointments by time of day</CardDescription>
                  </div>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointmentMetrics.distributionByTime.map((time) => (
                        <TableRow key={time.time}>
                          <TableCell className="font-medium">{time.time}</TableCell>
                          <TableCell>{time.appointments}</TableCell>
                          <TableCell>{time.utilization}%</TableCell>
                          <TableCell>
                            <Badge variant={time.utilization > 80 ? "default" : time.utilization > 50 ? "secondary" : "outline"}>
                              {time.utilization > 80 ? "Peak" : time.utilization > 50 ? "Busy" : "Quiet"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};