"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Search, X } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { format } from "date-fns"

// Dummy data
const bookings = [
  {
    id: "BK-123456",
    customer: "John Doe",
    service: "Haircut",
    barber: "Mike Johnson",
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
    barber: "John Smith",
    date: "2023-05-15",
    time: "11:30 AM",
    status: "Completed",
    phone: "555-987-6543",
    email: "jane.smith@example.com",
  },
  {
    id: "BK-123458",
    customer: "Robert Johnson",
    service: "Beard Trim",
    barber: "David Williams",
    date: "2023-05-15",
    time: "1:00 PM",
    status: "Cancelled",
    phone: "555-456-7890",
    email: "robert.johnson@example.com",
  },
  {
    id: "BK-123459",
    customer: "Michael Brown",
    service: "Hair Coloring",
    barber: "Robert Brown",
    date: "2023-05-15",
    time: "2:30 PM",
    status: "No-show",
    phone: "555-789-0123",
    email: "michael.brown@example.com",
  },
  {
    id: "BK-123460",
    customer: "William Davis",
    service: "Haircut",
    barber: "John Smith",
    date: "2023-05-16",
    time: "9:30 AM",
    status: "Confirmed",
    phone: "555-234-5678",
    email: "william.davis@example.com",
  },
  {
    id: "BK-123461",
    customer: "James Wilson",
    service: "Hot Towel Shave",
    barber: "David Williams",
    date: "2023-05-16",
    time: "10:30 AM",
    status: "Confirmed",
    phone: "555-345-6789",
    email: "james.wilson@example.com",
  },
  {
    id: "BK-123462",
    customer: "David Moore",
    service: "Full Service",
    barber: "Mike Johnson",
    date: "2023-05-16",
    time: "11:30 AM",
    status: "Confirmed",
    phone: "555-456-7890",
    email: "david.moore@example.com",
  },
  {
    id: "BK-123463",
    customer: "Richard Taylor",
    service: "Beard Trim",
    barber: "Robert Brown",
    date: "2023-05-16",
    time: "1:00 PM",
    status: "Confirmed",
    phone: "555-567-8901",
    email: "richard.taylor@example.com",
  },
]

const barbers = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Mike Johnson" },
  { id: 3, name: "David Williams" },
  { id: 4, name: "Robert Brown" },
]

const services = [
  { id: 1, name: "Haircut", price: 25, duration: 30 },
  { id: 2, name: "Beard Trim", price: 15, duration: 15 },
  { id: 3, name: "Full Service", price: 35, duration: 45 },
  { id: 4, name: "Hair Coloring", price: 50, duration: 60 },
  { id: 5, name: "Hot Towel Shave", price: 30, duration: 30 },
]

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
]

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [barberFilter, setBarberFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  // New booking form state
  const [newBookingDate, setNewBookingDate] = useState<Date | undefined>(undefined)
  const [newBookingTime, setNewBookingTime] = useState("")
  const [newBookingService, setNewBookingService] = useState("")
  const [newBookingBarber, setNewBookingBarber] = useState("")

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Search term filter
    const searchMatch =
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const statusMatch = statusFilter === "all" || booking.status === statusFilter

    // Barber filter
    const barberMatch = barberFilter === "all" || booking.barber === barberFilter

    // Service filter
    const serviceMatch = serviceFilter === "all" || booking.service === serviceFilter

    // Date filter
    const dateMatch = !dateFilter || booking.date === format(dateFilter, "yyyy-MM-dd")

    return searchMatch && statusMatch && barberMatch && serviceMatch && dateMatch
  })

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking)
    setIsRescheduleOpen(true)
  }

  const handleCancel = (booking: any) => {
    setSelectedBooking(booking)
    setIsCancelOpen(true)
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
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <Button onClick={() => setIsAddBookingOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Booking
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by name, email, phone or booking ID"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No-show">No-show</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={barberFilter} onValueChange={setBarberFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Barber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Barbers</SelectItem>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.name}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                  </PopoverContent>
                </Popover>

                {dateFilter && (
                  <Button variant="ghost" size="icon" onClick={() => setDateFilter(undefined)} className="h-10 w-10">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No bookings found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div>{booking.customer}</div>
                        <div className="text-sm text-gray-500">{booking.phone}</div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.barber}</TableCell>
                      <TableCell>
                        <div>{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(booking)}
                            disabled={booking.status === "Completed" || booking.status === "No-show"}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(booking)}
                            disabled={booking.status !== "Confirmed"}
                          >
                            Cancel
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

      {/* Add Booking Dialog */}
      <Dialog open={isAddBookingOpen} onOpenChange={setIsAddBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>Create a new appointment for a customer.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="First name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Last name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Phone number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" placeholder="Email address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select value={newBookingService} onValueChange={setNewBookingService}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} (${service.price} - {service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber">Barber</Label>
              <Select value={newBookingBarber} onValueChange={setNewBookingBarber}>
                <SelectTrigger id="barber">
                  <SelectValue placeholder="Select a barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.name}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newBookingDate ? format(newBookingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBookingDate}
                      onSelect={setNewBookingDate}
                      initialFocus
                      disabled={
                        (date) => date < new Date() || date.getDay() === 0 // Sundays disabled
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={newBookingTime} onValueChange={setNewBookingTime}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Any special requests or notes" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBookingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddBookingOpen(false)}>
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Change the date and time for this appointment.</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label>Customer</Label>
                <div className="font-medium">{selectedBooking.customer}</div>
                <div className="text-sm text-gray-500">
                  {selectedBooking.service} with {selectedBooking.barber}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newBookingDate ? format(newBookingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBookingDate}
                      onSelect={setNewBookingDate}
                      initialFocus
                      disabled={
                        (date) => date < new Date() || date.getDay() === 0 // Sundays disabled
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rescheduleTime">Time</Label>
                <Select value={newBookingTime} onValueChange={setNewBookingTime}>
                  <SelectTrigger id="rescheduleTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rescheduleReason">Reason for Rescheduling</Label>
                <Input id="rescheduleReason" placeholder="Reason for rescheduling" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsRescheduleOpen(false)}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>Cancel this appointment and notify the customer.</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label>Customer</Label>
                <div className="font-medium">{selectedBooking.customer}</div>
                <div className="text-sm text-gray-500">
                  {selectedBooking.service} with {selectedBooking.barber}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason for Cancellation</Label>
                <Select>
                  <SelectTrigger id="cancelReason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-request">Customer Request</SelectItem>
                    <SelectItem value="barber-unavailable">Barber Unavailable</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelNotes">Additional Notes</Label>
                <Input id="cancelNotes" placeholder="Additional notes" />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="notifyCustomer" className="rounded border-gray-300" />
                <Label htmlFor="notifyCustomer">Notify customer via email</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" type="submit" onClick={() => setIsCancelOpen(false)}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
