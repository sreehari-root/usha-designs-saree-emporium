
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  products?: {
    name: string;
    image: string | null;
  };
  customer_name?: string;
}

export const fetchReviews = async (): Promise<Review[]> => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products(name, image)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user profiles separately to avoid join issues
    if (reviews && reviews.length > 0) {
      const userIds = [...new Set(reviews.map(review => review.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      // Map profile data to reviews
      return reviews.map(review => ({
        ...review,
        customer_name: profiles?.find(p => p.id === review.user_id) 
          ? `${profiles.find(p => p.id === review.user_id)?.first_name} ${profiles.find(p => p.id === review.user_id)?.last_name}`.trim()
          : 'Anonymous User'
      }));
    }

    return reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    toast({
      title: "Review Deleted",
      description: "Review has been successfully deleted.",
    });

    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    toast({
      title: "Error",
      description: "Failed to delete review.",
      variant: "destructive"
    });
    return false;
  }
};

export const addReview = async (productId: string, rating: number, comment: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a review.",
        variant: "destructive"
      });
      return false;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: productId,
        rating,
        comment
      });

    if (error) throw error;

    toast({
      title: "Review Added",
      description: "Your review has been added successfully.",
    });

    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    toast({
      title: "Error",
      description: "Failed to add review.",
      variant: "destructive"
    });
    return false;
  }
};
