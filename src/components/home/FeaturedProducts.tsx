
import React from 'react';
import ProductCard from '@/components/products/ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedProducts() {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts();
  
  if (error) {
    console.error('Error fetching featured products:', error);
  }
  
  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Featured Collection
          </h2>
          <a href="/products" className="mt-4 md:mt-0 text-usha-burgundy hover:underline">
            View All Products
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : featuredProducts && featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
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
              No featured products available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
