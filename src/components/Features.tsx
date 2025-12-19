import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Auto-Bid System',
    desc: 'Set your max price and let our system bid for you automatically in real-time.',
    icon: '⚡'
  },
  {
    title: 'Instant Notifications',
    desc: 'Get notified immediately when you are outbid so you never miss a deal.',
    icon: '🔔'
  },
  {
    title: 'Secure Payments',
    desc: 'End-to-end encrypted transactions with full payment tracing history.',
    icon: '🔒'
  },
  {
    title: 'Seller Controls',
    desc: 'Powerful dashboard for sellers to manage listings and track performance.',
    icon: '📊'
  }
];

const Features: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-container" id="features" ref={containerRef}>
      <h2 className="feature-title" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '60px' }}>
        Premium <span className="text-gradient">Features</span>
      </h2>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="glass-card feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
