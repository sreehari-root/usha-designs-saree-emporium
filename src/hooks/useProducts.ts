
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api/products';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const products = await fetchProducts();
      return products.filter(product => product.featured).slice(0, 4);
    },
  });
};

export const useBestsellingProducts = () => {
  return useQuery({
    queryKey: ['products', 'bestselling'],
    queryFn: async () => {
      const products = await fetchProducts();
      return products.filter(product => product.bestseller).slice(0, 4);
    },
  });
};

export const useProductsByCategory = (categoryName?: string) => {
  return useQuery({
    queryKey: ['products', 'category', categoryName],
    queryFn: async () => {
      const products = await fetchProducts();
      if (!categoryName) return products;
      return products.filter(product => 
        product.category_name?.toLowerCase() === categoryName.toLowerCase()
      );
    },
  });
};
