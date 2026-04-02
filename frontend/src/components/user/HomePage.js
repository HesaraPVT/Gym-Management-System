import React from 'react';
import './HomePage.css';

function UserHomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">POWER WORLD GYMS</span>
            <h1 className="hero-title">Your Complete Fitness Ecosystem</h1>
            <p className="hero-description">
              Track progress, book trainers, manage memberships, shop accessories, and get 24/7 support—all in one place.
            </p>
            <button className="hero-btn" onClick={() => window.location.href = '/main/user'}>
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section">
        <h2 className="section-title">Everything you need for <span className="italic">fitness success.</span></h2>
        <p className="section-subtitle">Your complete gym management companion—training, coaching, shopping, and community support in one powerful platform</p>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon progress-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Log workouts, track body measurements, and visualize your fitness journey with detailed analytics and charts.</p>
            <span className="feature-tag">Track</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon schedule-icon">📅</div>
            <h3>Schedule & Trainers</h3>
            <p>Book appointments with professional trainers, view availability, and schedule your personalized training sessions.</p>
            <span className="feature-tag">Schedule</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon membership-icon">💳</div>
            <h3>Memberships</h3>
            <p>Explore flexible membership plans tailored to your fitness goals. Upgrade, downgrade, or manage your membership anytime.</p>
            <span className="feature-tag">Plans</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon shop-icon">🛍️</div>
            <h3>Shop & Accessories</h3>
            <p>Buy premium supplements, accessories, and gym equipment directly through our integrated shop with exclusive member deals.</p>
            <span className="feature-tag">Shop</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon support-icon">💬</div>
            <h3>Support & Feedback</h3>
            <p>Submit complaints, share feedback, and connect with our support team. Your voice helps us improve your experience.</p>
            <span className="feature-tag">Support</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon community-icon">👥</div>
            <h3>Community</h3>
            <p>Join a supportive community of fitness enthusiasts. Share achievements, get motivation, and reach your goals together.</p>
            <span className="feature-tag">Connect</span>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="why-content">
          <h2>Why Choose Power World Gyms?</h2>
          <div className="why-grid">
            <div className="why-item">
              <span className="why-number">1</span>
              <h4>All-in-One Platform</h4>
              <p>No need for multiple apps. Everything you need for fitness success is integrated in one place.</p>
            </div>
            <div className="why-item">
              <span className="why-number">2</span>
              <h4>Expert Trainers</h4>
              <p>Access experienced certified trainers who can guide your fitness journey with personalized coaching.</p>
            </div>
            <div className="why-item">
              <span className="why-number">3</span>
              <h4>Data-Driven Insights</h4>
              <p>Real-time analytics and detailed progress reports help you understand your fitness journey better.</p>
            </div>
            <div className="why-item">
              <span className="why-number">4</span>
              <h4>Flexible Plans</h4>
              <p>Choose membership plans that fit your schedule and budget. Cancel or upgrade anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <button className="cta-btn" onClick={() => window.location.href = '/main/user'}>
          Get Started Today
        </button>
      </section>
    </div>
  );
}

export default UserHomePage;
