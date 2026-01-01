import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, PlusCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/10 border-b border-white/10">
      <div className="text-2xl font-bold tracking-tighter text-slate-900">
        <Link to="/">AUTO-BID</Link>
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-700">
        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
        <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
      </div>
      <div className="flex space-x-4 items-center">
        {isAuthenticated ? (
          <>
             <span className="text-sm font-medium text-slate-700 hidden sm:block">Hi, {user?.fullName}</span>
             <Link to="/create-auction" className="p-2 text-slate-700 hover:text-blue-600 transition-colors" title="Create Auction">
                <PlusCircle size={20} />
             </Link>
             <Link to="/profile" className="p-2 text-slate-700 hover:text-blue-600 transition-colors" title="Profile">
                <User size={20} />
             </Link>
             <button onClick={logout} className="p-2 text-slate-700 hover:text-red-600 transition-colors" title="Logout">
                <LogOut size={20} />
             </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
