
import React, { useState } from 'react';
import { Users, Search, Mail, Phone, Eye } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock customers data
const mockCustomers = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    dateJoined: new Date(2024, 9, 15),
    totalOrders: 5,
    totalSpent: 27500,
    lastOrder: new Date(2025, 4, 20),
    address: {
      street: '42 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001'
    }
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+91 87654 32109',
    dateJoined: new Date(2025, 0, 10),
    totalOrders: 3,
    totalSpent: 15200,
    lastOrder: new Date(2025, 4, 21),
    address: {
      street: '78 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001'
    }
  },
  {
    id: 3,
    name: 'Vijay Kumar',
    email: 'vijay.k@example.com',
    phone: '+91 76543 21098',
    dateJoined: new Date(2024, 11, 5),
    totalOrders: 7,
    totalSpent: 42700,
    lastOrder: new Date(2025, 4, 22),
    address: {
      street: '23 MG Road',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001'
    }
  },
  {
    id: 4,
    name: 'Ananya Singh',
    email: 'ananya.s@example.com',
    phone: '+91 65432 10987',
    dateJoined: new Date(2025, 2, 18),
    totalOrders: 2,
    totalSpent: 9500,
    lastOrder: new Date(2025, 4, 23),
    address: {
      street: '56 Gandhi Nagar',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001'
    }
  },
  {
    id: 5,
    name: 'Kiran Rao',
    email: 'kiran.r@example.com',
    phone: '+91 54321 09876',
    dateJoined: new Date(2025, 1, 7),
    totalOrders: 4,
    totalSpent: 18800,
    lastOrder: new Date(2025, 4, 19),
    address: {
      street: '89 Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302001'
    }
  }
];

// Mock orders for customer detail view
const mockCustomerOrders = [
  { id: 'ORD-1001', date: new Date(2025, 4, 20), total: 12500, status: 'completed' },
  { id: 'ORD-1002', date: new Date(2025, 3, 15), total: 7200, status: 'completed' },
  { id: 'ORD-1003', date: new Date(2025, 2, 5), total: 4800, status: 'completed' },
  { id: 'ORD-1004', date: new Date(2025, 1, 10), total: 3000, status: 'completed' }
];

const CustomersPage = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const customersPerPage = 10;
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm)
    );
  });
  
  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const pageCount = Math.ceil(filteredCustomers.length / customersPerPage);
  
  const viewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-muted-foreground">View and manage customer information</p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
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
                  {currentCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(customer.dateJoined, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell>
                        ₹{customer.totalSpent.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewCustomer(customer)}
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
            
            {filteredCustomers.length > 0 && pageCount > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(currentPage - 2 + i, pageCount));
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                        className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Customer Detail Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(selectedCustomer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                  <p className="text-muted-foreground">Customer since {format(selectedCustomer.dateJoined, 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
                    <div className="mt-1">
                      <p>{selectedCustomer.address.street}</p>
                      <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Order Summary</h3>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">{selectedCustomer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-medium">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Order:</span>
                        <span className="font-medium">{format(selectedCustomer.lastOrder, 'MMM dd, yyyy')}</span>
                      </div>
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
                      {mockCustomerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{format(order.date, 'MMM dd, yyyy')}</TableCell>
                          <TableCell>₹{order.total.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                              {order.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CustomersPage;
