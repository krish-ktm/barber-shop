import React, { useState, useEffect } from 'react';
import { Clock, Filter, Plus, Search, SortAsc, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';
import { EditServiceDialog } from '@/features/services/EditServiceDialog';
import { AddServiceDialog } from '@/features/services/AddServiceDialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/useApi';
import { 
  getAllServices, 
  createService, 
  updateService,
  deleteService,
  Service
} from '@/api/services/serviceService';
import { useToast } from '@/hooks/use-toast';

export const Services: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page] = useState(1);
  const [limit] = useState(100); // Get more services to allow client-side filtering
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 120]);

  // API Hooks
  const {
    data: servicesData,
    loading: isLoading,
    error: servicesError,
    execute: fetchServices
  } = useApi(getAllServices);
  
  const {
    execute: saveService,
  } = useApi(createService);
  
  const {
    execute: executeUpdateService,
  } = useApi(updateService);
  
  const {
    execute: executeDeleteService,
  } = useApi(deleteService);
  
  useEffect(() => {
    // Convert sort state to API parameter format
    let sortParam = '';
    switch (sortBy) {
      case 'name':
        sortParam = 'name_asc';
        break;
      case 'price':
        sortParam = 'price_desc';
        break;
      case 'duration':
        sortParam = 'duration_desc';
        break;
      case 'category':
        sortParam = 'category_asc';
        break;
      default:
        sortParam = 'name_asc';
    }
    
    // Only send category filter if it's not "all"
    const category = categoryFilter !== 'all' ? categoryFilter : undefined;
    
    fetchServices(page, limit, sortParam, category);
  }, [fetchServices, page, limit, sortBy, categoryFilter]);

  // Set maxPrice and maxDuration based on API data
  const services = servicesData?.services || [];
  const maxPrice = Math.max(...services.map(s => s.price), 200);
  const maxDuration = Math.max(...services.map(s => s.duration), 120);

  // Get all unique categories from API data
  const categories = Array.from(new Set(services.map(service => service.category)));

  // Error handling
  useEffect(() => {
    if (servicesError) {
      toast({
        title: "Error loading services",
        description: servicesError.message,
        variant: "destructive"
      });
    }
  }, [servicesError, toast]);

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

  // Filter services
  const filteredServices = services
    .filter(service => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchLower) ||
        (service.description?.toLowerCase().includes(searchLower) || false);
      if (!searchMatch) return false;
      
      // Selected categories (checkboxes)
      if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
        return false;
      }
      
      // Price range
      if (service.price < priceRange[0] || service.price > priceRange[1]) return false;
      
      // Duration range
      if (service.duration < durationRange[0] || service.duration > durationRange[1]) return false;
      
      return true;
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

  const handleDeleteClick = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingService(service);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    
    setIsDeleting(true);
    try {
      await executeDeleteService(deletingService.id);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      fetchServices(page, limit);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletingService(null);
    }
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    try {
      await saveService(serviceData);
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      fetchServices(page, limit);
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateService = async (serviceData: Partial<Service>) => {
    if (!selectedService) return;
    
    try {
      await executeUpdateService(selectedService.id, serviceData);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      fetchServices(page, limit);
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive"
      });
    }
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
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
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading services...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No services found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-muted/50"
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
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditService(service)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={(e) => handleDeleteClick(service, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
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
        onSave={handleUpdateService}
      />

      <AddServiceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveService}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service "{deletingService?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};