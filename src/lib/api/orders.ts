
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
  profiles?: {
    first_name: string;
    last_name: string;
  };
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

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!inner(first_name, last_name),
        order_items(
          *,
          products!inner(name, image)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
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
