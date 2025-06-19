import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Trash, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getGeneric as get, postGeneric as post, delGeneric as del } from '@/api/apiClient';
import { PageHeader } from '@/components/layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ShopClosure {
  id?: string;
  date: string;
  reason: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}

const ShopClosures: React.FC = () => {
  const { toast } = useToast();
  const [closures, setClosures] = useState<ShopClosure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ShopClosure>({
    date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    is_full_day: true,
    start_time: '09:00',
    end_time: '17:00',
  });
  
  // Date state for the Calendar component
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch shop closures
  const fetchClosures = async () => {
    setIsLoading(true);
    try {
      const response = await get<{ success: boolean; closures: ShopClosure[] }>('/shop-closures');
      if (response.success) {
        setClosures(response.closures);
      }
    } catch (error) {
      console.error('Error fetching shop closures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shop closures',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new shop closure
  const addClosure = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.is_full_day) {
        // If it's a full day closure, remove time fields
        delete payload.start_time;
        delete payload.end_time;
      }

      const response = await post<{ success: boolean; closure: ShopClosure }>('/shop-closures', payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shop closure added successfully',
        });
        setClosures([...closures, response.closure]);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding shop closure:', error);
      toast({
        title: 'Error',
        description: 'Failed to add shop closure',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete shop closure
  const deleteClosure = async (id: string) => {
    try {
      const response = await del<{ success: boolean }>(`/shop-closures/${id}`);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shop closure deleted successfully',
        });
        setClosures(closures.filter(closure => closure.id !== id));
      }
    } catch (error) {
      console.error('Error deleting shop closure:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shop closure',
        variant: 'destructive',
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle date change from Calendar
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_full_day: checked
    }));
  };

  // Reset form
  const resetForm = () => {
    const today = new Date();
    setSelectedDate(today);
    setFormData({
      date: format(today, 'yyyy-MM-dd'),
      reason: '',
      is_full_day: true,
      start_time: '09:00',
      end_time: '17:00',
    });
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClosure();
  };

  // Load shop closures on component mount
  useEffect(() => {
    fetchClosures();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop Closures"
        description="Manage days when your shop will be closed"
        action={{
          label: "Add Closure",
          onClick: () => setShowForm(true),
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      {/* Modal Dialog for Adding Shop Closure */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Shop Closure</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date Field with Shadcn Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'MMMM d, yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Full Day Switch */}
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label htmlFor="is_full_day" className="font-medium">Full Day Closure</Label>
              <Switch
                id="is_full_day"
                checked={formData.is_full_day}
                onCheckedChange={handleSwitchChange}
              />
            </div>

            {/* Time Fields - Only shown when not full day */}
            {!formData.is_full_day && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!formData.is_full_day}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!formData.is_full_day}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reason Field */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter reason for closure"
                required
              />
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Closure'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : closures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No shop closures found</p>
            <p className="text-sm text-muted-foreground">Add a closure to get started</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Closure
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {closures.map((closure) => (
            <Card key={closure.id} className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    <span className="font-medium">{format(new Date(closure.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closure.id && deleteClosure(closure.id)}
                    className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <span className="font-semibold">Type:</span>{' '}
                  {closure.is_full_day ? 'Full Day' : 'Partial Day'}
                </div>
                {!closure.is_full_day && (
                  <div className="mb-2">
                    <span className="font-semibold">Time:</span>{' '}
                    {closure.start_time} - {closure.end_time}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Reason:</span>
                  <p className="mt-1 text-muted-foreground">{closure.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopClosures; 