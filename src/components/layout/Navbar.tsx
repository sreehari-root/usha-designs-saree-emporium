
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Get cart count
  const { data: cartCount = 0 } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!cart) return 0;
      
      const { data: items } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('cart_id', cart.id);
      
      return items?.reduce((total, item) => total + item.quantity, 0) || 0;
    },
    enabled: !!user,
  });

  // Get wishlist count
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ['wishlist-count'],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id);
      
      return data?.length || 0;
    },
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/58e143db-43bd-4d54-a076-852305928435.png" 
              alt="Usha Silks" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-usha-burgundy transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-usha-burgundy transition-colors">
              Products
            </Link>
            <Link to="/new-arrivals" className="text-gray-700 hover:text-usha-burgundy transition-colors">
              New Arrivals
            </Link>
            <Link to="/category/sarees" className="text-gray-700 hover:text-usha-burgundy transition-colors">
              Sarees
            </Link>
            <Link to="/category/lehengas" className="text-gray-700 hover:text-usha-burgundy transition-colors">
              Lehengas
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-usha-burgundy transition-colors">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-usha-burgundy">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            )}
            
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-usha-burgundy transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-usha-burgundy">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {user && !loading ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Account</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
              
              <Link to="/" className="text-gray-700 hover:text-usha-burgundy transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-usha-burgundy transition-colors">
                Products
              </Link>
              <Link to="/new-arrivals" className="text-gray-700 hover:text-usha-burgundy transition-colors">
                New Arrivals
              </Link>
              <Link to="/category/sarees" className="text-gray-700 hover:text-usha-burgundy transition-colors">
                Sarees
              </Link>
              <Link to="/category/lehengas" className="text-gray-700 hover:text-usha-burgundy transition-colors">
                Lehengas
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
