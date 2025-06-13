import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReviewsPagination } from '@/components/ReviewsPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, Trash, Star, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Review, CreateReviewRequest } from '@/api/services/reviewService';
import { CreateReviewForm } from '@/components/CreateReviewForm';

// Type for the UI-friendly review object
interface UIReview {
  id: string;
  customerName: string;
  customerEmail: string;
  staffName: string;
  staffPosition: string;
  rating: number;
  reviewText: string | null;
  date: string;
  isApproved: boolean;
}

// Helper function to transform API review to UI review
const transformReview = (review: Review): UIReview => {
  return {
    id: review.id,
    customerName: review.customer_name || review.customer?.name || 'Unknown Customer',
    customerEmail: review.customer?.email || 'No email provided',
    staffName: review.staff_name || review.staff?.user?.name || 'Unknown Staff',
    staffPosition: review.staff?.user?.role || 'Staff',
    rating: review.rating,
    reviewText: review.text,
    date: review.date,
    isApproved: review.is_approved
  };
};

// Component to display rating stars
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      ))}
    </div>
  );
};

const AdminReviews: React.FC = () => {
  const {
    reviews,
    loading,
    totalCount,
    pages,
    page,
    setPage,
    setFilters,
    approveReview,
    deleteReview,
    createReview
  } = useReviews();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<UIReview | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Transform API reviews to UI-friendly format
  const uiReviews = reviews.map(transformReview);

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setSelectedReviewId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedReviewId) {
      await deleteReview(selectedReviewId);
      setDeleteDialogOpen(false);
      setSelectedReviewId(null);
    }
  };

  // Handle view review
  const handleViewClick = (review: UIReview) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  // Handle approve review
  const handleApproveClick = async (id: string) => {
    await approveReview(id);
  };

  // Handle create review
  const handleCreateReview = async (data: CreateReviewRequest) => {
    const success = await createReview(data);
    if (success) {
      setCreateDialogOpen(false);
    }
    return success;
  };

  // Handle filter changes
  const handleApprovalFilterChange = (value: string) => {
    if (value === 'all') {
      setFilters({ approved: undefined });
    } else if (value === 'approved') {
      setFilters({ approved: true });
    } else if (value === 'pending') {
      setFilters({ approved: false });
    }
  };

  const handleSortChange = (value: string) => {
    setFilters({ sort: value });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Reviews</h1>
        <div className="flex gap-4">
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Review
          </Button>
          <Select onValueChange={handleApprovalFilterChange} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved Only</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={handleSortChange} defaultValue="date_desc">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest First</SelectItem>
              <SelectItem value="date_asc">Oldest First</SelectItem>
              <SelectItem value="rating_desc">Highest Rating</SelectItem>
              <SelectItem value="rating_asc">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviews ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uiReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    uiReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          {format(new Date(review.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div>{review.customerName}</div>
                          <div className="text-sm text-muted-foreground">{review.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div>{review.staffName}</div>
                          <div className="text-sm text-muted-foreground">{review.staffPosition}</div>
                        </TableCell>
                        <TableCell>
                          <RatingStars rating={review.rating} />
                        </TableCell>
                        <TableCell>
                          {review.isApproved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewClick(review)}
                            >
                              View
                            </Button>
                            {!review.isApproved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveClick(review.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(review.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {pages > 1 && (
                <div className="flex justify-center mt-4">
                  <ReviewsPagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Customer</h3>
                  <p>{selectedReview.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.customerEmail}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-medium">Date</h3>
                  <p>{format(new Date(selectedReview.date), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Staff</h3>
                <p>{selectedReview.staffName} ({selectedReview.staffPosition})</p>
              </div>
              
              <div>
                <h3 className="font-medium">Rating</h3>
                <div className="flex items-center gap-2">
                  <RatingStars rating={selectedReview.rating} />
                  <span>{selectedReview.rating}/5</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Review</h3>
                <p className="whitespace-pre-wrap">
                  {selectedReview.reviewText || 'No review text provided.'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Status</h3>
                {selectedReview.isApproved ? (
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedReview && !selectedReview.isApproved && (
              <Button onClick={() => {
                approveReview(selectedReview.id);
                setViewDialogOpen(false);
              }}>
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Review Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
            <DialogDescription>
              Create a new customer review for a staff member.
            </DialogDescription>
          </DialogHeader>
          <CreateReviewForm 
            onSubmit={handleCreateReview}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews; 