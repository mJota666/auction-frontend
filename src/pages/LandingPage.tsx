import React from 'react';
import Scene3D from '../components/Scene3D';
import Navbar from '../components/Navbar';
import HeroOverlay from '../components/HeroOverlay';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';
import ProductList from '../components/product/ProductList';

const LandingPage: React.FC = () => {
  return (
    <div className="app-container">
      <Scene3D />
      <Navbar />
      <HeroOverlay />
      
      <div className="bg-white relative z-10 py-10" style={{ marginTop: '100vh' }}>
         <ProductList />
      </div>

      <Features />
      <HowItWorks />
      <CTA />
      
      {/* Footer simple */}
      <footer style={{ textAlign: 'center', padding: '40px', opacity: 0.5, fontSize: '0.8rem' }}>
        &copy; 2025 Online Auction (AUTO-BID). All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
