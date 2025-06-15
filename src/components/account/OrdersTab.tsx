
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { Order, updateOrderStatus } from '@/lib/api/orders';

interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
  onOrderUpdate: () => void;
}

const OrdersTab = ({ orders, loading, onViewOrder, onOrderUpdate }: OrdersTabProps) => {
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

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

  const canCancelOrder = (status: string) => {
    return status === 'pending' || status === 'processing';
  };

  const handleCancelOrder = async (orderId: string) => {
    console.log('Attempting to cancel order:', orderId);
    setCancellingOrderId(orderId);
    
    try {
      const success = await updateOrderStatus(orderId, 'cancelled');
      console.log('Cancel order result:', success);
      
      if (success) {
        // Refresh the orders list immediately
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <p className="text-sm text-muted-foreground">View your recent orders and their status</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Order ID</div>
              <div>Date</div>
              <div>Status</div>
              <div>Total</div>
              <div>Actions</div>
              <div></div>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b last:border-b-0">
                <div className="font-medium">#{order.id.slice(0, 8)}</div>
                <div className="text-sm">{format(new Date(order.created_at), 'M/d/yyyy')}</div>
                <div>{getStatusBadge(order.status)}</div>
                <div className="font-medium">₹{order.total.toLocaleString('en-IN')}</div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewOrder(order)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
                <div>
                  {canCancelOrder(order.status) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={cancellingOrderId === order.id}
                        >
                          <X className="w-4 h-4" />
                          {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel order #{order.id.slice(0, 8)}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Order</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelOrder(order.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancel Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
