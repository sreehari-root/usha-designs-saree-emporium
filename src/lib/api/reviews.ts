
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
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
        status: (review.status || 'pending') as 'pending' | 'approved' | 'rejected',
        customer_name: profiles?.find(p => p.id === review.user_id) 
          ? `${profiles.find(p => p.id === review.user_id)?.first_name || ''} ${profiles.find(p => p.id === review.user_id)?.last_name || ''}`.trim()
          : 'Anonymous User'
      }));
    }

    return reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const fetchApprovedReviews = async (productId?: string): Promise<Review[]> => {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        products(name, image)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: reviews, error } = await query;

    if (error) throw error;

    // Get user profiles separately
    if (reviews && reviews.length > 0) {
      const userIds = [...new Set(reviews.map(review => review.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      return reviews.map(review => ({
        ...review,
        status: review.status as 'pending' | 'approved' | 'rejected',
        customer_name: profiles?.find(p => p.id === review.user_id) 
          ? `${profiles.find(p => p.id === review.user_id)?.first_name || ''} ${profiles.find(p => p.id === review.user_id)?.last_name || ''}`.trim()
          : 'Anonymous User'
      }));
    }

    return reviews || [];
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return [];
  }
};

export const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId);

    if (error) throw error;

    toast({
      title: "Review Updated",
      description: `Review has been ${status}.`,
    });

    return true;
  } catch (error) {
    console.error('Error updating review status:', error);
    toast({
      title: "Error",
      description: "Failed to update review status.",
      variant: "destructive"
    });
    return false;
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

export const addReview = async (productId: string, rating: number, comment: string, orderId: string): Promise<boolean> => {
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
        comment,
        status: 'pending'
      });

    if (error) throw error;

    toast({
      title: "Review Submitted",
      description: "Your review has been submitted for approval.",
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

export const checkCanReview = async (productId: string, orderId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if order exists, is completed, and belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        order_items(product_id)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (!order) return false;

    // Check if the product is in this order
    const hasProduct = order.order_items?.some(item => item.product_id === productId);
    if (!hasProduct) return false;

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    return !existingReview; // Can review if no existing review
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return false;
  }
};
