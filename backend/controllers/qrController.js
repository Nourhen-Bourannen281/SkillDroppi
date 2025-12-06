// controllers/qrController.js
import QRCode from 'qrcode';
import User from '../models/User.js';

// Générer un QR Code pour le profil utilisateur
export const generateProfileQR = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('🎯 Génération QR Code pour user:', userId);

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    // Données du profil à encoder
    const profileData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      skills: user.skills,
      profileUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile`,
      generatedAt: new Date().toISOString(),
      platform: 'SkillDropi'
    };

    console.log('📊 Données du profil pour QR:', profileData);

    // Générer le QR Code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(profileData), {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    // Sauvegarder dans l'utilisateur
    user.qrCode = {
      data: qrCodeDataURL,
      lastGenerated: new Date()
    };
    
    await user.save();

    console.log('✅ QR Code généré et sauvegardé pour:', user.email);

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      profileData: profileData,
      message: 'QR Code généré avec succès!',
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération QR Code:', error);
    
    // En cas d'erreur, retourner un QR Code de démonstration
    const demoQR = await QRCode.toDataURL('https://skilldropi.com/demo', {
      width: 400,
      margin: 2,
      color: {
        dark: '#007bff',
        light: '#FFFFFF'
      }
    });
    
    res.json({
      success: true,
      qrCode: demoQR,
      message: "QR Code de démonstration généré (mode fallback)",
      error: error.message
    });
  }
};

// Récupérer le QR Code existant
export const getUserQRCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('qrCode name email');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    if (!user.qrCode || !user.qrCode.data) {
      return res.status(404).json({ 
        success: false,
        message: 'Aucun QR Code trouvé. Veuillez en générer un nouveau.' 
      });
    }

    res.json({
      success: true,
      qrCode: user.qrCode.data,
      lastGenerated: user.qrCode.lastGenerated,
      user: {
        name: user.name,
        email: user.email
      },
      message: 'QR Code existant chargé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur récupération QR Code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du QR Code',
      error: error.message 
    });
  }
};

// Scanner un QR Code
export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'Données QR Code manquantes'
      });
    }

    let profileData;
    try {
      profileData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Format QR Code invalide'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(profileData.userId)
      .select('-password -securityAnswer -qrCode');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      profile: user,
      qrProfileData: profileData,
      message: 'QR Code scanné avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur scan QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du scan du QR Code',
      error: error.message
    });
  }
};