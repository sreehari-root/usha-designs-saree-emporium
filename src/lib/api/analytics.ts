import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentReviews: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales_count: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Analytics: Fetching dashboard stats...');
    
    // Check admin status first
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdminData) {
      console.error('Analytics: Not admin or error checking admin status:', adminError);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        recentReviews: 0,
      };
    }

    // Get total orders and revenue with detailed logging
    console.log('Analytics: Fetching orders for dashboard stats...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total, status, created_at');

    if (ordersError) {
      console.error('Analytics: Error fetching orders for dashboard:', ordersError);
      throw ordersError;
    }

    console.log('Analytics: Orders fetched for dashboard:', orders?.length || 0);

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

    console.log('Analytics: Dashboard stats calculated:', {
      totalOrders,
      totalRevenue,
      pendingOrders
    });

    // Get total customers using the fixed RPC function - get all users
    let totalCustomers = 0;
    try {
      console.log('Analytics: Fetching all customers count...');
      const { data: allUsers, error: customersError } = await supabase
        .rpc('get_user_emails', { user_ids: [] });

      if (customersError) {
        console.error('Analytics: Error fetching user count:', customersError);
        // Fallback to profiles count
        const { count: profileCount, error: profileError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!profileError) {
          totalCustomers = profileCount || 0;
        }
      } else {
        totalCustomers = allUsers?.length || 0;
      }
      
      console.log('Analytics: Total customers count:', totalCustomers);
    } catch (error) {
      console.error('Analytics: Error getting customer count:', error);
      // Final fallback to profiles
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      totalCustomers = profileCount || 0;
    }

    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('Analytics: Error fetching products count:', productsError);
      throw productsError;
    }

    // Get low stock products (stock < 10)
    const { count: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10);

    if (lowStockError) {
      console.error('Analytics: Error fetching low stock products:', lowStockError);
      throw lowStockError;
    }

    // Get recent reviews count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (reviewsError) {
      console.error('Analytics: Error fetching reviews count:', reviewsError);
      throw reviewsError;
    }

    const finalStats = {
      totalOrders,
      totalRevenue,
      totalCustomers, // This now correctly uses all authenticated users count
      totalProducts: totalProducts || 0,
      pendingOrders,
      lowStockProducts: lowStockProducts || 0,
      recentReviews: recentReviews || 0,
    };

    console.log('Analytics: Final dashboard stats:', finalStats);
    return finalStats;
  } catch (error) {
    console.error('Analytics: Error fetching dashboard stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      recentReviews: 0,
    };
  }
};

export const getSalesOverTime = async (): Promise<SalesDataPoint[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group orders by date and sum revenue
    const salesByDate: { [key: string]: number } = {};
    
    orders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + order.total;
    });

    return Object.entries(salesByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    return [];
  }
};

export const getTopProducts = async (): Promise<TopProduct[]> => {
  try {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products!inner(name)
      `);

    if (error) throw error;

    // Group by product and calculate totals
    const productStats: { [key: string]: { name: string; sales_count: number; revenue: number } } = {};

    orderItems?.forEach(item => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = {
          name: item.products.name,
          sales_count: 0,
          revenue: 0,
        };
      }
      productStats[productId].sales_count += item.quantity;
      productStats[productId].revenue += item.price * item.quantity;
    });

    return Object.entries(productStats)
      .map(([id, stats]) => ({
        id,
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
};

export const getRecentOrders = async (): Promise<RecentOrder[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return orders || [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};
