"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { StaffSidebar } from "@/components/staff-sidebar"

export default function StaffSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isBreakOpen, setIsBreakOpen] = useState(false)
  const [isTimeOffOpen, setIsTimeOffOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar />

      <div className="flex-1 p-8 md:pl-72">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsBreakOpen(true)}>
              <Clock className="mr-2 h-4 w-4" /> Schedule Break
            </Button>
            <Button onClick={() => setIsTimeOffOpen(true)}>Request Time Off</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view your schedule</CardDescription>
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

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Regular Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">Monday - Friday</div>
                      <div>9:00 AM - 7:00 PM</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">Saturday</div>
                      <div>Off</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">Sunday</div>
                      <div>Off</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Scheduled Breaks</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Lunch Break</div>
                        <div className="text-sm text-gray-500">Daily</div>
                      </div>
                      <div>1:00 PM - 2:00 PM</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Personal Break</div>
                        <div className="text-sm text-gray-500">May 15, 2023</div>
                      </div>
                      <div>4:00 PM - 4:30 PM</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Time Off</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Vacation</div>
                        <div className="text-sm text-gray-500">June 10 - June 17, 2023</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Break Dialog */}
      <Dialog open={isBreakOpen} onOpenChange={setIsBreakOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Break</DialogTitle>
            <DialogDescription>Block time for a personal break.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="breakDate" className="text-sm font-medium">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="breakDate">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input id="startTime" type="time" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input id="endTime" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="breakReason" className="text-sm font-medium">
                  Reason (Optional)
                </label>
                <Input id="breakReason" placeholder="Reason for break" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBreakOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsBreakOpen(false)}>Schedule Break</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Time Off Dialog */}
      <Dialog open={isTimeOffOpen} onOpenChange={setIsTimeOffOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>Submit a request for time off.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="timeOffType" className="text-sm font-medium">
                  Type of Time Off
                </label>
                <select
                  id="timeOffType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Day</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input id="startDate" type="date" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input id="endDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="timeOffReason" className="text-sm font-medium">
                  Reason
                </label>
                <Input id="timeOffReason" placeholder="Reason for time off" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeOffOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsTimeOffOpen(false)}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
