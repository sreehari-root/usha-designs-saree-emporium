
import React from 'react';
import { Star, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Review } from '@/lib/api/reviews';

interface ReviewDetailModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

const ReviewDetailModal = ({ review, isOpen, onClose, onApprove, onReject }: ReviewDetailModalProps) => {
  if (!review) return null;

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-md overflow-hidden">
              <img 
                src={review.products?.image || '/placeholder.svg'} 
                alt={review.products?.name || 'Product'} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{review.products?.name || 'Unknown Product'}</h3>
              <p className="text-muted-foreground">Product ID: {review.product_id}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="font-medium">Customer:</p>
                <p>{review.customer_name || 'Anonymous User'}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium">Submitted:</p>
                <p>{format(new Date(review.created_at), 'MMMM dd, yyyy')}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium">Status:</p>
                <p>{getStatusBadge(review.status)}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium">Rating:</p>
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="font-medium mb-2">Comment:</p>
            <p className="text-sm">{review.comment || 'No comment provided'}</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {review.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600"
                  onClick={() => {
                    onApprove(review.id);
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={() => {
                    onReject(review.id);
                    onClose();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailModal;
