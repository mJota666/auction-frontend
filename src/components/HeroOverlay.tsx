import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const HeroOverlay: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
      });
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.8
      });
      gsap.from('.hero-cta', {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 1.1
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="full-screen" ref={containerRef}>
      <div className="hero-content">
        <h1 className="hero-title">
          The Future of <br />
          <span className="text-gradient">Online Auctions</span>
        </h1>
        <p className="hero-subtitle">
          Experience real-time bidding with our premium auto-bid system.
          <br />Secure, transparent, and exhilarating.
        </p>
        <div className="hero-cta">
          <button className="btn-primary">Explore Auctions</button>
          <button className="btn-outline">Become a Seller</button>
        </div>
      </div>
    </div>
  );
};

export default HeroOverlay;
