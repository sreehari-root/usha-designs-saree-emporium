
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  shipping_address: any;
  payment_intent: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: {
    name: string;
    image: string | null;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders for admin dashboard...');
    
    // Get all orders with order items and product information
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

    console.log('Raw orders data:', orders);

    if (!orders || orders.length === 0) {
      console.log('No orders found');
      return [];
    }

    // Get profile data for customer names
    const userIds = [...new Set(orders.map(order => order.user_id))];
    console.log('User IDs to fetch profiles for:', userIds);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    console.log('Profiles data:', profiles);

    // Get auth users for email addresses
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map();
    
    if (users && !usersError) {
      users.forEach(user => {
        userEmailMap.set(user.id, user.email);
      });
    }

    const processedOrders = orders.map(order => {
      // Get customer name from profiles
      const profile = profiles?.find(p => p.id === order.user_id);
      const profileName = profile && profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : null;

      // Fallback to shipping address if profile name not available
      const shippingAddr = order.shipping_address as ShippingAddress | null;
      let shippingName = null;
      
      if (shippingAddr && typeof shippingAddr === 'object') {
        if (shippingAddr.firstName && shippingAddr.lastName) {
          shippingName = `${shippingAddr.firstName} ${shippingAddr.lastName}`.trim();
        }
      }

      const customerName = profileName || shippingName || 'Unknown Customer';
      const customerEmail = userEmailMap.get(order.user_id) || 'Email not available';

      console.log(`Order ${order.id}: profile name = ${profileName}, shipping name = ${shippingName}, final = ${customerName}`);

      return {
        ...order,
        customer_name: customerName,
        customer_email: customerEmail
      };
    });

    console.log('Processed orders:', processedOrders);
    return processedOrders;

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

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    toast({
      title: "Order Updated",
      description: `Order status has been updated to ${status}.`,
    });

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    toast({
      title: "Error",
      description: "Failed to update order status.",
      variant: "destructive"
    });
    return false;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    // First delete order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Then delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (orderError) throw orderError;

    toast({
      title: "Order Deleted",
      description: "Order has been successfully deleted.",
    });

    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    toast({
      title: "Error",
      description: "Failed to delete order.",
      variant: "destructive"
    });
    return false;
  }
};
