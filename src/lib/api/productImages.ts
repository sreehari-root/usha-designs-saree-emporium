
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ProductImageType {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export const fetchProductImages = async (productId: string): Promise<ProductImageType[]> => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
};

export const addProductImage = async (
  productId: string,
  imageFile: File,
  displayOrder: number = 0
): Promise<ProductImageType | null> => {
  try {
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    
    const { data: imageData, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: data.publicUrl,
        display_order: displayOrder
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving image data:', error);
      throw error;
    }

    return imageData;
  } catch (error) {
    console.error('Error adding product image:', error);
    toast({
      title: "Error",
      description: "Failed to add product image. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

export const deleteProductImage = async (imageId: string): Promise<boolean> => {
  try {
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      throw error;
    }

    if (image && image.image_url) {
      try {
        const imagePath = image.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('product-images').remove([imagePath]);
        }
      } catch (imageError) {
        console.error('Error deleting image file:', imageError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    toast({
      title: "Error",
      description: "Failed to delete product image. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const updateImageOrder = async (imageId: string, newOrder: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_images')
      .update({ display_order: newOrder })
      .eq('id', imageId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating image order:', error);
    return false;
  }
};
