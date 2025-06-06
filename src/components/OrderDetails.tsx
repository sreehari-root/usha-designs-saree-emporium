
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Order } from '@/lib/api/orders';
import { addReview, checkCanReview } from '@/lib/api/reviews';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  const { toast } = useToast();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [canReviewProduct, setCanReviewProduct] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check review eligibility for each product in completed orders
    if (order.status === 'completed' && order.order_items) {
      order.order_items.forEach(async (item) => {
        const canReview = await checkCanReview(item.product_id, order.id);
        setCanReviewProduct(prev => ({
          ...prev,
          [item.product_id]: canReview
        }));
      });
    }
  }, [order]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Shipped</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedProduct) return;

    const success = await addReview(selectedProduct.product_id, rating, comment, order.id);
    if (success) {
      setShowReviewModal(false);
      setSelectedProduct(null);
      setRating(5);
      setComment('');
      // Update the can review status
      setCanReviewProduct(prev => ({
        ...prev,
        [selectedProduct.product_id]: false
      }));
    }
  };

  const openReviewModal = (item: any) => {
    setSelectedProduct(item);
    setShowReviewModal(true);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed on {format(new Date(order.created_at), 'PPP')}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-lg font-semibold mt-1">₹{order.total.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.shipping_address && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
              <div className="text-sm">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                <p>Phone: {order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {order.order_items && order.order_items.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        <img 
                          src={item.products?.image || '/placeholder.svg'} 
                          alt={item.products?.name || 'Product'} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.products?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      {order.status === 'completed' && canReviewProduct[item.product_id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => openReviewModal(item)}
                        >
                          Write Review
                        </Button>
                      )}
                      {order.status === 'completed' && !canReviewProduct[item.product_id] && (
                        <p className="text-xs text-muted-foreground mt-2">Review submitted</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-md overflow-hidden">
                  <img 
                    src={selectedProduct.products?.image || '/placeholder.svg'} 
                    alt={selectedProduct.products?.name || 'Product'} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedProduct.products?.name}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="comment">Review Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderDetails;
