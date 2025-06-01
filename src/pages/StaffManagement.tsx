// Rename file to StaffManagement.tsx
import React, { useState } from 'react';
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

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>(staffData);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const { toast } = useToast();
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [commissionRange, setCommissionRange] = useState<[number, number]>([0, 50]);
  const [earningsRange, setEarningsRange] = useState<[number, number]>([0, 10000]);
  const [appointmentsRange, setAppointmentsRange] = useState<[number, number]>([0, 100]);
  
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

  const handleAddStaff = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
    toast({
      title: 'Staff member added',
      description: `${newStaff.name} has been added to your team.`,
    });
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    toast({
      title: 'Staff profile updated',
      description: `${updatedStaff.name}'s profile has been updated.`,
    });
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
                  <SelectItem value="available">Active</SelectItem>
                  <SelectItem value="unavailable">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="h-9 px-4">
              {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <StaffList staff={filteredStaff} onUpdateStaff={handleUpdateStaff} />
        </div>
      </div>
      
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="appointments">Appointments (High to Low)</SelectItem>
                  <SelectItem value="earnings">Earnings (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="available">Active</SelectItem>
                  <SelectItem value="unavailable">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Services</label>
              <div className="grid grid-cols-2 gap-2">
                {allServices.map(service => (
                  <div key={service} className="flex items-center gap-2">
                    <Checkbox 
                      id={`service-${service}`} 
                      checked={selectedServices.includes(service)}
                      onCheckedChange={() => handleServiceChange(service)}
                    />
                    <Label htmlFor={`service-${service}`} className="cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Commission Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxCommission]}
                  min={0}
                  max={maxCommission}
                  step={1}
                  value={commissionRange}
                  onValueChange={(value) => setCommissionRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{commissionRange[0]}%</div>
                <div>{commissionRange[1]}%</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Earnings Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxEarnings]}
                  min={0}
                  max={maxEarnings}
                  step={500}
                  value={earningsRange}
                  onValueChange={(value) => setEarningsRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{formatCurrency(earningsRange[0])}</div>
                <div>{formatCurrency(earningsRange[1])}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-medium">Appointments Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxAppointments]}
                  min={0}
                  max={maxAppointments}
                  step={5}
                  value={appointmentsRange}
                  onValueChange={(value) => setAppointmentsRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{appointmentsRange[0]}</div>
                <div>{appointmentsRange[1]}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => {
                  // Set high commission staff
                  setCommissionRange([20, maxCommission]);
                }}>
                  High Commission
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set top performers
                  setEarningsRange([5000, maxEarnings]);
                }}>
                  Top Performers
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set high appointment staff
                  setAppointmentsRange([50, maxAppointments]);
                }}>
                  Busy Staff
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set haircut specialists
                  setSelectedServices(['haircut']);
                }}>
                  Haircut Experts
                </Button>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex justify-between pt-4 mt-4 border-t">
            <Button variant="outline" onClick={clearFilters}>
              Reset filters
            </Button>
            <SheetClose asChild>
              <Button>Apply filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddStaff}
      />
    </div>
  );
};