
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  image: string | null;
  stock: number;
  rating: number;
  bestseller: boolean;
  featured: boolean;
};

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterOpen, setFilterOpen] = useState(false);
  const categoryName = category ? category.replace(/-/g, ' ') : '';

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*');
    
    // Apply category filter if we're on a category page
    if (category) {
      // Convert slug back to category name format and use ILIKE for case-insensitive partial matching
      const categorySearch = categoryName.toLowerCase();
      query = query.ilike('category', `%${categorySearch}%`);
    }

    // Apply price filter
    query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [category, priceRange, sortBy]);

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb and title */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <a href="/" className="hover:text-usha-burgundy">Home</a>
            <span className="mx-2">/</span>
            <a href="/category" className="hover:text-usha-burgundy">Categories</a>
            {category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">{categoryName}</span>
              </>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-800">
            {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'All Categories'}
          </h1>
        </div>

        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <Button 
            variant="outline" 
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full flex items-center justify-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className={`w-full md:w-64 ${filterOpen ? 'block' : 'hidden'} md:block`}>
            <div className="bg-background p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg">Filters</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setPriceRange([0, 50000]);
                }}>
                  Reset
                </Button>
              </div>
            
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range</h3>
                <Slider
                  value={priceRange}
                  min={0}
                  max={50000}
                  step={500}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sort-price-asc" 
                      checked={sortBy === 'price-asc'}
                      onCheckedChange={() => setSortBy('price-asc')}
                    />
                    <label htmlFor="sort-price-asc">Price: Low to High</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sort-price-desc" 
                      checked={sortBy === 'price-desc'}
                      onCheckedChange={() => setSortBy('price-desc')}
                    />
                    <label htmlFor="sort-price-desc">Price: High to Low</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sort-newest" 
                      checked={sortBy === 'newest'}
                      onCheckedChange={() => setSortBy('newest')}
                    />
                    <label htmlFor="sort-newest">Newest First</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sort-rating" 
                      checked={sortBy === 'rating'}
                      onCheckedChange={() => setSortBy('rating')}
                    />
                    <label htmlFor="sort-rating">Customer Rating</label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-usha-burgundy" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    discount={product.discount}
                    image={product.image || "/placeholder.svg"}
                    rating={product.rating}
                    category={product.category}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for new arrivals.
                </p>
                <Button 
                  onClick={() => {
                    setPriceRange([0, 50000]);
                    setSortBy('price-asc');
                  }}
                  variant="outline"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
