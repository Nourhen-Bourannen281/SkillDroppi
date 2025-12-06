import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      step: '1',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en 2 minutes et définissez vos compétences'
    },
    {
      step: '2',
      title: 'Explorez ou proposez',
      description: 'Recherchez des services ou publiez vos offres'
    },
    {
      step: '3',
      title: 'Connectez-vous',
      description: 'Utilisez la messagerie pour discuter et négocier'
    },
    {
      step: '4',
      title: 'Travailler et évaluer',
      description: 'Réalisez la mission et laissez un avis'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">Comment ça marche ?</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;