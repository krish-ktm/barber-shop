import React from 'react';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils';
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
import { 
  Edit, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Trash 
} from 'lucide-react';

export const StaffList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {staffData.map((staff) => (
        <Card key={staff.id} className="overflow-hidden">
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-black to-primary"></div>
            <Avatar className="absolute bottom-0 left-4 transform translate-y-1/2 h-16 w-16 border-4 border-background">
              <AvatarImage src={staff.image} alt={staff.name} />
              <AvatarFallback>
                {staff.name
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
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <CardContent className="pt-10 pb-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{staff.name}</h3>
              <p className="text-sm text-muted-foreground">{staff.position}</p>
              <div className="mt-2">
                <Badge variant={staff.isAvailable ? "default" : "outline"}>
                  {staff.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1 text-sm mb-4">
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {staff.email}
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {staff.phone}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-medium">{staff.totalAppointments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="font-medium">{formatCurrency(staff.totalEarnings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};