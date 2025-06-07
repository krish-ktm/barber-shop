import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { serviceData } from '@/mocks';
import { useToast } from '@/hooks/use-toast';
import { Staff } from '@/types';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  position: z.string().min(1, 'Position is required'),
  bio: z.string().optional(),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  commissionPercentage: z.number().min(0).max(100),
  isActive: z.boolean(),
});

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (newStaff: Staff) => void;
  onAddStaff?: (newStaff: Staff) => void;
}

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  onAddStaff,
}) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      bio: '',
      services: [],
      commissionPercentage: 40,
      isActive: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Create a new staff member object
    const newStaff: Staff = {
      ...values,
      id: `staff-${Date.now()}`, // Generate a unique ID (in a real app this would be from the backend)
      role: 'staff',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', // Default image
      workingHours: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      totalEarnings: 0,
      totalAppointments: 0,
      isAvailable: values.isActive, // Map isActive to isAvailable
    };

    if (onAddStaff) {
      onAddStaff(newStaff);
    } else if (onAdd) {
      onAdd(newStaff);
    } else {
      // If no handler provided, just log
      console.log(newStaff);
    }
    
    toast({
      title: 'Staff member added',
      description: 'New staff member has been added successfully.',
    });
    
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to your barber shop. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Status: {field.value ? 'Active' : 'Inactive'}</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {field.value 
                            ? 'Staff member is active and can be scheduled' 
                            : 'Staff member is inactive and cannot be scheduled'}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Junior Barber">Junior Barber</SelectItem>
                            <SelectItem value="Senior Barber">Senior Barber</SelectItem>
                            <SelectItem value="Master Barber">Master Barber</SelectItem>
                            <SelectItem value="Style Specialist">Style Specialist</SelectItem>
                            <SelectItem value="Color Specialist">Color Specialist</SelectItem>
                            <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter staff member's bio"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                        {serviceData.map((service) => (
                          <label
                            key={service.id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={field.value.includes(service.id)}
                              onChange={(e) => {
                                const value = service.id;
                                if (e.target.checked) {
                                  field.onChange([...field.value, value]);
                                } else {
                                  field.onChange(
                                    field.value.filter((v) => v !== value)
                                  );
                                }
                              }}
                              className="form-checkbox h-4 w-4"
                            />
                            <span>{service.name}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button onClick={form.handleSubmit(onSubmit)}>Add Staff Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};