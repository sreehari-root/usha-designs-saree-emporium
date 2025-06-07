
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CheckoutData {
  shippingAddress: any;
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

    // Set payment intent based on payment method
    const paymentIntent = checkoutData.paymentMethod === 'cod' ? 'cash_on_delivery' : null;
    
    console.log('Creating order with payment intent:', paymentIntent);

    // Create the order - store total in rupees (not cents)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: Math.round(checkoutData.total), // Store in rupees
        status: 'pending',
        shipping_address: checkoutData.shippingAddress,
        payment_intent: paymentIntent
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    console.log('Order created:', order);

    // Create order items
    const orderItems = checkoutData.cartItems.map(item => {
      const price = item.products?.price || 0;
      const discount = item.products?.discount || 0;
      const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
      
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: finalPrice // Store price per item in rupees
      };
    });

    console.log('Creating order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
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
      description: `Your order #${order.id.slice(0, 8)} has been placed. You will receive a confirmation email shortly.`,
    });

    console.log('Checkout completed successfully');
    return true;

  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Order Failed",
      description: "There was an error processing your order. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
