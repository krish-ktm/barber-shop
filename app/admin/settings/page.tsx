"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function SettingsPage() {
  const [shopOpenTime, setShopOpenTime] = useState("09:00")
  const [shopCloseTime, setShopCloseTime] = useState("19:00")
  const [slotDuration, setSlotDuration] = useState("30")
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  })

  const handleWorkingDayChange = (day: keyof typeof workingDays) => {
    setWorkingDays({
      ...workingDays,
      [day]: !workingDays[day],
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="slots">Time Slots</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>Update your shop details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input id="shopName" defaultValue="BarberShop" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Address</Label>
                  <Input id="shopAddress" defaultValue="123 Main Street" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopCity">City</Label>
                    <Input id="shopCity" defaultValue="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopZip">ZIP Code</Label>
                    <Input id="shopZip" defaultValue="10001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopPhone">Phone Number</Label>
                  <Input id="shopPhone" defaultValue="(123) 456-7890" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopEmail">Email</Label>
                  <Input id="shopEmail" type="email" defaultValue="info@barbershop.com" />
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your regular business hours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="monday"
                        checked={workingDays.monday}
                        onCheckedChange={() => handleWorkingDayChange("monday")}
                      />
                      <Label htmlFor="monday">Monday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="09:00" disabled={!workingDays.monday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="19:00" disabled={!workingDays.monday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tuesday"
                        checked={workingDays.tuesday}
                        onCheckedChange={() => handleWorkingDayChange("tuesday")}
                      />
                      <Label htmlFor="tuesday">Tuesday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="09:00" disabled={!workingDays.tuesday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="19:00" disabled={!workingDays.tuesday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wednesday"
                        checked={workingDays.wednesday}
                        onCheckedChange={() => handleWorkingDayChange("wednesday")}
                      />
                      <Label htmlFor="wednesday">Wednesday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="09:00" disabled={!workingDays.wednesday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="19:00" disabled={!workingDays.wednesday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="thursday"
                        checked={workingDays.thursday}
                        onCheckedChange={() => handleWorkingDayChange("thursday")}
                      />
                      <Label htmlFor="thursday">Thursday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="09:00" disabled={!workingDays.thursday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="19:00" disabled={!workingDays.thursday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="friday"
                        checked={workingDays.friday}
                        onCheckedChange={() => handleWorkingDayChange("friday")}
                      />
                      <Label htmlFor="friday">Friday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="09:00" disabled={!workingDays.friday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="19:00" disabled={!workingDays.friday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saturday"
                        checked={workingDays.saturday}
                        onCheckedChange={() => handleWorkingDayChange("saturday")}
                      />
                      <Label htmlFor="saturday">Saturday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="10:00" disabled={!workingDays.saturday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="18:00" disabled={!workingDays.saturday} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sunday"
                        checked={workingDays.sunday}
                        onCheckedChange={() => handleWorkingDayChange("sunday")}
                      />
                      <Label htmlFor="sunday">Sunday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="time" className="w-32" defaultValue="10:00" disabled={!workingDays.sunday} />
                      <span>to</span>
                      <Input type="time" className="w-32" defaultValue="16:00" disabled={!workingDays.sunday} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Slot Configuration</CardTitle>
                <CardDescription>Configure appointment time slots and duration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopOpenTime">Shop Opening Time</Label>
                      <Input
                        id="shopOpenTime"
                        type="time"
                        value={shopOpenTime}
                        onChange={(e) => setShopOpenTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shopCloseTime">Shop Closing Time</Label>
                      <Input
                        id="shopCloseTime"
                        type="time"
                        value={shopCloseTime}
                        onChange={(e) => setShopCloseTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slotDuration">Slot Duration</Label>
                      <Select value={slotDuration} onValueChange={setSlotDuration}>
                        <SelectTrigger id="slotDuration">
                          <SelectValue placeholder="Select slot duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="breakStartTime">Break Start Time</Label>
                      <Input id="breakStartTime" type="time" defaultValue="13:00" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="breakEndTime">Break End Time</Label>
                      <Input id="breakEndTime" type="time" defaultValue="14:00" />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Switch id="enableBreak" defaultChecked />
                      <Label htmlFor="enableBreak">Enable lunch break</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-500 mb-2">Available time slots based on your configuration:</div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {Array.from({
                        length:
                          (Number.parseInt(shopCloseTime.split(":")[0]) - Number.parseInt(shopOpenTime.split(":")[0])) *
                          (60 / Number.parseInt(slotDuration)),
                      }).map((_, index) => {
                        const hour =
                          Math.floor((index * Number.parseInt(slotDuration)) / 60) +
                          Number.parseInt(shopOpenTime.split(":")[0])
                        const minute = (index * Number.parseInt(slotDuration)) % 60
                        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

                        // Skip lunch break
                        if (timeString >= "13:00" && timeString < "14:00") {
                          return null
                        }

                        return (
                          <div key={index} className="bg-white border rounded-md p-2 text-center text-sm">
                            {timeString}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Configuration</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
                <CardDescription>Set rules for appointment booking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minAdvanceBooking">Minimum Advance Booking Time</Label>
                  <Select defaultValue="1">
                    <SelectTrigger id="minAdvanceBooking">
                      <SelectValue placeholder="Select minimum time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No minimum</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAdvanceBooking">Maximum Advance Booking Time</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="maxAdvanceBooking">
                      <SelectValue placeholder="Select maximum time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="60">2 months</SelectItem>
                      <SelectItem value="90">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bufferTime">Buffer Time Between Appointments</Label>
                  <Select defaultValue="0">
                    <SelectTrigger id="bufferTime">
                      <SelectValue placeholder="Select buffer time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="allowSameDay" defaultChecked />
                  <Label htmlFor="allowSameDay">Allow same-day bookings</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="allowCancellation" defaultChecked />
                  <Label htmlFor="allowCancellation">Allow customer cancellation</Label>
                </div>

                <div className="flex justify-end">
                  <Button>Save Rules</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure email notifications for you and your customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyNewBooking" className="text-base">
                        New Booking Notification
                      </Label>
                      <p className="text-sm text-gray-500">Receive an email when a new booking is made</p>
                    </div>
                    <Switch id="notifyNewBooking" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyCancellation" className="text-base">
                        Cancellation Notification
                      </Label>
                      <p className="text-sm text-gray-500">Receive an email when a booking is cancelled</p>
                    </div>
                    <Switch id="notifyCancellation" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyReschedule" className="text-base">
                        Reschedule Notification
                      </Label>
                      <p className="text-sm text-gray-500">Receive an email when a booking is rescheduled</p>
                    </div>
                    <Switch id="notifyReschedule" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sendCustomerConfirmation" className="text-base">
                        Customer Booking Confirmation
                      </Label>
                      <p className="text-sm text-gray-500">Send confirmation email to customers when they book</p>
                    </div>
                    <Switch id="sendCustomerConfirmation" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sendCustomerReminder" className="text-base">
                        Customer Appointment Reminder
                      </Label>
                      <p className="text-sm text-gray-500">Send reminder email to customers before their appointment</p>
                    </div>
                    <Switch id="sendCustomerReminder" defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Select defaultValue="24">
                    <SelectTrigger id="reminderTime">
                      <SelectValue placeholder="Select reminder time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Customize email notification templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingConfirmationTemplate">Booking Confirmation Template</Label>
                  <Textarea
                    id="bookingConfirmationTemplate"
                    className="min-h-[100px]"
                    defaultValue="Dear {customer_name},

Thank you for booking an appointment with BarberShop. Your appointment details are as follows:

Service: {service_name}
Barber: {barber_name}
Date: {appointment_date}
Time: {appointment_time}

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
BarberShop Team"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTemplate">Appointment Reminder Template</Label>
                  <Textarea
                    id="reminderTemplate"
                    className="min-h-[100px]"
                    defaultValue="Dear {customer_name},

This is a friendly reminder about your upcoming appointment:

Service: {service_name}
Barber: {barber_name}
Date: {appointment_date}
Time: {appointment_time}

We look forward to seeing you!

Best regards,
BarberShop Team"
                  />
                </div>

                <div className="flex justify-end">
                  <Button>Save Templates</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Name</Label>
                  <Input id="accountName" defaultValue="Admin User" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountEmail">Email</Label>
                  <Input id="accountEmail" type="email" defaultValue="admin@barbershop.com" />
                </div>

                <div className="flex justify-end">
                  <Button>Update Account</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>

                <div className="flex justify-end">
                  <Button>Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
