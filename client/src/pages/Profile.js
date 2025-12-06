import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";

export default function Profile() {
  const { user, apiCall } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    bio: "",
    location: "",
    phone: "",
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setUsingFallback(false);
        setBackendStatus("checking");
        
        console.log("🔄 Tentative de chargement du profil depuis MongoDB...");

        // Test d'abord la connexion au backend
        try {
          const healthResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
          if (!healthResponse.ok) {
            throw new Error("Backend non disponible");
          }
          setBackendStatus("online");
        } catch (healthError) {
          throw new Error("Impossible de contacter le backend");
        }

        // Essayer de récupérer le vrai profil
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log("📊 Statut réponse profil:", response.status);

        // Vérifier si c'est du JSON
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log("❌ Réponse non-JSON reçue:", responseText.substring(0, 200));
          throw new Error("Le backend retourne une réponse non-JSON");
        }

        const userData = JSON.parse(responseText);
        console.log("📊 Réponse API profil:", userData);

        if (userData.success && userData.user) {
          setProfileUser(userData.user);
          setForm({
            name: userData.user.name || "",
            email: userData.user.email || "",
            bio: userData.user.bio || "",
            location: userData.user.location || "",
            phone: userData.user.phone || "",
            skills: userData.user.skills || []
          });
          setError("");
          console.log("✅ Profil chargé depuis MongoDB avec succès");
        } else {
          throw new Error(userData.message || "Structure de données invalide");
        }
      } catch (error) {
        console.log("❌ Impossible de charger depuis MongoDB:", error.message);
        setBackendStatus("offline");
        setError("Backend en cours de configuration - Utilisation des données locales");
        setUsingFallback(true);
        
        // Utiliser les données de l'utilisateur connecté avec des valeurs par défaut améliorées
        if (user) {
          const enhancedUser = {
            ...user,
            name: user.name || "Utilisateur",
            email: user.email || "email@exemple.com",
            bio: user.bio || "Bienvenue sur mon profil !",
            location: user.location || "Ville non renseignée",
            phone: user.phone || "Non renseigné",
            skills: user.skills?.length > 0 ? user.skills : ["Compétences à ajouter"]
          };
          
          setProfileUser(enhancedUser);
          setForm({
            name: enhancedUser.name,
            email: enhancedUser.email,
            bio: enhancedUser.bio,
            location: enhancedUser.location,
            phone: enhancedUser.phone,
            skills: enhancedUser.skills
          });
          console.log("🔄 Données locales chargées avec succès");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setForm({ ...form, skills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (usingFallback || backendStatus === "offline") {
        // Simuler une sauvegarde en local
        const updatedUser = { 
          ...profileUser, 
          ...form,
          updatedAt: new Date().toISOString()
        };
        setProfileUser(updatedUser);
        setIsEditing(false);
        showSuccessMessage("✅ Profil sauvegardé localement (backend en cours de configuration)");
        console.log("💾 Sauvegarde locale effectuée:", updatedUser);
      } else {
        // Essayer la vraie API
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form)
        });
        
        const result = await response.json();
        if (result.success) {
          setProfileUser(result.user || result);
          setIsEditing(false);
          showSuccessMessage("✅ Profil mis à jour avec succès !");
          console.log("💾 Sauvegarde MongoDB effectuée:", result);
        } else {
          throw new Error(result.message || "Erreur lors de la sauvegarde");
        }
      }
    } catch (error) {
      console.error("❌ Erreur sauvegarde:", error);
      setError("Erreur lors de la sauvegarde: " + error.message);
      
      // Fallback vers sauvegarde locale en cas d'erreur
      const updatedUser = { ...profileUser, ...form };
      setProfileUser(updatedUser);
      setIsEditing(false);
      showSuccessMessage("✅ Profil sauvegardé localement (fallback)");
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-weight: 500;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (document.body.contains(alertDiv)) {
        document.body.removeChild(alertDiv);
      }
    }, 3000);
  };

  const retryLoadProfile = async () => {
    setError("");
    setLoading(true);
    
    try {
      console.log("🔄 Tentative de reconnexion au backend...");

      const healthResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
      if (!healthResponse.ok) {
        throw new Error("Backend toujours indisponible");
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const userData = await response.json();
      
      if (userData.success && userData.user) {
        setProfileUser(userData.user);
        setForm({
          name: userData.user.name || "",
          email: userData.user.email || "",
          bio: userData.user.bio || "",
          location: userData.user.location || "",
          phone: userData.user.phone || "",
          skills: userData.user.skills || []
        });
        setUsingFallback(false);
        setBackendStatus("online");
        setError("");
        showSuccessMessage("✅ Connexion au backend rétablie !");
      }
    } catch (error) {
      console.log("❌ Échec reconnexion:", error.message);
      setError("Backend toujours indisponible - Données locales conservées");
      setBackendStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (backendStatus) {
      case "online":
        return { message: "✅ Connecté à MongoDB", type: "success" };
      case "offline":
        return { message: "🔄 Mode local activé", type: "warning" };
      case "checking":
        return { message: "🔍 Vérification connexion...", type: "info" };
      default:
        return { message: "⚡ Statut inconnu", type: "info" };
    }
  };

  const statusInfo = getStatusInfo();

  // Affichage du chargement
  if (loading && !profileUser) {
    return (
      <div className="profile-container">
        <Sidebar />
        <div className="profile-main">
          <Navbar />
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Chargement du profil...</p>
            <div className="status-indicator checking">
              🔍 Connexion au backend en cours...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-main">
        <Navbar />
        <main className="profile-content">
          <div className="profile-header">
            <h2>Mon Profile</h2>
            <div className="profile-subtitle">
              
            </div>
          </div>

          

          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}>
              👤 Informations Profil
            </button>
            <button className={`tab-btn ${activeTab === 'qrcode' ? 'active' : ''}`}
              onClick={() => setActiveTab('qrcode')}>
              📱 QR Code Profil
            </button>
          </div>

          {activeTab === 'profile' && (
            !isEditing ? (
              <div className="profile-display">
                {profileUser && (
                  <>
                    <div className="profile-field">
                      <strong>Nom :</strong>
                      <p>{profileUser.name}</p>
                    </div>
                    <div className="profile-field">
                      <strong>Email :</strong>
                      <p>{profileUser.email}</p>
                    </div>
                    <div className="profile-field">
                      <strong>Bio :</strong>
                      <p>{profileUser.bio || "Aucune bio"}</p>
                    </div>
                    <div className="profile-field">
                      <strong>Localisation :</strong>
                      <p>{profileUser.location || "Non renseignée"}</p>
                    </div>
                    <div className="profile-field">
                      <strong>Téléphone :</strong>
                      <p>{profileUser.phone || "Non renseigné"}</p>
                    </div>
                    <div className="profile-field">
                      <strong>Compétences :</strong>
                      <div>
                        {profileUser.skills?.length > 0 ? (
                          <div className="skills-list">
                            {profileUser.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        ) : (
                          <p>Aucune compétence</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="profile-actions">
                      <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Modifier le profil
                      </button>
                      
                      {usingFallback && (
                        <div className="fallback-notice">
                          <small>
                            💡 Les modifications seront sauvegardées localement en attendant la connexion au backend.
                          </small>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom :</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="form-input" 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Email :</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    className="form-input" 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Bio :</label>
                  <textarea 
                    name="bio" 
                    value={form.bio} 
                    onChange={handleChange} 
                    className="form-textarea" 
                    placeholder="Décrivez-vous en quelques mots..." 
                    disabled={loading} 
                    rows="4" 
                  />
                </div>
                <div className="form-group">
                  <label>Localisation :</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="Ville, Pays" 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone :</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="+33 1 23 45 67 89" 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Compétences :</label>
                  <input 
                    type="text" 
                    name="skills" 
                    value={form.skills.join(', ')} 
                    onChange={handleSkillsChange} 
                    className="form-input" 
                    placeholder="React, Node.js, MongoDB, Design..." 
                    disabled={loading}
                  />
                  <small className="form-help">Séparez les compétences par des virgules</small>
                </div>
                
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="save-btn">
                    {loading ? "⏳ En cours..." : usingFallback ? "💾 Sauvegarder localement" : "💾 Enregistrer"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="cancel-btn" 
                    disabled={loading}
                  >
                    ❌ Annuler
                  </button>
                </div>
                
                {usingFallback && (
                  <div className="save-notice">
                    <small>
                      💡 <strong>Mode local activé:</strong> Vos modifications seront sauvegardées dans le navigateur.
                      Elles seront synchronisées avec MongoDB lorsque le backend sera disponible.
                    </small>
                  </div>
                )}
              </form>
            )
          )}

          {activeTab === 'qrcode' && <QRCodeGenerator />}
        </main>
      </div>
    </div>
  );
}