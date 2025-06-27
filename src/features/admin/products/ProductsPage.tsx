import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProductDialog } from './ProductDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApi } from '@/hooks/useApi';
import { getAllProducts, createProduct, updateProduct, deleteProduct, Product } from '@/api/services/productService';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProductsPage() {
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  // API hooks
  const {
    data: productsData,
    loading: isLoading,
    error: productsError,
    execute: fetchProducts
  } = useApi(getAllProducts);
  
  const {
    loading: isCreating,
    error: createError,
    execute: executeCreateProduct
  } = useApi(createProduct);
  
  const {
    loading: isUpdating,
    error: updateError,
    execute: executeUpdateProduct
  } = useApi(updateProduct);
  
  const {
    loading: isDeleting,
    error: deleteError,
    execute: executeDeleteProduct
  } = useApi(deleteProduct);

  // Centralised loader
  const loadProducts = useCallback(
    (
      page: number = 1,
      limit: number = 100,
      sort: string = 'name_asc',
      cat: string | undefined = categoryFilter !== 'all' ? categoryFilter : undefined,
      search: string | undefined = searchQuery || undefined,
    ) => {
      fetchProducts(page, limit, sort, cat, search);
    },
    [fetchProducts, categoryFilter, searchQuery]
  );

  // Initial load
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update local state when products data changes
  useEffect(() => {
    if (productsData) {
      setProducts(productsData.products);
    }
  }, [productsData]);
  
  // Handle API errors
  useEffect(() => {
    const error = productsError || createError || updateError || deleteError;
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [productsError, createError, updateError, deleteError, toast]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedProduct) {
        // Update existing product
        const response = await executeUpdateProduct(selectedProduct.id, data);
        if (response && response.product) {
          setProducts(products.map(p => 
            p.id === selectedProduct.id ? response.product : p
          ));
          toast({
            title: 'Success',
            description: 'Product updated successfully',
          });
        }
      } else {
        // Add new product
        const response = await executeCreateProduct(data);
        if (response && response.product) {
          setProducts([...products, response.product]);
          toast({
            title: 'Success',
            description: 'Product added successfully',
          });
        }
      }
      setDialogOpen(false);
    } catch {
      // Error will be handled by the useEffect
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await executeDeleteProduct(selectedProduct.id);
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setDeleteDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } catch {
        // Error will be handled by the useEffect
      }
    }
  };

  // All unique categories from current products
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Search button click handler
  const handleSearchClick = () => {
    setSearchQuery(pendingSearchQuery);
    loadProducts(1, 100, 'name_asc', categoryFilter !== 'all' ? categoryFilter : undefined, pendingSearchQuery || undefined);
  };

  // Category change handler
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    loadProducts(1, 100, 'name_asc', value !== 'all' ? value : undefined, searchQuery || undefined);
  };

  const displayedProducts = products;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button className="flex items-center gap-2 w-full md:w-auto" onClick={handleAddProduct}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>
            Manage your shop's products inventory and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
            {/* Search group (input + button) */}
            <div className="flex flex-1 items-stretch">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                  className="pl-10 h-full"
                  value={pendingSearchQuery}
                  onChange={(e) => setPendingSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchClick();
                  }}
                />
              </div>
              <Button onClick={handleSearchClick} disabled={isLoading} className="gap-2 ml-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="min-w-[140px] w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
            {/* Desktop Table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-md">
                            {product.imageUrl ? (
                              <AvatarImage src={product.imageUrl} alt={product.name} />
                            ) : (
                              <AvatarFallback className="rounded-md bg-muted">
                                {product.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price !== undefined ? `$${parseFloat(product.price.toString()).toFixed(2)}` : '-'}</TableCell>
                      <TableCell>{product.commission !== undefined ? `${parseFloat(product.commission.toString())}%` : '-'}</TableCell>
                      <TableCell>{product.stock !== undefined ? product.stock : '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            disabled={isUpdating}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Mobile list */}
            <div className="space-y-3 md:hidden">
              {displayedProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                </p>
              ) : (
                displayedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-card rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        {product.imageUrl ? (
                          <AvatarImage src={product.imageUrl} alt={product.name} />
                        ) : (
                          <AvatarFallback className="rounded-md bg-muted">
                            {product.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} disabled={isUpdating}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)} disabled={isDeleting}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedProduct || undefined}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
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
} 