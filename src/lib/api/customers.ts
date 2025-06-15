
import { supabase } from '@/integrations/supabase/client';

export interface CustomerType {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
  last_order_date?: string;
}

export const fetchCustomers = async (): Promise<CustomerType[]> => {
  try {
    console.log('Fetching customers data...');
    
    // Check if user is authenticated first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('No authenticated user:', userError);
      return [];
    }

    console.log('Current user:', user.id);

    // Verify admin status using the existing is_admin function
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return [];
    }

    console.log('Is admin check result:', isAdminData);

    if (!isAdminData) {
      console.error('User is not admin');
      return [];
    }

    // Get all user emails using the fixed RPC function
    let allUserEmails: Array<{id: string, email: string}> = [];
    try {
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_emails', { user_ids: [] });

      if (emailError) {
        console.error('Error fetching all user emails:', emailError);
        return [];
      }

      allUserEmails = emailData || [];
      console.log('All user emails fetched:', allUserEmails.length);
    } catch (error) {
      console.error('Failed to fetch user emails:', error);
      return [];
    }

    if (allUserEmails.length === 0) {
      console.log('No users found in auth.users');
      return [];
    }

    // Get user IDs to fetch profiles for
    const userIds = allUserEmails.map(u => u.id);
    
    // Get profiles for these users (some may not have profiles yet)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    console.log('Profiles fetched:', profiles?.length || 0);

    // Get orders information for each user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('user_id, total, created_at, status');

    if (ordersError) {
      console.error('Error fetching orders for customers:', ordersError);
    }

    console.log('Orders fetched for customer stats:', orders?.length || 0);

    // Process orders data to calculate stats
    const customerStats = new Map();
    
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        if (!customerStats.has(order.user_id)) {
          customerStats.set(order.user_id, {
            orders_count: 0,
            total_spent: 0,
            last_order_date: null
          });
        }
        
        const stats = customerStats.get(order.user_id);
        stats.orders_count += 1;
        stats.total_spent += order.total;
        
        const orderDate = new Date(order.created_at);
        if (!stats.last_order_date || orderDate > new Date(stats.last_order_date)) {
          stats.last_order_date = order.created_at;
        }
      });
    }

    // Combine the data - create customers for all authenticated users
    const customers = allUserEmails.map(userEmail => {
      const profile = profiles?.find(p => p.id === userEmail.id);
      const stats = customerStats.get(userEmail.id) || {
        orders_count: 0,
        total_spent: 0,
        last_order_date: null
      };
      
      return {
        id: userEmail.id,
        email: userEmail.email,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        phone: profile?.phone || null,
        address: profile?.address || null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        orders_count: stats.orders_count,
        total_spent: stats.total_spent,
        last_order_date: stats.last_order_date
      };
    });

    console.log('Customer data processed:', customers.length);
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const getCustomerOrders = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total,
        status,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products:product_id (name)
        )
      `)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
};
