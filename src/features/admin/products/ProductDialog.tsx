import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 