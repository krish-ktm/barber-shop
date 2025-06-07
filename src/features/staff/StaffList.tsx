import React, { useState } from 'react';
import { 
  Edit, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Trash,
  Clock
} from 'lucide-react';
import { Staff } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditStaffDialog } from '@/features/admin/staff-management/components/EditStaffDialog';
import { useToast } from '@/hooks/use-toast';

interface StaffListProps {
  staff: Staff[];
  onUpdateStaff?: (updatedStaff: Staff) => void;
  onDeleteStaff?: (staffId: string) => void;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, onUpdateStaff, onDeleteStaff }) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    if (onUpdateStaff) {
      onUpdateStaff(updatedStaff);
    } else {
      // If no update handler is provided, just show a toast
      toast({
        title: "Update simulated",
        description: "In a real application, this would update the staff member in the database.",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-black to-primary"></div>
              <Avatar className="absolute bottom-0 left-4 transform translate-y-1/2 h-16 w-16 border-4 border-background">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
                      <MoreHorizontal className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDeleteStaff && onDeleteStaff(member.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="pt-10 pb-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.position}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={member.isAvailable ? "default" : "outline"}>
                    {member.isAvailable ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{member.commissionPercentage}% Commission</Badge>
                </div>
              </div>
              
              <div className="space-y-1 text-sm mb-4">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {member.email}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatPhoneNumber(member.phone)}
                </p>
                {member.bio && (
                  <p className="text-muted-foreground mt-2">{member.bio}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b mb-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{member.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center border-x">
                  <p className="text-2xl font-semibold">
                    {member.services.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Services</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {formatCurrency(member.totalEarnings).replace('$', '')}
                  </p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Today's Schedule</h4>
                {member.workingHours[getDayKey(new Date())].length > 0 ? (
                  member.workingHours[getDayKey(new Date())].map((slot, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{slot.start} - {slot.end}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Not scheduled today</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedStaff && (
        <EditStaffDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          staff={selectedStaff}
          onUpdate={handleUpdateStaff}
        />
      )}
    </>
  );
};

// Helper function to get the day key for workingHours
const getDayKey = (date: Date): keyof Staff['workingHours'] => {
  const days: (keyof Staff['workingHours'])[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
};