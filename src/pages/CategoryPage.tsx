import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronsUpDown } from "lucide-react"
import { useProductsByCategory } from '@/hooks/useProducts';
import { ProductType } from '@/lib/api/products';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { data: categoryProducts, isLoading, error } = useProductsByCategory(category);
  
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');
  
  // Define available sizes manually since the mock data doesn't have sizes
  const [availableSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Define colors from the products' colors arrays
  const [availableColors] = useState(Array.from(new Set([])));
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceFilterRange, setPriceFilterRange] = useState([0, 100000]);

  useEffect(() => {
    if (categoryProducts && categoryProducts.length > 0) {
      const min = Math.min(...categoryProducts.map(product => product.price));
      const max = Math.max(...categoryProducts.map(product => product.price));
      setMinPrice(min);
      setMaxPrice(max);
      setPriceFilterRange([min, max]);
      setFilteredProducts(categoryProducts);
    } else {
      setFilteredProducts([]);
    }
    setCurrentPage(1); // Reset to first page when category changes
  }, [categoryProducts]);

  // Sorting function
  const sortProducts = useCallback((productsToSort: ProductType[]) => {
    let sortedProducts = [...productsToSort];
    switch (sortOrder) {
      case 'asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        // Default sorting: keep original order
        break;
    }
    return sortedProducts;
  }, [sortOrder]);

  // Size filtering
  const handleSizeChange = (size: string) => {
    setSelectedSizes(prevSizes =>
      prevSizes.includes(size) ? prevSizes.filter(s => s !== size) : [...prevSizes, size]
    );
  };

  // Color filtering
  const handleColorChange = (color: string) => {
    setSelectedColors(prevColors =>
      prevColors.includes(color) ? prevColors.filter(c => c !== color) : [...prevColors, color]
    );
  };

  // Price filtering
  const handlePriceChange = (value: number[]) => {
    setPriceFilterRange(value);
  };

  useEffect(() => {
    if (!categoryProducts || categoryProducts.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Start with category products
    let newFilteredProducts = [...categoryProducts];

    // Filter by size (if we had size data in the products)
    if (selectedSizes.length > 0) {
      // Since our mock data doesn't have size information, this is a placeholder
      // In a real app, you would filter based on actual product sizes
      // newFilteredProducts = newFilteredProducts.filter(product =>
      //   product.sizes.some(size => selectedSizes.includes(size))
      // );
    }

    // Filter by color
    if (selectedColors.length > 0) {
      // newFilteredProducts = newFilteredProducts.filter(product =>
      //   product.colors.some(color => selectedColors.includes(color))
      // );
    }

    // Filter by price
    newFilteredProducts = newFilteredProducts.filter(product =>
      product.price >= priceFilterRange[0] && product.price <= priceFilterRange[1]
    );

    // Sort products
    newFilteredProducts = sortProducts(newFilteredProducts);

    setFilteredProducts(newFilteredProducts);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedSizes, selectedColors, priceFilterRange, categoryProducts, sortProducts]);

  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (error) {
    console.error('Error fetching products for category:', error);
  }

  return (
    <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8">
      {/* Filter Section */}
      <aside className="w-full md:w-80 p-4 border rounded">
        <ScrollArea className="h-[500px] w-full">
          <Card>
            <CardHeader>
              <CardTitle>Filter by Price</CardTitle>
              <CardDescription>Set the price range for products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={priceFilterRange[0]}
                  onChange={(e) => handlePriceChange([Number(e.target.value), priceFilterRange[1]])}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  value={priceFilterRange[1]}
                  onChange={(e) => handlePriceChange([priceFilterRange[0], Number(e.target.value)])}
                  className="w-24"
                />
              </div>
              <Slider
                value={priceFilterRange}
                min={minPrice}
                max={maxPrice}
                step={100}
                onValueChange={handlePriceChange}
              />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Filter by Size</CardTitle>
              <CardDescription>Select the sizes you want to filter by</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                {availableSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => handleSizeChange(size)}
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Filter by Color</CardTitle>
              <CardDescription>Select the colors you want to filter by</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                {availableColors.map(color => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => handleColorChange(color)}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </aside>

      {/* Product Listing Section */}
      <section className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Sort by Price
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder('default')}>
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                Default
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                <ChevronDown className="mr-2 h-4 w-4" />
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                <ChevronDown className="mr-2 h-4 w-4 rotate-180" />
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Debug info */}
        {category && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
            <p>Category: {category}</p>
            <p>Category products: {categoryProducts?.length || 0}</p>
            <p>Filtered products: {filteredProducts.length}</p>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map(product => (
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
              {category ? `No products found in ${category} category` : 'No products available'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && pageCount > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(currentPage - 2 + i, pageCount));
                  return (
                    <PaginationItem key={pageNumber} hidden={pageNumber > pageCount}>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(prev + 1, pageCount));
                    }}
                    className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
