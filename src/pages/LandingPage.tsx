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
      
      <div className="bg-white relative z-10" style={{ marginTop: '100vh' }}>
         <FeaturedSection title="Ending Soon" sortBy="endAt" sortDir="asc" />
         <FeaturedSection title="Hot Auctions" sortBy="bidCount" sortDir="desc" />
         <FeaturedSection title="High Value" sortBy="currentPrice" sortDir="desc" />
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
