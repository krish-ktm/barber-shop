import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Calendar,
  DollarSign,
  Scissors,
  BarChart,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  bookingStats,
  revenueStats,
  staffStats,
  serviceStats,
  dailyStats,
  servicePopularity,
  paymentMethodStats
} from '@/data/stats';
import { 
  bookings,
  getUpcomingBookings,
  getTodayBookings
} from '@/data/bookings';

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as RechartsBarChart
} from 'recharts';

export default function AdminDashboard() {
  const todayBookings = getTodayBookings();
  const upcomingBookings = getUpcomingBookings().slice(0, 5);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue (30 days)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueStats.last30Days.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +{(revenueStats.last30Days / revenueStats.total * 100).toFixed(1)}% from total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.today}</div>
            <p className="text-xs text-muted-foreground">
              {todayBookings.filter(b => b.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {staffStats.mostBookings.name} has most bookings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Popular Service
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.mostPopular.name}</div>
            <p className="text-xs text-muted-foreground">
              Booked {serviceStats.mostPopular.count} times
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Chart */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>
                  Daily revenue for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyStats}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Service Popularity Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
                <CardDescription>
                  Distribution of booked services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicePopularity.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => entry.name.split(' ')[0]}
                        labelLine={false}
                      >
                        {servicePopularity.slice(0, 5).map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Bookings Chart */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  Daily bookings for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dailyStats}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="hsl(var(--chart-1))" name="Total" />
                      <Bar dataKey="completed" fill="hsl(var(--chart-2))" name="Completed" />
                      <Bar dataKey="cancelled" fill="hsl(var(--chart-3))" name="Cancelled" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Methods Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment types
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {paymentMethodStats.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
                <CardDescription>
                  Overview of all bookings by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <span className="text-sm font-semibold">
                          {bookingStats.completed} 
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({((bookingStats.completed / bookingStats.total) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(bookingStats.completed / bookingStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Upcoming</span>
                        <span className="text-sm font-semibold">
                          {bookingStats.upcoming}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({((bookingStats.upcoming / bookingStats.total) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(bookingStats.upcoming / bookingStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cancelled</span>
                        <span className="text-sm font-semibold">
                          {bookingStats.cancelled}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({((bookingStats.cancelled / bookingStats.total) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${(bookingStats.cancelled / bookingStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">No-show</span>
                        <span className="text-sm font-semibold">
                          {bookingStats.noShow}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({((bookingStats.noShow / bookingStats.total) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-destructive" 
                          style={{ width: `${(bookingStats.noShow / bookingStats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>
                  Key financial indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full p-2 bg-muted">
                        <BarChart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Total Revenue</p>
                        <p className="text-sm text-muted-foreground">All time</p>
                      </div>
                    </div>
                    <div className="font-medium">${revenueStats.total.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full p-2 bg-muted">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Average Order</p>
                        <p className="text-sm text-muted-foreground">Per invoice</p>
                      </div>
                    </div>
                    <div className="font-medium">${revenueStats.averageTicket.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full p-2 bg-muted">
                        <ArrowUpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">This Week</p>
                        <p className="text-sm text-muted-foreground">Last 7 days</p>
                      </div>
                    </div>
                    <div className="font-medium">${revenueStats.last7Days.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full p-2 bg-muted">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Today</p>
                        <p className="text-sm text-muted-foreground">Current date</p>
                      </div>
                    </div>
                    <div className="font-medium">${revenueStats.today.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Staff with highest revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStats.byBarber
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 4)
                    .map((barber, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-4 rounded-full w-8 h-8 bg-muted text-center flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">{barber.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {((barber.total / revenueStats.total) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                        <div className="font-medium">${barber.total.toFixed(0)}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                Manage today's scheduled appointments
              </CardDescription>
            </div>
            <Link to="/admin/bookings">
              <Button variant="outline">View All Bookings</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="py-2 px-4 text-left font-medium">Time</th>
                  <th className="py-2 px-4 text-left font-medium">Customer</th>
                  <th className="py-2 px-4 text-left font-medium">Service</th>
                  <th className="py-2 px-4 text-left font-medium">Barber</th>
                  <th className="py-2 px-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.length > 0 ? (
                  todayBookings
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="py-2 px-4">
                          {booking.timeSlot}
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                        </td>
                        <td className="py-2 px-4">
                          <div>{booking.serviceName}</div>
                          <div className="text-xs text-muted-foreground">{booking.duration} mins</div>
                        </td>
                        <td className="py-2 px-4">{booking.barberName}</td>
                        <td className="py-2 px-4">
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                              : booking.status === 'completed'
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                              : booking.status === 'cancelled'
                              ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                              : 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No appointments scheduled for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}