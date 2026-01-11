import React from 'react';
import Scene3D from '../components/Scene3D';
import Navbar from '../components/Navbar';
import HeroOverlay from '../components/HeroOverlay';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';
import FeaturedSection from '../components/FeaturedSection';

const LandingPage: React.FC = () => {
  return (
    <div className="app-container">
      <Scene3D />
      <Navbar />
      <HeroOverlay />
      
      <div className="bg-[#E0E5EC] relative z-10" style={{ marginTop: '100vh' }}>
         <FeaturedSection title="Hot Auctions" type="most-bids" />
         <FeaturedSection title="High Value" type="high-price" />
         <FeaturedSection title="Ending Soon" type="ending-soon" />
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
