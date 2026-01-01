import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gavel, User, LogOut, ShoppingBag, Search, PlusCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user, logout, token } = useAuth();
  console.log('MainLayout Render:', { isAuthenticated, user, token });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Gavel className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BidMaster</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Auctions
                </Link>
                <Link to="/about" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
               <div className="flex-shrink-0 mr-4">
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Search items..."
                    />
                  </div>
               </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Hi, {user?.fullName}</span>
                  <Link to="/profile" className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none">
                    <User className="h-6 w-6" />
                  </Link>
                  <Link to="/my-orders" className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none">
                    <ShoppingBag className="h-6 w-6" />
                  </Link>
                  <Link to="/create-auction" className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none" title="Create Auction">
                    <PlusCircle className="h-6 w-6" />
                  </Link>
                  <button onClick={handleLogout} className="p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none">
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                   <Link to="/login" className="text-gray-500 hover:text-indigo-600 text-sm font-medium">
                     Log in
                   </Link>
                   <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                     Sign up
                   </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 BidMaster Auction. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
