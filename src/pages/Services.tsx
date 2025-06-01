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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export const Services: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 120]);

  // Get all unique categories
  const categories = Array.from(new Set(serviceData.map(service => service.category)));
  
  // Computed values
  const maxPrice = Math.max(...serviceData.map(s => s.price), 200);
  const maxDuration = Math.max(...serviceData.map(s => s.duration), 120);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== 'name') count++;
    if (categoryFilter !== 'all') count++;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (durationRange[0] > 0 || durationRange[1] < maxDuration) count++;
    return count;
  };

  // Filter and sort services
  const filteredServices = serviceData
    .filter(service => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower);
      if (!searchMatch) return false;
      
      // Category filter (dropdown)
      const categoryMatch = categoryFilter === 'all' || service.category === categoryFilter;
      if (!categoryMatch) return false;
      
      // Selected categories (checkboxes)
      if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
        return false;
      }
      
      // Price range
      if (service.price < priceRange[0] || service.price > priceRange[1]) return false;
      
      // Duration range
      if (service.duration < durationRange[0] || service.duration > durationRange[1]) return false;
      
      return true;
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
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setDurationRange([0, maxDuration]);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditDialog(true);
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    console.log('Saving service:', updatedService);
    // In a real app, this would update the backend
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(value)) {
        return prev.filter(c => c !== value);
      } else {
        return [...prev, value];
      }
    });
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

            <div className="hidden sm:flex items-center gap-3">
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
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No services found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
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
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{service.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(service.price)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
                  <SelectItem value="price">Price (High to Low)</SelectItem>
                  <SelectItem value="duration">Duration (Long to Short)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox 
                      id={`category-${category}`} 
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Price Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={5}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{formatCurrency(priceRange[0])}</div>
                <div>{formatCurrency(priceRange[1])}</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Duration Range</label>
              <div className="px-1">
                <Slider
                  defaultValue={[0, maxDuration]}
                  min={0}
                  max={maxDuration}
                  step={5}
                  value={durationRange}
                  onValueChange={(value) => setDurationRange(value as [number, number])}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{durationRange[0]} min</div>
                <div>{durationRange[1]} min</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => {
                  // Set short services filter
                  setDurationRange([0, 30]);
                }}>
                  Short Services
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set premium services filter
                  setPriceRange([50, maxPrice]);
                }}>
                  Premium
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set haircut filter
                  setSelectedCategories(['haircut']);
                }}>
                  Haircuts Only
                </Button>
                <Button variant="outline" onClick={() => {
                  // Set combo services filter
                  setSelectedCategories(['combo']);
                }}>
                  Combo Services
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