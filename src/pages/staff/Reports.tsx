import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Download, 
  RefreshCcw,
  Scissors,
  DollarSign,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/lib/auth';
import { 
  getStaffReport,
  getRevenueReport,
  getServicesReport
} from '@/api/services/reportService';
import { useToast } from '@/hooks/use-toast';

// Date range presets
const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
];

export const StaffReports: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const staffId = user?.id;

  // API hooks
  const {
    loading: revenueLoading,
    error: revenueError,
    execute: fetchRevenueReport,
  } = useApi(getRevenueReport);

  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
    execute: fetchStaffReport,
  } = useApi(getStaffReport);

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    execute: fetchServicesReport,
  } = useApi(getServicesReport);

  // State for date selection
  const [dateRange, setDateRange] = useState<string>('last7days');
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());

  // Load data on component mount
  useEffect(() => {
    if (staffId) {
      fetchInitialData();
    }
  }, [staffId]);

  // Fetch initial data
  const fetchInitialData = () => {
    // Format dates for API calls
    const dateFrom = format(fromDate, 'yyyy-MM-dd');
    const dateTo = format(toDate, 'yyyy-MM-dd');
    
    // Fetch all report data
    fetchRevenueReport(dateFrom, dateTo, 'day');
    fetchStaffReport(dateFrom, dateTo, 'revenue_desc');
    fetchServicesReport(dateFrom, dateTo, 'revenue_desc');
  };

  // Handle date range changes
  const handleDateRangeChange = (preset: string) => {
    setDateRange(preset);
    const today = new Date();
    
    switch(preset) {
      case 'today':
        setFromDate(today);
        setToDate(today);
        break;
      case 'yesterday': {
        const yesterday = subDays(today, 1);
        setFromDate(yesterday);
        setToDate(yesterday);
        break;
      }
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
    }
    
    // Refresh data when date range changes
    setTimeout(() => {
      fetchInitialData();
    }, 0);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== 'custom') {
      return DATE_PRESETS.find(preset => preset.value === dateRange)?.label || '';
    }
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  // Handle errors
  useEffect(() => {
    if (revenueError) {
      toast({
        title: 'Error loading revenue data',
        description: revenueError.message,
        variant: 'destructive'
      });
    }
    
    if (staffError) {
      toast({
        title: 'Error loading staff data',
        description: staffError.message,
        variant: 'destructive'
      });
    }
    
    if (servicesError) {
      toast({
        title: 'Error loading services data',
        description: servicesError.message,
        variant: 'destructive'
      });
    }
  }, [revenueError, staffError, servicesError, toast]);

  // Get current staff data from API
  const currentStaffData = staffData?.data?.find(staff => staff.staffId === staffId);
  
  // If still loading or no staff ID
  if (!staffId || staffLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Performance Reports"
        description="View your performance metrics and earnings"
      />

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left w-full md:w-auto',
                !fromDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={dateRange === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDateRangeChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{
                from: fromDate,
                to: toDate,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setFromDate(range.from);
                  setDateRange('custom');
                }
                if (range?.to) {
                  setToDate(range.to);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={fetchInitialData}
            disabled={staffLoading || revenueLoading || servicesLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentStaffData?.appointments || 0}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During selected period
            </div>
            <div className="mt-4">
              <Progress value={currentStaffData?.appointments ? Math.min(currentStaffData.appointments / 100 * 100, 100) : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(currentStaffData?.revenue || 0)}</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During selected period
            </div>
            <div className="mt-4">
              <Progress value={currentStaffData?.revenue ? Math.min(currentStaffData.revenue / 5000 * 100, 100) : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(currentStaffData?.commission || 0)}</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During selected period
            </div>
            <div className="mt-4">
              <Progress value={currentStaffData?.commission ? Math.min(currentStaffData.commission / 1000 * 100, 100) : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Per Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  currentStaffData && currentStaffData.appointments > 0
                    ? currentStaffData.revenue / currentStaffData.appointments
                    : 0
                )}
              </div>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average revenue per appointment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Services Performance</CardTitle>
          <CardDescription>
            Services provided during the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : servicesError ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading services data</p>
            </div>
          ) : servicesData?.data && servicesData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg. Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesData.data.map((service) => (
                  <TableRow key={service.serviceId}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-right">{service.bookings}</TableCell>
                    <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(service.bookings > 0 ? service.revenue / service.bookings : 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No services data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffReports; 