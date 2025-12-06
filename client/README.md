# SkillForge - Frontend React

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.9.5-red.svg)](https://reactrouter.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-black.svg)](https://socket.io/)

## 🎨 Présentation du Frontend

Le frontend de SkillForge est une application React moderne et interactive qui offre une expérience utilisateur exceptionnelle pour la plateforme de services locaux en Tunisie.

## ✨ Fonctionnalités Frontend

### 🎭 Avatar Interactif Animé
- **Avatar SVG personnalisé** qui réagit aux saisies utilisateur
- **Animations faciales dynamiques** : yeux qui suivent le curseur, bouche qui s'anime
- **Interactions ludiques** lors de la connexion (couverture des yeux pour le mot de passe)

### 🤖 Chatbot IA Intégré
- **Assistant virtuel** disponible sur toutes les pages
- **Interface conversationnelle** intuitive
- **Réponses contextuelles** et aide à la navigation

### 📱 Interface Utilisateur Moderne
- **Design responsive** adapté mobile et desktop
- **Animations fluides** avec GSAP
- **Thème cohérent** avec composants UI réutilisables

### 🔄 Communication Temps Réel
- **Messagerie instantanée** avec Socket.io
- **Notifications en temps réel** pour les nouveaux messages
- **Statut de connexion** des utilisateurs

## 🛠️ Technologies Frontend

- **React 18.2.0** - Framework JavaScript avec hooks modernes
- **React Router 7.9.5** - Navigation côté client
- **Axios** - Requêtes HTTP asynchrones
- **Socket.io-client 4.8.1** - Communication bidirectionnelle
- **Chart.js 4.5.1** - Graphiques et visualisations de données
- **GSAP 3.13.0** - Animations performantes
- **React Feather** - Icônes SVG légères
- **Date-fns** - Manipulation des dates

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (version 18+)
- Backend SkillForge en cours d'exécution

### Installation
```bash
cd client
npm install
```

### Configuration
Créer un fichier `.env` dans le dossier client :
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Démarrage
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
client/
├── public/
│   ├── images/          # Images statiques
│   └── manifest.json    # PWA configuration
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── ui/         # Composants UI de base
│   │   ├── landing/    # Composants de la page d'accueil
│   │   ├── ChatBot.js  # 🤖 Chatbot IA
│   │   ├── InteractiveAvatar.js  # 🎭 Avatar animé
│   │   └── ...
│   ├── context/        # Context React (Auth)
│   ├── pages/          # Pages principales
│   ├── styles/         # Styles CSS
│   └── App.js          # Point d'entrée
└── package.json
```

## 🎯 Pages Principales

- **Landing Page** - Présentation de la plateforme
- **Authentification** - Connexion/Inscription avec avatar animé
- **Dashboard** - Tableau de bord utilisateur
- **Marketplace** - Catalogue des services
- **Messenger** - Messagerie instantanée
- **Profile** - Gestion du profil utilisateur
- **Orders** - Gestion des commandes
- **Reviews** - Système d'avis et notation

## 🎨 Fonctionnalités Visuelles

### Avatar Interactif
L'avatar SVG réagit en temps réel aux interactions utilisateur :
- **Saisie email** : Les yeux suivent le curseur, la bouche s'anime
- **Saisie mot de passe** : Les bras couvrent les yeux
- **Affichage mot de passe** : Les doigts s'écartent

### Animations GSAP
- Transitions fluides entre les pages
- Animations d'entrée/sortie des composants
- Effets visuels pour améliorer l'expérience utilisateur

### Design Responsive
- Adaptation automatique aux différentes tailles d'écran
- Interface optimisée pour mobile et desktop
- Navigation intuitive sur tous les appareils

## 🔧 Scripts Disponibles

### `npm start`
Démarre l'application en mode développement sur `http://localhost:3000`

### `npm run build`
Construit l'application pour la production dans le dossier `build`

### `npm test`
Lance le suite de tests en mode interactif

### `npm run eject`
**Attention : opération irréversible !**
Éjecte la configuration Create React App pour une personnalisation avancée

## 🌐 Déploiement

L'application peut être déployée sur :
- **Vercel** - Déploiement automatique depuis GitHub
- **Netlify** - Hébergement statique avec fonctions serverless
- **Heroku** - Plateforme cloud complète

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question concernant le frontend :
- Vérifier la [documentation React](https://reactjs.org/)
- Consulter les [issues GitHub](https://github.com/username/skillforge/issues)
