import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Plus,
  Trash,
  Edit,
  Save,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot, WorkingHours } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// API imports
import { useAuth } from '@/lib/auth';
import { getStaffById, updateStaffAvailability, WorkingHour } from '@/api/services/staffService';
import { useApi } from '@/hooks/useApi';

export const StaffWorkingHours: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get staff ID from auth context
  const staffId = user?.staff?.id;
  
  // API hooks
  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
    execute: fetchStaff
  } = useApi(getStaffById);

  const {
    loading: updateLoading,
    error: updateError,
    execute: saveWorkingHours
  } = useApi(updateStaffAvailability);
  
  // Initialize working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: []
  });
  
  // Time slot management dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof WorkingHours>('monday');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeSlotForm, setTimeSlotForm] = useState<TimeSlot>({
    start: '09:00',
    end: '17:00',
  });

  // Common time slots for quick selection
  const quickTimeSlots = [
    { label: 'Morning (9:00 AM - 1:00 PM)', start: '09:00', end: '13:00' },
    { label: 'Afternoon (1:00 PM - 5:00 PM)', start: '13:00', end: '17:00' },
    { label: 'Evening (5:00 PM - 9:00 PM)', start: '17:00', end: '21:00' },
    { label: 'Full Day (9:00 AM - 5:00 PM)', start: '09:00', end: '17:00' },
    { label: 'Lunch Break (12:00 PM - 1:00 PM)', start: '12:00', end: '13:00', isBreak: true },
  ];

  // Day names for iteration
  const dayNames: Array<keyof WorkingHours> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Fetch staff data on component mount
  useEffect(() => {
    if (staffId) {
      fetchStaff(staffId);
    }
  }, [staffId, fetchStaff]);

  // Update state when API data is loaded
  useEffect(() => {
    if (staffData?.staff?.workingHours) {
      // Convert API format to our frontend format
      const apiWorkingHours = staffData.staff.workingHours;
      const formattedHours: WorkingHours = {
        monday: [], tuesday: [], wednesday: [], thursday: [],
        friday: [], saturday: [], sunday: []
      };

      apiWorkingHours.forEach((hour: WorkingHour) => {
        const day = hour.day_of_week as keyof WorkingHours;
        // Format time from "HH:MM:SS" to "HH:MM"
        const start = hour.start_time.slice(0, 5);
        const end = hour.end_time.slice(0, 5);
        
        formattedHours[day].push({
          start,
          end,
          isBreak: hour.is_break
        });
      });

      setWorkingHours(formattedHours);
    }
  }, [staffData]);

  // Handle API errors
  useEffect(() => {
    if (staffError) {
      toast({
        title: 'Error loading working hours',
        description: staffError.message,
        variant: 'destructive',
      });
    }

    if (updateError) {
      toast({
        title: 'Error saving working hours',
        description: updateError.message,
        variant: 'destructive',
      });
    }
  }, [staffError, updateError, toast]);

  const handleSave = async () => {
    if (!staffId) {
      toast({
        title: 'Error',
        description: 'Staff ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert our frontend format to API format
      const apiWorkingHours: WorkingHour[] = [];
      
      Object.entries(workingHours).forEach(([day, slots]) => {
        slots.forEach((slot: TimeSlot) => {
          apiWorkingHours.push({
            day_of_week: day,
            start_time: `${slot.start}:00`,
            end_time: `${slot.end}:00`,
            is_break: !!slot.isBreak
          });
        });
      });

      // Save to API
      await saveWorkingHours(staffId, apiWorkingHours);
      
      toast({
        title: 'Working hours updated',
        description: 'Your working hours have been updated successfully.',
      });
      
      // Refresh data
      fetchStaff(staffId);
    } catch (error) {
      console.error('Error saving working hours:', error);
    }
  };

  const handleAddTimeSlot = () => {
    if (timeSlotForm.start >= timeSlotForm.end) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    // Check for overlapping slots
    const hasOverlap = workingHours[selectedDay].some((slot: TimeSlot) => {
      return (timeSlotForm.start < slot.end && timeSlotForm.end > slot.start);
    });

    if (hasOverlap && !isEditMode) {
      toast({
        title: 'Time slot overlap',
        description: 'This time slot overlaps with existing slots.',
        variant: 'destructive',
      });
      return;
    }

    const updatedHours = { ...workingHours };
    
    if (isEditMode && selectedSlot) {
      // Update existing slot
      updatedHours[selectedDay] = workingHours[selectedDay].map((slot: TimeSlot) => 
        slot === selectedSlot ? timeSlotForm : slot
      );
    } else {
      // Add new slot
      updatedHours[selectedDay] = [...workingHours[selectedDay], timeSlotForm];
    }

    setWorkingHours(updatedHours);
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedSlot(null);
    
    toast({
      title: isEditMode ? 'Time slot updated' : 'Time slot added',
      description: `Your availability on ${selectedDay} has been ${isEditMode ? 'updated' : 'added'}.`,
    });
  };

  const handleDeleteTimeSlot = (day: keyof WorkingHours, slotToDelete: TimeSlot) => {
    const updatedHours = { ...workingHours };
    updatedHours[day] = workingHours[day].filter(slot => slot !== slotToDelete);
    setWorkingHours(updatedHours);
    
    toast({
      title: 'Time slot removed',
      description: `Your availability on ${day} has been updated.`,
    });
  };

  const openAddDialog = (day: keyof WorkingHours) => {
    setSelectedDay(day);
    setIsEditMode(false);
    setSelectedSlot(null);
    setTimeSlotForm({
      start: '09:00',
      end: '17:00',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (day: keyof WorkingHours, slot: TimeSlot) => {
    setSelectedDay(day);
    setIsEditMode(true);
    setSelectedSlot(slot);
    setTimeSlotForm({
      start: slot.start,
      end: slot.end,
      isBreak: slot.isBreak,
    });
    setIsDialogOpen(true);
  };

  const handleQuickTimeSlotSelect = (preset: TimeSlot) => {
    setTimeSlotForm(preset);
  };

  const formatTimeSlotDisplay = (slot: TimeSlot) => {
    // Convert 24h time to AM/PM format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours, 10);
      return `${h % 12 || 12}:${minutes} ${h < 12 ? 'AM' : 'PM'}`;
    };
    
    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
  };

  const calculateDayTotalHours = (day: keyof WorkingHours) => {
    let totalMinutes = 0;
    
    workingHours[day].forEach((slot: TimeSlot) => {
      if (!slot.isBreak) {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        totalMinutes += (endTotalMinutes - startTotalMinutes);
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours + (minutes > 0 ? ` hours ${minutes} min` : ` hours`);
  };

  // Show loading state
  if (staffLoading && !staffData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading working hours...</p>
        </div>
      </div>
    );
  }

  // Show error state if no staff ID
  if (!staffId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load staff information. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Working Hours"
        description="Manage your availability for appointments"
        action={{
          label: updateLoading ? "Saving..." : "Save Changes",
          onClick: handleSave,
          icon: updateLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />,
          disabled: updateLoading,
        }}
      />

      {(staffError || updateError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {staffError?.message || updateError?.message || "There was an error with your request."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium text-sm text-muted-foreground">Day</div>
                <div className="col-span-2 font-medium text-sm text-muted-foreground">Working Hours</div>
                
                {dayNames.map((day) => (
                  <React.Fragment key={day}>
                    <div className="capitalize font-medium">{day}</div>
                    <div className="col-span-2">
                      {workingHours[day].length > 0 ? (
                        calculateDayTotalHours(day)
                      ) : (
                        <Badge variant="outline">Day Off</Badge>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold">Total Weekly Hours</div>
                  <div className="col-span-2 font-semibold">
                    {Object.keys(workingHours).reduce((total, day) => {
                      const dayHours = workingHours[day as keyof WorkingHours];
                      const dayMinutes = dayHours.reduce((sum, slot) => {
                        if (slot.isBreak) return sum;
                        const [startHours, startMinutes] = slot.start.split(':').map(Number);
                        const [endHours, endMinutes] = slot.end.split(':').map(Number);
                        const startTotalMinutes = startHours * 60 + startMinutes;
                        const endTotalMinutes = endHours * 60 + endMinutes;
                        return sum + (endTotalMinutes - startTotalMinutes);
                      }, 0);
                      return total + dayMinutes;
                    }, 0) / 60} hours
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekdays" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekdays">Weekdays</TabsTrigger>
          <TabsTrigger value="weekend">Weekend</TabsTrigger>
        </TabsList>

        <TabsContent value="weekdays">
          <div className="grid md:grid-cols-3 gap-6">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
              <Card key={day} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{day}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAddDialog(day as keyof WorkingHours)}
                            className="h-8 px-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new time slot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {workingHours[day as keyof WorkingHours].length > 0 && 
                   !workingHours[day as keyof WorkingHours].every(slot => slot.isBreak) && (
                    <CardDescription className="mt-1">
                      Total: {calculateDayTotalHours(day as keyof WorkingHours)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                  {workingHours[day as keyof WorkingHours].length > 0 ? (
                    <div className="space-y-2">
                      {workingHours[day as keyof WorkingHours].map((slot, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-2 rounded-md border ${slot.isBreak ? 'bg-muted/30' : 'bg-card'}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <Clock className={`h-4 w-4 mr-2 ${slot.isBreak ? 'text-muted-foreground' : 'text-primary'}`} />
                            <span className="text-sm truncate">
                              {formatTimeSlotDisplay(slot)}
                              {slot.isBreak && <Badge variant="outline" className="ml-2 text-xs">Break</Badge>}
                            </span>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(day as keyof WorkingHours, slot)}
                              className="h-7 w-7"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <Trash className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this time slot? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTimeSlot(day as keyof WorkingHours, slot)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-md">
                      No hours set (day off)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekend">
          <div className="grid md:grid-cols-2 gap-6">
            {['saturday', 'sunday'].map((day) => (
              <Card key={day} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{day}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAddDialog(day as keyof WorkingHours)}
                            className="h-8 px-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new time slot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {workingHours[day as keyof WorkingHours].length > 0 && 
                   !workingHours[day as keyof WorkingHours].every(slot => slot.isBreak) && (
                    <CardDescription className="mt-1">
                      Total: {calculateDayTotalHours(day as keyof WorkingHours)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                  {workingHours[day as keyof WorkingHours].length > 0 ? (
                    <div className="space-y-2">
                      {workingHours[day as keyof WorkingHours].map((slot, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-2 rounded-md border ${slot.isBreak ? 'bg-muted/30' : 'bg-card'}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <Clock className={`h-4 w-4 mr-2 ${slot.isBreak ? 'text-muted-foreground' : 'text-primary'}`} />
                            <span className="text-sm truncate">
                              {formatTimeSlotDisplay(slot)}
                              {slot.isBreak && <Badge variant="outline" className="ml-2 text-xs">Break</Badge>}
                            </span>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(day as keyof WorkingHours, slot)}
                              className="h-7 w-7"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <Trash className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this time slot? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTimeSlot(day as keyof WorkingHours, slot)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-md">
                      No hours set (day off)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Time slot dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Time Slot" : "Add Time Slot"}
            </DialogTitle>
            <DialogDescription>
              Set your working hours for <span className="capitalize font-medium">{selectedDay}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quick select:</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickTimeSlots.map((preset, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`justify-start h-auto py-2 px-3 text-left ${
                      timeSlotForm.start === preset.start && 
                      timeSlotForm.end === preset.end && 
                      timeSlotForm.isBreak === preset.isBreak 
                        ? 'border-primary' 
                        : ''
                    }`}
                    onClick={() => handleQuickTimeSlotSelect(preset)}
                  >
                    <div>
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.isBreak ? 'Break Time' : 'Working Hours'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom time:</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={timeSlotForm.start}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-xs">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={timeSlotForm.end}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-break"
                checked={timeSlotForm.isBreak || false}
                onCheckedChange={(checked) => setTimeSlotForm({ ...timeSlotForm, isBreak: checked })}
              />
              <Label htmlFor="is-break">Mark as break time</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 