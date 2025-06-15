
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AdminLayout from '@/components/layout/AdminLayout';
import CustomerTable from '@/components/admin/customers/CustomerTable';
import CustomerDetailModal from '@/components/admin/customers/CustomerDetailModal';
import { CustomerType, fetchCustomers, getCustomerOrders } from '@/lib/api/customers';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const customersPerPage = 10;
  
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomers();
  }, []);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.first_name && customer.first_name.toLowerCase().includes(searchLower)) ||
      (customer.last_name && customer.last_name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  });
  
  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const pageCount = Math.ceil(filteredCustomers.length / customersPerPage);
  
  const viewCustomer = async (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
    
    try {
      const orders = await getCustomerOrders(customer.id);
      setCustomerOrders(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setCustomerOrders([]);
    }
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
            
            <CustomerTable 
              customers={currentCustomers}
              isLoading={isLoading}
              onViewCustomer={viewCustomer}
            />
            
            {filteredCustomers.length > customersPerPage && (
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
      
      <CustomerDetailModal 
        customer={selectedCustomer}
        customerOrders={customerOrders}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCustomer(null);
        }}
      />
    </AdminLayout>
  );
};

export default CustomersPage;
