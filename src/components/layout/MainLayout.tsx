
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export default function MainLayout({ 
  children, 
  requireAuth = false,
  adminOnly = false
}: MainLayoutProps) {
  const { user, loading, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
