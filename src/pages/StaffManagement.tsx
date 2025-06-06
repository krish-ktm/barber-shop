// Rename file to StaffManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, X } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StaffList } from '@/features/staff/StaffList';
import { AddStaffDialog } from '@/features/staff/AddStaffDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { staffData } from '@/mocks';
import { Staff } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils';
import { useApi } from '@/hooks/useApi';
import { getAllStaff, createStaff, updateStaff, deleteStaff, Staff as ApiStaff } from '@/api';

// Convert API staff to our internal Staff type
const mapApiStaffToInternal = (apiStaff: ApiStaff): Staff => {
  return {
    id: apiStaff.id,
    name: apiStaff.name,
    email: apiStaff.email,
    phone: apiStaff.phone || '',
    position: apiStaff.position,
    bio: apiStaff.bio || '',
    services: apiStaff.services || [],
    commissionPercentage: apiStaff.commission_percentage,
    isAvailable: apiStaff.is_available,
    image: apiStaff.image || '/placeholder.jpg',
    totalEarnings: 0, // These would need to come from a separate API call
    totalAppointments: 0,
  };
};

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // API fetch hook
  const {
    loading: staffLoading,
    error: staffError,
    execute: fetchStaff
  } = useApi(getAllStaff);
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [commissionRange, setCommissionRange] = useState<[number, number]>([0, 50]);
  const [earningsRange, setEarningsRange] = useState<[number, number]>([0, 10000]);
  const [appointmentsRange, setAppointmentsRange] = useState<[number, number]>([0, 100]);
  
  // Fetch staff data on component mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        setIsLoading(true);
        const response = await fetchStaff();
        
        if (response.success) {
          // Map API staff to our internal format
          const mappedStaff = response.staff.map(mapApiStaffToInternal);
          setStaff(mappedStaff);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load staff data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load staff:', error);
        toast({
          title: 'Error',
          description: 'Failed to load staff data',
          variant: 'destructive',
        });
        
        // Fallback to mock data for demo purposes
        setStaff(staffData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStaff();
  }, [fetchStaff, toast]);
  
  // Get all unique services across all staff
  const allServices = Array.from(
    new Set(staff.flatMap(staffMember => staffMember.services))
  );
  
  // Computed values
  const maxCommission = Math.max(...staff.map(s => s.commissionPercentage), 50);
  const maxEarnings = Math.max(...staff.map(s => s.totalEarnings), 10000);
  const maxAppointments = Math.max(...staff.map(s => s.totalAppointments), 100);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== 'name') count++;
    if (filterAvailability !== 'all') count++;
    if (selectedServices.length > 0) count++;
    if (commissionRange[0] > 0 || commissionRange[1] < maxCommission) count++;
    if (earningsRange[0] > 0 || earningsRange[1] < maxEarnings) count++;
    if (appointmentsRange[0] > 0 || appointmentsRange[1] < maxAppointments) count++;
    return count;
  };

  // Filter and sort staff
  const filteredStaff = staff
    .filter(staffMember => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = searchQuery === '' || 
        staffMember.name.toLowerCase().includes(searchLower) ||
        staffMember.email.toLowerCase().includes(searchLower) ||
        staffMember.phone.includes(searchQuery);
      if (!searchMatch) return false;
      
      // Availability filter
      const availabilityMatch = filterAvailability === 'all' || 
        (filterAvailability === 'available' ? staffMember.isAvailable : !staffMember.isAvailable);
      if (!availabilityMatch) return false;
      
      // Services filter
      if (selectedServices.length > 0 && 
          !selectedServices.some(service => staffMember.services.includes(service))) {
        return false;
      }
      
      // Commission range
      if (staffMember.commissionPercentage < commissionRange[0] || 
          staffMember.commissionPercentage > commissionRange[1]) return false;
      
      // Earnings range
      if (staffMember.totalEarnings < earningsRange[0] || 
          staffMember.totalEarnings > earningsRange[1]) return false;
      
      // Appointments range
      if (staffMember.totalAppointments < appointmentsRange[0] || 
          staffMember.totalAppointments > appointmentsRange[1]) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'appointments':
          return b.totalAppointments - a.totalAppointments;
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilterAvailability('all');
    setSelectedServices([]);
    setCommissionRange([0, maxCommission]);
    setEarningsRange([0, maxEarnings]);
    setAppointmentsRange([0, maxAppointments]);
  };
  
  const handleServiceChange = (value: string) => {
    setSelectedServices(prev => {
      if (prev.includes(value)) {
        return prev.filter(s => s !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleAddStaff = async (newStaff: Staff) => {
    try {
      setIsLoading(true);
      
      // Convert to API format
      const apiStaffData = {
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        position: newStaff.position,
        bio: newStaff.bio,
        commission_percentage: newStaff.commissionPercentage,
        is_available: newStaff.isAvailable,
        services: newStaff.services,
        // Add other required fields for your API
        password: 'tempPassword123', // This would be changed by the user later
      };
      
      // Call the API
      const response = await createStaff(apiStaffData);
      
      if (response.success) {
        // Add the new staff to the local state
        const mappedStaff = mapApiStaffToInternal(response.staff);
        setStaff(prev => [...prev, mappedStaff]);
        
        toast({
          title: 'Staff member added',
          description: `${newStaff.name} has been added to your team.`,
        });
      } else {
        throw new Error('Failed to add staff member');
      }
    } catch (error) {
      console.error('Failed to add staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStaff = async (updatedStaff: Staff) => {
    try {
      setIsLoading(true);
      
      // Convert to API format
      const apiStaffData = {
        name: updatedStaff.name,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        position: updatedStaff.position,
        bio: updatedStaff.bio,
        commission_percentage: updatedStaff.commissionPercentage,
        is_available: updatedStaff.isAvailable,
        services: updatedStaff.services
      };
      
      // Call the API
      const response = await updateStaff(updatedStaff.id, apiStaffData);
      
      if (response.success) {
        // Update the staff in local state
        setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
        
        toast({
          title: 'Staff profile updated',
          description: `${updatedStaff.name}'s profile has been updated.`,
        });
      } else {
        throw new Error('Failed to update staff member');
      }
    } catch (error) {
      console.error('Failed to update staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to update staff member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Staff Management"
        description="View and manage your barber shop staff"
        action={{
          label: "Add Staff",
          onClick: () => setShowAddDialog(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="earnings">Earnings</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setShowFilters(true)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {getActiveFilterCount() > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-pulse text-center">
              <p>Loading staff data...</p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No staff members found with the current filters.</p>
            {getActiveFilterCount() > 0 && (
              <Button variant="link" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <StaffList 
            staff={filteredStaff} 
            onUpdate={handleUpdateStaff} 
          />
        )}
      </div>

      <AddStaffDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddStaff}
        existingServices={allServices}
      />

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Services</h3>
              <div className="space-y-2">
                {allServices.map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`service-${service}`} 
                      checked={selectedServices.includes(service)}
                      onCheckedChange={() => handleServiceChange(service)}
                    />
                    <Label htmlFor={`service-${service}`}>{service}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Commission Rate</h3>
              <div className="pt-4 px-2">
                <Slider 
                  value={commissionRange} 
                  onValueChange={value => setCommissionRange(value as [number, number])} 
                  min={0} 
                  max={maxCommission} 
                  step={1}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{commissionRange[0]}%</span>
                  <span>{commissionRange[1]}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Total Earnings</h3>
              <div className="pt-4 px-2">
                <Slider 
                  value={earningsRange} 
                  onValueChange={value => setEarningsRange(value as [number, number])} 
                  min={0} 
                  max={maxEarnings} 
                  step={100}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(earningsRange[0])}</span>
                  <span>{formatCurrency(earningsRange[1])}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Total Appointments</h3>
              <div className="pt-4 px-2">
                <Slider 
                  value={appointmentsRange} 
                  onValueChange={value => setAppointmentsRange(value as [number, number])} 
                  min={0} 
                  max={maxAppointments} 
                  step={5}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{appointmentsRange[0]}</span>
                  <span>{appointmentsRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex flex-row gap-2 sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};