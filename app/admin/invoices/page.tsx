"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Download, Eye, Plus, Printer, Search } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

// Dummy data
const invoices = [
  {
    id: "INV-001",
    customer: "John Doe",
    date: "2023-05-15",
    amount: 25,
    status: "Paid",
    paymentMethod: "Credit Card",
    barber: "Mike Johnson",
    services: ["Haircut"],
  },
  {
    id: "INV-002",
    customer: "Jane Smith",
    date: "2023-05-15",
    amount: 35,
    status: "Paid",
    paymentMethod: "Cash",
    barber: "John Smith",
    services: ["Full Service"],
  },
  {
    id: "INV-003",
    customer: "Robert Johnson",
    date: "2023-05-15",
    amount: 15,
    status: "Paid",
    paymentMethod: "Credit Card",
    barber: "David Williams",
    services: ["Beard Trim"],
  },
  {
    id: "INV-004",
    customer: "Michael Brown",
    date: "2023-05-15",
    amount: 50,
    status: "Pending",
    paymentMethod: "Pending",
    barber: "Robert Brown",
    services: ["Hair Coloring"],
  },
  {
    id: "INV-005",
    customer: "William Davis",
    date: "2023-05-16",
    amount: 25,
    status: "Paid",
    paymentMethod: "Cash",
    barber: "John Smith",
    services: ["Haircut"],
  },
  {
    id: "INV-006",
    customer: "James Wilson",
    date: "2023-05-16",
    amount: 30,
    status: "Paid",
    paymentMethod: "Credit Card",
    barber: "David Williams",
    services: ["Hot Towel Shave"],
  },
  {
    id: "INV-007",
    customer: "David Moore",
    date: "2023-05-16",
    amount: 35,
    status: "Paid",
    paymentMethod: "Cash",
    barber: "Mike Johnson",
    services: ["Full Service"],
  },
  {
    id: "INV-008",
    customer: "Richard Taylor",
    date: "2023-05-16",
    amount: 15,
    status: "Pending",
    paymentMethod: "Pending",
    barber: "Robert Brown",
    services: ["Beard Trim"],
  },
]

const services = [
  { id: 1, name: "Haircut", price: 25, duration: 30 },
  { id: 2, name: "Beard Trim", price: 15, duration: 15 },
  { id: 3, name: "Full Service", price: 35, duration: 45 },
  { id: 4, name: "Hair Coloring", price: 50, duration: 60 },
  { id: 5, name: "Hot Towel Shave", price: 30, duration: 30 },
]

const barbers = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Mike Johnson" },
  { id: 3, name: "David Williams" },
  { id: 4, name: "Robert Brown" },
]

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // New invoice state
  const [activeTab, setActiveTab] = useState("customer")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedBarber, setSelectedBarber] = useState("")
  const [discount, setDiscount] = useState(0)
  const [tip, setTip] = useState(0)

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    // Search term filter
    const searchMatch =
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const statusMatch = statusFilter === "all" || invoice.status === statusFilter

    // Date filter
    const dateMatch = !dateFilter || invoice.date === format(dateFilter, "yyyy-MM-dd")

    return searchMatch && statusMatch && dateMatch
  })

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewInvoiceOpen(true)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <Button onClick={() => setIsCreateInvoiceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by customer name or invoice ID"
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
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.services.join(", ")}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
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

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Generate a new invoice for services rendered.</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4">
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

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("services")}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barber">Barber</Label>
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
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

              <div className="space-y-2">
                <Label>Services</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {services.map((service) => (
                    <Card key={service.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.duration} min</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="font-medium">${service.price.toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedServices.includes(service.name)) {
                                setSelectedServices(selectedServices.filter((s) => s !== service.name))
                              } else {
                                setSelectedServices([...selectedServices, service.name])
                              }
                            }}
                          >
                            {selectedServices.includes(service.name) ? "Remove" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("customer")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("payment")}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount ($)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0.00"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip">Tip ($)</Label>
                <Input
                  id="tip"
                  type="number"
                  placeholder="0.00"
                  value={tip}
                  onChange={(e) => setTip(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("services")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("summary")}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Invoice Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer:</span>
                    <span>John Doe</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Barber:</span>
                    <span>{selectedBarber || "Not selected"}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Services:</span>
                      <span></span>
                    </div>
                    {selectedServices.length > 0 ? (
                      selectedServices.map((serviceName, index) => {
                        const service = services.find((s) => s.name === serviceName)
                        return (
                          <div key={index} className="flex justify-between pl-4">
                            <span>{serviceName}</span>
                            <span>${service?.price.toFixed(2)}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="pl-4 text-gray-500">No services selected</div>
                    )}
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        $
                        {selectedServices
                          .reduce((total, serviceName) => {
                            const service = services.find((s) => s.name === serviceName)
                            return total + (service?.price || 0)
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    {tip > 0 && (
                      <div className="flex justify-between">
                        <span>Tip:</span>
                        <span>${tip.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>
                        $
                        {(
                          selectedServices.reduce((total, serviceName) => {
                            const service = services.find((s) => s.name === serviceName)
                            return total + (service?.price || 0)
                          }, 0) +
                          tip -
                          discount
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("payment")}>
                  Back
                </Button>
                <Button onClick={() => setIsCreateInvoiceOpen(false)}>Generate Invoice</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Issued on ${new Date(selectedInvoice.date).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">BarberShop</h3>
                  <div className="text-sm text-gray-500">
                    <p>123 Main Street</p>
                    <p>New York, NY 10001</p>
                    <p>info@barbershop.com</p>
                    <p>(123) 456-7890</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedInvoice.id}</div>
                  <div className="text-sm text-gray-500">
                    <p>Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                    <p>Status: {selectedInvoice.status}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-b py-4">
                <h4 className="font-medium mb-2">Bill To:</h4>
                <div className="text-sm">
                  <p className="font-medium">{selectedInvoice.customer}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Services:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Barber</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.services.map((service: string, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{service}</TableCell>
                        <TableCell>{selectedInvoice.barber}</TableCell>
                        <TableCell className="text-right">
                          ${services.find((s) => s.name === service)?.price.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">${selectedInvoice.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Payment Information:</h4>
                <div className="text-sm">
                  <p>Payment Method: {selectedInvoice.paymentMethod}</p>
                  <p>Payment Status: {selectedInvoice.status}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
