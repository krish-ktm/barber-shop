import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { 
  revenueData, 
  servicePerformanceData, 
  staffPerformanceData 
} from '@/mocks';

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('revenue');

  const handleExport = () => {
    // In a real app, this would trigger a CSV/PDF export
    alert('Export functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="View detailed business performance metrics"
        action={{
          label: "Export Report",
          onClick: handleExport,
          icon: <Download className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Card className="w-full md:w-64">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
              />
            </div>

            <Button className="w-full" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        <div className="flex-1 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="staff">Staff Performance</TabsTrigger>
              <TabsTrigger value="services">Service Analytics</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              <TabsContent value="revenue">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart
                        title=""
                        data={revenueData}
                      />
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="staff">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PerformanceTable
                      title=""
                      data={staffPerformanceData}
                      type="staff"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PerformanceTable
                      title=""
                      data={servicePerformanceData}
                      type="service"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};