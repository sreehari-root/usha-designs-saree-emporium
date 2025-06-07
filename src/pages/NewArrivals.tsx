
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewArrivals() {
  const { data: products, isLoading, error } = useProducts();
  
  // Sort by created_at to show newest first
  const newArrivals = products?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];
  
  if (error) {
    console.error('Error fetching new arrivals:', error);
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">New Arrivals</h1>
        <p className="text-muted-foreground mb-8">Discover our latest collection of designer sarees and ethnic wear</p>
        
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
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No new arrivals available
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
