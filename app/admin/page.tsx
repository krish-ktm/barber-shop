import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, FileText, Scissors, Users, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { AdminDashboardChart } from "@/components/admin-dashboard-chart"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Today
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                  <span className="text-3xl font-bold">$1,245</span>
                  <span className="text-sm font-medium text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> 12% from last week
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Appointments</span>
                  <span className="text-3xl font-bold">24</span>
                  <span className="text-sm font-medium text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> 8% from last week
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">New Customers</span>
                  <span className="text-3xl font-bold">8</span>
                  <span className="text-sm font-medium text-red-600 flex items-center mt-1">
                    <ArrowDownRight className="h-4 w-4 mr-1" /> 3% from last week
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Avg. Service Time</span>
                  <span className="text-3xl font-bold">32m</span>
                  <span className="text-sm font-medium text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> 5% faster than target
                  </span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily revenue for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminDashboardChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>Most booked services this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Haircut</div>
                      <div className="text-sm text-gray-500">30 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">42</div>
                    <div className="text-sm text-gray-500">bookings</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Beard Trim</div>
                      <div className="text-sm text-gray-500">15 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">28</div>
                    <div className="text-sm text-gray-500">bookings</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Full Service</div>
                      <div className="text-sm text-gray-500">45 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">23</div>
                    <div className="text-sm text-gray-500">bookings</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Hair Coloring</div>
                      <div className="text-sm text-gray-500">60 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">15</div>
                    <div className="text-sm text-gray-500">bookings</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Upcoming appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">9:30 AM</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-gray-500">Haircut • Mike Johnson</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Check In
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      10:00 AM
                    </div>
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-sm text-gray-500">Full Service • John Smith</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Check In
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      11:30 AM
                    </div>
                    <div>
                      <div className="font-medium">Robert Johnson</div>
                      <div className="text-sm text-gray-500">Beard Trim • David Williams</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Check In
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">1:00 PM</div>
                    <div>
                      <div className="font-medium">Michael Brown</div>
                      <div className="text-sm text-gray-500">Hair Coloring • Robert Brown</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Check In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Barber performance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">John Smith</div>
                    <div className="text-sm text-gray-500">48 appointments</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-black h-2.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">Mike Johnson</div>
                    <div className="text-sm text-gray-500">42 appointments</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-black h-2.5 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">David Williams</div>
                    <div className="text-sm text-gray-500">36 appointments</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-black h-2.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">Robert Brown</div>
                    <div className="text-sm text-gray-500">30 appointments</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-black h-2.5 rounded-full" style={{ width: "55%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
