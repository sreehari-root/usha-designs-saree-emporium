import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductImageCarousel from '@/components/products/ProductImageCarousel';
import { supabase } from '@/integrations/supabase/client';
import { ProductType } from '@/lib/api/products';
import { ProductImageType, fetchProductImages } from '@/lib/api/productImages';

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString()}`;
};

const calculateDiscountedPrice = (price: number, discount?: number) => {
  if (!discount) return price;
  return price - (price * discount / 100);
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [productImages, setProductImages] = useState<ProductImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const productWithCategory = {
          ...data,
          category_name: data.categories?.name || 'Uncategorized'
        };

        setProduct(productWithCategory);

        // Fetch product images
        const images = await fetchProductImages(id);
        setProductImages(images);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount || 0);
  const hasDiscount = product.discount && product.discount > 0;

  // Create image array for carousel
  const carouselImages = [];
  
  // Add main product image first if it exists
  if (product.image) {
    carouselImages.push({ url: product.image, alt: product.name });
  }
  
  // Add additional product images
  productImages.forEach((img, index) => {
    carouselImages.push({ 
      url: img.image_url, 
      alt: `${product.name} - Image ${index + 2}` 
    });
  });

  // If no images at all, use placeholder
  if (carouselImages.length === 0) {
    carouselImages.push({ url: '/placeholder.svg', alt: product.name });
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <ProductImageCarousel images={carouselImages} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category_name}</Badge>
              {product.featured && <Badge>Featured</Badge>}
              {product.bestseller && <Badge variant="destructive">Bestseller</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(Number(product.rating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({Number(product.rating).toFixed(1)})
                </span>
                {product.sales_count && product.sales_count > 0 && (
                  <span className="text-sm text-muted-foreground">
                    • {product.sales_count} sold
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive">
                    {product.discount}% OFF
                  </Badge>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600">
                You save {formatPrice(product.price - discountedPrice)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {(product.stock || 0) > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min((product.stock || 0), quantity + 1))}
                  disabled={quantity >= (product.stock || 0)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                size="lg"
                disabled={(product.stock || 0) <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
            <p>• Free shipping on orders over ₹999</p>
            <p>• 30-day return policy</p>
            <p>• Secure payment with SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
