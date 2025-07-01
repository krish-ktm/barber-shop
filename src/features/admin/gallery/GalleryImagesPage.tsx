import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import {
  GalleryImage,
  getAllGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '@/api/services/galleryImageService';
import { GalleryImageDialog } from './GalleryImageDialog';

export const GalleryImagesPage: React.FC = () => {
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // API hooks
  const {
    data,
    loading: loadingList,
    error: listError,
    execute: fetchImages,
  } = useApi(getAllGalleryImages);

  const { loading: creating, execute: executeCreate } = useApi(createGalleryImage);
  const { loading: updating, execute: executeUpdate } = useApi(updateGalleryImage);
  const { loading: deleting, execute: executeDelete } = useApi(deleteGalleryImage);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (listError) {
      toast({ title: 'Error', description: listError.message, variant: 'destructive' });
    }
  }, [listError, toast]);

  const handleAdd = () => {
    setSelectedImage(null);
    setDialogOpen(true);
  };

  const handleEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleDeleteClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values: Partial<Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      if (selectedImage) {
        await executeUpdate(selectedImage.id, values);
        toast({ title: 'Updated', description: 'Gallery image updated successfully.' });
      } else {
        await executeCreate(values);
        toast({ title: 'Created', description: 'Gallery image added successfully.' });
      }
      setDialogOpen(false);
      fetchImages();
    } catch {
      // errors handled globally
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedImage) return;
    try {
      await executeDelete(selectedImage.id);
      toast({ title: 'Deleted', description: 'Gallery image deleted.' });
      setDeleteDialogOpen(false);
      fetchImages();
    } catch {
      // error handled
    }
  };

  const images = data?.images || [];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gallery Images</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Image
          </Button>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((img) => (
                  <TableRow key={img.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={img.url} alt={img.title} />
                        <AvatarFallback>
                          <ImageIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{img.title}</TableCell>
                    <TableCell>{img.display_order}</TableCell>
                    <TableCell>{img.is_active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="icon" variant="outline" onClick={() => handleEdit(img)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(img)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <GalleryImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedImage}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this image?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 