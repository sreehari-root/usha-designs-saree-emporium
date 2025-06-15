
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import { fetchOrders, updateOrderStatus, type Order, type OrderStatus } from '@/lib/api/orders';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const ordersPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    console.log('OrdersPage: Starting to load orders...');
    setLoading(true);
    try {
      const ordersData = await fetchOrders();
      console.log('OrdersPage: Orders received from API:', ordersData);
      console.log('OrdersPage: Number of orders:', ordersData.length);
      
      if (ordersData.length === 0) {
        console.warn('OrdersPage: No orders returned from fetchOrders');
        
        // Let's also try to debug by checking the database directly
        console.log('OrdersPage: Attempting to debug database connection...');
        
        // Add some debugging info
        console.log('OrdersPage: Current window location:', window.location.href);
        console.log('OrdersPage: Orders data structure:', ordersData);
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('OrdersPage: Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  console.log('OrdersPage: Filtered orders:', filteredOrders.length);
  console.log('OrdersPage: All orders for filtering:', orders.map(o => ({ id: o.id, status: o.status, customer_name: o.customer_name })));
  
  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const pageCount = Math.ceil(filteredOrders.length / ordersPerPage);
  
  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      await loadOrders(); // Reload orders to get updated data
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">View and manage all customer orders ({orders.length} total)</p>
        </div>
        <Button onClick={loadOrders} variant="outline">
          Refresh Orders
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Order List</CardTitle>
          {orders.length === 0 && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Information:</h4>
              <p className="text-sm text-yellow-700 mb-2">
                No orders found. This could mean:
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>No orders have been placed yet</li>
                <li>There might be an issue with the database connection</li>
                <li>The RPC function for fetching user emails might not be working</li>
                <li>Row Level Security policies might be blocking access</li>
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                Check the browser console for detailed error logs.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Status
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
                  Shipped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found in the database</p>
              <p className="text-sm text-muted-foreground mt-2">
                Orders will appear here once customers make purchases
              </p>
              <Button onClick={loadOrders} variant="outline" className="mt-4">
                Try Refreshing
              </Button>
            </div>
          ) : (
            <>
              <OrdersTable 
                orders={currentOrders}
                onViewOrder={viewOrder}
                onUpdateStatus={handleUpdateOrderStatus}
              />
              
              {filteredOrders.length > 0 && pageCount > 1 && (
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
            </>
          )}
        </CardContent>
      </Card>
      
      <OrderDetailModal 
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersPage;
