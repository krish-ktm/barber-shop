"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarRange, Download, FileText } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

// Dummy data
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 4500 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4800 },
  { name: "May", revenue: 5500 },
  { name: "Jun", revenue: 6000 },
  { name: "Jul", revenue: 6200 },
  { name: "Aug", revenue: 5800 },
  { name: "Sep", revenue: 6500 },
  { name: "Oct", revenue: 7000 },
  { name: "Nov", revenue: 7500 },
  { name: "Dec", revenue: 8000 },
]

const appointmentsData = [
  { name: "Jan", appointments: 120 },
  { name: "Feb", appointments: 140 },
  { name: "Mar", appointments: 160 },
  { name: "Apr", appointments: 155 },
  { name: "May", appointments: 170 },
  { name: "Jun", appointments: 190 },
  { name: "Jul", appointments: 200 },
  { name: "Aug", appointments: 185 },
  { name: "Sep", appointments: 210 },
  { name: "Oct", appointments: 230 },
  { name: "Nov", appointments: 245 },
  { name: "Dec", appointments: 260 },
]

const serviceData = [
  { name: "Haircut", value: 42, color: "#0088FE" },
  { name: "Beard Trim", value: 28, color: "#00C49F" },
  { name: "Full Service", value: 23, color: "#FFBB28" },
  { name: "Hair Coloring", value: 15, color: "#FF8042" },
  { name: "Hot Towel Shave", value: 12, color: "#8884d8" },
]

const barberPerformanceData = [
  { name: "John Smith", appointments: 48, revenue: 1680 },
  { name: "Mike Johnson", appointments: 42, revenue: 1470 },
  { name: "David Williams", appointments: 36, revenue: 1260 },
  { name: "Robert Brown", appointments: 30, revenue: 1050 },
]

const customerRetentionData = [
  { name: "New", value: 35, color: "#0088FE" },
  { name: "Returning", value: 65, color: "#00C49F" },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("year")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                        <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Appointments over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                  <CardDescription>Most booked services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} bookings`, "Quantity"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerRetentionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {customerRetentionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>Performance summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CalendarRange className="h-5 w-5 text-gray-500" />
                        <span>Total Appointments</span>
                      </div>
                      <span className="font-bold">2,400</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>Total Revenue</span>
                      </div>
                      <span className="font-bold">$65,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>Avg. Service Value</span>
                      </div>
                      <span className="font-bold">$27.08</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>Avg. Daily Bookings</span>
                      </div>
                      <span className="font-bold">8.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>No-show Rate</span>
                      </div>
                      <span className="font-bold">3.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Popularity</CardTitle>
                <CardDescription>Breakdown of service bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#000">
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Revenue</CardTitle>
                  <CardDescription>Revenue by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData.map((service) => ({
                            ...service,
                            value:
                              service.value *
                              (service.name === "Hair Coloring"
                                ? 50
                                : service.name === "Full Service"
                                  ? 35
                                  : service.name === "Hot Towel Shave"
                                    ? 30
                                    : service.name === "Haircut"
                                      ? 25
                                      : 15),
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Duration</CardTitle>
                  <CardDescription>Time spent on each service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Haircut", duration: 30 },
                          { name: "Beard Trim", duration: 15 },
                          { name: "Full Service", duration: 45 },
                          { name: "Hair Coloring", duration: 60 },
                          { name: "Hot Towel Shave", duration: 30 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => [`${value} min`, "Duration"]} />
                        <Bar dataKey="duration" fill="#000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Appointments and revenue by barber</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barberPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="appointments"
                        name="Appointments"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Services performed by each barber</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "John Smith",
                            haircut: 20,
                            beardTrim: 10,
                            fullService: 12,
                            hairColoring: 0,
                            hotTowelShave: 6,
                          },
                          {
                            name: "Mike Johnson",
                            haircut: 18,
                            beardTrim: 8,
                            fullService: 10,
                            hairColoring: 6,
                            hotTowelShave: 0,
                          },
                          {
                            name: "David Williams",
                            haircut: 15,
                            beardTrim: 0,
                            fullService: 8,
                            hairColoring: 9,
                            hotTowelShave: 4,
                          },
                          {
                            name: "Robert Brown",
                            haircut: 12,
                            beardTrim: 10,
                            fullService: 5,
                            hairColoring: 3,
                            hotTowelShave: 0,
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="haircut" name="Haircut" stackId="a" fill="#0088FE" />
                        <Bar dataKey="beardTrim" name="Beard Trim" stackId="a" fill="#00C49F" />
                        <Bar dataKey="fullService" name="Full Service" stackId="a" fill="#FFBB28" />
                        <Bar dataKey="hairColoring" name="Hair Coloring" stackId="a" fill="#FF8042" />
                        <Bar dataKey="hotTowelShave" name="Hot Towel Shave" stackId="a" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                  <CardDescription>Hours worked by each barber</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "John Smith", hours: 40 },
                          { name: "Mike Johnson", hours: 32 },
                          { name: "David Williams", hours: 36 },
                          { name: "Robert Brown", hours: 28 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} hours`, "Working Hours"]} />
                        <Bar dataKey="hours" fill="#000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerRetentionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {customerRetentionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Growth</CardTitle>
                  <CardDescription>New customers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: "Jan", customers: 15 },
                          { name: "Feb", customers: 18 },
                          { name: "Mar", customers: 22 },
                          { name: "Apr", customers: 20 },
                          { name: "May", customers: 25 },
                          { name: "Jun", customers: 30 },
                          { name: "Jul", customers: 32 },
                          { name: "Aug", customers: 28 },
                          { name: "Sep", customers: 35 },
                          { name: "Oct", customers: 40 },
                          { name: "Nov", customers: 45 },
                          { name: "Dec", customers: 50 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, "New Customers"]} />
                        <Line type="monotone" dataKey="customers" stroke="#0088FE" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Preferences</CardTitle>
                <CardDescription>Most popular services by customer demographic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { age: "18-24", haircut: 15, beardTrim: 8, fullService: 5, hairColoring: 2, hotTowelShave: 1 },
                        {
                          age: "25-34",
                          haircut: 20,
                          beardTrim: 12,
                          fullService: 10,
                          hairColoring: 5,
                          hotTowelShave: 4,
                        },
                        {
                          age: "35-44",
                          haircut: 18,
                          beardTrim: 10,
                          fullService: 12,
                          hairColoring: 6,
                          hotTowelShave: 5,
                        },
                        { age: "45-54", haircut: 12, beardTrim: 6, fullService: 8, hairColoring: 4, hotTowelShave: 3 },
                        { age: "55+", haircut: 8, beardTrim: 4, fullService: 5, hairColoring: 3, hotTowelShave: 2 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="haircut" name="Haircut" fill="#0088FE" />
                      <Bar dataKey="beardTrim" name="Beard Trim" fill="#00C49F" />
                      <Bar dataKey="fullService" name="Full Service" fill="#FFBB28" />
                      <Bar dataKey="hairColoring" name="Hair Coloring" fill="#FF8042" />
                      <Bar dataKey="hotTowelShave" name="Hot Towel Shave" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
