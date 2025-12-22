import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPhone, FaWhatsapp, FaInstagram, FaFacebook, 
  FaBars, FaTimes, FaMapMarkerAlt, FaClock, 
  FaEnvelope, FaStar
} from 'react-icons/fa';
import './../css/Homepage.css';  // Import the CSS
function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneNumber = '+91 98330 72760';
  const whatsappNumber = '919833072760';
  const emailAddress = 'tressencebysimi@gmail.com';

  const services = [
    { title: "Bridal Makeup", price: "₹15,000+", desc: "Complete bridal package with trials" },
    { title: "Hair Styling", price: "₹2,500+", desc: "Professional hair styling for all occasions" },
    { title: "Spa Treatments", price: "₹3,000+", desc: "Relaxing facial and body treatments" },
    { title: "Nail Art", price: "₹1,500+", desc: "Creative nail designs and manicures" },
    { title: "Skin Care", price: "₹4,000+", desc: "Customized facial treatments" },
    { title: "Mehendi Art", price: "₹5,000+", desc: "Traditional and contemporary designs" },
  ];

  const testimonials = [
    { name: "Sarah Johnson", text: "Best salon experience ever!", rating: 5 },
    { name: "Priya Sharma", text: "My wedding makeup was perfect!", rating: 5 },
    { name: "Lisa Wang", text: "Professional service and amazing results.", rating: 5 },
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
            <button onClick={() => scrollToSection('services')}>Services</button>
            <button onClick={() => scrollToSection('testimonials')}>Reviews</button>
            <button onClick={() => scrollToSection('contact')}>Contact</button>
                <div className="auth-buttons">
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/sign" className="signup-btn">Sign Up</Link> {/* Change from /signup to /sign */}
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
            <button className="btn-primary" onClick={() => scrollToSection('services')}>
              View Services
            </button>
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-whatsapp">
              <FaWhatsapp /> Book via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="section-title">Our Premium Services</h2>
          <p className="section-subtitle">Professional beauty services for all occasions</p>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.title.charAt(0)}</div>
                <h3>{service.title}</h3>
                <p className="service-price">{service.price}</p>
                <p className="service-desc">{service.desc}</p>
                <a href={`https://wa.me/${whatsappNumber}`} className="book-btn">
                  Book Now
                </a>
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
                <button onClick={() => scrollToSection('services')}>Services</button>
                <button onClick={() => scrollToSection('contact')}>Contact</button>
                <Link to="/login">Login</Link>
                <Link to="/sign">Sign Up</Link> {/* Change from /signup to /sign */}
                </div>
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="https://www.instagram.com/tressencebysimi" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>
              </div>
              <p className="copyright">© 2024 Tressence by Simi. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;