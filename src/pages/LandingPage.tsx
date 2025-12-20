import React from 'react';
import Scene3D from '../components/Scene3D';
import Navbar from '../components/Navbar';
import HeroOverlay from '../components/HeroOverlay';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';

const LandingPage: React.FC = () => {
  return (
    <div className="app-container">
      <Scene3D />
      <Navbar />
      <HeroOverlay />
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
