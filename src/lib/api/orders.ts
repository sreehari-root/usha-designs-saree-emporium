import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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

    if (error) throw error;

    // Get profile data for customer names
    if (orders && orders.length > 0) {
      const userIds = [...new Set(orders.map(order => order.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

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

        return {
          ...order,
          customer_name: profileName || shippingName || 'Unknown Customer',
          customer_email: 'Available in profile' // We don't store email separately in orders
        };
      });
    }

    return orders || [];
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
