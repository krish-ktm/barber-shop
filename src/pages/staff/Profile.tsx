import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Save,
  Scissors,
  User
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPhoneNumber } from '@/utils';

export const StaffProfile: React.FC = () => {
  const { toast } = useToast();
  
  // Mock staff ID - in real app would come from auth context
  const staffId = 'staff-1';
  const staff = staffData.find(s => s.id === staffId);

  if (!staff) return null;

  const [formData, setFormData] = useState({
    email: staff.email,
    phone: staff.phone,
    bio: staff.bio || '',
  });

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
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
                    <Calendar className="h-4 w-4" />
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(staff.workingHours).map(([day, slots]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="capitalize">{day}</span>
                    <div>
                      {slots.length > 0 ? (
                        slots.map((slot, index) => (
                          <span key={index} className="text-sm">
                            {slot.start} - {slot.end}
                            {index < slots.length - 1 && ', '}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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