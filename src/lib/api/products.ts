
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
        categories!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const productsWithCategories = products.map(product => ({
      ...product,
      category_name: product.categories?.name
    }));

    return productsWithCategories;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (productData: Partial<ProductType>, imageFile?: File): Promise<ProductType | null> => {
  try {
    let imagePath = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imagePath = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name!,
        price: productData.price!,
        description: productData.description,
        discount: productData.discount,
        category_id: productData.category_id,
        stock: productData.stock,
        featured: productData.featured,
        bestseller: productData.bestseller,
        image: imagePath,
      })
      .select()
      .single();

    if (error) {
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
    let imagePath = productData.image;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imagePath = data.publicUrl;
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        discount: productData.discount,
        category_id: productData.category_id,
        stock: productData.stock,
        featured: productData.featured,
        bestseller: productData.bestseller,
        image: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
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
