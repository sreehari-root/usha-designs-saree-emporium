
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Users, User, BarChart2, Settings, LogOut, Package, FileText, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import AdminMenu from '@/components/AdminMenu';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  
  // Mock stats for the dashboard
  const stats = {
    totalOrders: 156,
    totalRevenue: 1875000,
    totalCustomers: 324,
    totalProducts: mockProducts.length,
    pendingOrders: 12,
    lowStockProducts: 5,
    recentReviews: 18,
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Usha Designs</p>
        </div>
        <div className="flex-1 p-4 space-y-1">
          <AdminMenu />
        </div>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-usha-burgundy text-white grid place-items-center">
                <User size={14} />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.user_metadata?.first_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="border-b bg-background p-4">
          <div className="container flex justify-between items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" /> Settings
              </Button>
              <Link to="/" className="text-sm text-usha-burgundy hover:underline flex items-center gap-1">
                <Eye size={16} /> View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <div className="h-12 w-12 rounded-full bg-usha-burgundy/10 text-usha-burgundy grid place-items-center">
                      <ShoppingBag />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +5 new orders today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 grid place-items-center">
                      <BarChart2 />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                      <Users />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +3 new customers today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 grid place-items-center">
                      <Package />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.lowStockProducts} items low in stock
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
                          <div>Order</div>
                          <div>Status</div>
                          <div className="text-right">Amount</div>
                        </div>
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-3 text-sm py-2 border-b">
                              <div>ORD-{1000 + i}</div>
                              <div>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                  Completed
                                </span>
                              </div>
                              <div className="text-right">₹{(3000 + i * 1000).toLocaleString('en-IN')}</div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          View All Orders
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 text-sm font-medium text-muted-foreground">
                          <div className="col-span-3">Product</div>
                          <div>Rating</div>
                          <div>Stock</div>
                          <div className="text-right">Sales</div>
                        </div>
                        <div className="space-y-2">
                          {mockProducts.slice(0, 5).map((product) => (
                            <div key={product.id} className="grid grid-cols-6 text-sm py-2 border-b">
                              <div className="col-span-3 flex items-center gap-2">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="truncate">{product.name}</span>
                              </div>
                              <div>{product.rating?.toFixed(1)}</div>
                              <div>
                                {product.inStock ? (
                                  <span className="text-green-600">In Stock</span>
                                ) : (
                                  <span className="text-red-500">Out of Stock</span>
                                )}
                              </div>
                              <div className="text-right">{product.salesCount}</div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" size="sm">
                          View All Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                        <Package size={24} />
                        <span>Add Product</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                        <Tag size={24} />
                        <span>Manage Categories</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                        <ShoppingBag size={24} />
                        <span>Process Orders</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                        <FileText size={24} />
                        <span>Generate Report</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-12">
                      Analytics charts and data visualization will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-12">
                      Sales reports, inventory reports, and other business analytics will be shown here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-12">
                      System notifications, alerts, and messages will appear in this section.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
