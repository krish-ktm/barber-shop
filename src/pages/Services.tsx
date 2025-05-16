import React, { useState } from 'react';
import { Clock, Filter, Plus, Search, SortAsc, X } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { serviceData } from '@/mocks';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';
import { EditServiceDialog } from '@/features/services/EditServiceDialog';
import { AddServiceDialog } from '@/features/services/AddServiceDialog';

export const Services: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter and sort services
  const filteredServices = serviceData
    .filter(service => {
      const searchLower = searchQuery.toLowerCase();
      const categoryMatch = categoryFilter === 'all' || service.category === categoryFilter;
      
      return (searchQuery === '' || 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)) && categoryMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'duration':
          return b.duration - a.duration;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setCategoryFilter('all');
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditDialog(true);
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    console.log('Saving service:', updatedService);
    // In a real app, this would update the backend
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; className: string }> = {
      haircut: { label: 'Haircut', className: 'bg-blue-100 text-blue-800' },
      beard: { label: 'Beard', className: 'bg-amber-100 text-amber-800' },
      shave: { label: 'Shave', className: 'bg-green-100 text-green-800' },
      color: { label: 'Color', className: 'bg-purple-100 text-purple-800' },
      treatment: { label: 'Treatment', className: 'bg-pink-100 text-pink-800' },
      combo: { label: 'Combo', className: 'bg-indigo-100 text-indigo-800' },
    };

    const categoryInfo = categories[category] || { 
      label: category.charAt(0).toUpperCase() + category.slice(1), 
      className: 'bg-gray-100 text-gray-800' 
    };

    return (
      <Badge variant="outline" className={categoryInfo.className}>
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Services"
        description="Manage your service catalog"
        action={{
          label: "Add Service",
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
                placeholder="Search services..."
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
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="haircut">Haircut</SelectItem>
                  <SelectItem value="beard">Beard</SelectItem>
                  <SelectItem value="shave">Shave</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || sortBy !== 'name' || categoryFilter !== 'all') && (
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
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditService(service)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(service.category)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{service.duration} min</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(service.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <EditServiceDialog
        service={selectedService}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveService}
      />

      <AddServiceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};