
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const NewArrivals = lazy(() => import('@/pages/NewArrivals'));
const Cart = lazy(() => import('@/pages/Cart'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const Account = lazy(() => import('@/pages/Account'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/ReviewsPage'));
const AdminReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                  <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
                  <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
                  <Route path="/category/:categoryName" element={<MainLayout><CategoryPage /></MainLayout>} />
                  <Route path="/new-arrivals" element={<MainLayout><NewArrivals /></MainLayout>} />
                  <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
                  <Route path="/auth" element={<MainLayout><Auth /></MainLayout>} />
                  
                  {/* Protected routes */}
                  <Route path="/wishlist" element={<MainLayout requireAuth><WishlistPage /></MainLayout>} />
                  <Route path="/account" element={<MainLayout requireAuth><Account /></MainLayout>} />
                  <Route path="/checkout" element={<MainLayout requireAuth><Checkout /></MainLayout>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/dashboard" element={<MainLayout requireAuth adminOnly><AdminDashboard /></MainLayout>} />
                  <Route path="/admin/products" element={<MainLayout requireAuth adminOnly><AdminProductsPage /></MainLayout>} />
                  <Route path="/admin/orders" element={<MainLayout requireAuth adminOnly><AdminOrdersPage /></MainLayout>} />
                  <Route path="/admin/customers" element={<MainLayout requireAuth adminOnly><AdminCustomersPage /></MainLayout>} />
                  <Route path="/admin/categories" element={<MainLayout requireAuth adminOnly><AdminCategoriesPage /></MainLayout>} />
                  <Route path="/admin/reviews" element={<MainLayout requireAuth adminOnly><AdminReviewsPage /></MainLayout>} />
                  <Route path="/admin/reports" element={<MainLayout requireAuth adminOnly><AdminReportsPage /></MainLayout>} />
                  <Route path="/admin/settings" element={<MainLayout requireAuth adminOnly><AdminSettingsPage /></MainLayout>} />
                  
                  {/* Redirects */}
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
