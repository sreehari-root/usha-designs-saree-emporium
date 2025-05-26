
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, calculateDiscountPrice, getStarRating } from '@/lib/utils';
import { addToCart } from '@/lib/api/cart';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/api/wishlist';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  category: string;
  inStock?: boolean;
  rating?: number;
  salesCount?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  discount = 0,
  image,
  category,
  inStock = true,
  rating,
  salesCount
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const finalPrice = discount ? calculateDiscountPrice(price, discount) : price;
  
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const inWishlist = await isInWishlist(id);
      setIsInWishlistState(inWishlist);
    };
    checkWishlistStatus();
  }, [id]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await addToCart(id, 1);
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async () => {
    setIsWishlistLoading(true);
    if (isInWishlistState) {
      const success = await removeFromWishlist(id);
      if (success) {
        setIsInWishlistState(false);
      }
    } else {
      const success = await addToWishlist(id);
      if (success) {
        setIsInWishlistState(true);
      }
    }
    setIsWishlistLoading(false);
  };
  
  const renderStarRating = () => {
    if (!rating) return null;
    
    return getStarRating(rating).map(star => (
      <span 
        key={star.key} 
        className={star.type === 'empty' ? 'text-gray-300' : 'text-yellow-500'}
      >
        ★
      </span>
    ));
  };
  
  return (
    <div className="product-card group rounded-lg border bg-card text-card-foreground overflow-hidden">
      <div className="relative product-image-container">
        <Link to={`/product/${id}`}>
          <img 
            src={image || '/placeholder.svg'} 
            alt={name} 
            className="w-full h-64 object-cover product-image"
          />
        </Link>
        
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-usha-burgundy text-white">
            {discount}% OFF
          </Badge>
        )}
        
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-white font-medium text-lg">Out of Stock</p>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          className={`absolute top-2 left-2 bg-white/80 hover:bg-white h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isInWishlistState ? 'text-red-500' : 'text-gray-600'
          }`}
          aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
        >
          {isWishlistLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart size={16} fill={isInWishlistState ? 'currentColor' : 'none'} />
          )}
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/product/${id}`} className="block">
              <h3 className="font-medium text-lg leading-tight hover:text-usha-burgundy transition-colors line-clamp-1">
                {name}
              </h3>
            </Link>
            
            <p className="text-muted-foreground text-sm mt-1">
              {category}
            </p>
            
            {rating && (
              <div className="flex items-center mt-1">
                {renderStarRating()}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({rating.toFixed(1)})
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold">
                {formatCurrency(finalPrice)}
              </span>
              
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
            
            {salesCount !== undefined && (
              <div className="text-xs text-muted-foreground">
                {salesCount} sold
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90 text-white"
            disabled={!inStock || isAddingToCart}
            onClick={handleAddToCart}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
