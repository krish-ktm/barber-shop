import React, { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Staff } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Loader2, ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { Service } from '@/api/services/serviceService';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/utils';

// Custom styles to override red color
const customStyles = `
  .custom-form .text-destructive {
    color: #f59e0b !important; /* amber-500 */
  }
  .custom-form [data-state="error"] {
    color: #f59e0b !important; /* amber-500 */
  }
  .custom-form [data-state="error"] .text-destructive {
    color: #f59e0b !important; /* amber-500 */
  }
  .custom-form .form-item-custom [data-state="error"] {
    color: #f59e0b !important; /* amber-500 */
  }
  .custom-form .form-item-custom .text-destructive {
    color: #f59e0b !important; /* amber-500 */
  }
`;

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  bio: z.string().optional(),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  commissionPercentage: z.number().min(0).max(100),
  isActive: z.boolean(),
});

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff;
  onUpdate: (updatedStaff: Staff) => void;
  services: Service[];
  isLoadingServices?: boolean;
}

export const EditStaffDialog: React.FC<EditStaffDialogProps> = ({
  open,
  onOpenChange,
  staff,
  onUpdate,
  services = [],
  isLoadingServices = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  
  // Get unique categories from services
  const categories = Array.from(new Set(services.map(service => service.category || 'Uncategorized')));
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: staff?.id || '',
      name: staff?.name || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
      bio: staff?.bio || '',
      services: [], // Initialize empty, will be set in useEffect
      commissionPercentage: staff?.commissionPercentage || 0,
      isActive: staff?.isAvailable || false,
    },
  });

  // Initialize selected services from staff data when component mounts or staff/services change
  useEffect(() => {
    if (staff?.services && Array.isArray(staff.services) && services.length > 0) {
      // Normalize staff services to an array of IDs regardless of whether they are objects or strings
      const staffServiceIds = staff.services.map((s: Service | string) =>
        typeof s === 'string' ? s : s.id
      );

      const validServiceIds = staffServiceIds.filter(id =>
        services.some(service => service.id === id)
      );
      
      setSelectedServiceIds(validServiceIds);
      form.setValue('services', validServiceIds, { shouldValidate: true });
      
      // Open categories that have selected services
      const categoriesToOpen: Record<string, boolean> = {};
      validServiceIds.forEach(id => {
        const service = services.find(s => s.id === id);
        if (service) {
          categoriesToOpen[service.category || 'Uncategorized'] = true;
        }
      });
      
      setOpenCategories(prev => ({
        ...prev,
        ...categoriesToOpen
      }));
    }
  }, [staff, services, form]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds(prev => {
      const isSelected = prev.includes(serviceId);
      
      let updatedServices: string[];
      if (isSelected) {
        // Remove service if already selected
        updatedServices = prev.filter(id => id !== serviceId);
      } else {
        // Add new service
        updatedServices = [...prev, serviceId];
      }
      
      // Update form value
      form.setValue('services', updatedServices, { shouldValidate: true });
      return updatedServices;
    });
  };

  const getSelectedServicesCount = (category: string) => {
    return services
      .filter(service => service.category === category && selectedServiceIds.includes(service.id))
      .length;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Create updated staff object (preserving other properties not in the form)
      const updatedStaff = {
        ...staff,
        ...values,
        isAvailable: values.isActive,
        services: selectedServiceIds, // Use the selected service IDs
      };
      
      await onUpdate(updatedStaff);
      
      toast({
        title: 'Staff profile updated',
        description: 'Staff profile has been updated successfully.',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update staff profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isSubmitting) {
        onOpenChange(isOpen);
      }
    }}>
      <style>{customStyles}</style>
      <DialogContent className="max-w-[95%] w-full sm:max-w-[600px] h-[90vh] flex flex-col rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Staff Profile</DialogTitle>
          <DialogDescription>
            Edit the profile information for {staff?.name}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 sm:px-6 pb-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  render={() => (
                    <FormItem className="form-item-custom">
                      <FormLabel className="text-slate-700">Services Offered</FormLabel>
                      <div className="space-y-2">
                        {isLoadingServices ? (
                          <div className="flex justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : services.length === 0 ? (
                          <div className="text-center p-4 border rounded-lg bg-muted/30">
                            <p>No services found. Please add services first.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {categories.map((category) => {
                              const selectedCount = getSelectedServicesCount(category);
                              return (
                                <Collapsible
                                  key={category}
                                  open={openCategories[category]}
                                  onOpenChange={() => toggleCategory(category)}
                                  className="border rounded-lg"
                                >
                                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                      </span>
                                      {selectedCount > 0 && (
                                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                          {selectedCount}
                                        </span>
                                      )}
                                    </div>
                                    {openCategories[category] ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-2">
                                    <div className="grid gap-2">
                                      {services
                                        .filter(s => s.category === category)
                                        .map((s) => {
                                          const isSelected = selectedServiceIds.includes(s.id);
                                          return (
                                            <Button
                                              key={s.id}
                                              type="button"
                                              variant={isSelected ? "default" : "outline"}
                                              className="w-full grid grid-cols-[1fr_auto] items-center gap-2 whitespace-normal py-2 h-auto"
                                              onClick={() => handleServiceSelection(s.id)}
                                            >
                                              <span className="text-left break-words whitespace-normal pr-2 leading-snug py-0.5">
                                                {s.name}
                                              </span>
                                              <span className={`${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'} pl-2 justify-self-end`}>
                                                {formatCurrency(Number(s.price) || 0)}
                                              </span>
                                            </Button>
                                          );
                                        })}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                            
                            {selectedServiceIds.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium">Selected Services</div>
                                {selectedServiceIds.map((serviceId) => {
                                  const selectedService = services.find(s => s.id === serviceId);
                                  if (!selectedService) return null;
                                  
                                  return (
                                    <div key={serviceId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <span>{selectedService.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {selectedService.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                          {formatCurrency(Number(selectedService.price) || 0)}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={() => handleServiceSelection(serviceId)}
                                          className="hover:bg-muted"
                                        >
                                          <Trash className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
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
                          placeholder="Enter commission percentage"
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

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Staff'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 