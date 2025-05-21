
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ushaLogo } from '@/lib/constants';

const categoryLinks = [
  { name: 'Pure Silk', path: '/category/pure-silk' },
  { name: 'Cotton', path: '/category/cotton' },
  { name: 'Georgette', path: '/category/georgette' },
  { name: 'Designer', path: '/category/designer' },
  { name: 'Ready Sets', path: '/category/ready-sets' },
  { name: 'New Arrivals', path: '/new-arrivals' },
];

export default function Navbar({ user }: { user?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // This would be from a context in a real app

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container py-2">
        {/* Mobile Menu Button */}
        <div className="flex justify-between items-center py-2 lg:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 text-usha-burgundy"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Logo For Mobile */}
          <Link to="/" className="flex items-center">
            <img src={ushaLogo} alt="Usha Designs Logo" className="h-12" />
          </Link>
          
          {/* Cart For Mobile */}
          <Link to="/cart" className="p-2 relative">
            <ShoppingBag size={24} className="text-usha-burgundy" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-usha-burgundy text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-8">
            <img src={ushaLogo} alt="Usha Designs Logo" className="h-16" />
          </Link>
          
          {/* Main Navigation Links */}
          <nav className="hidden lg:flex flex-1 items-center justify-center space-x-6">
            {categoryLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-foreground hover:text-usha-burgundy text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Right Nav Items */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-foreground hover:text-usha-burgundy">
              <Search size={20} />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback className="bg-usha-rose text-white">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/logout">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" className="border-usha-burgundy text-usha-burgundy hover:bg-usha-burgundy hover:text-white">
                <Link to="/login">Login</Link>
              </Button>
            )}
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-usha-burgundy">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-usha-burgundy text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t animate-fade-in">
          <div className="container py-4 space-y-4">
            {!user ? (
              <div className="flex space-x-4">
                <Button asChild variant="default" className="flex-1 bg-usha-burgundy hover:bg-usha-burgundy/90">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 border-usha-burgundy text-usha-burgundy">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                  <AvatarFallback className="bg-usha-rose text-white">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            
            <div className="flex w-full rounded-md border border-input">
              <input 
                type="search" 
                placeholder="Search for products..." 
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              />
              <Button variant="ghost" size="icon">
                <Search size={18} />
              </Button>
            </div>
            
            <nav className="space-y-1">
              {categoryLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-2 text-foreground hover:text-usha-burgundy"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {user && (
              <div className="space-y-1 border-t pt-2">
                <Link to="/account" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  My Account
                </Link>
                <Link to="/orders" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
                <Link to="/wishlist" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link to="/logout" className="block py-2" onClick={() => setIsMenuOpen(false)}>
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
