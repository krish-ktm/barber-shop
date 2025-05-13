import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { staffData, serviceData, customerData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  staffId: z.string().min(1, 'Please select a staff member'),
  services: z.array(z.object({
    serviceId: z.string().min(1, 'Please select a service'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Add at least one service'),
  tipAmount: z.number().min(0, 'Tip cannot be negative'),
  notes: z.string().optional(),
});

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [services, setServices] = useState([{ id: '1', serviceId: '', quantity: 1 }]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      staffId: '',
      services: [{ serviceId: '', quantity: 1 }],
      tipAmount: 0,
      notes: '',
    },
  });

  const calculateSubtotal = () => {
    return services.reduce((total, service) => {
      const selectedService = serviceData.find(s => s.id === service.serviceId);
      return total + (selectedService?.price || 0) * service.quantity;
    }, 0);
  };

  const handleAddService = () => {
    setServices([...services, { id: Date.now().toString(), serviceId: '', quantity: 1 }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      title: 'Invoice created',
      description: 'New invoice has been created successfully.',
    });
    onOpenChange(false);
    form.reset();
    setServices([{ id: '1', serviceId: '', quantity: 1 }]);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.075; // 7.5% tax rate
  const total = subtotal + tax + (form.watch('tipAmount') || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice by filling in the details below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customerData.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
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
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Member</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staffData.map((staff) => (
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Services</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddService}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    {services.map((service, index) => (
                      <div key={service.id} className="space-y-4">
                        <div className="flex items-end gap-4">
                          <div className="flex-1">
                            <FormLabel className="text-sm">Service</FormLabel>
                            <Select
                              value={service.serviceId}
                              onValueChange={(value) => {
                                const newServices = [...services];
                                newServices[index].serviceId = value;
                                setServices(newServices);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceData.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name} - {formatCurrency(s.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-24">
                            <FormLabel className="text-sm">Quantity</FormLabel>
                            <Input
                              type="number"
                              min="1"
                              value={service.quantity}
                              onChange={(e) => {
                                const newServices = [...services];
                                newServices[index].quantity = parseInt(e.target.value) || 1;
                                setServices(newServices);
                              }}
                            />
                          </div>

                          {services.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveService(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {service.serviceId && (
                          <div className="text-sm text-right text-muted-foreground">
                            {formatCurrency(
                              (serviceData.find(s => s.id === service.serviceId)?.price || 0) *
                              service.quantity
                            )}
                          </div>
                        )}

                        {index < services.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  <FormField
                    control={form.control}
                    name="tipAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add any notes about the invoice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax (7.5%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tip:</span>
                      <span>{formatCurrency(form.watch('tipAmount') || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button onClick={form.handleSubmit(onSubmit)}>Create Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};