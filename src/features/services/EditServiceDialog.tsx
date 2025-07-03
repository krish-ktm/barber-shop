import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Image } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Service } from '@/api/services/serviceService';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import { getAllCategories, ServiceCategory } from '@/api/services/categoryService';
import { useApi } from '@/hooks/useApi';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  duration: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  category: z.string().min(1, 'Please select a category'),
  imageUrl: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface EditServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Partial<Service>) => void;
}

export const EditServiceDialog: React.FC<EditServiceDialogProps> = ({
  service,
  open,
  onOpenChange,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(service?.imageUrl);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: '',
      imageUrl: '',
      is_active: true,
    },
  });

  const MAX_SIZE_BYTES = 5 * 1024 * 1024;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: 'Image too large',
        description: 'Please select an image smaller than 5 MB.',
        variant: 'destructive',
      });
      e.currentTarget.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      form.setValue('imageUrl', url);
    };
    reader.readAsDataURL(file);
  };

  // Fetch categories
  const {
    data: categoryData,
    execute: fetchCategories,
  } = useApi(getAllCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const defaultCategories = (categoryData?.categories || []).map((c: ServiceCategory) => c.name.toLowerCase());
  const fallbackCategories = ['haircut','beard','shave','color','treatment','combo'];
  const categoriesList = defaultCategories.length > 0 ? defaultCategories : fallbackCategories;

  const currentCat = (service?.category || '').toLowerCase();
  const categories = categoriesList.includes(currentCat)
    ? categoriesList
    : currentCat
      ? [...categoriesList, currentCat]
      : categoriesList;

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        category: (service.category || '').toLowerCase(),
        imageUrl: service.imageUrl || '',
        is_active: service.is_active ?? true,
      });
      setImagePreview(service.imageUrl);
    }
  }, [service, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!service) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        ...values,
        id: service.id
      });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={service?.id ?? 'new'} className="w-[90vw] sm:max-w-[600px] rounded-lg p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Make changes to the service details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter service name" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter service description"
                          className="resize-none"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price and duration */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="whitespace-nowrap">Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            step={5}
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column - image */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center">
                          {imagePreview ? (
                            <div className="relative mb-2 w-full max-w-[220px]">
                              <AspectRatio ratio={1/1} className="bg-muted rounded-md overflow-hidden border">
                                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                              </AspectRatio>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-2 right-2"
                                onClick={() => {
                                  setImagePreview(undefined);
                                  form.setValue('imageUrl', '');
                                }}
                              >Remove</Button>
                            </div>
                          ) : (
                            <div className="w-full max-w-[220px]">
                              <label htmlFor="edit-service-image-upload" className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30">
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                  <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF</p>
                                </div>
                                <input id="edit-service-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                <input type="hidden" {...field} />
                              </label>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>

          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};