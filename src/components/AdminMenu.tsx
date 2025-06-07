
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Star,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      active: location.pathname === '/admin'
    },
    {
      icon: Package,
      label: 'Products',
      href: '/admin/products',
      active: location.pathname === '/admin/products'
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      href: '/admin/orders',
      active: location.pathname === '/admin/orders'
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/admin/customers',
      active: location.pathname === '/admin/customers'
    },
    {
      icon: Star,
      label: 'Reviews',
      href: '/admin/reviews',
      active: location.pathname === '/admin/reviews'
    }
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              item.active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminMenu;
