import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F8]">
      {/* Shared Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 text-[#3D4852]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#E0E5EC] border-t border-white/20 neu-extruded mt-12 mx-8 mb-8 rounded-3xl">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-[#6B7280]">
            &copy; 2025 Auto-Bid Auction. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
