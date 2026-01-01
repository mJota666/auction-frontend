import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, PlusCircle } from 'lucide-react';
import CategoryMenu from './CategoryMenu';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-[#E0E5EC]/90 backdrop-blur-md border-b border-white/20">
      <Link to="/" className="text-2xl font-extrabold tracking-tighter text-[#3D4852] flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#E0E5EC] neu-extruded flex items-center justify-center text-[#6C63FF]">
            A
        </div>
        AUTO-BID
      </Link>
      <div className="hidden md:flex space-x-6 text-sm font-medium text-[#6B7280]">
        <CategoryMenu />
        {isHomePage && (
            <>
                <a href="#features" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded">Features</a>
                <a href="#how-it-works" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded">How it Works</a>
            </>
        )}
      </div>
      <div className="flex space-x-4 items-center">
        {isAuthenticated ? (
          <>
             <span className="text-sm font-medium text-[#3D4852] hidden sm:block">Hi, {user?.fullName}</span>
             <Link to="/create-auction" className="w-10 h-10 neu-btn hover:text-[#6C63FF]" title="Create Auction">
                <PlusCircle size={20} />
             </Link>
             <Link to="/profile" className="w-10 h-10 neu-btn hover:text-[#6C63FF]" title="Profile">
                <User size={20} />
             </Link>
             <button onClick={logout} className="w-10 h-10 neu-btn text-red-500 hover:text-red-600" title="Logout">
                <LogOut size={20} />
             </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-[#6B7280] hover:text-[#3D4852] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="neu-btn px-6 py-2.5 text-sm font-bold text-[#6C63FF] hover:text-[#5a52d5]">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
