
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, calculateDiscountPrice } from '@/lib/utils';
import { addToCart } from '@/lib/api/cart';
import { removeFromWishlist, getUserWishlist } from '@/lib/api/wishlist';
import { useToast } from '@/hooks/use-toast';

const WishlistTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getUserWishlist,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) => addToCart(productId, 1),
  });

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-muted"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add items to your wishlist to save them for later
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((item) => {
        const product = item.products;
        if (!product) return null;

        const finalPrice = product.discount 
          ? calculateDiscountPrice(product.price, product.discount) 
          : product.price;
        const isInStock = (product.stock || 0) > 0;

        return (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {product.discount && product.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-usha-burgundy text-white">
                  {product.discount}% OFF
                </Badge>
              )}

              {!isInStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <p className="text-white font-medium">Out of Stock</p>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium text-lg leading-tight mb-2">
                {product.name}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-3">
                {product.categories?.name || 'Uncategorized'}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-lg">
                    {formatCurrency(finalPrice)}
                  </span>
                  {product.discount && product.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={!isInStock || addToCartMutation.isPending}
                >
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  disabled={removeFromWishlistMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WishlistTab;
