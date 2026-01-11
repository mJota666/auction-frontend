import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, PlusCircle, Heart, LayoutDashboard } from 'lucide-react';
import { } from 'react';


const Navbar: React.FC = () => {
// ... existing Navbar code ...
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
      navigate('/', { replace: true });
      // Timeout to ensure navigation unmounts protected components before auth state clears
      setTimeout(() => logout(), 100);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-[#E0E5EC]/90 backdrop-blur-md border-b border-white/20">
    <Link
      to="/"
      className="flex items-center gap-3 select-none"
      aria-label="AUTOBID Home"
    >
      {/* Logo mark */}
      <div className="w-11 h-11 rounded-2xl bg-[#E0E5EC] neu-extruded flex items-center justify-center">
        {/* Simple mark: gradient dot + gavel-ish bars */}
        <div className="relative w-6 h-6">
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#6C63FF] shadow-sm" />
          <span className="absolute left-0 top-2 w-6 h-2 rounded-md bg-[#3D4852]/80" />
          <span className="absolute left-2 top-4 w-4 h-2 rounded-md bg-[#3D4852]/55" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="leading-none">
        <div className="text-xl font-extrabold tracking-tight text-[#3D4852]">
          <span className="opacity-70">AUTO</span>
          <span className="text-[#6C63FF]">BID</span>
        </div>
        <div className="text-[11px] font-semibold tracking-widest text-[#6B7280]">
          SMART AUCTIONS
        </div>
      </div>
    </Link>
      <div className="hidden md:flex space-x-6 text-sm font-medium text-[#6B7280]">
        <Link to="/search" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded flex items-center gap-1">
            Search Product
        </Link>
        {isHomePage && (
            <>
                {/* <Link to="/search" ... Removed redundant Browse link if we have Categories */ }
                <a href="#features" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded">Features</a>
                <a href="#how-it-works" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded">How it Works</a>
            </>
        )}
      </div>
      <div className="flex space-x-4 items-center">
        {isAuthenticated ? (
          <>
             <span className="text-sm font-medium text-[#3D4852] hidden sm:block">Hi, {user?.fullName}</span>
             {/* Debug: {console.log('Navbar User Debug:', user)} */}
             {(user?.role?.toUpperCase() === 'SELLER' || user?.role?.toUpperCase() === 'ADMIN') && (
                 <Link to="/create-auction" className="w-10 h-10 neu-btn hover:text-[#6C63FF]" title="Create Auction">
                    <PlusCircle size={20} />
                 </Link>
             )}
             {user?.role?.toUpperCase() === 'ADMIN' && (
                 <Link to="/admin" className="w-10 h-10 neu-btn hover:text-indigo-600" title="Admin Panel">
                    <LayoutDashboard size={20} />
                 </Link>
             )}
             <Link to="/favorites" className="w-10 h-10 neu-btn hover:text-pink-500 text-pink-500/80" title="Watchlist">
                <div className="relative">
                    <Heart size={20} className="fill-current" />
                </div>
             </Link>
             <Link to="/profile" className="w-10 h-10 neu-btn hover:text-[#6C63FF]" title="Profile">
                <User size={20} />
             </Link>
             <button onClick={handleLogout} className="w-10 h-10 neu-btn text-red-500 hover:text-red-600" title="Logout">
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
