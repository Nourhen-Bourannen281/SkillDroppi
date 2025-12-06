import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const { apiCall } = useContext(AuthContext);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Test de connexion au backend
  const testBackendConnection = async () => {
    try {
      console.log('🔗 Test de connexion backend...');
      const response = await fetch('http://localhost:5000/api/health');
      
      if (!response.ok) {
        throw new Error(`Backend non disponible: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend accessible:', data);
      return true;
    } catch (err) {
      console.error('❌ Backend inaccessible:', err);
      return false;
    }
  };

  // Test spécifique des routes QR
  const testQRRoutes = async () => {
    try {
      console.log('🔗 Test des routes QR...');
      const response = await apiCall('/api/qr/test');
      const data = await response.json();
      console.log('✅ Routes QR test:', data);
      return data.success;
    } catch (err) {
      console.error('❌ Routes QR non accessibles:', err);
      return false;
    }
  };

  // Générer un QR Code
  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔄 Début génération QR Code...');
      
      // Test de connexion général d'abord
      const backendConnected = await testBackendConnection();
      if (!backendConnected) {
        setError('❌ Backend inaccessible. Démarrez le serveur sur le port 5000.');
        return;
      }

      // Test spécifique des routes QR
      const qrRoutesWorking = await testQRRoutes();
      if (!qrRoutesWorking) {
        console.log('🔄 Routes QR non configurées, utilisation du mode démo...');
        generateDemoQR();
        return;
      }

      // Si les tests passent, essayer la vraie génération
      console.log('🚀 Tentative de génération réelle...');
      const response = await apiCall('/api/qr/generate', {
        method: 'POST'
      });

      console.log('📊 Statut réponse QR:', response.status);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Réponse QR réussie:', data);

      if (data.success) {
        setQrCode(data.qrCode);
        setSuccess(data.message || '✅ QR Code généré avec succès !');
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('❌ Erreur génération QR:', error);
      
      // En cas d'erreur, basculer vers le mode démo
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        setError('⚠️ Routes QR non trouvées. Activation du mode démonstration...');
        setTimeout(() => {
          generateDemoQR();
        }, 1500);
      } else {
        setError(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Générer un QR Code de démonstration
  const generateDemoQR = () => {
    console.log('🎯 Génération QR Code démo...');
    
    // Créer un SVG de démonstration en base64
    const demoSVG = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#007bff"/>
        <text x="50%" y="45%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">QR Code Demo</text>
        <text x="50%" y="55%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">SkillDropi</text>
        <text x="50%" y="65%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">Backend en configuration</text>
        <!-- Pattern simulant un QR Code -->
        <rect x="50" y="250" width="20" height="20" fill="white"/>
        <rect x="80" y="250" width="20" height="20" fill="white"/>
        <rect x="50" y="280" width="20" height="20" fill="white"/>
        <rect x="330" y="250" width="20" height="20" fill="white"/>
        <rect x="300" y="280" width="20" height="20" fill="white"/>
      </svg>
    `;
    
    const demoQRCode = `data:image/svg+xml;base64,${btoa(demoSVG)}`;
    
    setQrCode(demoQRCode);
    setSuccess('🎯 QR Code de démonstration généré !');
    setError('');
    setLoading(false);
  };

  // Charger le QR Code existant
  const loadExistingQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Chargement QR existant...');
      
      const backendConnected = await testBackendConnection();
      if (!backendConnected) {
        setError('Backend inaccessible');
        return;
      }

      const response = await apiCall('/api/qr/my-qrcode');

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setSuccess('✅ QR Code existant chargé !');
      } else {
        setError(data.message || 'Aucun QR Code trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur chargement QR:', error);
      setError('Aucun QR Code sauvegardé. Génerez-en un nouveau.');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger le QR Code
  const downloadQRCode = () => {
    if (qrCode) {
      try {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `mon-profil-skilldropi-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccess('💾 QR Code téléchargé !');
      } catch (error) {
        console.error('❌ Erreur téléchargement:', error);
        setError('Erreur lors du téléchargement');
      }
    }
  };

  return (
    <div className="qr-code-generator">
      <div className="qr-header">
        <h3>📱 QR Code de Mon Profil</h3>
        <p>Générez et partagez votre profil facilement</p>
      </div>

      {/* Indicateur de statut */}
      <div className="qr-status">
        <div className="status-item">
          <span className="status-dot online"></span>
          <span>Backend: localhost:5000</span>
        </div>
        <div className="status-item">
          <span className="status-dot warning"></span>
          <span>Routes QR: En développement</span>
        </div>
      </div>

      {/* Actions */}
      <div className="qr-actions">
        <button 
          onClick={generateQRCode} 
          disabled={loading}
          className="btn btn-primary qr-btn"
        >
          {loading ? '⏳ Génération...' : '🚀 Générer QR Code'}
        </button>
        
        <button 
          onClick={loadExistingQRCode}
          disabled={loading}
          className="btn btn-secondary qr-btn"
        >
          📥 Charger Existante
        </button>

        <button 
          onClick={generateDemoQR}
          disabled={loading}
          className="btn btn-info qr-btn"
        >
          🎯 Mode Démo
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className={`alert ${error.includes('démonstration') ? 'alert-warning' : 'alert-error'}`}>
          <div className="error-header">
            {error}
          </div>
          {error.includes('404') && (
            <div className="error-solution">
              <strong>Solution:</strong> Les routes QR sont en cours de configuration. Utilisez le mode démo pour tester.
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Affichage QR Code */}
      <div className="qr-code-display">
        {qrCode ? (
          <div className="qr-code-result">
            <div className="qr-image-container">
              <img 
                src={qrCode} 
                alt="QR Code de mon profil SkillDropi" 
                className="qr-image"
              />
            </div>
            
            <div className="qr-actions-secondary">
              <button 
                onClick={downloadQRCode}
                className="btn btn-success qr-btn"
              >
                💾 Télécharger
              </button>
              <button 
                onClick={() => setQrCode('')}
                className="btn btn-outline qr-btn"
              >
                ❌ Effacer
              </button>
            </div>
            
            <div className="qr-help">
              <p>💡 <strong>Comment utiliser votre QR Code ?</strong></p>
              <ul>
                <li>📱 Partagez-le avec vos contacts</li>
                <li>🖨️ Imprimez-le pour vos cartes de visite</li>
                <li>📧 Ajoutez-le à votre signature email</li>
                <li>🔍 Scannez-le pour voir votre profil</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="no-qr-placeholder">
            <div className="placeholder-icon">
              📱
            </div>
            <p>Aucun QR Code généré</p>
            <p className="placeholder-subtitle">
              Générez votre QR Code pour partager votre profil
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;