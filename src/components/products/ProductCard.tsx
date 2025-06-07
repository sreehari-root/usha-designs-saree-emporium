
import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductType } from '@/lib/api/products';

interface ProductCardProps {
  product: ProductType;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountedPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-48 h-48 relative overflow-hidden">
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                {product.discount}% OFF
              </Badge>
            )}
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            {product.description && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.rating || 0})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(discountedPrice)}
                  </span>
                  {product.discount && product.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  {product.bestseller && (
                    <Badge variant="secondary">Bestseller</Badge>
                  )}
                </div>
              </div>
              
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            {product.discount}% OFF
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute bottom-2 left-2 bg-primary">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {Array(5).fill(0).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.rating || 0})
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatPrice(discountedPrice)}
            </span>
            {product.discount && product.discount > 0 && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {product.bestseller && (
            <Badge variant="secondary">Bestseller</Badge>
          )}
        </div>

        <Button className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
