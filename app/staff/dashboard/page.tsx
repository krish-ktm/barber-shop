"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Check, Clock, DollarSign, User } from "lucide-react"
import { StaffSidebar } from "@/components/staff-sidebar"

// Dummy data
const appointments = [
  {
    id: "BK-123456",
    customer: "John Doe",
    service: "Haircut",
    date: "2023-05-15",
    time: "10:00 AM",
    status: "Confirmed",
    phone: "555-123-4567",
    email: "john.doe@example.com",
  },
  {
    id: "BK-123457",
    customer: "Jane Smith",
    service: "Full Service",
    date: "2023-05-15",
    time: "11:30 AM",
    status: "Confirmed",
    phone: "555-987-6543",
    email: "jane.smith@example.com",
  },
  {
    id: "BK-123458",
    customer: "Robert Johnson",
    service: "Beard Trim",
    date: "2023-05-15",
    time: "1:00 PM",
    status: "Confirmed",
    phone: "555-456-7890",
    email: "robert.johnson@example.com",
  },
  {
    id: "BK-123459",
    customer: "Michael Brown",
    service: "Hair Coloring",
    date: "2023-05-15",
    time: "2:30 PM",
    status: "Confirmed",
    phone: "555-789-0123",
    email: "michael.brown@example.com",
  },
]

export default function StaffDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const handleCheckIn = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsCheckInOpen(true)
  }

  const handleAddNote = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsAddNoteOpen(true)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "No-show":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="font-medium">John Smith</div>
              <div className="text-sm text-gray-500">Senior Barber</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Today's Appointments</span>
                  <span className="text-3xl font-bold">4</span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Today's Earnings</span>
                  <span className="text-3xl font-bold">$125</span>
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
                  <span className="text-sm font-medium text-gray-500">Next Appointment</span>
                  <span className="text-xl font-bold">10:00 AM</span>
                  <span className="text-sm">John Doe - Haircut</span>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No appointments for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <div>{appointment.customer}</div>
                          <div className="text-sm text-gray-500">{appointment.phone}</div>
                        </TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              appointment.status,
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCheckIn(appointment)}>
                              Check In
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleAddNote(appointment)}>
                              Add Note
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Check In Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check In Customer</DialogTitle>
            <DialogDescription>Confirm customer arrival for their appointment.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-medium">{selectedAppointment.customer}</div>
                  <div className="text-sm text-gray-500">{selectedAppointment.phone}</div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Service:</div>
                  <div>{selectedAppointment.service}</div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Time:</div>
                  <div>{selectedAppointment.time}</div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Booking ID:</div>
                  <div>{selectedAppointment.id}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCheckInOpen(false)}>
              <Check className="mr-2 h-4 w-4" /> Confirm Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Customer Note</DialogTitle>
            <DialogDescription>Add notes or preferences for this customer.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-medium">{selectedAppointment.customer}</div>
                  <div className="text-sm text-gray-500">{selectedAppointment.service}</div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="customerNote" className="text-sm font-medium">
                    Note
                  </label>
                  <Textarea
                    id="customerNote"
                    placeholder="Add notes about customer preferences, style details, etc."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddNoteOpen(false)}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
