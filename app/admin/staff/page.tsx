"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Search, Trash, User } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

// Dummy data
const staff = [
  {
    id: 1,
    name: "John Smith",
    phone: "555-123-4567",
    email: "john.smith@example.com",
    services: ["Haircut", "Beard Trim", "Full Service", "Hot Towel Shave"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    commission: 60,
    active: true,
    joinDate: "2020-03-15",
  },
  {
    id: 2,
    name: "Mike Johnson",
    phone: "555-234-5678",
    email: "mike.johnson@example.com",
    services: ["Haircut", "Beard Trim", "Full Service", "Hair Coloring"],
    workingDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    commission: 55,
    active: true,
    joinDate: "2021-05-20",
  },
  {
    id: 3,
    name: "David Williams",
    phone: "555-345-6789",
    email: "david.williams@example.com",
    services: ["Haircut", "Full Service", "Hair Coloring", "Hot Towel Shave"],
    workingDays: ["Tuesday", "Thursday", "Friday", "Saturday"],
    commission: 50,
    active: true,
    joinDate: "2022-01-10",
  },
  {
    id: 4,
    name: "Robert Brown",
    phone: "555-456-7890",
    email: "robert.brown@example.com",
    services: ["Haircut", "Beard Trim", "Full Service", "Hair Coloring", "Hot Towel Shave"],
    workingDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
    commission: 60,
    active: true,
    joinDate: "2019-11-05",
  },
  {
    id: 5,
    name: "James Wilson",
    phone: "555-567-8901",
    email: "james.wilson@example.com",
    services: ["Haircut", "Beard Trim"],
    workingDays: ["Wednesday", "Thursday", "Friday", "Saturday"],
    commission: 45,
    active: false,
    joinDate: "2021-08-15",
  },
]

const services = [
  { id: 1, name: "Haircut", price: 25, duration: 30 },
  { id: 2, name: "Beard Trim", price: 15, duration: 15 },
  { id: 3, name: "Full Service", price: 35, duration: 45 },
  { id: 4, name: "Hair Coloring", price: 50, duration: 60 },
  { id: 5, name: "Hot Towel Shave", price: 30, duration: 30 },
]

const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false)
  const [isDeleteStaffOpen, setIsDeleteStaffOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  // Filter staff
  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm),
  )

  const handleEdit = (member: any) => {
    setSelectedStaff(member)
    setIsEditStaffOpen(true)
  }

  const handleDelete = (member: any) => {
    setSelectedStaff(member)
    setIsDeleteStaffOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <Button onClick={() => setIsAddStaffOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email or phone"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No staff members found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <div>{member.phone}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.services.map((service, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.workingDays.map((day, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100"
                            >
                              {day.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{member.commission}%</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {member.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(member)}>
                            <Trash className="h-4 w-4" />
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

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>Add a new barber to your team.</DialogDescription>
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email address" />
            </div>

            <div className="space-y-2">
              <Label>Services</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox id={`service-${service.id}`} />
                    <Label htmlFor={`service-${service.id}`}>{service.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {workingDays.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`day-${index}`} />
                    <Label htmlFor={`day-${index}`}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Commission Percentage</Label>
              <div className="flex items-center space-x-2">
                <Input id="commission" type="number" placeholder="Commission %" />
                <span>%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" defaultChecked />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddStaffOpen(false)}>
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information.</DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input id="editFirstName" defaultValue={selectedStaff.name.split(" ")[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input id="editLastName" defaultValue={selectedStaff.name.split(" ")[1]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input id="editPhone" defaultValue={selectedStaff.phone} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" defaultValue={selectedStaff.email} />
              </div>

              <div className="space-y-2">
                <Label>Services</Label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-service-${service.id}`}
                        defaultChecked={selectedStaff.services.includes(service.name)}
                      />
                      <Label htmlFor={`edit-service-${service.id}`}>{service.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="grid grid-cols-4 gap-2">
                  {workingDays.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox id={`edit-day-${index}`} defaultChecked={selectedStaff.workingDays.includes(day)} />
                      <Label htmlFor={`edit-day-${index}`}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCommission">Commission Percentage</Label>
                <div className="flex items-center space-x-2">
                  <Input id="editCommission" type="number" defaultValue={selectedStaff.commission} />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="editActive" defaultChecked={selectedStaff.active} />
                <Label htmlFor="editActive">Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsEditStaffOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={isDeleteStaffOpen} onOpenChange={setIsDeleteStaffOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="py-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">{selectedStaff.name}</div>
                  <div className="text-sm text-gray-500">{selectedStaff.email}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteStaffOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
