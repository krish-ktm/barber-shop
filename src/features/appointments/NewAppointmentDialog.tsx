import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { createTimeSlots } from '@/utils/dates';
import { useToast } from '@/hooks/use-toast';
import { ServicePicker } from './ServicePicker';
import { Staff, Service, createAppointment, Appointment } from '@/api/services/appointmentService';
import { createCustomer, getAllCustomers } from '@/api/services/customerService';
import { useApi } from '@/hooks/useApi';

const formSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  staffId: z.string().min(1, 'Please select a staff member'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  staffList: Staff[];
  serviceList: Service[];
  onAppointmentCreated?: (newAppointment?: Appointment) => void;
}

export const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  staffList,
  serviceList,
  onAppointmentCreated
}) => {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);

  // API hooks
  const {
    execute: searchCustomers,
  } = useApi(getAllCustomers);

  const {
    execute: createNewCustomer,
  } = useApi(createCustomer);

  const {
    execute: createNewAppointment,
  } = useApi(createAppointment);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      staffId: '',
      services: [],
      date: selectedDate || new Date(),
      time: '',
      notes: '',
    },
  });

  // When the form opens, reset it with the selected date
  useEffect(() => {
    if (open && selectedDate) {
      form.setValue('date', selectedDate);
    }
  }, [open, selectedDate, form]);

  // Get the formatted date for time slot creation
  const selectedDateValue = form.watch('date');
  const formattedDate = selectedDateValue 
    ? format(selectedDateValue instanceof Date ? selectedDateValue : parseISO(selectedDateValue), 'yyyy-MM-dd')
    : '';

  // Watch for customer phone changes to check if customer exists
  const customerPhone = form.watch('customerPhone');
  
  useEffect(() => {
    const checkExistingCustomer = async () => {
      if (customerPhone && customerPhone.length >= 10) {
        setIsCheckingCustomer(true);
        try {
          const result = await searchCustomers(1, 10, 'name_asc', customerPhone);
          if (result && result.customers && result.customers.length > 0) {
            const existingCustomer = result.customers[0];
            form.setValue('customerName', existingCustomer.name);
            if (existingCustomer.email) {
              form.setValue('customerEmail', existingCustomer.email);
            }
            toast({
              title: 'Customer found',
              description: `Found existing customer: ${existingCustomer.name}`,
              variant: 'default',
            });
          }
        } catch (error) {
          console.error('Error checking customer:', error);
        } finally {
          setIsCheckingCustomer(false);
        }
      }
    };

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(checkExistingCustomer, 500);
    return () => clearTimeout(timeoutId);
  }, [customerPhone, searchCustomers, form, toast]);

  // Get available time slots
  const timeSlots = createTimeSlots(
    '09:00', 
    '20:00', 
    30, 
    [{ start: '12:00', end: '13:00' }],
    [],
    formattedDate
  );

  // Calculate total duration and price
  const calculateTotals = () => {
    return selectedServices.reduce(
      (acc, serviceId) => {
        const service = serviceList.find((s) => s.id === serviceId);
        if (service) {
          // Ensure duration is a number
          const duration = typeof service.duration === 'number' ? service.duration : parseInt(String(service.duration), 10) || 0;
          
          // Ensure price is a number - Sequelize often returns decimal values as strings
          const price = typeof service.price === 'number' ? service.price : parseFloat(String(service.price)) || 0;
          
          acc.duration += duration;
          acc.price += price;
        }
        return acc;
      },
      { duration: 0, price: 0 }
    );
  };

  const { duration, price } = calculateTotals();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Format date to YYYY-MM-DD
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      
      // First check if we need to create a customer
      let customerId = '';
      
      // Search for existing customer by phone
      const customerResult = await searchCustomers(1, 10, 'name_asc', values.customerPhone);
      
      if (customerResult && customerResult.customers.length > 0) {
        // Use existing customer
        customerId = customerResult.customers[0].id;
      } else {
        // Create new customer
        const newCustomerResult = await createNewCustomer({
          name: values.customerName,
          phone: values.customerPhone,
          email: values.customerEmail || undefined,
        });
        
        if (newCustomerResult && newCustomerResult.success) {
          customerId = newCustomerResult.customer.id;
        } else {
          throw new Error('Failed to create customer');
        }
      }
      
      // Now create the appointment
      const result = await createNewAppointment({
        customer_id: customerId,
        staff_id: values.staffId,
        date: formattedDate,
        time: values.time,
        services: values.services,
        notes: values.notes,
      });
      
      if (result && result.success) {
        toast({
          title: 'Success',
          description: 'Appointment created successfully',
          variant: 'default',
        });
        
        // Reset form and close dialog
        form.reset();
        setSelectedServices([]);
        onOpenChange(false);
        
        // Callback to refresh appointments
        if (onAppointmentCreated) {
          onAppointmentCreated(result.appointment);
        }
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment by filling in the details below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number
                          {isCheckingCustomer && (
                            <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />
                          )}
                        </FormLabel>
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
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Member</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffList.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services</FormLabel>
                      <ServicePicker
                        selectedServices={field.value}
                        serviceList={serviceList}
                        onServiceSelect={(serviceId) => {
                          const currentServices = field.value;
                          const isSelected = currentServices.includes(serviceId);
                          
                          const newServices = isSelected 
                            ? currentServices.filter(id => id !== serviceId)
                            : [...currentServices, serviceId];
                          
                          field.onChange(newServices);
                          setSelectedServices(newServices);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time">
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {field.value || 'Select time'}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Add any notes about the appointment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedServices.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>{duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Price:</span>
                      <span>${(Math.round(price * 100) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Appointment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};