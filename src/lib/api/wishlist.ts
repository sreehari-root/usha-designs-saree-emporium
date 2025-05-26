
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    discount: number | null;
  };
}

export const addToWishlist = async (productId: string): Promise<boolean> => {
  try {
    console.log('Adding to wishlist - Product ID:', productId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to wishlist.",
        variant: "destructive"
      });
      return false;
    }

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
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

    // Check if item already exists in wishlist
    const { data: existingItem, error: existingError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing wishlist item:', existingError);
      throw existingError;
    }

    if (existingItem) {
      toast({
        title: "Already in Wishlist",
        description: "This product is already in your wishlist.",
      });
      return false;
    }

    const { error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id: productId
      });

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }

    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    toast({
      title: "Error",
      description: "Failed to add product to wishlist. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const removeFromWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }

    toast({
      title: "Removed from Wishlist",
      description: "Product has been removed from your wishlist.",
    });

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    toast({
      title: "Error",
      description: "Failed to remove product from wishlist.",
      variant: "destructive"
    });
    return false;
  }
};

export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products(id, name, price, image, discount)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }

    return data?.map(item => ({
      ...item,
      product: item.products
    })) || [];
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    return [];
  }
};

export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};
