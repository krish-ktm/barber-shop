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
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
              
              <div className="grid grid-cols-2 gap-4 w-full mb-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{staff.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {formatCurrency(staff.totalEarnings).replace('$', '')}
                  </p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
              
              <div className="text-sm text-left w-full space-y-2">
                <p className="font-medium">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {staff.services.map((service, i) => (
                    <Badge variant="secondary" key={i}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Link Card */}
        <Card className="md:col-span-12">
          <CardHeader className="pb-4">
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Manage your availability for appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm">Configure your working schedule and breaks for each day of the week.</p>
                <p className="text-sm text-muted-foreground">
                  Your current schedule has {Object.values(staff.workingHours).flat().filter(slot => !slot.isBreak).length} time slots 
                  across {Object.values(staff.workingHours).filter(day => day.length > 0).length} days.
                </p>
              </div>
              <Button asChild>
                <Link to="/staff/working-hours">
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Working Hours
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};