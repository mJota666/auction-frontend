import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="section-container cta-section">
      <div className="glass-card cta-box">
        <h2 className="feature-title" style={{ fontSize: '3rem', marginBottom: '30px' }}>
          Ready to Start <span className="text-gradient">Bidding?</span>
        </h2>
        <p className="feature-desc" style={{ fontSize: '1.2rem', marginBottom: '40px' }}>
          Join thousands of collectors and sellers in the most premium marketplace.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button className="btn-primary">Start Bidding</button>
          <button className="btn-outline">Create Listing</button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
