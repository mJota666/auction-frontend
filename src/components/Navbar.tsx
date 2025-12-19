import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo text-gradient">AUTO-BID</div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it Works</a>
        <a href="#auctions">Live Auctions</a>
      </div>
      <button className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.8rem' }}>
        Login
      </button>
    </nav>
  );
};

export default Navbar;
