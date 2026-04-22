import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/features/auth/Login';
import DashboardLayout from '@/components/common/DashboardLayout';
import { DashboardOverview } from '@/features/dashboard/DashboardOverview';
import { ProductList } from '@/features/products/ProductList';
import { ProductForm } from '@/features/products/ProductForm';
import { CategoryList } from '@/features/categories/CategoryList';
import { CategoryForm } from '@/features/categories/CategoryForm';
import { BrandList } from '@/features/brands/BrandList';
import { BrandForm } from '@/features/brands/BrandForm';
import { ReviewList } from '@/features/reviews/ReviewList';
import { CouponList } from '@/features/coupons/CouponList';
import { CouponForm } from '@/features/coupons/CouponForm';
import { OrderList } from '@/features/orders/OrderList';
import { UserList } from '@/features/users/UserList'; 

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DashboardOverview />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="brands/new" element={<BrandForm />} />
          <Route path="brands/:id/edit" element={<BrandForm />} />
          <Route path="reviews" element={<ReviewList />} />
          <Route path="coupons" element={<CouponList />} />
          <Route path="coupons/new" element={<CouponForm />} />
          <Route path="coupons/:id/edit" element={<CouponForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
