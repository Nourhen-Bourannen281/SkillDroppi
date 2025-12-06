# Plan de Déploiement Gratuit pour SkillForge

## ✅ Étape 1: Préparation du Code
- [x] Ajouter le dossier client à Git
- [x] Commit des changements
- [x] Créer un fichier .env.example pour le backend
- [x] Mettre à jour les origines CORS pour la production
- [ ] Build du frontend React

## ⏳ Étape 2: Configuration MongoDB Atlas
- [ ] Créer un cluster gratuit sur Atlas
- [ ] Configurer l'accès réseau (IP whitelist: 0.0.0.0/0 pour Render)
- [ ] Créer un utilisateur de base de données
- [ ] Récupérer la chaîne de connexion MONGO_URI

## ⏳ Étape 3: Déploiement du Backend (Render)
- [ ] Créer un compte Render
- [ ] Connecter le repository GitHub
- [ ] Configurer les variables d'environnement
- [ ] Déployer le backend avec support Socket.io
- [ ] Obtenir l'URL du backend déployé

## ⏳ Étape 4: Déploiement du Frontend (Netlify)
- [ ] Créer un compte Netlify
- [ ] Connecter le repository GitHub
- [ ] Configurer les variables d'environnement (URL du backend)
- [ ] Build et déploiement du frontend
- [ ] Obtenir l'URL du frontend déployé

## ⏳ Étape 5: Configuration Finale
- [ ] Mettre à jour les URLs dans les applications
- [ ] Tests des fonctionnalités (authentification, chat, etc.)
- [ ] Vérification du bon fonctionnement

## Informations Importantes
- **Base de données**: MongoDB Atlas (gratuit)
- **Backend**: Render (gratuit, URL: *.onrender.com)
- **Frontend**: Netlify (gratuit, URL: *.netlify.app)
- **Domaines**: Sous-domaines gratuits fournis par les plateformes
