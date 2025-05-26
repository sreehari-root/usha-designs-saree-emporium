
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    discount: number | null;
  };
}

export const getOrCreateCart = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user has an existing cart
    const { data: existingCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingCart) {
      return existingCart.id;
    }

    // Create new cart if none exists
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return newCart.id;
  } catch (error) {
    console.error('Error getting or creating cart:', error);
    return null;
  }
};

export const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart.",
        variant: "destructive"
      });
      return false;
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });

      if (error) throw error;
    }

    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart.",
    });

    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast({
      title: "Error",
      description: "Failed to add product to cart.",
      variant: "destructive"
    });
    return false;
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products!inner(id, name, price, image, discount)
      `)
      .eq('cart_id', cartId);

    if (error) throw error;

    return data.map(item => ({
      ...item,
      product: item.products
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return false;
  }
};

export const removeFromCart = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    toast({
      title: "Removed from Cart",
      description: "Product has been removed from your cart.",
    });

    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    toast({
      title: "Error",
      description: "Failed to remove product from cart.",
      variant: "destructive"
    });
    return false;
  }
};
