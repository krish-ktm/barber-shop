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
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Search, Trash } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

// Dummy data
const services = [
  {
    id: 1,
    name: "Haircut",
    price: 25,
    duration: 30,
    description: "Professional haircut tailored to your style and preferences.",
    active: true,
  },
  {
    id: 2,
    name: "Beard Trim",
    price: 15,
    duration: 15,
    description: "Expert beard trimming and shaping for a clean, polished look.",
    active: true,
  },
  {
    id: 3,
    name: "Full Service",
    price: 35,
    duration: 45,
    description: "Complete haircut and beard trim package with premium care.",
    active: true,
  },
  {
    id: 4,
    name: "Hair Coloring",
    price: 50,
    duration: 60,
    description: "Professional hair coloring service with quality products.",
    active: true,
  },
  {
    id: 5,
    name: "Hot Towel Shave",
    price: 30,
    duration: 30,
    description: "Relaxing hot towel shave for a smooth, refreshed feel.",
    active: true,
  },
  {
    id: 6,
    name: "Kids Haircut",
    price: 20,
    duration: 20,
    description: "Gentle haircuts for children in a friendly environment.",
    active: false,
  },
  {
    id: 7,
    name: "Head Massage",
    price: 25,
    duration: 20,
    description: "Relaxing scalp massage to relieve stress and tension.",
    active: true,
  },
]

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  // Filter services
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (service: any) => {
    setSelectedService(service)
    setIsEditServiceOpen(true)
  }

  const handleDelete = (service: any) => {
    setSelectedService(service)
    setIsDeleteServiceOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Services Management</h1>
          <Button onClick={() => setIsAddServiceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search services by name or description"
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
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No services found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(service)}>
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

      {/* Add Service Dialog */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Add a new service to your offerings.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input id="serviceName" placeholder="Service name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Description</Label>
              <Input id="serviceDescription" placeholder="Service description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                <Input id="serviceDuration" type="number" placeholder="Duration" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicePrice">Price ($)</Label>
                <Input id="servicePrice" type="number" placeholder="Price" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="serviceActive" defaultChecked />
              <Label htmlFor="serviceActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddServiceOpen(false)}>
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details.</DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editServiceName">Service Name</Label>
                <Input id="editServiceName" defaultValue={selectedService.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editServiceDescription">Description</Label>
                <Input id="editServiceDescription" defaultValue={selectedService.description} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editServiceDuration">Duration (minutes)</Label>
                  <Input id="editServiceDuration" type="number" defaultValue={selectedService.duration} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editServicePrice">Price ($)</Label>
                  <Input id="editServicePrice" type="number" defaultValue={selectedService.price} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="editServiceActive" defaultChecked={selectedService.active} />
                <Label htmlFor="editServiceActive">Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditServiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsEditServiceOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={isDeleteServiceOpen} onOpenChange={setIsDeleteServiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="font-medium text-lg">{selectedService.name}</div>
                <div className="text-sm text-gray-500">
                  ${selectedService.price} - {selectedService.duration} min
                </div>
                <div className="text-sm">{selectedService.description}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteServiceOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteServiceOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
