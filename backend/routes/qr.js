// routes/qr.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  generateProfileQR, 
  getUserQRCode, 
  scanQRCode 
} from '../controllers/qrController.js';

const router = express.Router();

console.log('🔄 Chargement des routes QR...');

// Middleware de protection pour toutes les routes QR
router.use(protect);

// Générer un nouveau QR Code
router.post('/generate', generateProfileQR);

// Récupérer le QR Code existant
router.get('/my-qrcode', getUserQRCode);

// Scanner un QR Code
router.post('/scan', scanQRCode);

// Route de test
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Routes QR fonctionnent!',
    user: req.user?.email,
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Routes QR configurées avec succès');

export default router;