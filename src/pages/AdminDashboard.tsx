
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, Users, User, BarChart2, Settings, LogOut, Package, FileText, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import AdminMenu from '@/components/AdminMenu';
import {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getSalesOverTime
} from '@/lib/api/analytics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load stats, orders and products data in parallel
        const [statsData, ordersData, productsData, salesTimeData] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(),
          getTopProducts(),
          getSalesOverTime()
        ]);
        
        setStats(statsData);
        setRecentOrders(ordersData);
        setTopProducts(productsData);
        setSalesData(salesTimeData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const handleAddProduct = () => {
    window.location.href = '/admin/products?action=add';
  };

  const handleManageCategories = () => {
    window.location.href = '/admin/categories';
  };

  const handleProcessOrders = () => {
    window.location.href = '/admin/orders';
  };

  const handleGenerateReport = () => {
    // In a real app, this would generate a downloadable report
    alert('Report generation functionality will be implemented soon!');
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
                    <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalOrders}</div>
                    <div className="h-12 w-12 rounded-full bg-usha-burgundy/10 text-usha-burgundy grid place-items-center">
                      <ShoppingBag />
                    </div>
                  </div>
                  {stats.pendingOrders > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.pendingOrders} pending orders
                    </p>
                  )}
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
                    <div className="text-2xl font-bold">
                      {isLoading ? '...' : formatCurrency(stats.totalRevenue)}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 grid place-items-center">
                      <BarChart2 />
                    </div>
                  </div>
                  {salesData.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {salesData[salesData.length - 1].revenue > salesData[salesData.length - 2].revenue ? '+' : '-'}
                      {Math.abs(salesData[salesData.length - 1].revenue - salesData[salesData.length - 2].revenue).toLocaleString('en-IN')} from previous day
                    </p>
                  )}
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
                    <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalCustomers}</div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 grid place-items-center">
                      <Users />
                    </div>
                  </div>
                  {stats.recentReviews > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.recentReviews} new reviews in the last 30 days
                    </p>
                  )}
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
                    <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalProducts}</div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 grid place-items-center">
                      <Package />
                    </div>
                  </div>
                  {stats.lowStockProducts > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.lowStockProducts} items low in stock
                    </p>
                  )}
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
                          {isLoading ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">Loading orders...</p>
                          ) : recentOrders.length === 0 ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">No orders yet</p>
                          ) : (
                            recentOrders.map((order) => (
                              <div key={order.id} className="grid grid-cols-3 text-sm py-2 border-b">
                                <div>{order.id.slice(0, 8)}</div>
                                <div>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="text-right">{formatCurrency(order.total)}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => window.location.href = '/admin/orders'}
                        >
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
                          <div>Sales</div>
                          <div className="text-right col-span-2">Revenue</div>
                        </div>
                        <div className="space-y-2">
                          {isLoading ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">Loading products...</p>
                          ) : topProducts.length === 0 ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">No products data yet</p>
                          ) : (
                            topProducts.map((product) => (
                              <div key={product.id} className="grid grid-cols-6 text-sm py-2 border-b">
                                <div className="col-span-3 truncate">
                                  {product.name}
                                </div>
                                <div>{product.sales_count}</div>
                                <div className="text-right col-span-2">{formatCurrency(product.revenue)}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => window.location.href = '/admin/products'}
                        >
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
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        onClick={handleAddProduct}
                      >
                        <Package size={24} />
                        <span>Add Product</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        onClick={handleManageCategories}
                      >
                        <Tag size={24} />
                        <span>Manage Categories</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        onClick={handleProcessOrders}
                      >
                        <ShoppingBag size={24} />
                        <span>Process Orders</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        onClick={handleGenerateReport}
                      >
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
                    <CardTitle>Sales Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-12 text-muted-foreground">Loading sales data...</p>
                    ) : salesData.length < 2 ? (
                      <p className="text-center py-12 text-muted-foreground">
                        Not enough sales data available to display chart.
                      </p>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={salesData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              name="Revenue"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products by Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-12 text-muted-foreground">Loading product data...</p>
                    ) : topProducts.length === 0 ? (
                      <p className="text-center py-12 text-muted-foreground">
                        No product sales data available yet.
                      </p>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topProducts}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
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
