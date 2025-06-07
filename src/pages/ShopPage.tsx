
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, ChevronsUpDown } from "lucide-react"
import MainLayout from '@/components/layout/MainLayout';
import { fetchProducts, ProductType } from '@/lib/api/products';
import { fetchCategories, CategoryType } from '@/lib/api/categories';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';

const ShopPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || category || 'all'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');
  const [selectedSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceFilterRange, setPriceFilterRange] = useState([0, 100000]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        setAllProducts(productsData);
        setCategories(categoriesData);
        
        if (productsData.length > 0) {
          const min = Math.min(...productsData.map(product => product.price));
          const max = Math.max(...productsData.map(product => product.price));
          setMinPrice(min);
          setMaxPrice(max);
          setPriceFilterRange([min, max]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

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
        break;
    }
    return sortedProducts;
  }, [sortOrder]);

  // Apply filters
  useEffect(() => {
    if (!allProducts.length) return;

    let newFilteredProducts = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'all') {
      newFilteredProducts = newFilteredProducts.filter(product => 
        product.category_id === selectedCategory || 
        product.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by price
    newFilteredProducts = newFilteredProducts.filter(product =>
      product.price >= priceFilterRange[0] && product.price <= priceFilterRange[1]
    );

    // Sort products
    newFilteredProducts = sortProducts(newFilteredProducts);

    setFilteredProducts(newFilteredProducts);
    setCurrentPage(1);
  }, [selectedCategory, priceFilterRange, allProducts, sortProducts]);

  const handlePriceChange = (value: number[]) => {
    setPriceFilterRange(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const getPageTitle = () => {
    if (selectedCategory === 'all') return 'All Products';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.name || 'Products';
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8">
        {/* Filter Section */}
        <aside className="w-full md:w-80 p-4 border rounded">
          <ScrollArea className="h-[500px] w-full">
            {/* Category Filter */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>Select a category to filter products</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Price Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Filter by Price</CardTitle>
                <CardDescription>Set the price range for products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
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
          </ScrollArea>
        </aside>

        {/* Product Listing Section */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
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

          {/* Product Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
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
                No products found matching your criteria
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
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          className="cursor-pointer"
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
                      className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default ShopPage;
