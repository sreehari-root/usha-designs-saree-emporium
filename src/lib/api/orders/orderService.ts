
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ShippingAddress } from './types';

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching all orders for admin...');
    
    // Check if user is admin first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return [];
    }

    console.log('Current user:', user.id);

    // Verify admin status
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('is_admin');

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return [];
    }

    console.log('Is admin check result:', isAdminData);

    if (!isAdminData) {
      console.error('User is not admin');
      return [];
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, image)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    console.log('Orders fetched:', orders?.length || 0);

    if (!orders || orders.length === 0) {
      console.log('No orders found');
      return [];
    }

    // Get profile data for customer names
    const userIds = [...new Set(orders.map(order => order.user_id))];
    console.log('Fetching profiles for user IDs:', userIds);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for orders:', profilesError);
    }

    console.log('Profiles for orders:', profiles?.length || 0);

    // Get actual email addresses from auth.users via RPC function
    const { data: userEmails, error: emailError } = await supabase
      .rpc('get_user_emails', { user_ids: userIds });

    if (emailError) {
      console.error('Error fetching user emails:', emailError);
    }

    return orders.map(order => {
      // Get customer name from profiles
      const profile = profiles?.find(p => p.id === order.user_id);
      const profileName = profile && profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : null;

      // Fallback to shipping address if profile name not available
      const shippingAddr = order.shipping_address as ShippingAddress | null;
      const shippingName = shippingAddr && typeof shippingAddr === 'object' && shippingAddr.firstName && shippingAddr.lastName
        ? `${shippingAddr.firstName} ${shippingAddr.lastName}`.trim()
        : null;

      // Get email from RPC result
      const userEmail = userEmails?.find((u: any) => u.id === order.user_id);

      return {
        ...order,
        customer_name: profileName || shippingName || 'Unknown Customer',
        customer_email: userEmail?.email || 'customer@example.com'
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, image)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};
