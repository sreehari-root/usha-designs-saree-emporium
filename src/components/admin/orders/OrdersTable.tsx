
import React from 'react';
import { Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Order, OrderStatus } from '@/lib/api/orders';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const OrdersTable = ({ orders, onViewOrder, onUpdateStatus }: OrdersTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Shipped</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders to display</p>
      </div>
    );
  }

  console.log('OrdersTable: Rendering orders:', orders.length);
  console.log('OrdersTable: Order details:', orders.map(o => ({
    id: o.id.slice(0, 8),
    user_id: o.user_id.slice(0, 8),
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    total: o.total,
    status: o.status
  })));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            console.log('OrdersTable: Rendering order:', order.id.slice(0, 8), 'Customer:', order.customer_name, 'User ID:', order.user_id.slice(0, 8));
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{order.id.slice(0, 8)}...</div>
                    <div className="text-xs text-muted-foreground">
                      User: {order.user_id.slice(0, 8)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer_name || 'Unknown Customer'}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_email || 'No email available'}
                    </p>
                    {order.shipping_address?.firstName && order.shipping_address?.lastName && (
                      <p className="text-xs text-muted-foreground">
                        Shipping: {order.shipping_address.firstName} {order.shipping_address.lastName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(order.created_at), 'PP')}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>₹{order.total.toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Change Status</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order.id, 'pending')}
                          disabled={order.status === 'pending'}
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order.id, 'processing')}
                          disabled={order.status === 'processing'}
                        >
                          Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order.id, 'shipped')}
                          disabled={order.status === 'shipped'}
                        >
                          Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order.id, 'completed')}
                          disabled={order.status === 'completed'}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(order.id, 'cancelled')}
                          disabled={order.status === 'cancelled'}
                          className="text-red-600"
                        >
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
