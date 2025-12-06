// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 Headers reçus:', req.headers.authorization);

    // Vérifier le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('❌ Aucun token fourni');
      return res.status(401).json({ 
        success: false,
        message: 'Non autorisé, token manquant' 
      });
    }

    try {
      // Vérifier le token
      console.log('🔍 Vérification du token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token décodé:', decoded);
      
      // Trouver l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('❌ Utilisateur non trouvé pour ID:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }
      
      console.log('✅ Utilisateur authentifié:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Erreur vérification token:', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Token non valide ou expiré' 
      });
    }
  } catch (error) {
    console.error('❌ Erreur middleware auth:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur dans l\'authentification' 
    });
  }
};