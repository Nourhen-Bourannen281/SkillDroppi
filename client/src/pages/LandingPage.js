import React from 'react';
import '../styles/Landing.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
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

      {/* Hero Section */}
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

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <h2 className="section-title">Pourquoi choisir SkillDroppi ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Recherche intelligente</h3>
              <p>Trouvez des services près de chez vous avec des filtres avancés</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Messagerie intégrée</h3>
              <p>Communiquez en direct avec vos prestataires ou clients</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>QR Code Profil</h3>
              <p>Partagez votre profil professionnel en un scan</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Double rôle</h3>
              <p>Passez de client à prestataire avec le même compte</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Tableau de bord</h3>
              <p>Suivez toutes vos activités en un seul endroit</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Système d'avis</h3>
              <p>Bâtissez votre réputation avec les retours clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Créez votre compte</h3>
                <p>Inscrivez-vous en 2 minutes et définissez vos compétences</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Explorez ou proposez</h3>
                <p>Recherchez des services ou publiez vos offres</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Connectez-vous</h3>
                <p>Utilisez la messagerie pour discuter et négocier</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Travailler et évaluer</h3>
                <p>Réalisez la mission et laissez un avis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">SkillDroppi en chiffres</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Prestataires actifs</p>
            </div>
            <div className="stat-item">
              <h3>1,200+</h3>
              <p>Services réalisés</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Satisfaction clients</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Catégories de services</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Prêt à transformer votre façon de travailler ?</h2>
          <p>Rejoignez la communauté SkillDroppi dès aujourd'hui</p>
          <div className="cta-buttons">
            <button 
              className="btn-primary large"
              onClick={() => window.location.href = '/auth'}
            >
              Créer mon compte gratuit
            </button>
            <button className="btn-secondary large">
              Voir les services disponibles
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">SkillDroppi</span>
              <p>La plateforme tout-en-un pour les services en Tunisie</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Plateforme</h4>
                <a href="#features">Fonctionnalités</a>
                <a href="#how-it-works">Comment ça marche</a>
                <a href="#services">Services</a>
              </div>
              <div className="link-group">
                <h4>Entreprise</h4>
                <a href="#about">À propos</a>
                <a href="#contact">Contact</a>
                <a href="#careers">Carrières</a>
              </div>
              <div className="link-group">
                <h4>Légal</h4>
                <a href="#privacy">Confidentialité</a>
                <a href="#terms">Conditions</a>
                <a href="#cookies">Cookies</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SkillDroppi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;