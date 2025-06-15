
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Package, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import OrderDetails from '@/components/OrderDetails';
import ProfileTab from '@/components/account/ProfileTab';
import OrdersTab from '@/components/account/OrdersTab';
import WishlistTab from '@/components/account/WishlistTab';
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
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    console.log('Loading orders for user:', user.id);
    setLoading(true);
    try {
      const userOrders = await fetchUserOrders(user.id);
      console.log('User orders loaded:', userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleOrderUpdate = async () => {
    console.log('Order update triggered, refreshing orders...');
    await loadUserOrders();
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
                    My Orders ({orders.length})
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    My Wishlist
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <ProfileTab />
                </TabsContent>

                <TabsContent value="orders">
                  <OrdersTab 
                    orders={orders}
                    loading={loading}
                    onViewOrder={viewOrder}
                    onOrderUpdate={handleOrderUpdate}
                  />
                </TabsContent>

                <TabsContent value="wishlist">
                  <WishlistTab />
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
