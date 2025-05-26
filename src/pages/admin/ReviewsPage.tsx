
import React, { useState, useEffect } from 'react';
import { Star, Search, Eye, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import { fetchReviews, deleteReview, type Review } from '@/lib/api/reviews';

const ReviewsPage = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const reviewsPerPage = 10;

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const reviewsData = await fetchReviews();
    setReviews(reviewsData);
    setLoading(false);
  };
  
  // Filter reviews based on search term and status
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      (review.products?.name && review.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.customer_name && review.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || statusFilter === 'published'; // Since we don't have status field, show all as published
    
    return matchesSearch && matchesStatus;
  });
  
  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const pageCount = Math.ceil(filteredReviews.length / reviewsPerPage);
  
  const viewReview = (review: Review) => {
    setSelectedReview(review);
    setIsViewModalOpen(true);
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    if (success) {
      await loadReviews(); // Reload reviews to get updated data
    }
  };

  const getStatusBadge = (status: string = 'published') => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Published</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">Published</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading reviews...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reviews Management</h1>
            <p className="text-muted-foreground">Manage customer reviews and ratings</p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Product Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Filter by Status
                    {statusFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {statusFilter}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Reviews
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('published')}>
                    Published
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md overflow-hidden">
                            <img 
                              src={review.products?.image || '/placeholder.svg'} 
                              alt={review.products?.name || 'Product'} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{review.customer_name || 'Anonymous User'}</TableCell>
                        <TableCell>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate">{review.comment || 'No comment'}</p>
                        </TableCell>
                        <TableCell>{format(new Date(review.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge('published')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewReview(review)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteReview(review.id)}
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
            
            {filteredReviews.length > 0 && pageCount > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(currentPage - 2 + i, pageCount));
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                        className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Review Detail Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-md overflow-hidden">
                  <img 
                    src={selectedReview.products?.image || '/placeholder.svg'} 
                    alt={selectedReview.products?.name || 'Product'} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{selectedReview.products?.name || 'Unknown Product'}</h3>
                  <p className="text-muted-foreground">Product ID: {selectedReview.product_id}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">Customer:</p>
                    <p>{selectedReview.customer_name || 'Anonymous User'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium">Submitted:</p>
                    <p>{format(new Date(selectedReview.created_at), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium">Status:</p>
                    <p>{getStatusBadge('published')}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium">Rating:</p>
                    <div className="flex">
                      {renderStars(selectedReview.rating)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-medium mb-2">Comment:</p>
                <p className="text-sm">{selectedReview.comment || 'No comment provided'}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ReviewsPage;
