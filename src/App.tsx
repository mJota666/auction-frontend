import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './components/layout/MainLayout';
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

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Standalone Routes (No MainLayout) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<div className="pt-20"><ProductList /></div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected/Inner Routes (With MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-sales" element={<MySales />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
          </Route>
        </Routes>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </Router>
  );
};

export default App;
