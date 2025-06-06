
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('yearly');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 0,
    monthlySales: [],
    categoryData: [],
    topProducts: [],
    ordersByStatus: [],
  });

  useEffect(() => {
    loadReportsData();
  }, [timeRange]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      // Fetch orders with details
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            price,
            products(name, category_id, categories(name))
          )
        `);

      // Fetch all products for inventory data
      const { data: products } = await supabase
        .from('products')
        .select('*, categories(name)');

      // Fetch profiles count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      if (orders && products && profiles) {
        // Calculate total revenue and orders
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const totalCustomers = profiles.length;

        // Calculate monthly sales (last 12 months)
        const monthlySales = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
          
          const monthOrders = orders.filter(order => 
            order.created_at.startsWith(monthKey)
          );
          
          return {
            name: date.toLocaleString('default', { month: 'short' }),
            sales: monthOrders.reduce((sum, order) => sum + order.total, 0)
          };
        }).reverse();

        // Calculate category distribution
        const categoryMap = new Map();
        orders.forEach(order => {
          order.order_items?.forEach(item => {
            const categoryName = item.products?.categories?.name || 'Uncategorized';
            const revenue = item.price * item.quantity;
            categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + revenue);
          });
        });

        const totalCategoryRevenue = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
        const categoryData = Array.from(categoryMap.entries()).map(([name, revenue]) => ({
          name,
          value: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0
        }));

        // Calculate top products by sales
        const productMap = new Map();
        orders.forEach(order => {
          order.order_items?.forEach(item => {
            const productName = item.products?.name || 'Unknown Product';
            const revenue = item.price * item.quantity;
            const existing = productMap.get(productName) || { sales: 0, revenue: 0 };
            productMap.set(productName, {
              sales: existing.sales + item.quantity,
              revenue: existing.revenue + revenue
            });
          });
        });

        const topProducts = Array.from(productMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate orders by status
        const statusMap = new Map();
        orders.forEach(order => {
          statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
        });

        const ordersByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));

        setDashboardData({
          totalRevenue,
          totalOrders,
          totalCustomers,
          conversionRate: totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100) : 0,
          monthlySales,
          categoryData,
          topProducts,
          ordersByStatus,
        });
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportType: string) => {
    console.log(`Downloading ${reportType} report...`);
    // In a real app, this would trigger a download of the report
    alert(`${reportType} report download started`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading reports...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">View business performance and generate reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              defaultValue={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Last 7 days</SelectItem>
                <SelectItem value="monthly">Last 30 days</SelectItem>
                <SelectItem value="quarterly">Last 3 months</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    From {dashboardData.totalOrders} orders
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total orders placed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Registered users
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{dashboardData.totalOrders > 0 ? Math.round(dashboardData.totalRevenue / dashboardData.totalOrders).toLocaleString('en-IN') : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Per order average
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Sales Overview</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => downloadReport('sales')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <CardDescription>Monthly sales for the current year</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Sales by Category</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => downloadReport('categories')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {dashboardData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No sales data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sales Trend</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => downloadReport('sales-trend')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <CardDescription>Monthly sales performance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products with the highest revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {dashboardData.topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={dashboardData.topProducts}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No product sales data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current status of all orders</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {dashboardData.ordersByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No order data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products by Revenue</CardTitle>
                  <CardDescription>Products generating the most revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {dashboardData.topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No product revenue data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Revenue distribution by product category</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {dashboardData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>Customer statistics and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dashboardData.totalCustomers}</div>
                    <p className="text-muted-foreground">Total Customers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dashboardData.totalOrders}</div>
                    <p className="text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {dashboardData.totalCustomers > 0 ? (dashboardData.totalOrders / dashboardData.totalCustomers).toFixed(1) : 0}
                    </div>
                    <p className="text-muted-foreground">Orders per Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
