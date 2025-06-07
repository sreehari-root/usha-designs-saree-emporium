
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  
  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                discount={product.discount || 0}
                image={product.image || '/placeholder.svg'}
                category={product.category_name || 'Uncategorized'}
                inStock={(product.stock || 0) > 0}
                rating={product.rating ? Number(product.rating) : undefined}
                salesCount={product.sales_count || 0}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No products available
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
