
import React from 'react';
import ProductCard from '@/components/products/ProductCard';
import { useBestsellingProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function BestSelling() {
  const { data: bestSellingProducts, isLoading, error } = useBestsellingProducts();
  
  if (error) {
    console.error('Error fetching bestselling products:', error);
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Best Selling Products
          </h2>
          <a href="/shop" className="mt-4 md:mt-0 text-usha-burgundy hover:underline">
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
          ) : bestSellingProducts && bestSellingProducts.length > 0 ? (
            bestSellingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No bestselling products available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
