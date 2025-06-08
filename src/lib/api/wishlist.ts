
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const addToWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return false;
    }

    // Check if item already exists in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist.",
      });
      return true;
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
      title: "Added to wishlist",
      description: "Item has been added to your wishlist.",
    });

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    toast({
      title: "Error",
      description: "Failed to add item to wishlist. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const removeFromWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your wishlist.",
        variant: "destructive"
      });
      return false;
    }

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
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    toast({
      title: "Error",
      description: "Failed to remove item from wishlist. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};
