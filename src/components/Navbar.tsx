import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, PlusCircle, Heart, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productService } from '../services/product';

const CategoryDropdownContent = () => {
    const [categories, setCategories] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await productService.getCategories();
                // Asssuming data is list of categories. If nested, handle accordingly.
                // Requirement said 2 levels. For dropdown, maybe just list parents?
                // Or maybe parents and on click expand.
                // Let's just list top 5-10 or all if few.
                setCategories(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to load categories for menu", e);
            }
        };
        fetchCats();
    }, []);

    return (
        <div className="max-h-64 overflow-y-auto">
            {categories.map((cat: any) => (
                <Link 
                    key={cat.id} 
                    to={`/search?categoryId=${cat.id}`} 
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-[#F3F4F8] hover:text-[#6C63FF] transition-colors"
                >
                    {cat.name}
                </Link>
            ))}
        </div>
    );
};

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
        <div className="relative group">
            <button className="hover:text-[#6C63FF] transition-colors px-4 py-2 rounded-xl hover:bg-[#E0E5EC] hover:neu-extruded flex items-center gap-1">
                Categories
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform z-50 overflow-hidden border border-gray-100">
                <Link to="/search" className="block px-4 py-3 hover:bg-[#F3F4F8] text-[#3D4852] font-semibold border-b border-gray-100">All Categories</Link>
                {/* Check if we want dynamic categories here. For now, hardcoded prominent ones or fetched? 
                    Fetching in Navbar might be heavy if not cached. 
                    Let's use a standard list or fetch if simple. 
                    Actually, let's keep it static for 'Browse' but the User Requirement implies dynamic.
                    I will add a useEffect to fetch them.
                */}
                <CategoryDropdownContent />
            </div>
        </div>
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
