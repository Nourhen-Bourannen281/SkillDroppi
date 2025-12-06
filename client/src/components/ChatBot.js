import React, { useState } from 'react';
import '../styles/ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);

    // Questions et réponses prédéfinies
    const faqData = [
    // Fonctionnalités de Base
    {
        question: "Comment créer un compte ?",
        answer: "Cliquez sur 'S'inscrire' sur la page d'accueil. Remplissez votre email, mot de passe et sélectionnez votre rôle. Confirmez votre email et votre compte est activé !"
    },
    {
        question: "Comment me connecter ?", 
        answer: "Utilisez le bouton 'Se connecter' et entrez votre email et mot de passe. Si vous avez oublié votre mot de passe, utilisez la fonction 'Mot de passe oublié'."
    },
    
    // Gestion du Profil
    {
        question: "Comment modifier mon profil ?",
        answer: "Allez dans 'Mon Profil' → 'Modifier le profil'. Vous pouvez changer votre photo, bio, compétences, localisation et informations de contact."
    },
    {
        question: "À quoi sert le QR Code de profil ?",
        answer: "Le QR Code permet de partager rapidement votre profil. D'autres utilisateurs peuvent le scanner pour accéder directement à votre page."
    },
    
    // Services
    {
        question: "Comment créer un service ?",
        answer: "Allez dans 'Mes Services' → 'Créer un service'. Remplissez le titre, description, catégorie, prix et téléchargez des images. Cliquez sur 'Publier'."
    },
    {
        question: "Comment rechercher des services ?",
        answer: "Utilisez la barre de recherche du Marketplace. Filtrez par catégorie, localisation, prix ou notes pour trouver exactement ce qu'il vous faut."
    },
    
    // Commandes
    {
        question: "Comment commander un service ?",
        answer: "Trouvez un service dans le Marketplace, cliquez dessus puis sur 'Commander'. Remplissez les détails et confirmez votre commande."
    },
    {
        question: "Comment suivre mes commandes ?",
        answer: "Allez dans 'Mes Commandes' pour voir toutes vos commandes avec leur statut : en attente, acceptée, en cours, terminée."
    },
    
    // Messagerie
    {
        question: "Comment envoyer un message ?",
        answer: "Visitez le profil d'un utilisateur et cliquez sur 'Envoyer un message'. Vous pouvez aussi utiliser la messagerie depuis vos conversations existantes."
    },
    {
        question: "Comment fonctionne le système de follow ?",
        answer: "Cliquez sur 'Follow' dans un profil pour suivre l'utilisateur. Vous verrez ses activités et pourrez facilement le recontacter."
    },
    
    // Todo List
    {
        question: "Comment utiliser la Todo List ?",
        answer: "Allez dans 'Ma Todo List' → 'Ajouter une tâche'. Entrez le titre et description. Cochez la case pour marquer comme terminée."
    },
    
    // Questions Générales
    {
        question: "SkillDropi est-il gratuit ?",
        answer: "Oui ! La création de compte et l'utilisation des fonctionnalités de base sont entièrement gratuites."
    },
    {
        question: "Puis-je être client et prestataire ?",
        answer: "Absolument ! Un même compte vous permet d'offrir vos services et d'en commander auprès d'autres professionnels."
    }
];

    const handleQuestionClick = (faq) => {
        // Ajouter la question de l'utilisateur
        const userMessage = {
            id: Date.now(),
            text: faq.question,
            isUser: true,
            timestamp: new Date().toLocaleTimeString()
        };

        // Ajouter la réponse du bot
        const botMessage = {
            id: Date.now() + 1,
            text: faq.answer,
            isUser: false,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage, botMessage]);
    };

    const resetChat = () => {
        setMessages([]);
    };

    return (
        <div className="chatbot-container">
            {/* Icône flottante */}
            <div 
                className={`chatbot-icon ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                💬
            </div>

            {/* Pop-up de chat */}
            {isOpen && (
                <div className="chatbot-popup">
                    {/* En-tête */}
                    <div className="chatbot-header">
                        <h3>Assistant SkillDropi</h3>
                        <div className="chatbot-actions">
                            <button onClick={resetChat} className="reset-btn">🔄</button>
                            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                        </div>
                    </div>

                    {/* Zone de messages */}
                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                <p>👋 Bonjour ! Je suis votre assistant SkillDropi.</p>
                                <p>Comment puis-je vous aider ?</p>
                            </div>
                        ) : (
                            messages.map(message => (
                                <div 
                                    key={message.id} 
                                    className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
                                >
                                    <div className="message-content">
                                        {message.text}
                                    </div>
                                    <div className="message-time">
                                        {message.timestamp}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Questions rapides */}
                    <div className="quick-questions">
                        <p>Questions fréquentes :</p>
                        {faqData.map((faq, index) => (
                            <button
                                key={index}
                                className="question-btn"
                                onClick={() => handleQuestionClick(faq)}
                            >
                                {faq.question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;