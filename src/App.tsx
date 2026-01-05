import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './components/layout/MainLayout';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ProductList from './components/product/ProductList';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import ProductDetail from './pages/ProductDetail';
import CreateAuction from './pages/CreateAuction';
import Favorites from './pages/Favorites';
import MyOrders from './pages/MyOrders';
import MySales from './pages/MySales';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import { AdminProvider } from './context/AdminContext';
import ProductManagement from './pages/admin/ProductManagement';

// Main App Component

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
        <Routes>
          {/* Standalone Routes (No MainLayout) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={
            <>
                <Navbar />
                <div className="pt-20"><ProductList /></div>
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected/Inner Routes (With MainLayout) */}
          <Route path="/profile" element={
            <div className="h-screen flex flex-col bg-[#F3F4F8] overflow-hidden">
                <Navbar />
                <div className="flex-1 flex flex-col pt-20 overflow-hidden w-full">
                    <UserProfile />
                </div>
            </div>
          } />

          <Route element={<MainLayout />}>
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-sales" element={<MySales />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminProvider>
                <div className="w-full h-full">
                  <AdminDashboard />
                </div>
              </AdminProvider>
            } />
            <Route path="/admin/users" element={
              <AdminProvider>
                <div className="w-full h-full">
                   <UserManagement />
                </div>
              </AdminProvider>
            } />
            <Route path="/admin/categories" element={
              <AdminProvider>
                <div className="w-full h-full">
                  <CategoryManagement />
                </div>
              </AdminProvider>
            } />
            <Route path="/admin/products" element={
              <AdminProvider>
                <div className="w-full h-full">
                  <ProductManagement />
                </div>
              </AdminProvider>
            } />
          </Route>
        </Routes>
        <ToastContainer position="bottom-right" />
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
