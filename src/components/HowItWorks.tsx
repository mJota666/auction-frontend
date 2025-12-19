import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Set Max Bid',
    desc: 'Decide the maximum amount you are willing to pay for an item.'
  },
  {
    num: '02',
    title: 'System Bids',
    desc: 'Our system places bids on your behalf, just enough to beat others.'
  },
  {
    num: '03',
    title: 'You Win',
    desc: 'If your max bid is the highest, you win at the lowest possible price.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="section-container" id="how-it-works">
      <h2 className="feature-title" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '60px' }}>
        How It <span className="text-gradient">Works</span>
      </h2>
      <div className="steps-container">
        {steps.map((s, i) => (
          <div key={i} className="step-item">
            <div className="step-number">{s.num}</div>
            <h3 className="feature-title">{s.title}</h3>
            <p className="feature-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
