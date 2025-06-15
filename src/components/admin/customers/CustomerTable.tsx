
import React from 'react';
import { Eye, Mail, Phone, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface CustomerTableProps {
  customers: CustomerType[];
  isLoading: boolean;
  onViewCustomer: (customer: CustomerType) => void;
}

const CustomerTable = ({ customers, isLoading, onViewCustomer }: CustomerTableProps) => {
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Since</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(customer.first_name, customer.last_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getFullName(customer)}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {customer.email && (
                    <div className="flex items-center">
                      <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {customer.created_at ? format(new Date(customer.created_at), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {customer.orders_count || 0}
              </TableCell>
              <TableCell>
                {formatCurrency(customer.total_spent || 0)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCustomer(customer)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;
