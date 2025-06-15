
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if this is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Only check auth requirements after loading is complete
    if (!loading) {
      // Handle authentication requirements
      if (requireAuth && !user) {
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Handle admin-only routes
      if (adminOnly && (!user || !isAdmin)) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
    }
  }, [user, loading, requireAuth, adminOnly, navigate, isAdmin, toast]);

  // Show loading state for protected routes while auth is being determined
  if (loading && (requireAuth || adminOnly)) {
    return (
      <div className="flex min-h-screen flex-col">
        {!isAdminRoute && <Navbar />}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    );
  }

  // For admin routes, don't show the regular navbar and footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
