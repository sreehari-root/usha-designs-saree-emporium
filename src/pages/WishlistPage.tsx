
import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, calculateDiscountPrice } from '@/lib/utils';
import { addToCart } from '@/lib/api/cart';
import { removeFromWishlist } from '@/lib/api/wishlist';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            discount,
            image,
            stock,
            category_id,
            categories (name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) => addToCart(productId, 1),
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="aspect-square bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-8 w-8 text-usha-burgundy" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlistItems && wishlistItems.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {wishlistItems.length} items
          </Badge>
        )}
      </div>

      {!wishlistItems || wishlistItems.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
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
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-lg leading-tight hover:text-usha-burgundy transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  
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
      )}
    </div>
  );
};

export default WishlistPage;
