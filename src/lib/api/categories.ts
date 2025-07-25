
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CategoryType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const fetchCategories = async (): Promise<CategoryType[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getProductCountByCategory = async (categoryId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error getting product count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting product count:', error);
    return 0;
  }
};

export const addCategory = async (name: string): Promise<CategoryType | null> => {
  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return null;
    }

    // Check if category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing category:', checkError);
      throw checkError;
    }

    if (existingCategory) {
      toast({
        title: "Error",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    toast({
      title: "Category Added",
      description: `${name} has been added successfully.`,
    });

    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    toast({
      title: "Error",
      description: "Failed to add category. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

export const updateCategory = async (id: string, name: string): Promise<CategoryType | null> => {
  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      });
      return null;
    }

    // Check if another category with the same name exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .neq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing category:', checkError);
      throw checkError;
    }

    if (existingCategory) {
      toast({
        title: "Error",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: name.trim()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    toast({
      title: "Category Updated",
      description: `Category has been updated successfully.`,
    });

    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    toast({
      title: "Error",
      description: "Failed to update category. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // First check if there are any products using this category
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      console.error('Error checking product count:', countError);
      throw countError;
    }

    if (count && count > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category is associated with ${count} products and cannot be deleted.`,
        variant: "destructive"
      });
      return false;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    toast({
      title: "Category Deleted",
      description: "The category has been successfully removed.",
    });

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast({
      title: "Error",
      description: "Failed to delete category. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
