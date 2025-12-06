import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          La plateforme <span className="gradient-text">tout-en-un</span> 
          pour vos services en Tunisie
        </h1>
        <p className="hero-subtitle">
          Client aujourd'hui, prestataire demain. Une seule plateforme 
          pour gérer toutes vos activités de services locaux.
        </p>
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/auth'}
          >
            Commencer maintenant
          </button>
          <button className="btn-secondary">
            Découvrir les services
          </button>
        </div>
        
        <div className="hero-stats">
          <div className="stat">
            <h3>500+</h3>
            <p>Prestataires actifs</p>
          </div>
          <div className="stat">
            <h3>1,200+</h3>
            <p>Services réalisés</p>
          </div>
          <div className="stat">
            <h3>98%</h3>
            <p>Satisfaction clients</p>
          </div>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="platform-preview">
          {/* Illustration de l'interface SkillDroppi */}
          <div className="preview-card client-view">
            <h4>Je cherche un service</h4>
            <p>Trouvez le professionnel qu'il vous faut</p>
          </div>
          <div className="preview-card freelancer-view">
            <h4>Je propose mes services</h4>
            <p>Développez votre activité</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;