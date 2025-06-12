import React, { useState, useEffect } from "react";
import { format, subDays, subMonths } from "date-fns";
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
  Info,
  Loader2,
  TrendingDown,
  Coins,
  CreditCard,
  PercentCircle,
  DollarSign as DollarSignIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { PieChartCard } from "@/components/dashboard/PieChartCard";
import { StaffDetailAnalytics } from "@/components/dashboard/StaffDetailAnalytics";
import { cn } from "@/lib/utils";
import {
  staffData,
  serviceData,
  revenueComparisonData,
  advancedRevenueMetrics,
  appointmentMetrics,
  customerMetrics,
  advancedStaffPerformance,
  advancedServicePerformance,
  paymentMethodAnalytics,
} from "@/mocks";

// API imports
import { useApi } from "@/hooks/useApi";
import {
  getRevenueReport,
  getServicesReport,
  getStaffReport,
  getTipsDiscountsReport,
  RevenueData,
  ServicePerformance,
  StaffPerformance,
  TipsDiscountsData,
} from "@/api/services/reportService";
import { getAllStaff } from "@/api/services/staffService";
import { getAllServices } from "@/api/services/serviceService";
import { useToast } from "@/hooks/use-toast";

// Date range presets
const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

// Report types
const REPORT_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Comparison options
const COMPARISON_OPTIONS = [
  { value: "none", label: "No comparison" },
  { value: "previousPeriod", label: "Previous period" },
  { value: "samePeroidLastYear", label: "Same period last year" },
];

// Export formats
const EXPORT_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
];

export const Reports: React.FC = () => {
  const { toast } = useToast();

  // API hooks
  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
    execute: fetchRevenueReport,
  } = useApi(getRevenueReport);

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    execute: fetchServicesReport,
  } = useApi(getServicesReport);

  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
    execute: fetchStaffReport,
  } = useApi(getStaffReport);

  const {
    data: tipsDiscountsData,
    loading: tipsDiscountsLoading,
    error: tipsDiscountsError,
    execute: fetchTipsDiscountsReport,
  } = useApi(getTipsDiscountsReport);

  const {
    data: staffListData,
    loading: staffListLoading,
    error: staffListError,
    execute: fetchStaffList,
  } = useApi(getAllStaff);

  const {
    data: servicesListData,
    loading: servicesListLoading,
    error: servicesListError,
    execute: fetchServicesList,
  } = useApi(getAllServices);

  // State management
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState<
    | "today"
    | "yesterday"
    | "last7days"
    | "last30days"
    | "thisMonth"
    | "lastMonth"
    | "custom"
  >("last7days");
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("revenue");
  const [showFilters, setShowFilters] = useState(false);
  const [compareWith, setCompareWith] = useState("none");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([
    "cash",
    "card",
    "mobile",
  ]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<
    string[]
  >([]);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Dialog state
  const [selectedStaffMember, setSelectedStaffMember] = useState<string | null>(
    null,
  );
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Fetch initial data
    fetchInitialData();
  }, []);

  // Handle API errors
  useEffect(() => {
    const errors = [
      { error: revenueError, source: "revenue" },
      { error: servicesError, source: "services" },
      { error: staffError, source: "staff" },
      { error: staffListError, source: "staff list" },
      { error: servicesListError, source: "services list" },
      { error: tipsDiscountsError, source: "tips and discounts" },
    ];

    errors.forEach(({ error, source }) => {
      if (error) {
        toast({
          title: `Error loading ${source} data`,
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [
    revenueError,
    servicesError,
    staffError,
    staffListError,
    servicesListError,
    tipsDiscountsError,
    toast,
  ]);

  // Fetch data based on selected filters
  const fetchInitialData = () => {
    // Format dates for API calls
    const fromDateStr = format(fromDate, "yyyy-MM-dd");
    const toDateStr = format(toDate, "yyyy-MM-dd");

    // Fetch reports with current filters
    fetchRevenueReport(
      fromDateStr,
      toDateStr,
      reportType === "daily" ? "day" : reportType,
    );
    fetchServicesReport(fromDateStr, toDateStr, "revenue_desc");
    fetchStaffReport(fromDateStr, toDateStr, "revenue_desc");
    fetchTipsDiscountsReport(fromDateStr, toDateStr, reportType);

    // Also fetch staff and services lists for filters
    fetchStaffList();
    fetchServicesList();
  };

  // Refetch data when filters change
  useEffect(() => {
    if (activeTab && !showFilters) {
      const fromDateStr = format(fromDate, "yyyy-MM-dd");
      const toDateStr = format(toDate, "yyyy-MM-dd");

      // Only fetch the data needed for the active tab
      switch (activeTab) {
        case "revenue":
          fetchRevenueReport(
            fromDateStr,
            toDateStr,
            reportType === "daily" ? "day" : reportType,
          );
          break;
        case "services":
          fetchServicesReport(fromDateStr, toDateStr, "revenue_desc");
          break;
        case "staff":
          fetchStaffReport(fromDateStr, toDateStr, "revenue_desc");
          break;
        case "tips-discounts":
          fetchTipsDiscountsReport(fromDateStr, toDateStr, reportType);
          break;
      }
    }
  }, [
    activeTab,
    reportType,
    fromDate,
    toDate,
    showFilters,
    fetchRevenueReport,
    fetchServicesReport,
    fetchStaffReport,
    fetchTipsDiscountsReport,
  ]);

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    fetchInitialData();
  };

  // Extract data from API responses
  const staffList = staffListData?.staff || [];
  const servicesList = servicesListData?.services || [];
  const revenueReportData = revenueData?.data || [];
  const servicesReportData = servicesData?.data || [];
  const staffReportData = staffData?.data || [];

  // Extract service categories from API data
  const serviceCategories = Array.from(
    new Set(servicesList.map((service) => service.category)),
  );

  // Handle date range changes
  const handleDateRangeChange = (preset: string) => {
    setDateRange(preset as any);
    const today = new Date();

    switch (preset) {
      case "today":
        setFromDate(today);
        setToDate(today);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setFromDate(yesterday);
        setToDate(yesterday);
        break;
      case "last7days":
        setFromDate(subDays(today, 7));
        setToDate(today);
        break;
      case "last30days":
        setFromDate(subDays(today, 30));
        setToDate(today);
        break;
      case "thisMonth":
        setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setToDate(today);
        break;
      case "lastMonth":
        setFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case "custom":
        // Keep current selection
        break;
    }
  };

  // Toggle selections
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId],
    );
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const toggleServiceCategory = (category: string) => {
    setSelectedServiceCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentFilter((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange("last7days");
    setFromDate(subDays(new Date(), 7));
    setToDate(new Date());
    setSelectedStaff([]);
    setSelectedServices([]);
    setSelectedServiceCategories([]);
    setPaymentFilter(["cash", "card", "mobile"]);
    setCompareWith("none");
  };

  // Export handling
  const handleExport = (format: string) => {
    alert(`Exporting data as ${format}...`);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== "custom") {
      return (
        DATE_PRESETS.find((preset) => preset.value === dateRange)?.label || ""
      );
    }
    return `${format(fromDate, "MMM dd, yyyy")} - ${format(toDate, "MMM dd, yyyy")}`;
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange !== "last7days") count++;
    if (compareWith !== "none") count++;
    if (selectedStaff.length > 0) count++;
    if (selectedServices.length > 0) count++;
    if (selectedServiceCategories.length > 0) count++;
    if (paymentFilter.length !== 3) count++;
    return count;
  };

  // Payment method distribution data for pie chart
  const paymentMethodData = paymentMethodAnalytics.methods.map((method) => ({
    name: method.method,
    value: method.amount,
    percentage: method.percentage,
    color:
      method.method === "Cash"
        ? "#000000"
        : method.method === "Card"
          ? "#666666"
          : "#999999",
  }));

  // Service category distribution data
  const serviceCategoryData = serviceCategories.map((category) => {
    const servicesInCategory = serviceData.filter(
      (service) => service.category === category,
    );
    const totalRevenue = servicesInCategory.reduce(
      (sum, service) => sum + service.price,
      0,
    );
    return {
      name: category,
      value: totalRevenue,
      color:
        category === "haircut"
          ? "#000000"
          : category === "beard"
            ? "#333333"
            : "#666666",
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Reports & Analytics"
          description="View and analyze your business performance"
          action={{
            label: "Export Data",
            onClick: () => handleExport("csv"),
            icon: <Download className="h-4 w-4 mr-2" />,
            menuItems: EXPORT_FORMATS.map((format) => ({
              label: `Export as ${format.label}`,
              onClick: () => handleExport(format.value),
            })),
          }}
        />
      </div>

      <div className="space-y-4">
        <Tabs
          defaultValue="revenue"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="services">
              <Scissors className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
                            <TabsTrigger value="tips-discounts">
                  <Coins className="h-4 w-4 mr-2" />
                  Tips & Discounts
                </TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
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
                    $
                    {advancedRevenueMetrics.current.monthly.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{advancedRevenueMetrics.current.monthly.percentChange}%
                    from last month
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
                    $
                    {advancedRevenueMetrics.current.daily.average.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{advancedRevenueMetrics.current.daily.percentChange}% from
                    last week
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
                    $
                    {advancedRevenueMetrics.current.monthly.projection.toLocaleString()}
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
                          {compareWith !== "none" &&
                            ` vs ${COMPARISON_OPTIONS.find((c) => c.value === compareWith)?.label}`}
                        </CardDescription>
                      </div>
                      <Select
                        defaultValue={reportType}
                        onValueChange={setReportType}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="View by" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_TYPES.map((type) => (
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
                    <CardDescription>
                      Revenue distribution by day of week
                    </CardDescription>
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
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const value = 1000 + Math.floor(Math.random() * 2000);
                          const transactions =
                            10 + Math.floor(Math.random() * 30);
                          const change = -10 + Math.floor(Math.random() * 30);

                          return (
                            <TableRow key={day}>
                              <TableCell className="font-medium">
                                {day}
                              </TableCell>
                              <TableCell>${value.toLocaleString()}</TableCell>
                              <TableCell>{transactions}</TableCell>
                              <TableCell>
                                ${(value / transactions).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={
                                    change > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {change > 0 ? "+" : ""}
                                  {change}%
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
                    <CardContent className="px-0 pb-0">
                      <PieChartCard
                        data={paymentMethodData}
                        title=""
                        showLegend
                        showLabels={false}
                        innerRadius={60}
                        outerRadius={80}
                        className="border-none shadow-none"
                      />
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Payment Method Analytics</CardTitle>
                      <CardDescription>
                        Detailed payment method analysis
                      </CardDescription>
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
                              <TableCell className="font-medium">
                                {method.method}
                              </TableCell>
                              <TableCell>
                                ${method.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>{method.percentage}%</TableCell>
                              <TableCell>
                                <span
                                  className={
                                    method.trend === "up"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {method.trend === "up" ? "+" : ""}
                                  {method.changePercent}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    method.trend === "up"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {method.trend === "up"
                                    ? "Increasing"
                                    : "Decreasing"}
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
                      <CardDescription>Revenue by category</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <PieChartCard
                        data={serviceCategoryData}
                        title=""
                        showLegend
                        showLabels={false}
                        innerRadius={60}
                        outerRadius={80}
                        className="border-none shadow-none"
                      />
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Category Performance</CardTitle>
                      <CardDescription>
                        Revenue and performance by service category
                      </CardDescription>
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
                            const servicesInCategory = serviceData.filter(
                              (service) => service.category === category,
                            );
                            const totalRevenue = servicesInCategory.reduce(
                              (sum, service) => sum + service.price,
                              0,
                            );
                            const avgPrice =
                              totalRevenue / servicesInCategory.length;
                            const growth = -5 + Math.floor(Math.random() * 25);

                            return (
                              <TableRow key={category}>
                                <TableCell className="font-medium capitalize">
                                  {category}
                                </TableCell>
                                <TableCell>
                                  ${totalRevenue.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {servicesInCategory.length}
                                </TableCell>
                                <TableCell>${avgPrice.toFixed(2)}</TableCell>
                                <TableCell>
                                  <span
                                    className={
                                      growth > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {growth > 0 ? "+" : ""}
                                    {growth}%
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

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
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
                    $
                    {(
                      serviceData.reduce(
                        (sum, service) => sum + service.price,
                        0,
                      ) / serviceData.length
                    ).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per service</p>
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
                  <div className="text-2xl font-bold">
                    {serviceCategories.length}
                  </div>
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
                      const serviceInfo = serviceData.find(
                        (s) => s.name === service.name,
                      );
                      return (
                        <TableRow
                          key={index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            handleServiceRowClick(
                              serviceInfo?.id || `service-${index}`,
                            )
                          }
                        >
                          <TableCell className="font-medium">
                            {service.name}
                          </TableCell>
                          <TableCell>{serviceInfo?.category || "-"}</TableCell>
                          <TableCell>{service.bookings}</TableCell>
                          <TableCell>
                            ${service.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                parseInt(service.growthRate) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {parseInt(service.growthRate) > 0 ? "+" : ""}
                              {service.growthRate}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {service.customerSatisfaction}/5.0
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Service Detail Dialog */}
            <Dialog
              open={showServiceDialog}
              onOpenChange={setShowServiceDialog}
            >
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
                        const serviceInfo = serviceData.find(
                          (s) => s.id === selectedService,
                        );
                        // Only match one record, either by name or by index
                        if (serviceInfo && serviceInfo.name === service.name)
                          return true;
                        if (
                          !serviceInfo &&
                          selectedService === `service-${index}`
                        )
                          return true;
                        return false;
                      })
                      .slice(0, 1) // Ensure only one record is displayed
                      .map((service, index) => {
                        const serviceInfo = serviceData.find(
                          (s) => s.name === service.name,
                        );
                        return (
                          <div key={index} className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-xl font-bold">
                                  {service.name}
                                </h2>
                                <p className="text-muted-foreground">
                                  {serviceInfo?.category || "General"} •{" "}
                                  {service.avgDuration} minutes
                                </p>
                              </div>
                              <Badge
                                variant={
                                  parseInt(service.growthRate) > 0
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {parseInt(service.growthRate) > 0 ? "+" : ""}
                                {service.growthRate}% growth
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Bookings
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {service.bookings}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Revenue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${service.revenue.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Profit Margin
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {service.profitMargin}%
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Rating
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {service.customerSatisfaction}/5.0
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            <Tabs defaultValue="metrics" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="metrics">
                                  Performance
                                </TabsTrigger>
                                <TabsTrigger value="staff">
                                  Top Performers
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="metrics"
                                className="space-y-4 pt-4"
                              >
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
                                      <TableCell>
                                        {service.popularity}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            service.popularity > 75
                                              ? "default"
                                              : service.popularity > 50
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {service.popularity > 75
                                            ? "High Demand"
                                            : service.popularity > 50
                                              ? "Popular"
                                              : "Low Demand"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Customer Satisfaction
                                      </TableCell>
                                      <TableCell>
                                        {service.customerSatisfaction}/5.0
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            Number(
                                              service.customerSatisfaction,
                                            ) > 4.5
                                              ? "default"
                                              : Number(
                                                    service.customerSatisfaction,
                                                  ) > 4.0
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {Number(
                                            service.customerSatisfaction,
                                          ) > 4.5
                                            ? "Excellent"
                                            : Number(
                                                  service.customerSatisfaction,
                                                ) > 4.0
                                              ? "Good"
                                              : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Profit Margin</TableCell>
                                      <TableCell>
                                        {service.profitMargin}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            service.profitMargin > 70
                                              ? "default"
                                              : service.profitMargin > 50
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {service.profitMargin > 70
                                            ? "High"
                                            : service.profitMargin > 50
                                              ? "Good"
                                              : "Low"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Growth Rate</TableCell>
                                      <TableCell>
                                        {service.growthRate}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            parseInt(service.growthRate) > 10
                                              ? "default"
                                              : parseInt(service.growthRate) > 0
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {parseInt(service.growthRate) > 10
                                            ? "Strong Growth"
                                            : parseInt(service.growthRate) > 0
                                              ? "Growing"
                                              : "Declining"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>

                              <TabsContent
                                value="staff"
                                className="space-y-4 pt-4"
                              >
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Staff Member</TableHead>
                                      <TableHead>Success Rate</TableHead>
                                      <TableHead>Performance</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {service.preferredByStaff.map(
                                      (staffName, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell className="font-medium">
                                            {staffName}
                                          </TableCell>
                                          <TableCell>
                                            {Math.round(
                                              70 + Math.random() * 20,
                                            )}
                                            %
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                idx < 2
                                                  ? "default"
                                                  : "secondary"
                                              }
                                            >
                                              {idx === 0
                                                ? "Top Performer"
                                                : idx === 1
                                                  ? "Specialist"
                                                  : "Competent"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
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

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
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
                    $
                    {(
                      advancedStaffPerformance.reduce(
                        (sum, staff) => sum + staff.commissionEarned,
                        0,
                      ) / staffData.length
                    ).toFixed(2)}
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
                    {Math.round(
                      advancedStaffPerformance.reduce(
                        (sum, staff) => sum + staff.utilization,
                        0,
                      ) / staffData.length,
                    )}
                    %
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
                    {(
                      advancedStaffPerformance.reduce(
                        (sum, staff) =>
                          sum + Number(staff.customerSatisfaction),
                        0,
                      ) / staffData.length
                    ).toFixed(1)}
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
                      const staffInfo = staffData.find(
                        (s) => s.name === staff.name,
                      );
                      return (
                        <TableRow
                          key={index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            handleStaffRowClick(
                              staffInfo?.id || `staff-${index}`,
                            )
                          }
                        >
                          <TableCell className="font-medium">
                            {staff.name}
                          </TableCell>
                          <TableCell>{staffInfo?.position || "-"}</TableCell>
                          <TableCell>{staff.appointments}</TableCell>
                          <TableCell>
                            ${staff.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {staff.customerSatisfaction}/5.0
                          </TableCell>
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
                        const staffInfo = staffData.find(
                          (s) => s.id === selectedStaffMember,
                        );
                        // Only match one record, either by name or by index
                        if (staffInfo && staffInfo.name === staff.name)
                          return true;
                        if (
                          !staffInfo &&
                          selectedStaffMember === `staff-${index}`
                        )
                          return true;
                        return false;
                      })
                      .slice(0, 1) // Ensure only one record is displayed
                      .map((staff, index) => {
                        const staffInfo = staffData.find(
                          (s) => s.name === staff.name,
                        );
                        return (
                          <div key={index} className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {staffInfo?.image ? (
                                  <img
                                    src={staffInfo.image}
                                    alt={staff.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl font-semibold">
                                    {staff.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h2 className="text-xl font-bold">
                                  {staff.name}
                                </h2>
                                <p className="text-muted-foreground">
                                  {staffInfo?.position || "Staff Member"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Appointments
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {staff.appointments}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Revenue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${staff.revenue.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Commission
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${staff.commissionEarned.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Utilization
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {staff.utilization}%
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            <Tabs defaultValue="metrics" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="metrics">
                                  Performance Metrics
                                </TabsTrigger>
                                <TabsTrigger value="services">
                                  Top Services
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="metrics"
                                className="space-y-4 pt-4"
                              >
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
                                      <TableCell>
                                        Appointment Completion
                                      </TableCell>
                                      <TableCell>
                                        {staff.appointmentCompletionRate}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            staff.appointmentCompletionRate > 90
                                              ? "default"
                                              : staff.appointmentCompletionRate >
                                                  75
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {staff.appointmentCompletionRate > 90
                                            ? "Excellent"
                                            : staff.appointmentCompletionRate >
                                                75
                                              ? "Good"
                                              : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Customer Satisfaction
                                      </TableCell>
                                      <TableCell>
                                        {staff.customerSatisfaction}/5.0
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            Number(staff.customerSatisfaction) >
                                            4.5
                                              ? "default"
                                              : Number(
                                                    staff.customerSatisfaction,
                                                  ) > 4.0
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {Number(staff.customerSatisfaction) >
                                          4.5
                                            ? "Excellent"
                                            : Number(
                                                  staff.customerSatisfaction,
                                                ) > 4.0
                                              ? "Good"
                                              : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Utilization Rate</TableCell>
                                      <TableCell>
                                        {staff.utilization}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            staff.utilization > 85
                                              ? "default"
                                              : staff.utilization > 70
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {staff.utilization > 85
                                            ? "High"
                                            : staff.utilization > 70
                                              ? "Good"
                                              : "Low"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Services Per Appointment
                                      </TableCell>
                                      <TableCell>
                                        {staff.averageServicesPerAppointment}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            Number(
                                              staff.averageServicesPerAppointment,
                                            ) > 1.5
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {Number(
                                            staff.averageServicesPerAppointment,
                                          ) > 1.5
                                            ? "High"
                                            : "Average"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>

                              <TabsContent
                                value="services"
                                className="space-y-4 pt-4"
                              >
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
                                        <TableCell className="font-medium">
                                          {service.name}
                                        </TableCell>
                                        <TableCell>{service.count}</TableCell>
                                        <TableCell>
                                          <Badge variant="secondary">
                                            {idx === 0
                                              ? "Most Popular"
                                              : idx === 1
                                                ? "Popular"
                                                : "Regular"}
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

          {/* Tips & Discounts Tab */}
          <TabsContent value="tips-discounts" className="space-y-6">
            {tipsDiscountsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : tipsDiscountsError ? (
              <div className="p-8 text-center">
                <p className="text-destructive">Error loading tips and discounts data</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedFromDate = format(fromDate, "yyyy-MM-dd");
                    const formattedToDate = format(toDate, "yyyy-MM-dd");
                    fetchTipsDiscountsReport(formattedFromDate, formattedToDate, reportType);
                  }}
                  className="mt-4"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : tipsDiscountsData && tipsDiscountsData.data ? (
              <>
                {/* Summary Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${tipsDiscountsData.data.summary.totalTips.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tipsDiscountsData.data.summary.invoicesWithTip} invoices with tips
                      </p>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Average:</span>{" "}
                        <span className="font-medium">
                          {tipsDiscountsData.data.summary.avgTipPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${tipsDiscountsData.data.summary.totalDiscounts.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tipsDiscountsData.data.summary.invoicesWithDiscount} invoices with discounts
                      </p>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Average:</span>{" "}
                        <span className="font-medium">
                          {tipsDiscountsData.data.summary.avgDiscountPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${tipsDiscountsData.data.summary.totalSales.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tipsDiscountsData.data.summary.totalInvoices} total invoices
                      </p>
                      <Progress 
                        value={
                          (tipsDiscountsData.data.summary.invoicesWithTip / 
                          tipsDiscountsData.data.summary.totalInvoices) * 100
                        } 
                        className="h-2 mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((tipsDiscountsData.data.summary.invoicesWithTip / 
                        tipsDiscountsData.data.summary.totalInvoices) * 100)}% of invoices include tips
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Discount Rate Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tipsDiscountsData.data.discountTypeBreakdown.map((type) => (
                          <div key={type.discount_type} className="flex justify-between items-center">
                            <span className="text-sm capitalize">
                              {type.discount_type || 'No type'} ({type.count})
                            </span>
                            <span className="text-sm font-medium">
                              ${type.totalDiscount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Time Series Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tips & Discounts Over Time</CardTitle>
                    <CardDescription>
                      Trends for the selected period ({getDisplayDateRange()})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px]">
                      {/* In a real app, render a chart component here using the timeSeriesData */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Tips</TableHead>
                              <TableHead>Tip %</TableHead>
                              <TableHead>Discounts</TableHead>
                              <TableHead>Discount %</TableHead>
                              <TableHead>Sales</TableHead>
                              <TableHead>Invoices</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tipsDiscountsData.data.timeSeriesData.map((item) => (
                              <TableRow key={item.date}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>${item.tips.toFixed(2)}</TableCell>
                                <TableCell>{item.tipPercentage.toFixed(1)}%</TableCell>
                                <TableCell>${item.discounts.toFixed(2)}</TableCell>
                                <TableCell>{item.discountPercentage.toFixed(1)}%</TableCell>
                                <TableCell>${item.totalSales.toFixed(2)}</TableCell>
                                <TableCell>{item.invoiceCount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                    <CardDescription>
                      Tips and discounts by staff member
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff</TableHead>
                          <TableHead>Total Tips</TableHead>
                          <TableHead>Avg Tip %</TableHead>
                          <TableHead>Total Discounts</TableHead>
                          <TableHead>Avg Discount %</TableHead>
                          <TableHead>Sales</TableHead>
                          <TableHead>Invoices</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tipsDiscountsData.data.staffBreakdown.map((staff) => (
                          <TableRow key={staff.staff_id}>
                            <TableCell>{staff.staff_name}</TableCell>
                            <TableCell>${staff.totalTips.toFixed(2)}</TableCell>
                            <TableCell>{staff.tipPercentage.toFixed(1)}%</TableCell>
                            <TableCell>${staff.totalDiscounts.toFixed(2)}</TableCell>
                            <TableCell>{staff.discountPercentage.toFixed(1)}%</TableCell>
                            <TableCell>${staff.totalSales.toFixed(2)}</TableCell>
                            <TableCell>{staff.invoiceCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="p-8 text-center">
                <p>No tips and discounts data available for the selected period</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
