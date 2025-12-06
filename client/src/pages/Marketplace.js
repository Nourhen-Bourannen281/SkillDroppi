import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";
import "../styles/Marketplace.css"; // Import de votre navbar

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    search: ""
  });
  const [loading, setLoading] = useState(false);
  
  // États pour les modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showManualImagesOnly, setShowManualImagesOnly] = useState(false);

  // États pour les reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  // Villes tunisiennes pour compléter les localisations
  const tunisianCities = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Kairouan",
    "Bizerte", "Monastir", "Nabeul", "Gabès", "Medenine", "Kasserine",
    "Gafsa", "Tozeur", "Kebili", "Tataouine", "Mahdia", "Zaghouan", "Siliana",
    "Beja", "Jendouba", "Le Kef"
  ];

  // Émojis pour les catégories
  const categoryEmojis = {
    "Technicien": "🔧",
    "Développement": "💻", 
    "Design": "🎨",
    "Marketing": "📊",
    "Consultation": "💼",
    "Formation": "📚",
    "Réparation": "🛠️",
    "Nettoyage": "🧹",
    "Plomberie": "🚰",
    "Électricité": "⚡",
    "Jardinage": "🌿",
    "Mécanique": "🔩",
    "Coiffure": "💇",
    "Cuisine": "👨‍🍳",
    "Photographie": "📷",
    "Santé": "⚕️",
    "Sport": "🏃",
    "Musique": "🎵",
    "Art": "🎭",
    "Transport": "🚗"
  };

  // Couleurs pour les badges de catégorie
  const categoryColors = {
    "Technicien": "#3498db",
    "Développement": "#9b59b6",
    "Design": "#e74c3c",
    "Marketing": "#2ecc71",
    "Consultation": "#f39c12",
    "Formation": "#1abc9c",
    "Réparation": "#e67e22",
    "Nettoyage": "#95a5a6",
    "Plomberie": "#3498db",
    "Électricité": "#f1c40f",
    "Jardinage": "#27ae60",
    "Mécanique": "#7f8c8d",
    "Coiffure": "#d35400",
    "Cuisine": "#c0392b",
    "Photographie": "#8e44ad",
    "Santé": "#e74c3c",
    "Sport": "#2980b9",
    "Musique": "#d35400",
    "Art": "#9b59b6",
    "Transport": "#16a085"
  };

  // Composant CategoryBadge
  const CategoryBadge = ({ category, size = "medium" }) => {
    const color = categoryColors[category] || "#6c757d";
    const emoji = categoryEmojis[category] || "📁";
    
    const sizes = {
      small: { padding: '6px 12px', fontSize: '12px', minWidth: '100px' },
      medium: { padding: '10px 16px', fontSize: '14px', minWidth: '120px' },
      large: { padding: '12px 20px', fontSize: '16px', minWidth: '140px' }
    };
    
    const selectedSize = sizes[size] || sizes.medium;
    
    return (
      <div 
        className="category-badge"
        style={{ 
          background: `linear-gradient(135deg, ${color}99, ${color})`,
          color: 'white',
          padding: selectedSize.padding,
          borderRadius: '25px',
          fontSize: selectedSize.fontSize,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: selectedSize.minWidth,
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          textAlign: 'center',
          border: `2px solid ${color}33`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <span style={{ fontSize: selectedSize.fontSize === '12px' ? '14px' : '16px' }}>{emoji}</span>
        {category}
      </div>
    );
  };

  // Composant StarRating
  const StarRating = ({ rating, onRate, interactive = false, size = "medium" }) => {
    const sizes = {
      small: "16px",
      medium: "20px",
      large: "24px"
    };

    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => interactive && onRate(star)}
            style={{
              cursor: interactive ? "pointer" : "default",
              fontSize: sizes[size],
              color: star <= rating ? "#ffc107" : "#ccc"
            }}
          >
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  // Charger les services avec filtres
  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await axios.get(`http://localhost:5000/api/services?${params}`);
      const servicesData = res.data.services || [];
      setServices(servicesData);
      
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories et locations disponibles
// Charger les catégories et locations disponibles
const fetchFilters = async () => {
  try {
    // Utiliser Promise.allSettled pour gérer les erreurs individuelles
    const [catResult, locResult] = await Promise.allSettled([
      axios.get("http://localhost:5000/api/services/categories/all"),
      axios.get("http://localhost:5000/api/services/locations/all")
    ]);
    
    let categories = [];
    let locations = tunisianCities; // Utiliser les villes tunisiennes par défaut
    
    // Traiter les catégories
    if (catResult.status === 'fulfilled') {
      categories = catResult.value.data.filter(cat => cat && cat.trim() !== "").sort();
    } else {
      console.warn('⚠️ Erreur chargement catégories:', catResult.reason);
    }
    
    // Traiter les localisations
    if (locResult.status === 'fulfilled') {
      const dbLocations = locResult.value.data.filter(loc => loc && loc.trim() !== "");
      locations = [...new Set([...dbLocations, ...tunisianCities])].sort();
    } else {
      console.warn('⚠️ Erreur chargement localisations:', locResult.reason);
    }
    
    setCategories(categories);
    setLocations(locations);
    
  } catch (err) {
    console.error('❌ Erreur lors du chargement des filtres:', err);
    // Utiliser les valeurs par défaut en cas d'erreur
    setCategories([]);
    setLocations(tunisianCities);
  }
};
  // Charger les reviews d'un service - CORRIGÉ
  const fetchServiceReviews = async (serviceId) => {
    try {
      console.log("🔄 Chargement des reviews pour le service:", serviceId);
      const res = await axios.get(`http://localhost:5000/api/reviews/service/${serviceId}`);
      console.log("📊 Reviews chargées:", res.data);
      
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des reviews:', err);
      console.error('Détails:', err.response?.data);
      
      // Si c'est une erreur 404, c'est normal (pas encore de reviews)
      if (err.response?.status !== 404) {
        alert("Erreur lors du chargement des avis");
      }
      
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  // Ajouter un review - CORRIGÉ
  const handleAddReview = async () => {
    if (!newReview.rating) {
      alert("Veuillez donner une note");
      return;
    }

    if (!user) {
      alert("Veuillez vous connecter pour donner un avis");
      return;
    }

    if (!token) {
      alert("Session expirée, veuillez vous reconnecter");
      return;
    }

    setReviewLoading(true);
    try {
      console.log("📤 Envoi du review:", newReview);
      
      const response = await axios.post("http://localhost:5000/api/reviews", {
        serviceId: selectedService._id,
        rating: newReview.rating,
        comment: newReview.comment
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Review ajouté:", response.data);
      
      setNewReview({ rating: 5, comment: "" });
      setShowReviewModal(false);
      
      // Recharger les reviews après un délai
      setTimeout(() => {
        fetchServiceReviews(selectedService._id);
      }, 500);
      
      alert("✅ Avis ajouté avec succès !");
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      
      const errorMessage = err.response?.data?.error || "Erreur lors de l'ajout de l'avis";
      
      if (err.response?.status === 400 && errorMessage.includes("déjà évalué")) {
        alert("❌ " + errorMessage);
        setShowReviewModal(false);
      } else if (err.response?.status === 400 && errorMessage.includes("propre service")) {
        alert("❌ " + errorMessage);
        setShowReviewModal(false);
      } else {
        alert("❌ " + errorMessage);
      }
    } finally {
      setReviewLoading(false);
    }
  };

  // Supprimer un review - CORRIGÉ
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    if (!token) {
      alert("Session expirée, veuillez vous reconnecter");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Recharger les reviews
      fetchServiceReviews(selectedService._id);
      alert("✅ Avis supprimé avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      console.error("Détails:", err.response?.data);
      
      const errorMessage = err.response?.data?.error || "Erreur lors de la suppression";
      alert("❌ " + errorMessage);
    }
  };

  // Fonction pour rediriger vers la messagerie
 // Fonction pour rediriger vers la messagerie avec message automatique
const handleMessageSeller = async (service) => {
  if (!user) {
    alert("Veuillez vous connecter pour envoyer un message");
    return;
  }

  try {
    // Créer une conversation ou récupérer l'existante
    const conversationResponse = await axios.post(
      "http://localhost:5000/api/conversations",
      {
        receiverId: service.userId?._id,
        serviceId: service._id
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const conversationId = conversationResponse.data._id;

    // Envoyer un message automatique
    const autoMessage = `Bonjour ! Je suis intéressé(e) par votre service "${service.title}" (${service.price} DT). Pouvez-vous me donner plus de détails ?`;

    await axios.post(
      "http://localhost:5000/api/messages",
      {
        conversationId: conversationId,
        text: autoMessage
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Rediriger vers la messagerie
    window.location.href = `/messenger?conversation=${conversationId}`;

  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    
    // Si erreur, rediriger quand même vers la messagerie
    window.location.href = `/messenger?seller=${service.userId?._id}&service=${service._id}`;
  }
};

  useEffect(() => {
    fetchServices();
    fetchFilters();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      search: ""
    });
  };

  // Fonction pour voir les détails
  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
    fetchServiceReviews(service._id);
  };

  // Fonction pour contacter le vendeur
  const handleContactSeller = (service) => {
    setSelectedService(service);
    setShowContactModal(true);
  };

  // Fonction pour ouvrir le modal de review
  const handleOpenReview = (service) => {
    setSelectedService(service);
    setNewReview({ rating: 5, comment: "" });
    setShowReviewModal(true);
  };

  // Fonction pour voir TOUTES les images (automatique + manuelles)
  const handleViewAllImages = (service) => {
    setSelectedService(service);
    setCurrentImageIndex(0);
    setShowManualImagesOnly(false);
    setShowImagesModal(true);
  };

  // Fonction pour voir SEULEMENT les images manuelles
  const handleViewManualImages = (service) => {
    setSelectedService(service);
    setCurrentImageIndex(0);
    setShowManualImagesOnly(true);
    setShowImagesModal(true);
  };

  // Obtenir les images manuelles seulement (sans l'image automatique)
  const getManualImages = (service) => {
    return service.images && service.images.length > 1 ? service.images.slice(1) : [];
  };

  // Navigation dans les images
  const nextImage = () => {
    const images = showManualImagesOnly && selectedService 
      ? getManualImages(selectedService)
      : (selectedService?.images || []);
    
    setCurrentImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    const images = showManualImagesOnly && selectedService 
      ? getManualImages(selectedService)
      : (selectedService?.images || []);
    
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  };

  // Obtenir l'image actuelle à afficher
  const getCurrentImage = () => {
    if (!selectedService || !selectedService.images) return null;
    
    if (showManualImagesOnly) {
      const manualImages = getManualImages(selectedService);
      return manualImages.length > 0 ? manualImages[currentImageIndex] : null;
    } else {
      return selectedService.images[currentImageIndex];
    }
  };

  // Obtenir le nombre total d'images à afficher
  const getTotalImages = () => {
    if (!selectedService || !selectedService.images) return 0;
    
    if (showManualImagesOnly) {
      return getManualImages(selectedService).length;
    } else {
      return selectedService.images.length;
    }
  };

  // Vérifier si l'utilisateur a déjà review ce service
  const userReview = reviews.find(review => review.userId?._id === user?._id);

  // Fonction pour fermer les modales
  const closeModals = () => {
    setShowDetailsModal(false);
    setShowContactModal(false);
    setShowImagesModal(false);
    setShowReviewModal(false);
    setSelectedService(null);
    setCurrentImageIndex(0);
    setShowManualImagesOnly(false);
    setReviews([]);
    setAverageRating(0);
    setTotalReviews(0);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "#1e1e2f", minHeight: "100vh" }}>
        <Navbar />
        
        <div className="marketplace-container">
          {/* En-tête */}
          <div className="marketplace-header">
            <h1>🏪 Marketplace SkillDropi</h1>
            <p>Découvrez tous les services disponibles près de chez vous</p>
          </div>

          {/* Section des filtres */}
          <div className="filters-section">
            <div className="filters-header">
              <h3>🔍 Filtres de recherche</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
                🗑️ Effacer tous les filtres
              </button>
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Rechercher un service, une compétence..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label>📂 Catégorie</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>📍 Localisation</label>
                <select 
                  value={filters.location} 
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">Toutes les localisations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>💰 Prix minimum (DT)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label>💰 Prix maximum (DT)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Filtres actifs */}
            {(filters.category || filters.location || filters.minPrice || filters.maxPrice || filters.search) && (
              <div className="active-filters">
                <span>Filtres actifs:</span>
                {filters.search && (
                  <span className="active-filter">
                    Recherche: "{filters.search}" 
                    <button onClick={() => handleFilterChange('search', '')}>×</button>
                  </span>
                )}
                {filters.category && (
                  <span className="active-filter">
                    Catégorie: {filters.category}
                    <button onClick={() => handleFilterChange('category', '')}>×</button>
                  </span>
                )}
                {filters.location && (
                  <span className="active-filter">
                    Localisation: {filters.location}
                    <button onClick={() => handleFilterChange('location', '')}>×</button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="active-filter">
                    Prix min: {filters.minPrice} DT
                    <button onClick={() => handleFilterChange('minPrice', '')}>×</button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="active-filter">
                    Prix max: {filters.maxPrice} DT
                    <button onClick={() => handleFilterChange('maxPrice', '')}>×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="results-section">
            <div className="results-header">
              <h3>
                {loading ? '⏳ Chargement...' : `📦 ${services.length} service(s) trouvé(s)`}
                {(filters.category || filters.location) && (
                  <span className="filter-indicator">
                    {filters.category && ` dans ${filters.category}`}
                    {filters.location && ` à ${filters.location}`}
                  </span>
                )}
              </h3>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Chargement des services...</p>
              </div>
            ) : services.length > 0 ? (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service._id} className="service-card">
                    {/* En-tête avec badge de catégorie et prix */}
                    <div className="service-header">
                      <CategoryBadge category={service.category} size="medium" />
                      <div className="service-price">
                        <span className="price-amount">{service.price}</span>
                        <span className="price-currency">DT</span>
                      </div>
                    </div>
                    
                    <div className="service-content">
                      <h3 className="service-title">{service.title}</h3>
                      
                      {service.description && (
                        <p className="service-description">
                          {service.description.length > 100 
                            ? `${service.description.substring(0, 100)}...` 
                            : service.description
                          }
                        </p>
                      )}
                      
                      <div className="service-meta">
                        <span className="service-location">
                          📍 {service.location}
                        </span>
                        {service.images && service.images.length > 0 && (
                          <span className="service-images-count">
                            📸 {service.images.length} photo(s)
                          </span>
                        )}
                      </div>
                      
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {service.userId?.avatar ? (
                            <img src={service.userId.avatar} alt={service.sellerName} />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </div>
                        <div className="seller-details">
                          <strong className="seller-name">
                            {service.sellerName || service.userId?.name || "Anonyme"}
                          </strong>
                          <span className="seller-rating">
                            {service.sellerRating > 0 ? (
                              <>
                                ⭐ {service.sellerRating}/5
                              </>
                            ) : (
                              <span className="new-seller">★ Nouveau</span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* BOUTON MESSAGER AJOUTÉ ICI */}
                      {user && service.userId?._id !== user._id && (
                        <button 
                          className="btn-messager"
                          onClick={() => handleMessageSeller(service)}
                          style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          💬 Messager
                        </button>
                      )}
                      
                      <div className="service-actions">
                        <button 
                          className="btn-primary"
                          onClick={() => handleViewDetails(service)}
                        >
                          👁️ Voir détails
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleContactSeller(service)}
                        >
                          📞 Contacter
                        </button>
                        {user && service.userId?._id !== user._id && (
                          <button 
                            className="btn-review"
                            onClick={() => handleOpenReview(service)}
                          >
                            ⭐ Noter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-services">
                <div className="no-services-icon">🔍</div>
                <h3>Aucun service trouvé</h3>
                <p>
                  {filters.category || filters.location || filters.search 
                    ? "Essayez de modifier vos critères de recherche ou supprimez certains filtres."
                    : "Il n'y a aucun service disponible pour le moment. Revenez plus tard !"
                  }
                </p>
                {(filters.category || filters.location || filters.search) && (
                  <button onClick={clearFilters} className="btn-primary">
                    Afficher tous les services
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modale Détails du Service */}
        <Modal 
          isOpen={showDetailsModal} 
          onClose={closeModals}
          title="📋 Détails du Service"
          size="large"
        >
          {selectedService && (
            <div className="service-details">
              {/* Section Image */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div className="detail-images-section">
                  <div className="images-header">
                    <h4>📸 Images du service</h4>
                    <div className="image-buttons">
                      <button 
                        className="view-images-btn"
                        onClick={() => handleViewAllImages(selectedService)}
                      >
                        🖼️ Toutes les images
                      </button>
                      {getManualImages(selectedService).length > 0 && (
                        <button 
                          className="view-manual-images-btn"
                          onClick={() => handleViewManualImages(selectedService)}
                        >
                          📸 Images manuelles ({getManualImages(selectedService).length})
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="detail-image-preview">
                    <img 
                      src={`http://localhost:5000${selectedService.images[0]}`}
                      alt={selectedService.title}
                      className="preview-image"
                      onClick={() => handleViewAllImages(selectedService)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="image-info">
                      <span className="automatic-badge">🖼️ Automatique</span>
                      {getManualImages(selectedService).length > 0 && (
                        <span className="manual-badge">
                          📸 +{getManualImages(selectedService).length} manuelle(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="detail-section">
                <h3>{selectedService.title}</h3>
                <div className="detail-price">{selectedService.price} DT</div>
              </div>
              
              <div className="detail-info-grid">
                <div className="detail-item">
                  <span className="detail-label">📂 Catégorie:</span>
                  <span className="detail-value">{selectedService.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Localisation:</span>
                  <span className="detail-value">{selectedService.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">👤 Vendeur:</span>
                  <span className="detail-value">{selectedService.sellerName || selectedService.userId?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{selectedService.userId?.email || "Non disponible"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📞 Téléphone:</span>
                  <span className="detail-value">{selectedService.userId?.phone || "Non disponible"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">⭐ Note moyenne:</span>
                  <span className="detail-value">
                    <StarRating rating={averageRating} size="small" />
                    {averageRating.toFixed(1)}/5 ({totalReviews} avis)
                  </span>
                </div>
              </div>
              
              <div className="detail-description">
                <h4>📝 Description:</h4>
                <p>{selectedService.description || "Aucune description fournie."}</p>
              </div>

              {/* Section Reviews */}
              <div className="reviews-section">
                <div className="reviews-header">
                  <h4>⭐ Avis des clients ({totalReviews})</h4>
                  {user && selectedService.userId?._id !== user._id && !userReview && (
                    <button 
                      className="btn-add-review"
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleOpenReview(selectedService);
                      }}
                    >
                      ✍️ Donner mon avis
                    </button>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <p>💬 Aucun avis pour le moment</p>
                    <p>Soyez le premier à donner votre avis !</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            {review.userId?.avatar ? (
                              <img src={review.userId.avatar} alt={review.userId.name} />
                            ) : (
                              <div className="reviewer-avatar">
                                {review.userId?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div>
                              <strong>{review.userId?.name || "Utilisateur"}</strong>
                              <StarRating rating={review.rating} size="small" />
                            </div>
                          </div>
                          {user?._id === review.userId?._id && (
                            <button 
                              onClick={() => handleDeleteReview(review._id)}
                              className="btn-delete-review"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        {review.comment && (
                          <p className="review-comment">"{review.comment}"</p>
                        )}
                        <div className="review-date">
                          📅 {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <div className="image-action-buttons">
                  {selectedService.images && selectedService.images.length > 0 && (
                    <button 
                      className="btn-view-images"
                      onClick={() => handleViewAllImages(selectedService)}
                    >
                      🖼️ Toutes les images
                    </button>
                  )}
                </div>
                
                {/* BOUTON MESSAGER AJOUTÉ DANS LA MODALE DÉTAILS */}
                {user && selectedService.userId?._id !== user._id && (
                  <button 
                    className="btn-messager"
                    onClick={() => handleMessageSeller(selectedService)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '10px'
                    }}
                  >
                    💬 Messager
                  </button>
                )}
                
                <button 
                  className="btn-contact"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowContactModal(true);
                  }}
                >
                  📞 Contacter le vendeur
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modale Ajouter un Avis */}
        <Modal 
          isOpen={showReviewModal} 
          onClose={closeModals}
          title="⭐ Donner mon avis"
        >
          {selectedService && (
            <div className="review-form">
              <div className="review-service-info">
                <h4>Service: {selectedService.title}</h4>
                <p>Vendeur: {selectedService.sellerName || selectedService.userId?.name}</p>
              </div>

              <div className="rating-section">
                <label>Votre note *</label>
                <StarRating 
                  rating={newReview.rating} 
                  onRate={(rating) => setNewReview({...newReview, rating})}
                  interactive={true}
                />
                <div className="rating-text">
                  {newReview.rating}/5 étoiles
                </div>
              </div>

              <div className="comment-section">
                <label>Commentaire (optionnel)</label>
                <textarea 
                  value={newReview.comment} 
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Partagez votre expérience avec ce service..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={handleAddReview}
                  disabled={reviewLoading}
                  className="btn-primary"
                >
                  {reviewLoading ? "⏳..." : "✅ Publier mon avis"}
                </button>
                <button 
                  onClick={closeModals}
                  className="btn-secondary"
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modale Images du Service */}
        <Modal 
          isOpen={showImagesModal} 
          onClose={closeModals}
          title={`${showManualImagesOnly ? '📸' : '🖼️'} ${selectedService?.title}`}
        >
          {selectedService && (
            <div className="images-modal">
              <div className="images-modal-header">
                <h4>
                  {showManualImagesOnly 
                    ? `📸 Images manuelles (${getManualImages(selectedService).length})`
                    : `🖼️ Toutes les images (${selectedService.images?.length || 0})`
                  }
                </h4>
                <div className="images-type-badge">
                  {showManualImagesOnly ? (
                    <span className="manual-badge">Images manuelles</span>
                  ) : (
                    <div className="automatic-info">
                      <span className="automatic-badge">Image automatique</span>
                      {getManualImages(selectedService).length > 0 && (
                        <span className="manual-count">+ {getManualImages(selectedService).length} manuelle(s)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="image-navigation">
                <button 
                  className="nav-btn prev-btn"
                  onClick={prevImage}
                  disabled={getTotalImages() <= 1}
                >
                  ◀️
                </button>
                
                <div className="main-image-container">
                  {getCurrentImage() ? (
                    <img 
                      src={`http://localhost:5000${getCurrentImage()}`}
                      alt={`${selectedService.title}`}
                      className="main-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                
                <button 
                  className="nav-btn next-btn"
                  onClick={nextImage}
                  disabled={getTotalImages() <= 1}
                >
                  ▶️
                </button>
              </div>
              
              {getTotalImages() > 1 && (
                <div className="image-counter">
                  Image {currentImageIndex + 1} sur {getTotalImages()}
                </div>
              )}

              {/* Indicateur image automatique */}
              {!showManualImagesOnly && selectedService.images && selectedService.images.length > 0 && (
                <div className="image-type-indicator">
                  {currentImageIndex === 0 ? (
                    <span className="automatic-indicator">🖼️ Image automatique (catégorie: {selectedService.category})</span>
                  ) : (
                    <span className="manual-indicator">📸 Image manuelle #{currentImageIndex}</span>
                  )}
                </div>
              )}
              
              <div className="service-info">
                <p><strong>Service:</strong> {selectedService.title}</p>
                <p><strong>Catégorie:</strong> {selectedService.category}</p>
                <p><strong>Prix:</strong> {selectedService.price} DT</p>
                <p><strong>Localisation:</strong> {selectedService.location}</p>
              </div>

              {/* Boutons de navigation entre types d'images */}
              <div className="images-type-navigation">
                {!showManualImagesOnly && getManualImages(selectedService).length > 0 && (
                  <button 
                    className="btn-view-manual-only"
                    onClick={() => {
                      setShowManualImagesOnly(true);
                      setCurrentImageIndex(0);
                    }}
                  >
                    📸 Voir seulement les images manuelles
                  </button>
                )}
                {showManualImagesOnly && (
                  <button 
                    className="btn-view-all"
                    onClick={() => {
                      setShowManualImagesOnly(false);
                      setCurrentImageIndex(0);
                    }}
                  >
                    🖼️ Voir toutes les images
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Modale Contact */}
        <Modal 
          isOpen={showContactModal} 
          onClose={closeModals}
          title="💬 Contacter le Vendeur"
        >
          {selectedService && (
            <div className="contact-details">
              <div className="contact-service-info">
                <h4>Service: {selectedService.title}</h4>
                <p>Prix: <strong>{selectedService.price} DT</strong></p>
              </div>
              
              <div className="seller-contact-info">
                <h4>Coordonnées du vendeur:</h4>
                <div className="contact-item">
                  <span className="contact-label">👤 Nom:</span>
                  <span className="contact-value">{selectedService.sellerName || selectedService.userId?.name}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">📧 Email:</span>
                  <span className="contact-value contact-email">
                    {selectedService.userId?.email || "Non disponible"}
                  </span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">📞 Téléphone:</span>
                  <span className="contact-value contact-phone">
                    {selectedService.userId?.phone || "Non disponible"}
                  </span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">📍 Localisation:</span>
                  <span className="contact-value">{selectedService.location}</span>
                </div>
              </div>
              
              {/* BOUTON MESSAGER AJOUTÉ DANS LA MODALE CONTACT */}
              {user && selectedService.userId?._id !== user._id && (
                <button 
                  className="btn-messager"
                  onClick={() => handleMessageSeller(selectedService)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '15px 0',
                    width: '100%'
                  }}
                >
                  💬 Ouvrir la messagerie
                </button>
              )}
              
              <div className="contact-message">
                <h4>💡 Conseil de contact:</h4>
                <p>Contactez directement le vendeur par email ou téléphone pour discuter des détails du service.</p>
                <p className="contact-tip">
                  <strong>Astuce:</strong> Mentionnez que vous venez de SkillDropi !
                </p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={closeModals}
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}