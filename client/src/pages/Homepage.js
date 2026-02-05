import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaUsers, FaChartLine, FaClipboardList,
  FaUserTie, FaHistory, FaUserShield, FaWhatsapp,
  FaStar, FaPhone, FaInstagram, FaFacebook, FaMapMarkerAlt,
  FaClock, FaEnvelope, FaBars, FaTimes
} from 'react-icons/fa';
import './../css/Homepage.css';

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneNumber = '+91 98330 72760';
  const whatsappNumber = '919833072760';
  const emailAddress = 'tressencebysimi@gmail.com';

  const features = [
    { 
      title: "Appointment Management", 
      icon: <FaCalendarAlt />,
      desc: "Schedule and manage customer appointments efficiently"
    },
    { 
      title: "Customer Database", 
      icon: <FaUsers />,
      desc: "Access complete customer records and history"
    },
    { 
      title: "Service Management", 
      icon: <FaClipboardList />,
      desc: "Manage beauty services, pricing, and categories"
    },
    { 
      title: "Business Analytics", 
      icon: <FaChartLine />,
      desc: "View daily/monthly income and performance reports"
    },
    { 
      title: "Staff Management", 
      icon: <FaUserTie />,
      desc: "Manage employee profiles and permissions"
    },
    { 
      title: "Transaction History", 
      icon: <FaHistory />,
      desc: "Complete record of all business transactions"
    },
  ];

  const testimonials = [
    { name: "Mrunmayee shivalkar", text: "Best salon experience ever!", rating: 5 },
    { name: "Jidnyaasa kurtradkar", text: "Professional service and amazing results", rating: 5 },
    { name: "Smita sawant", text: "Professional service and amazing results.", rating: 5 },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>Tressence by Simi</h1>
            <p>Beauty Redefined</p>
          </div>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollToSection('home')}>Home</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('testimonials')}>Reviews</button>
            <button onClick={() => scrollToSection('contact')}>Contact</button>
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/sign" className="signup-btn">Sign Up</Link>
            </div>
          </nav>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h2>Experience Luxury Beauty Services</h2>
          <p>Professional makeup, hair styling, and spa treatments for your special moments</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => scrollToSection('features')}>
              View Features
            </button>
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp /> Book via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="services">
        <div className="container">
          <h2 className="section-title">Portal Features</h2>
          <p className="section-subtitle">Comprehensive business management tools</p>
          
          <div className="services-grid">
            {features.map((feature, index) => (
              <div key={index} className="service-card">
                <div className="service-icon" style={{ fontSize: '40px', background: 'linear-gradient(135deg, #8b4513, #d2691e)' }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p className="service-desc">{feature.desc}</p>
                <Link to="/login" className="book-btn">
                  Access Feature
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <h4 className="client-name">{testimonial.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt />
                <div>
                  <h4>Visit Us</h4>
                  <p>Shop No.20, B-Wing, Royal Tusk</p>
                  <p>Bhawani Shankar Road, Dadar, Mumbai</p>
                </div>
              </div>
              <div className="contact-item">
                <FaPhone />
                <div>
                  <h4>Call Us</h4>
                  <p>{phoneNumber}</p>
                </div>
              </div>
              <div className="contact-item">
                <FaClock />
                <div>
                  <h4>Working Hours</h4>
                  <p>Mon - Sun: 9:00 AM - 10:00 PM</p>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <div>
                  <h4>Email Us</h4>
                  <p>{emailAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>Tressence by Simi</h3>
              <p>Professional beauty services since 2018</p>
            </div>
            <div className="footer-links">
              <button onClick={() => scrollToSection('home')}>Home</button>
              <button onClick={() => scrollToSection('features')}>Features</button>
              <button onClick={() => scrollToSection('contact')}>Contact</button>
              <Link to="/login">Login</Link>
              <Link to="/sign">Sign Up</Link>
            </div>
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="https://www.instagram.com/tressencebysimi" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>
              </div>
              <p className="copyright">© 2026 Tressence by Simi. All rights reserved.</p>
              <p className="developer-credit">
    Created & Maintained by <span>Shravani Mandve</span>
  </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;