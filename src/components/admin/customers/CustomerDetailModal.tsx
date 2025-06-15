
import React from 'react';
import { Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CustomerType } from '@/lib/api/customers';
import { formatCurrency } from '@/lib/utils';

interface CustomerDetailModalProps {
  customer: CustomerType | null;
  customerOrders: any[];
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailModal = ({ customer, customerOrders, isOpen, onClose }: CustomerDetailModalProps) => {
  if (!customer) return null;

  const getInitials = (first?: string | null, last?: string | null) => {
    let initials = '';
    if (first) initials += first[0].toUpperCase();
    if (last) initials += last[0].toUpperCase();
    return initials || 'U';
  };
  
  const getFullName = (customer: CustomerType) => {
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown User';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials(customer.first_name, customer.last_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{getFullName(customer)}</h2>
              <p className="text-muted-foreground">
                Customer since {format(new Date(customer.created_at), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <div className="mt-1 space-y-1">
                  {customer.email && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {customer.address && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
                  <div className="mt-1">
                    <p>{customer.address}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Order Summary</h3>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-medium">{customer.orders_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-medium">{formatCurrency(customer.total_spent || 0)}</span>
                  </div>
                  {customer.last_order_date && (
                    <div className="flex justify-between">
                      <span>Last Order:</span>
                      <span className="font-medium">
                        {format(new Date(customer.last_order_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Order History</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-50 text-green-700' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailModal;
