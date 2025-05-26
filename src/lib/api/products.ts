import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ProductType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount: number | null;
  category_id: string | null;
  image: string | null;
  stock: number | null;
  featured: boolean | null;
  bestseller: boolean | null;
  rating: number | null;
  sales_count: number | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export const fetchProducts = async (): Promise<ProductType[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    const productsWithCategories = products?.map(product => ({
      ...product,
      category_name: product.categories?.name || 'Uncategorized'
    })) || [];

    return productsWithCategories;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (productData: Partial<ProductType>, imageFile?: File): Promise<ProductType | null> => {
  try {
    // Validate required fields
    if (!productData.name || productData.name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return null;
    }

    if (!productData.price || productData.price <= 0) {
      toast({
        title: "Error",
        description: "Valid product price is required.",
        variant: "destructive"
      });
      return null;
    }

    let imagePath = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imagePath = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name.trim(),
        price: productData.price,
        description: productData.description?.trim() || null,
        discount: productData.discount || 0,
        category_id: productData.category_id || null,
        stock: productData.stock || 0,
        featured: productData.featured || false,
        bestseller: productData.bestseller || false,
        image: imagePath,
        rating: 0,
        sales_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    toast({
      title: "Product Added",
      description: `${productData.name} has been added successfully.`,
    });

    return data;
  } catch (error) {
    console.error('Error adding product:', error);
    toast({
      title: "Error",
      description: "Failed to add product. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

export const updateProduct = async (
  id: string, 
  productData: Partial<ProductType>, 
  imageFile?: File
): Promise<ProductType | null> => {
  try {
    // Validate required fields
    if (!productData.name || productData.name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return null;
    }

    if (!productData.price || productData.price <= 0) {
      toast({
        title: "Error",
        description: "Valid product price is required.",
        variant: "destructive"
      });
      return null;
    }

    let imagePath = productData.image;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imagePath = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name.trim(),
        price: productData.price,
        description: productData.description?.trim() || null,
        discount: productData.discount || 0,
        category_id: productData.category_id || null,
        stock: productData.stock || 0,
        featured: productData.featured || false,
        bestseller: productData.bestseller || false,
        image: imagePath
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    toast({
      title: "Product Updated",
      description: `${productData.name} has been updated successfully.`,
    });

    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    toast({
      title: "Error",
      description: "Failed to update product. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (product && product.image) {
      try {
        const imagePath = product.image.split('/').pop();
        if (imagePath) {
          await supabase.storage.from('product-images').remove([imagePath]);
        }
      } catch (imageError) {
        console.error('Error deleting product image:', imageError);
      }
    }

    toast({
      title: "Product Deleted",
      description: "The product has been successfully removed.",
    });

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    toast({
      title: "Error",
      description: "Failed to delete product. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
