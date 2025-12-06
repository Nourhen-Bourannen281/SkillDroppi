# SkillForge - Plateforme de Services Locaux en Tunisie

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.8.7-green.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Présentation du Projet

SkillForge est une plateforme innovante tout-en-un conçue pour révolutionner les services locaux en Tunisie. Elle permet aux utilisateurs de basculer facilement entre les rôles de client et de prestataire, créant ainsi un écosystème dynamique où chacun peut à la fois offrir et bénéficier de services locaux.

### 🎯 Mission
Créer un pont entre les besoins locaux et les compétences disponibles, favorisant l'économie collaborative et le développement des petites entreprises en Tunisie.

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Gestion des Utilisateurs
- Système d'inscription/connexion sécurisé
- Gestion des rôles (Client/Prestataire)
- Profils utilisateurs détaillés avec compétences et spécialités

### 💬 Messagerie Instantanée
- Chat en temps réel avec Socket.io
- Notifications push pour les nouveaux messages
- Historique des conversations

### 📱 QR Code Profil
- Génération automatique de QR codes pour partager son profil
- Scan rapide pour accéder aux informations professionnelles

### 🏪 Marketplace des Services
- Catalogue complet des services disponibles
- Système de recherche et filtrage avancé
- Gestion des commandes et propositions

### 🤖 Chatbot IA Intégré
- Assistant virtuel disponible sur toutes les pages
- Réponses contextuelles et aide à la navigation
- Interface conversationnelle intuitive

### 🎭 Avatar Interactif Animé
- Avatar SVG animé qui réagit aux saisies utilisateur
- Expressions faciales dynamiques lors de la connexion
- Animation des yeux et bouche selon le contenu saisi

### 📊 Tableau de Bord
- Vue d'ensemble des activités (services, commandes, messages)
- Graphiques et statistiques de performance
- Gestion des tâches avec système de todos

### ⭐ Système d'Avis & Réputation
- Évaluation des prestataires par les clients
- Système de notation 5 étoiles
- Commentaires détaillés

## 🛠️ Technologies Utilisées

### Frontend
- **React 18.2.0** - Framework JavaScript moderne
- **React Router** - Navigation côté client
- **Axios** - Requêtes HTTP
- **Chart.js** - Graphiques et visualisations
- **GSAP** - Animations avancées
- **Socket.io-client** - Communication temps réel

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification sécurisée
- **Bcrypt** - Hashage des mots de passe
- **Socket.io** - Communication bidirectionnelle

### Fonctionnalités Avancées
- **Multer** - Gestion des fichiers uploadés
- **QRCode** - Génération de codes QR
- **CORS** - Gestion des requêtes cross-origin

## 🚀 Installation & Configuration

### Prérequis
- Node.js (version 18+)
- MongoDB (local ou Atlas)
- npm ou yarn

### Installation du Backend

```bash
cd backend
npm install
```

### Configuration de l'Environnement

Créer un fichier `.env` dans le dossier backend :

```env
MONGO_URI=mongodb://localhost:27017/skillforge
JWT_SECRET=votre_secret_jwt
PORT=5000
```

### Démarrage du Backend

```bash
cd backend
npm start
```

Le serveur démarrera sur `http://localhost:5000`

### Installation du Frontend

```bash
cd client
npm install
```

### Démarrage du Frontend

```bash
cd client
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Utilisation

1. **Inscription** : Créez votre compte en tant que client ou prestataire
2. **Exploration** : Parcourez les services disponibles sur le marketplace
3. **Connexion** : Utilisez la messagerie pour contacter les prestataires
4. **Commandes** : Passez des commandes et suivez leur progression
5. **Évaluation** : Laissez des avis après chaque service

## 🎨 Fonctionnalités Innovantes

### Avatar Interactif
Notre avatar SVG animé apporte une touche ludique à l'expérience utilisateur. Il réagit en temps réel aux saisies :
- Les yeux suivent le curseur lors de la saisie email
- La bouche s'anime selon la longueur du texte
- Les bras couvrent les yeux lors de la saisie du mot de passe

### Chatbot IA
Un assistant virtuel intelligent guide les utilisateurs à travers la plateforme, offrant :
- Aide contextuelle
- Réponses instantanées
- Suggestions personnalisées

## 📊 Statistiques du Projet

- **500+** Prestataires actifs
- **1,200+** Services réalisés
- **98%** Satisfaction client
- **50+** Catégories de services

## 🎬 Démo & Screenshots

### Avatar Interactif en Action
![Avatar Interactif](demo/avatar-demo.gif)
*L'avatar SVG réagit en temps réel aux saisies utilisateur - yeux qui suivent le curseur, bouche qui s'anime*

### Interface de Messagerie
![Messagerie](demo/messenger-demo.png)
*Chat en temps réel avec notifications push et historique des conversations*

### Marketplace des Services
![Marketplace](demo/marketplace-demo.png)
*Catalogue complet avec recherche avancée et filtres par catégorie*

### Chatbot IA Intégré
![Chatbot](demo/chatbot-demo.png)
*Assistant virtuel disponible sur toutes les pages pour guider les utilisateurs*

### Tableau de Bord
![Dashboard](demo/dashboard-demo.png)
*Vue d'ensemble des activités avec graphiques et statistiques*

### 📹 Vidéo Démo Complète
Découvrez toutes les fonctionnalités en action : [Voir la démo vidéo](https://youtu.be/demo-skillforge)

*Note: Les captures d'écran et vidéos de démonstration seront ajoutées prochainement*

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

Développé avec ❤️ par l'équipe SkillForge

## 📞 Contact

Pour toute question ou suggestion :
- Email : contact@skillforge.tn
- Site web : [www.skillforge.tn](https://www.skillforge.tn)
