
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/lib/api/orders';

interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
}

const OrdersTab = ({ orders, loading, onViewOrder }: OrdersTabProps) => {
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
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Order ID</div>
              <div>Date</div>
              <div>Status</div>
              <div>Total</div>
              <div>Action</div>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b last:border-b-0">
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
