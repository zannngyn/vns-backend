import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/features/auth/Login';
import DashboardLayout from '@/components/common/DashboardLayout';
import { DashboardOverview } from '@/features/dashboard/DashboardOverview';
import { ProductList } from '@/features/catalog/ProductList';
import { ProductForm } from '@/features/catalog/ProductForm';
import { OrderList } from '@/features/sales/OrderList';
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
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
