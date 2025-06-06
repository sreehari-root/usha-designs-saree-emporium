
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CheckoutData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  paymentMethod: string;
  cartItems: any[];
  total: number;
}

export const processCheckout = async (checkoutData: CheckoutData): Promise<boolean> => {
  try {
    console.log('Processing checkout with data:', checkoutData);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your order.",
        variant: "destructive"
      });
      return false;
    }

    // Create the order with proper total (in rupees, not cents)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: checkoutData.total, // Keep as rupees for display
        shipping_address: checkoutData.shippingAddress,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Create order items with proper prices
    const orderItems = checkoutData.cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0 // Store actual price in rupees
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    // Clear the cart after successful order
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
    }

    toast({
      title: "Order Placed Successfully!",
      description: `Your order #${order.id.slice(0, 8)} has been placed and is being processed.`,
    });

    return true;
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Checkout Failed",
      description: "There was an error processing your order. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
