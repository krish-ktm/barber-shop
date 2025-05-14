import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Save,
  Scissors,
  User,
  Plus,
  Trash,
  Edit,
  CheckCircle,
  Copy
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

export const StaffProfile: React.FC = () => {
  const { toast } = useToast();
  
  // Mock staff ID - in real app would come from auth context
  const staffId = 'staff-1';
  const staff = staffData.find(s => s.id === staffId);
  
  // Initialize form data with defaults in case staff is not found
  const [formData, setFormData] = useState({
    email: staff?.email || '',
    phone: staff?.phone || '',
    bio: staff?.bio || '',
  });
  
  // Initialize working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    staff?.workingHours || {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: []
    }
  );
  
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

  // Template schedule for copying to multiple days
  const [templateDay, setTemplateDay] = useState<keyof WorkingHours | null>(null);
  const [targetDays, setTargetDays] = useState<Array<keyof WorkingHours>>([]);

  // Day names for iteration
  const dayNames: Array<keyof WorkingHours> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  if (!staff) return null;

  const handleSave = () => {
    // In a real app, you would save all changes to the backend
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
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
    const hasOverlap = workingHours[selectedDay].some(slot => {
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
      updatedHours[selectedDay] = workingHours[selectedDay].map(slot => 
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

  const handleCopySchedule = () => {
    if (!templateDay) return;
    
    const updatedHours = { ...workingHours };
    
    targetDays.forEach(day => {
      updatedHours[day] = [...workingHours[templateDay]];
    });
    
    setWorkingHours(updatedHours);
    setTemplateDay(null);
    setTargetDays([]);
    
    toast({
      title: 'Schedule copied',
      description: `Your schedule has been copied to the selected days.`,
    });
  };

  const toggleTargetDay = (day: keyof WorkingHours) => {
    if (templateDay === day) return; // Can't copy to the template day
    
    setTargetDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
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
    
    workingHours[day].forEach(slot => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and update your profile information"
        action={{
          label: "Save Changes",
          onClick: handleSave,
          icon: <Save className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Overview */}
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={staff.image} alt={staff.name} />
                <AvatarFallback>
                  {staff.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold">{staff.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">{staff.position}</p>
              
              <div className="flex gap-2 mb-4">
                <Badge variant={staff.isAvailable ? "default" : "outline"}>
                  {staff.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
                <Badge variant="outline">{staff.commissionPercentage}% Commission</Badge>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Member since</span>
                  </div>
                  <span className="text-sm">Jan 2024</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Scissors className="h-4 w-4" />
                    <span>Services</span>
                  </div>
                  <span className="text-sm">{staff.services.length}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Appointments</span>
                  </div>
                  <span className="text-sm">{staff.totalAppointments}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Earnings</span>
                  </div>
                  <span className="text-sm">{formatCurrency(staff.totalEarnings)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Manage your availability for appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
                  <TabsTrigger value="copy">Copy Schedule</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekly" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {dayNames.map((day) => (
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
                                    onClick={() => openAddDialog(day)}
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
                          {workingHours[day].length > 0 && !workingHours[day].every(slot => slot.isBreak) && (
                            <CardDescription className="mt-1">
                              Total: {calculateDayTotalHours(day)}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                          {workingHours[day].length > 0 ? (
                            <div className="space-y-2">
                              {workingHours[day].map((slot, index) => (
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
                                      onClick={() => openEditDialog(day, slot)}
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
                                          <AlertDialogAction onClick={() => handleDeleteTimeSlot(day, slot)}>
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
                
                <TabsContent value="copy">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Copy Schedule Between Days</CardTitle>
                      <CardDescription>
                        Select a source day to copy from, then select target days to copy to
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="template-day">Copy from:</Label>
                        <Select
                          value={templateDay || undefined}
                          onValueChange={(value) => setTemplateDay(value as keyof WorkingHours)}
                        >
                          <SelectTrigger id="template-day" className="mt-1">
                            <SelectValue placeholder="Select a day" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayNames.map((day) => (
                              <SelectItem key={day} value={day}>
                                <span className="capitalize">{day}</span>
                                {workingHours[day].length === 0 && " (Day off)"}
                                {workingHours[day].length > 0 && ` (${workingHours[day].length} slots)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {templateDay && (
                        <>
                          <div>
                            <Label className="mb-2 block">Copy to:</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {dayNames.filter(day => day !== templateDay).map((day) => (
                                <div 
                                  key={day} 
                                  className={`
                                    flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors
                                    ${targetDays.includes(day) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                                  `}
                                  onClick={() => toggleTargetDay(day)}
                                >
                                  <span className="capitalize text-sm">{day}</span>
                                  {targetDays.includes(day) && <CheckCircle className="h-4 w-4 text-primary" />}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleCopySchedule} 
                            disabled={targetDays.length === 0}
                            className="w-full"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Schedule to Selected Days
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {staff.services.map((serviceId) => (
                  <div
                    key={serviceId}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <Scissors className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Service {serviceId}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};