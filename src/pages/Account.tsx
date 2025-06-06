
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, Package, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import ProfileForm from '@/components/ProfileForm';
import OrderDetails from '@/components/OrderDetails';
import { fetchUserOrders, type Order } from '@/lib/api/orders';

const Account = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    const userOrders = await fetchUserOrders(user.id);
    setOrders(userOrders);
    setLoading(false);
  };

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

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please log in to access your account.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (showOrderDetails && selectedOrder) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <OrderDetails 
            order={selectedOrder} 
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
              loadUserOrders(); // Refresh orders after viewing details (in case reviews were added)
            }} 
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and view your orders</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-usha-burgundy text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">Usha Designs</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </CardHeader>
                <CardContent>
                  <Button onClick={signOut} variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Profile
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    My Orders
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    My Wishlist
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <ProfileForm />
                </TabsContent>

                <TabsContent value="orders">
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
                                  onClick={() => viewOrder(order)}
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
                </TabsContent>

                <TabsContent value="wishlist">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Wishlist</CardTitle>
                      <p className="text-sm text-muted-foreground">Items you've saved for later</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Your wishlist is empty</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
