import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { User, LogOut, PlusCircle, Heart, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';


const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { state: { categories } } = useProduct();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
      navigate('/', { replace: true });
      // Timeout to ensure navigation unmounts protected components before auth state clears
      setTimeout(() => logout(), 100);
  };
  
  const navCategories = useMemo(() => {
      const allParents = categories.filter((c: any) => !c.parentId);
      // Map children to parents
      return allParents.slice(0, 5).map(parent => ({
          ...parent,
          children: categories.filter((c: any) => c.parentId === parent.id)
      }));
  }, [categories]);

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
      <div className="hidden md:flex space-x-2 text-sm font-medium text-[#6B7280]">
        
        {navCategories.map((cat: any) => (
            <div key={cat.id} className="relative group">
                <Link 
                    to={`/search?categoryId=${cat.id}`} 
                    className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded flex items-center gap-1"
                >
                    {cat.name}
                    {cat.children && cat.children.length > 0 && <ChevronDown size={14} className="mt-0.5" />}
                </Link>

                {/* Dropdown Menu */}
                {cat.children && cat.children.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[#E0E5EC] rounded-2xl shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top border border-white/20 overflow-hidden">
                        {cat.children.map((child: any) => (
                            <Link
                                key={child.id}
                                to={`/search?categoryId=${child.id}`}
                                className="block px-4 py-2.5 text-sm font-medium text-[#3D4852] hover:bg-gray-100/50 hover:text-[#6C63FF] transition-colors"
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        ))}

        <Link to="/search" className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded flex items-center gap-1 font-bold">
            All Products
        </Link>
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
