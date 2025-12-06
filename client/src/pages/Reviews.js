import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import "../styles/Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [newReview, setNewReview] = useState({ 
    serviceId: "", 
    rating: 5, 
    comment: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  // Configuration axios
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Intercepteur pour gérer les erreurs
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("❌ API Error:", error.response?.data);
      return Promise.reject(error);
    }
  );

  // Charger toutes les reviews
  const fetchAllReviews = async () => {
    try {
      console.log("📝 Chargement de tous les avis...");
      const response = await api.get("/reviews");
      setReviews(response.data);
      console.log(`✅ ${response.data.length} avis chargés`);
    } catch (err) {
      console.error("❌ Erreur chargement tous les avis:", err);
      setError("Impossible de charger les avis");
    }
  };

  // Charger mes reviews
  const fetchMyReviews = async () => {
    if (!user) return;
    
    try {
      console.log("👤 Chargement de mes avis...");
      const response = await api.get("/reviews/my-reviews");
      setMyReviews(response.data);
      console.log(`✅ ${response.data.length} de mes avis chargés`);
    } catch (err) {
      console.error("❌ Erreur chargement mes avis:", err);
      if (err.response?.status === 401) {
        setError("Veuillez vous reconnecter");
      }
    }
  };

  // Charger les services disponibles pour review
  const fetchAvailableServices = async () => {
    if (!user) return;
    
    try {
      console.log("🛒 Chargement des services disponibles...");
      
      // Charger tous les services d'abord
      const servicesResponse = await api.get("/services");
      let allServices = [];
      
      if (Array.isArray(servicesResponse.data)) {
        allServices = servicesResponse.data;
      } else if (servicesResponse.data?.services) {
        allServices = servicesResponse.data.services;
      }
      
      // Filtrer pour exclure mes propres services
      const otherUsersServices = allServices.filter(service => {
        const serviceSellerId = service.userId?._id || service.userId;
        return serviceSellerId !== user._id;
      });
      
      setServices(otherUsersServices);
      console.log(`✅ ${otherUsersServices.length} services disponibles pour review`);
      
    } catch (err) {
      console.error("❌ Erreur chargement des services:", err);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchAllReviews();
    if (user) {
      fetchMyReviews();
      fetchAvailableServices();
    }
  }, [user]);

  // Ajouter un nouvel avis
  const handleAddReview = async () => {
    if (!newReview.serviceId || !newReview.rating) {
      setError("Veuillez sélectionner un service et donner une note");
      return;
    }

    if (!user) {
      setError("Veuillez vous connecter pour ajouter un avis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("➕ Ajout d'un nouvel avis...", newReview);
      
      const response = await api.post("/reviews", {
        serviceId: newReview.serviceId,
        rating: parseInt(newReview.rating),
        comment: newReview.comment || ""
      });
      
      console.log("✅ Avis ajouté avec succès:", response.data);
      
      // Réinitialiser le formulaire
      setNewReview({ serviceId: "", rating: 5, comment: "" });
      
      // Recharger les données
      await Promise.all([
        fetchAllReviews(),
        fetchMyReviews()
      ]);
      
      setActiveTab("my");
      alert("✅ Avis ajouté avec succès !");
      
    } catch (err) {
      console.error("❌ Erreur ajout avis:", err);
      const errorMessage = err.response?.data?.error || 
                          "Impossible d'ajouter l'avis";
      setError(errorMessage);
      alert(`❌ Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      
      // Recharger les données
      await Promise.all([
        fetchAllReviews(),
        fetchMyReviews()
      ]);
      
      alert("✅ Avis supprimé avec succès !");
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      const errorMessage = err.response?.data?.error || "Erreur lors de la suppression";
      alert(`❌ ${errorMessage}`);
    }
  };

  // Like/unlike
  const handleLike = async (reviewId) => {
    if (!user) {
      alert("Veuillez vous connecter pour liker un avis");
      return;
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/like`);
      
      // Mettre à jour l'état local
      const updatedReviews = reviews.map(review => 
        review._id === reviewId 
          ? { ...review, likes: response.data.likes, dislikes: response.data.dislikes }
          : review
      );
      setReviews(updatedReviews);
      
      const updatedMyReviews = myReviews.map(review => 
        review._id === reviewId 
          ? { ...review, likes: response.data.likes, dislikes: response.data.dislikes }
          : review
      );
      setMyReviews(updatedMyReviews);
      
    } catch (err) {
      console.error("❌ Erreur like:", err);
    }
  };

  // Dislike/undislike
  const handleDislike = async (reviewId) => {
    if (!user) {
      alert("Veuillez vous connecter pour disliker un avis");
      return;
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/dislike`);
      
      // Mettre à jour l'état local
      const updatedReviews = reviews.map(review => 
        review._id === reviewId 
          ? { ...review, likes: response.data.likes, dislikes: response.data.dislikes }
          : review
      );
      setReviews(updatedReviews);
      
      const updatedMyReviews = myReviews.map(review => 
        review._id === reviewId 
          ? { ...review, likes: response.data.likes, dislikes: response.data.dislikes }
          : review
      );
      setMyReviews(updatedMyReviews);
      
    } catch (err) {
      console.error("❌ Erreur dislike:", err);
    }
  };

  // Composant étoiles
  const StarRating = ({ rating, onRate, interactive = false, size = "24px" }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => interactive && onRate(star)}
            className={`star ${interactive ? 'interactive' : ''} ${star <= rating ? 'filled' : 'empty'}`}
            style={{ fontSize: size }}
          >
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  // Recharger les données
  const refreshData = () => {
    setError("");
    fetchAllReviews();
    if (user) {
      fetchMyReviews();
      fetchAvailableServices();
    }
  };

  return (
    <div className="reviews-container">
      <Sidebar />
      <div className="reviews-main">
        <Navbar />
        <main className="reviews-content">
          <div className="reviews-header">
            <h2>⭐ Avis & Évaluations</h2>
            <button onClick={refreshData} className="refresh-btn">
              🔄 Actualiser
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => setError("")} className="close-error-btn">
                ×
              </button>
            </div>
          )}

          {/* Onglets */}
          <div className="tabs-container">
            <button 
              onClick={() => setActiveTab("all")}
              className={`tab-btn ${activeTab === "all" ? 'active' : ''}`}
            >
              📝 Tous les Avis ({reviews.length})
            </button>
            <button 
              onClick={() => setActiveTab("my")}
              className={`tab-btn ${activeTab === "my" ? 'active' : ''}`}
            >
              👤 Mes Avis ({myReviews.length})
            </button>
            <button 
              onClick={() => setActiveTab("add")}
              className={`tab-btn ${activeTab === "add" ? 'active' : ''}`}
            >
              ➕ Ajouter un Avis
            </button>
          </div>

          {/* Formulaire d'ajout d'avis */}
          {activeTab === "add" && (
            <div className="add-review-section">
              <h3>💬 Donner mon avis</h3>
              
              <div className="review-form">
                <div className="form-group">
                  <label>📦 Service évalué *</label>
                  <select 
                    value={newReview.serviceId} 
                    onChange={(e) => setNewReview({...newReview, serviceId: e.target.value})}
                    className="service-select"
                  >
                    <option value="">-- Choisir un service --</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.title} - {service.price} DT
                        {service.userId?.name && ` (par ${service.userId.name})`}
                      </option>
                    ))}
                  </select>
                  {services.length === 0 ? (
                    <div className="services-info services-error">
                      ❌ Aucun service disponible pour évaluation
                    </div>
                  ) : (
                    <div className="services-info services-success">
                      ✅ {services.length} service(s) disponible(s) pour évaluation
                    </div>
                  )}
                </div>

                <div className="form-group rating-section">
                  <label>⭐ Note *</label>
                  <StarRating 
                    rating={newReview.rating} 
                    onRate={(rating) => setNewReview({...newReview, rating})}
                    interactive={true}
                  />
                  <div className="rating-text">
                    {newReview.rating}/5 étoiles
                  </div>
                </div>

                <div className="form-group">
                  <label>💬 Commentaire (optionnel)</label>
                  <textarea 
                    value={newReview.comment} 
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Partagez votre expérience avec ce service..."
                    rows="4"
                    className="comment-textarea"
                  />
                </div>

                <button 
                  onClick={handleAddReview}
                  disabled={loading || services.length === 0 || !newReview.serviceId}
                  className="publish-btn"
                >
                  {loading ? "⏳ Publication en cours..." : "✅ Publier mon avis"}
                </button>
              </div>
            </div>
          )}

          {/* Liste des avis */}
          <div className="reviews-list-section">
            <div className="reviews-list-header">
              <h3>
                {activeTab === "all" ? "📝 Tous les Avis" : "👤 Mes Avis"}
              </h3>
              <span className="reviews-count">
                ({activeTab === "all" ? reviews.length : myReviews.length})
              </span>
            </div>

            {(activeTab === "all" ? reviews : myReviews).length === 0 ? (
              <div className="empty-reviews">
                <div className="empty-reviews-icon">📝</div>
                <h3>
                  {activeTab === "all" ? "Aucun avis pour le moment" : "Vous n'avez encore donné aucun avis"}
                </h3>
                {activeTab === "my" && (
                  <p>Donnez votre premier avis en utilisant l'onglet "Ajouter un Avis" !</p>
                )}
              </div>
            ) : (
              <div>
                {(activeTab === "all" ? reviews : myReviews).map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-content">
                      <div className="review-main">
                        <div className="reviewer-info">
                          {review.userId?.avatar ? (
                            <img 
                              src={review.userId.avatar} 
                              alt={review.userId.name}
                              className="reviewer-avatar"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {review.userId?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className="reviewer-details">
                            <h4>{review.userId?.name || "Utilisateur"}</h4>
                            <div className="service-reference">
                              a évalué <strong>{review.serviceId?.title}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="rating-display">
                          <StarRating rating={review.rating} />
                          <span className="rating-value">
                            {review.rating}/5
                          </span>
                        </div>

                        {review.comment && (
                          <p className="review-comment">
                            "{review.comment}"
                          </p>
                        )}

                        <div className="review-meta">
                          <span className="meta-item">
                            📅 {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          {review.serviceId?.category && (
                            <span className="meta-item">
                              🏷️ {review.serviceId.category}
                            </span>
                          )}
                          {review.serviceId?.price && (
                            <span className="meta-item">
                              💰 {review.serviceId.price} DT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="review-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(review._id);
                          }}
                          disabled={!user}
                          className={`feedback-btn like-btn ${review.likes?.includes(user?._id) ? 'active' : ''}`}
                        >
                          👍 {review.likes?.length || 0}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDislike(review._id);
                          }}
                          disabled={!user}
                          className={`feedback-btn dislike-btn ${review.dislikes?.includes(user?._id) ? 'active' : ''}`}
                        >
                          👎 {review.dislikes?.length || 0}
                        </button>

                        {activeTab === "my" && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReview(review._id);
                            }}
                            className="delete-btn"
                          >
                            🗑️ Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}