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
import { Badge } from '@/components/ui/badge';
import { staffData } from '@/mocks';

export const Staff: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Filter and sort staff
  const filteredStaff = staffData
    .filter(staff => {
      const searchLower = searchQuery.toLowerCase();
      const availabilityMatch = filterAvailability === 'all' || 
        (filterAvailability === 'available' ? staff.isAvailable : !staff.isAvailable);
      
      return (searchQuery === '' || 
        staff.name.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.phone.includes(searchQuery)) && availabilityMatch;
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

            <div className="flex items-center gap-3">
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

              {(searchQuery || sortBy !== 'name' || filterAvailability !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
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

          <StaffList staff={filteredStaff} />
        </div>
      </div>

      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};