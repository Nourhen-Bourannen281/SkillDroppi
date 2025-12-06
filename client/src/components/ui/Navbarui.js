import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">SkillDroppi</span>
        </div>
        
        <div className="nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#how-it-works">Comment ça marche</a>
          <a href="#services">Services</a>
        </div>
        
        <div className="nav-actions">
          <button 
            className="btn-login"
            onClick={() => window.location.href = '/auth'}
          >
            Se connecter
          </button>
          <button 
            className="btn-signup"
            onClick={() => window.location.href = '/auth?tab=signup'}
          >
            S'inscrire
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;