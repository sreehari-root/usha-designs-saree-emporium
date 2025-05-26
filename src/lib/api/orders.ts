
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

    // Get user profiles separately to avoid join issues
    if (orders && orders.length > 0) {
      const userIds = [...new Set(orders.map(order => order.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      // Map profile data to orders
      return orders.map(order => ({
        ...order,
        customer_name: profiles?.find(p => p.id === order.user_id) 
          ? `${profiles.find(p => p.id === order.user_id)?.first_name} ${profiles.find(p => p.id === order.user_id)?.last_name}`.trim()
          : 'Unknown Customer',
        customer_email: 'email@example.com' // You might want to get this from auth.users if needed
      }));
    }

    return orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
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
