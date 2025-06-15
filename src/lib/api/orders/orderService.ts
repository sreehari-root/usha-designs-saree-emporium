
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ShippingAddress } from './types';

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching all orders for admin...');
    
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

    // Fetch ALL orders from database with order items and product details
    console.log('Fetching ALL orders from database...');
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

    console.log('Raw orders data from database:', orders);
    console.log('Total orders fetched:', orders?.length || 0);

    if (!orders || orders.length === 0) {
      console.log('No orders found in database');
      return [];
    }

    // Get all unique user IDs from orders
    const userIds = [...new Set(orders.map(order => order.user_id))];
    console.log('Unique user IDs from orders:', userIds);
    
    // Get user emails for all users who have orders
    let userEmails: Array<{id: string, email: string}> = [];
    try {
      console.log('Calling get_user_emails RPC function...');
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_emails', { user_ids: userIds });

      if (emailError) {
        console.error('Error fetching user emails:', emailError);
        // Fallback: try to get all user emails
        const { data: allEmailData, error: allEmailError } = await supabase
          .rpc('get_user_emails');
        
        if (allEmailError) {
          console.error('Error fetching all user emails:', allEmailError);
          userEmails = [];
        } else {
          userEmails = allEmailData || [];
          console.log('Fallback: All user emails fetched:', userEmails.length);
        }
      } else {
        userEmails = emailData || [];
        console.log('User emails fetched:', userEmails.length);
      }
      
      console.log('User emails data:', userEmails);
    } catch (emailErr) {
      console.error('Failed to fetch user emails:', emailErr);
    }

    // Get profile data for customer names
    console.log('Fetching profiles for user IDs:', userIds);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for orders:', profilesError);
    }

    console.log('Profiles for orders:', profiles?.length || 0);
    console.log('Profiles data:', profiles);

    // Process orders with complete customer information
    const processedOrders = orders.map(order => {
      console.log('Processing order:', order.id, 'for user:', order.user_id);
      
      // Get customer email from RPC result
      const userEmail = userEmails?.find((u: any) => u.id === order.user_id);
      console.log('Found user email for', order.user_id, ':', userEmail);
      
      // Get customer name from profiles
      const profile = profiles?.find(p => p.id === order.user_id);
      console.log('Found profile for', order.user_id, ':', profile);
      
      const profileName = profile && profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : null;

      // Fallback to shipping address if profile name not available
      const shippingAddr = order.shipping_address as ShippingAddress | null;
      const shippingName = shippingAddr && typeof shippingAddr === 'object' && shippingAddr.firstName && shippingAddr.lastName
        ? `${shippingAddr.firstName} ${shippingAddr.lastName}`.trim()
        : null;

      // Use email as final fallback for customer name
      const finalCustomerName = profileName || shippingName || userEmail?.email || `User ${order.user_id.slice(0, 8)}`;
      const finalCustomerEmail = userEmail?.email || 'Email not available';
      
      console.log('Final customer info for order', order.id, ':', {
        name: finalCustomerName,
        email: finalCustomerEmail,
        user_id: order.user_id,
        profileName,
        shippingName,
        userEmail: userEmail?.email
      });

      return {
        ...order,
        customer_name: finalCustomerName,
        customer_email: finalCustomerEmail
      };
    });

    console.log('Final processed orders count:', processedOrders.length);
    console.log('Final processed orders summary:', processedOrders.map(o => ({
      id: o.id.slice(0, 8),
      user_id: o.user_id.slice(0, 8),
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      total: o.total,
      status: o.status,
      created_at: o.created_at
    })));
    
    return processedOrders;
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    return [];
  }
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    console.log('Fetching orders for user:', userId);
    
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

    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }

    console.log('User orders fetched:', orders?.length || 0);
    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};
