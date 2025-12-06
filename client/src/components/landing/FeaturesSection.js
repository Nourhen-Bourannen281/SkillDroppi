import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🔍',
      title: 'Recherche intelligente',
      description: 'Trouvez des services près de chez vous avec des filtres avancés'
    },
    {
      icon: '💬',
      title: 'Messagerie intégrée',
      description: 'Communiquez en direct avec vos prestataires ou clients'
    },
    {
      icon: '📱',
      title: 'QR Code Profil',
      description: 'Partagez votre profil professionnel en un scan'
    },
    {
      icon: '✅',
      title: 'Double rôle',
      description: 'Passez de client à prestataire avec le même compte'
    },
    {
      icon: '📊',
      title: 'Tableau de bord',
      description: 'Suivez toutes vos activités en un seul endroit'
    },
    {
      icon: '⭐',
      title: 'Système d\'avis',
      description: 'Bâtissez votre réputation avec les retours clients'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Pourquoi choisir SkillDroppi ?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;