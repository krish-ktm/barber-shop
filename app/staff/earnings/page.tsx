"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Download, DollarSign } from "lucide-react"
import { StaffSidebar } from "@/components/staff-sidebar"

// Dummy data
const earnings = [
  { date: "2023-05-01", service: "Haircut", amount: 25, commission: 15, tip: 5 },
  { date: "2023-05-01", service: "Beard Trim", amount: 15, commission: 9, tip: 3 },
  { date: "2023-05-02", service: "Full Service", amount: 35, commission: 21, tip: 7 },
  { date: "2023-05-02", service: "Haircut", amount: 25, commission: 15, tip: 5 },
  { date: "2023-05-03", service: "Hair Coloring", amount: 50, commission: 30, tip: 10 },
  { date: "2023-05-03", service: "Beard Trim", amount: 15, commission: 9, tip: 3 },
  { date: "2023-05-04", service: "Haircut", amount: 25, commission: 15, tip: 5 },
  { date: "2023-05-04", service: "Full Service", amount: 35, commission: 21, tip: 7 },
]

const monthlyEarnings = [
  { month: "Jan", commission: 1200, tips: 300 },
  { month: "Feb", commission: 1300, tips: 320 },
  { month: "Mar", commission: 1400, tips: 350 },
  { month: "Apr", commission: 1350, tips: 330 },
  { month: "May", commission: 1500, tips: 380 },
  { month: "Jun", commission: 1600, tips: 400 },
  { month: "Jul", commission: 1650, tips: 420 },
  { month: "Aug", commission: 1550, tips: 390 },
  { month: "Sep", commission: 1700, tips: 430 },
  { month: "Oct", commission: 1800, tips: 450 },
  { month: "Nov", commission: 1900, tips: 480 },
  { month: "Dec", commission: 2000, tips: 500 },
]

const serviceEarnings = [
  { name: "Haircut", value: 2500 },
  { name: "Beard Trim", value: 1200 },
  { name: "Full Service", value: 1800 },
  { name: "Hair Coloring", value: 1500 },
  { name: "Hot Towel Shave", value: 800 },
]

export default function StaffEarningsPage() {
  const [timeRange, setTimeRange] = useState("month")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Earnings</h1>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Total Earnings</span>
                  <span className="text-3xl font-bold">$2,145</span>
                  <span className="text-sm font-medium text-green-600">+12% from last month</span>
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
                  <span className="text-sm font-medium text-gray-500">Commission</span>
                  <span className="text-3xl font-bold">$1,650</span>
                  <span className="text-sm font-medium text-green-600">+10% from last month</span>
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
                  <span className="text-sm font-medium text-gray-500">Tips</span>
                  <span className="text-3xl font-bold">$495</span>
                  <span className="text-sm font-medium text-green-600">+15% from last month</span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
              <CardDescription>Your earnings trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyEarnings} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Legend />
                    <Line type="monotone" dataKey="commission" name="Commission" stroke="#000" strokeWidth={2} />
                    <Line type="monotone" dataKey="tips" name="Tips" stroke="#888" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings by Service</CardTitle>
              <CardDescription>Revenue breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceEarnings} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Bar dataKey="value" fill="#000" name="Earnings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Your recent service earnings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(earning.date).toLocaleDateString()}</TableCell>
                    <TableCell>{earning.service}</TableCell>
                    <TableCell>${earning.amount.toFixed(2)}</TableCell>
                    <TableCell>${earning.commission.toFixed(2)}</TableCell>
                    <TableCell>${earning.tip.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">${(earning.commission + earning.tip).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
