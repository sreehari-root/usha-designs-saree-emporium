
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    // Check if user has an existing cart
    const { data: existingCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingCart) {
      console.log('Found existing cart:', existingCart.id);
      return existingCart.id;
    }

    if (cartError && cartError.code !== 'PGRST116') {
      console.error('Error checking for existing cart:', cartError);
      throw cartError;
    }

    // Create new cart if none exists
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating new cart:', createError);
      throw createError;
    }

    console.log('Created new cart:', newCart.id);
    return newCart.id;
  } catch (error) {
    console.error('Error getting or creating cart:', error);
    return null;
  }
};

export const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
  try {
    console.log('Adding to cart - Product ID:', productId, 'Quantity:', quantity);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart.",
        variant: "destructive"
      });
      return false;
    }

    const cartId = await getOrCreateCart();
    if (!cartId) {
      toast({
        title: "Error",
        description: "Failed to create cart.",
        variant: "destructive"
      });
      return false;
    }

    // Verify product exists and get details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Product not found:', productError);
      toast({
        title: "Error",
        description: "Product not found.",
        variant: "destructive"
      });
      return false;
    }

    if (!product) {
      toast({
        title: "Error",
        description: "Product not found.",
        variant: "destructive"
      });
      return false;
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing cart item:', existingError);
      throw existingError;
    }

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock availability
      if (product.stock && newQuantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} items available.`,
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (error) {
        console.error('Error updating cart item:', error);
        throw error;
      }
    } else {
      // Check stock availability for new item
      if (product.stock && quantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} items available.`,
          variant: "destructive"
        });
        return false;
      }

      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        });

      if (error) {
        console.error('Error inserting cart item:', error);
        throw error;
      }
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });

    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast({
      title: "Error",
      description: "Failed to add product to cart. Please try again.",
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
        products(id, name, price, image, discount, stock)
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
