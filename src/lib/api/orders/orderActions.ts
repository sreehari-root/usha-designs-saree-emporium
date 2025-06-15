
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { OrderStatus } from './types';

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
