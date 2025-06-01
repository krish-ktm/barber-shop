import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Download, 
  RefreshCcw,
  Scissors,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Check as CheckIcon
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  staffData, 
  appointmentData,
  serviceData,
  advancedStaffPerformance
} from '@/mocks';
import { formatCurrency } from '@/utils';

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
  // Mock staff ID - in real app would come from auth context
  const staffId = 'staff-1';
  const staff = staffData.find(s => s.id === staffId);

  // State for date selection
  const [dateRange, setDateRange] = useState<string>('last7days');
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());

  if (!staff) return null;

  // Get the staff performance data by matching the staff name
  const staffPerformance = advancedStaffPerformance.find(s => s.name === staff.name);

  if (!staffPerformance) return null;

  // Filter appointments for this staff member within the selected date range
  const staffAppointments = appointmentData.filter(appointment => 
    appointment.staffId === staffId
  );

  // Count appointments by status
  const completedAppointments = staffAppointments.filter(a => a.status === 'completed').length;
  const scheduledAppointments = staffAppointments.filter(a => a.status === 'scheduled').length;
  const cancelledAppointments = staffAppointments.filter(a => a.status === 'cancelled').length;
  
  // Calculate revenue
  const totalRevenue = staffAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, appointment) => sum + appointment.totalAmount, 0);
  
  // Calculate commission
  const commission = totalRevenue * (staff.commissionPercentage / 100);

  // Service counts
  const serviceIds = staff.services;
  const servicesData = serviceData.filter(service => serviceIds.includes(service.id));

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
          <Button variant="outline" size="sm" className="h-9">
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
              <div className="text-2xl font-bold">{staff.totalAppointments}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total lifetime appointments
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="font-medium text-green-600">{completedAppointments}</span>
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-blue-600">{scheduledAppointments}</span>
                <span className="text-muted-foreground">Scheduled</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-red-600">{cancelledAppointments}</span>
                <span className="text-muted-foreground">Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{staff.commissionPercentage}%</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Your current commission rate
            </div>
            <div className="mt-4">
              <Progress value={staff.commissionPercentage} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
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
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total revenue from your appointments
            </div>
            <div className="mt-4 text-sm">
              <div className="flex justify-between">
                <span>Your Commission:</span>
                <span className="font-medium">{formatCurrency(commission)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{staffPerformance.customerSatisfaction}</div>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average rating from customers
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      parseFloat(staffPerformance.customerSatisfaction) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>
              Your top performing services and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPerformance.topServices.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Scissors className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{service.name}</span>
                    </div>
                    <Badge variant="outline">{service.count} appointments</Badge>
                  </div>
                  <Progress value={service.count * 5} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Service Efficiency</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Avg. Duration</TableHead>
                    <TableHead className="text-right">Popularity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesData.slice(0, 5).map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.duration} mins</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          High
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Utilization</CardTitle>
            <CardDescription>
              How efficiently you're using your working hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Overall Utilization</span>
                  </div>
                  <span className="font-medium">{staffPerformance.utilization}%</span>
                </div>
                <Progress value={staffPerformance.utilization} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Appointment Completion Rate</span>
                  </div>
                  <span className="font-medium">{staffPerformance.appointmentCompletionRate}%</span>
                </div>
                <Progress value={staffPerformance.appointmentCompletionRate} className="h-2" />
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Time Distribution</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Service Time</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Prep Time</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Breaks</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Unassigned</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>
            Your recent appointment history and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Your Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAppointments.slice(0, 5).map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.date), 'MMM dd, yyyy')} {appointment.time}
                  </TableCell>
                  <TableCell>{appointment.customerName}</TableCell>
                  <TableCell>
                    {appointment.services.length > 1 
                      ? `${appointment.services[0].serviceName} +${appointment.services.length - 1} more` 
                      : appointment.services[0].serviceName}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        appointment.status === 'completed' && "bg-green-50 text-green-700 border-green-200",
                        appointment.status === 'scheduled' && "bg-blue-50 text-blue-700 border-blue-200",
                        appointment.status === 'cancelled' && "bg-red-50 text-red-700 border-red-200",
                      )}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(appointment.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(appointment.totalAmount * (staff.commissionPercentage / 100))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffReports; 