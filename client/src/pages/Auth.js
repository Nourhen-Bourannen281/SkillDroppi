// pages/Auth.js - VERSION CORRIGÉE
import { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Auth() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const chkRef = useRef(null);
  const forgotPasswordChkRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    name: "", email: "", password: "", phone: "", location: "", securityAnswer: "" 
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "", securityAnswer: "", newPassword: "", confirmPassword: ""
  });
  const [securityQuestion, setSecurityQuestion] = useState("");

  useEffect(() => {
    if (forgotPasswordChkRef.current) {
      forgotPasswordChkRef.current.checked = securityQuestion !== "";
    }
  }, [securityQuestion]);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError("");
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateRegisterForm = () => {
    if (registerForm.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    
    const phoneDigits = registerForm.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setError("Le numéro de téléphone doit contenir au moins 8 chiffres");
      return false;
    }
    
    if (!registerForm.name || !registerForm.email || !registerForm.password || 
        !registerForm.phone || !registerForm.location || !registerForm.securityAnswer) {
      setError("Tous les champs sont requis");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Format d'email invalide");
      return false;
    }
    
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: loginForm.email.toLowerCase().trim(),
          password: loginForm.password
        },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      if (!response.data.token) throw new Error('Token manquant');
      
      loginUser(response.data, response.data.token);
      navigate("/dashboard");

    } catch (err) {
      handleApiError(err, "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.toLowerCase().trim(),
        password: registerForm.password,
        phone: registerForm.phone.replace(/\D/g, ''),
        location: registerForm.location.trim(),
        securityAnswer: registerForm.securityAnswer.trim()
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload,
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      setSuccessMessage("Compte créé avec succès !");
      setRegisterForm({ name: "", email: "", password: "", phone: "", location: "", securityAnswer: "" });
      
      setTimeout(() => {
        if (chkRef.current) chkRef.current.checked = false;
        setSuccessMessage("");
        setLoginForm(prev => ({ ...prev, email: payload.email }));
      }, 2000);

    } catch (err) {
      handleApiError(err, "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    const emailToUse = loginForm.email || registerForm.email;
    if (!emailToUse) {
      setError("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/get-security-question",
        { email: emailToUse.toLowerCase().trim() },
        { timeout: 5000 }
      );

      setForgotPasswordData(prev => ({ ...prev, email: emailToUse }));
      setSecurityQuestion(response.data.securityQuestion);

    } catch (err) {
      handleApiError(err, "Erreur de récupération");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!forgotPasswordData.securityAnswer) {
      setError("Veuillez répondre à la question de sécurité");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email: forgotPasswordData.email,
          securityAnswer: forgotPasswordData.securityAnswer,
          newPassword: forgotPasswordData.newPassword // ✅ CORRECTION : "forgotPasswordData" au lieu de "forgotgotPasswordData"
        },
        { timeout: 5000 }
      );

      setSuccessMessage("Mot de passe réinitialisé !");
      
      setTimeout(() => {
        setSecurityQuestion("");
        setForgotPasswordData({ email: "", securityAnswer: "", newPassword: "", confirmPassword: "" });
        if (forgotPasswordChkRef.current) forgotPasswordChkRef.current.checked = false;
      }, 2000);

    } catch (err) {
      handleApiError(err, "Erreur de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err, defaultMessage) => {
    let errorMessage = defaultMessage;
    if (err.response?.data?.message) errorMessage = err.response.data.message;
    else if (err.response?.data?.error) errorMessage = err.response.data.error;
    else if (err.message) errorMessage = err.message;
    setError(errorMessage);
  };

  const switchToLogin = () => {
    if (chkRef.current) chkRef.current.checked = false;
    if (forgotPasswordChkRef.current) forgotPasswordChkRef.current.checked = false;
    setError("");
    setSuccessMessage("");
    setSecurityQuestion("");
  };

  const switchToRegister = () => {
    if (chkRef.current) chkRef.current.checked = true;
    if (forgotPasswordChkRef.current) forgotPasswordChkRef.current.checked = false;
    setError("");
    setSuccessMessage("");
    setSecurityQuestion("");
  };

  const handleBackToLogin = () => {
    if (forgotPasswordChkRef.current) forgotPasswordChkRef.current.checked = false;
    setSecurityQuestion("");
    setForgotPasswordData({ email: "", securityAnswer: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccessMessage("");
  };

  const handleCloseError = () => setError("");
  const handleCloseSuccess = () => setSuccessMessage("");

  return (
    <div className="main" onMouseMove={handleMouseMove}>
      {/* Effet de souris subtil */}
      <div 
        className="global-hover-effect"
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      />

      {/* Particules simples */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Checkboxes pour transitions */}
      <input type="checkbox" id="chk" aria-hidden="true" ref={chkRef} />
      <input type="checkbox" id="forgotPasswordChk" className="forgot-password-active" ref={forgotPasswordChkRef} style={{ display: 'none' }} />

      {/* Messages */}
      {error && <div className="error-message" onClick={handleCloseError}>{error}</div>}
      {successMessage && <div className="success-message" onClick={handleCloseSuccess}>{successMessage}</div>}

      {/* Instructions */}
      <div className="instruction-message">
        {securityQuestion ? "🔐 Répondez à votre question de sécurité" :
         chkRef.current?.checked ? "👆 Cliquez sur Connexion si vous avez un compte" :
         "👆 Cliquez sur S'inscrire pour créer un compte"}
      </div>

      {/* Formulaire d'inscription */}
      <div className="signup">
        <form onSubmit={handleRegisterSubmit}>
          <label htmlFor="chk" aria-hidden="true" onClick={switchToRegister}>S'inscrire</label>
          
          <input name="name" placeholder="Nom complet *" value={registerForm.name} onChange={handleRegisterChange} required disabled={loading} />
          <input type="email" name="email" placeholder="Email *" value={registerForm.email} onChange={handleRegisterChange} required disabled={loading} />
          <input type="tel" name="phone" placeholder="Téléphone *" value={registerForm.phone} onChange={handleRegisterChange} required disabled={loading} />
          <input name="location" placeholder="Localisation *" value={registerForm.location} onChange={handleRegisterChange} required disabled={loading} />
          <input type="password" name="password" placeholder="Mot de passe *" value={registerForm.password} onChange={handleRegisterChange} required minLength="6" disabled={loading} />
          
          <div className="security-field">
            <p className="security-question-label"><strong>Question de sécurité:</strong> Quel est le nom de votre animal de compagnie ?</p>
            <input type="text" name="securityAnswer" placeholder="Votre réponse *" value={registerForm.securityAnswer} onChange={handleRegisterChange} required disabled={loading} />
          </div>

          <button type="submit" disabled={loading}>{loading ? "⏳ Création..." : "S'inscrire"}</button>
        </form>
      </div>

      {/* Formulaire de connexion */}
      <div className="login">
        <form onSubmit={handleLoginSubmit}>
          <label htmlFor="chk" aria-hidden="true" onClick={switchToLogin}>Connexion</label>
          
          <input type="email" name="email" placeholder="Email *" value={loginForm.email} onChange={handleLoginChange} required disabled={loading} />
          <input type="password" name="password" placeholder="Mot de passe *" value={loginForm.password} onChange={handleLoginChange} required disabled={loading} />

          <button type="submit" disabled={loading}>{loading ? "⏳ Connexion..." : "Se connecter"}</button>

          <div className="forgot-password-link">
            <button type="button" onClick={handleForgotPasswordClick} className="forgot-password-btn" disabled={loading}>
              Mot de passe oublié ?
            </button>
          </div>
        </form>
      </div>

      {/* Mot de passe oublié */}
      <div className="forgot-password-container">
        <form onSubmit={securityQuestion ? handleResetPasswordSubmit : handleForgotPasswordClick}>
          <label onClick={handleBackToLogin}>Mot de passe oublié</label>
          
          {!securityQuestion ? (
            <>
              <div style={{ 
                marginBottom: '15px', 
                padding: '12px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px',
                borderLeft: '3px solid #4ecdc4'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#4ecdc4', 
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  Entrez votre email pour commencer
                </p>
              </div>
              
              <input 
                type="email" 
                name="email" 
                placeholder="Votre email *" 
                value={forgotPasswordData.email} 
                onChange={handleForgotPasswordChange} 
                required 
                disabled={loading} 
              />
              <button type="submit" disabled={loading}>
                {loading ? "⏳ Vérification..." : "Continuer"}
              </button>
            </>
          ) : (
            <>
              <div className="security-question">
                <label>Question de sécurité:</label>
                <p className="question-text">"{securityQuestion}"</p>
              </div>

              <input 
                type="text" 
                name="securityAnswer" 
                placeholder="Votre réponse *" 
                value={forgotPasswordData.securityAnswer} 
                onChange={handleForgotPasswordChange} 
                required 
                disabled={loading} 
              />
              <input 
                type="password" 
                name="newPassword" 
                placeholder="Nouveau mot de passe *" 
                value={forgotPasswordData.newPassword} 
                onChange={handleForgotPasswordChange} 
                required 
                minLength="6" 
                disabled={loading} 
              />
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirmer le mot de passe *" 
                value={forgotPasswordData.confirmPassword} 
                onChange={handleForgotPasswordChange} 
                required 
                minLength="6" 
                disabled={loading} 
              />

              <button type="submit" disabled={loading}>
                {loading ? "⏳ Réinitialisation..." : "Réinitialiser"}
              </button>
            </>
          )}

          <button type="button" onClick={handleBackToLogin} className="back-to-login" disabled={loading}>
            ↩️ Retour à la connexion
          </button>
        </form>
      </div>
    </div>
  );
}