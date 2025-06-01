import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  commission: number;
  imageUrl?: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ProductDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the product details below.'
              : 'Fill in the details to add a new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <ProductForm 
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
} 