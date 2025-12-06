import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import "../styles/MyServices.css";

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [newService, setNewService] = useState({ 
    title: "", 
    price: "", 
    category: "",
    description: "",
    location: "",
    images: []
  });
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { user } = useContext(AuthContext);

  // Couleurs par catégorie pour les badges
  const categoryColors = {
    "Technicien": "#ff6b6b",
    "Développement": "#4ecdc4", 
    "Design": "#45b7d1",
    "Marketing": "#96ceb4",
    "Consultation": "#feca57",
    "Formation": "#ff9ff3",
    "Réparation": "#54a0ff",
    "Nettoyage": "#5f27cd",
    "Plomberie": "#00d2d3",
    "Électricité": "#ff9f43",
    "Jardinage": "#10ac84",
    "Mécanique": "#ee5a24",
    "Coiffure": "#c44569",
    "Cuisine": "#f368e0",
    "Photographie": "#0abde3",
    "Santé": "#ee5253",
    "Sport": "#1dd1a1",
    "Musique": "#ff9ff3",
    "Art": "#5f27cd",
    "Transport": "#54a0ff"
  };

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

  // Fonction pour obtenir le token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fonction pour générer un badge de catégorie
  const CategoryBadge = ({ category }) => {
    const color = categoryColors[category] || "#6c757d";
    const emoji = categoryEmojis[category] || "📁";
    
    return (
      <div 
        className="category-badge"
        style={{ 
          background: color,
          color: 'white',
        }}
      >
        <span style={{ fontSize: '16px' }}>{emoji}</span>
        {category}
      </div>
    );
  };

  // fetch MES services personnels
const fetchMyServices = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/services/my-services", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    // Vérification : la réponse contient un tableau ?
    if (Array.isArray(data.services)) {
      setServices(data.services);
    } else {
      console.error("❌ Mauvais format :", data);
      setServices([]); // éviter crash
    }

  } catch (error) {
    console.error("❌ Erreur fetch:", error);
  }
};

  useEffect(() => {
    fetchMyServices();
  }, []);

  // Gestion des images pour l'ajout
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Créer des URLs de prévisualisation
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    
    // Stocker les fichiers pour l'envoi
    setNewService(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newImages = [...newService.images];
    
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);
    
    setImagePreviews(newPreviews);
    setNewService(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Gestion des images pour l'édition
  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Créer des URLs de prévisualisation
    const previews = files.map(file => URL.createObjectURL(file));
    setEditImagePreviews(prev => [...prev, ...previews]);
    
    setEditingService(prev => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...files]
    }));
  };

  const removeEditImage = (index) => {
    const newPreviews = [...editImagePreviews];
    const newImages = [...(editingService.newImages || [])];
    
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);
    
    setEditImagePreviews(newPreviews);
    setEditingService(prev => ({
      ...prev,
      newImages: newImages
    }));
  };

  // AJOUTER un service
// AJOUTER un service
// AJOUTER un service - VERSION DEBUG
// AJOUTER un service - VERSION DEBUG COMPLÈTE
const handleAddService = async () => {
  // Validation améliorée
  console.log("🔍 Validation des champs:", {
    title: newService.title,
    price: newService.price,
    category: newService.category,
    location: newService.location,
    user: user
  });

  if (!newService.title || !newService.price || !newService.category || !newService.location) {
    const missing = [];
    if (!newService.title) missing.push('Titre');
    if (!newService.price) missing.push('Prix');
    if (!newService.category) missing.push('Catégorie');
    if (!newService.location) missing.push('Localisation');
    
    alert(`❌ Champs manquants: ${missing.join(', ')}`);
    return;
  }

  try {
    const token = getAuthToken();
    console.log("🔑 Token:", token ? "✓ Présent" : "✗ Manquant");
    
    const formData = new FormData();

    // DEBUG: Afficher les valeurs avant envoi
    console.log("📤 Données à envoyer:", {
      title: newService.title,
      price: newService.price,
      category: newService.category,
      location: newService.location,
      sellerName: user?.name || user?.email || 'Vendeur',
      description: newService.description,
      imagesCount: newService.images?.length || 0
    });

    // Ajouter tous les champs requis
    formData.append('title', newService.title);
    formData.append('price', newService.price.toString()); // Convertir en string
    formData.append('category', newService.category);
    formData.append('description', newService.description || '');
    formData.append('location', newService.location);
    formData.append('sellerName', user?.name || user?.email || 'Vendeur');

    // DEBUG: Vérifier le contenu de FormData
    console.log("📋 Contenu FormData (avant images):");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    // Images
    if (newService.images && newService.images.length > 0) {
      newService.images.forEach((image, index) => {
        formData.append('images', image);
        console.log(`📷 Image ${index}:`, image.name, image.type, image.size);
      });
    }

    console.log("🚀 Envoi de la requête...");
    
    const res = await axios.post("http://localhost:5000/api/services", formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 10000
    });

    console.log("✅ Succès!", res.data);
    
    // Réinitialiser le formulaire
    setNewService({ 
      title: "", 
      price: "", 
      category: "", 
      description: "", 
      location: "", 
      images: [] 
    });
    setImagePreviews([]);
    fetchMyServices();
    alert("✅ Service ajouté avec succès !");

  } catch (err) {
    console.error('❌ Erreur détaillée ajout service:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Status:', err.response?.status);
    console.error('  Data:', err.response?.data);
    console.error('  Headers:', err.response?.headers);
    
    if (err.response?.data) {
      alert(`❌ Erreur: ${err.response.data.message || JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      alert('❌ Erreur réseau - impossible de contacter le serveur');
    } else {
      alert('❌ Erreur: ' + err.message);
    }
  }
};


  // MODIFIER un service
// MODIFIER un service
const handleUpdateService = async () => {
  if (!editingService.title || !editingService.price || !editingService.category || !editingService.location) {
    return alert("Veuillez remplir tous les champs obligatoires : Titre, Prix, Catégorie et Localisation");
  }

  try {
    const token = getAuthToken();
    
    const formData = new FormData();
    formData.append('title', editingService.title);
    formData.append('price', Number(editingService.price));
    formData.append('category', editingService.category);
    formData.append('description', editingService.description || '');
    formData.append('location', editingService.location);
    formData.append('sellerName', user?.name || user?.email || 'Vendeur'); // ✅ Champ requis
    
    if (editingService.newImages && editingService.newImages.length > 0) {
      editingService.newImages.forEach((image) => {
        formData.append('images', image);
      });
    }

    await axios.put(`http://localhost:5000/api/services/${editingService._id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    setEditingService(null);
    setEditImagePreviews([]);
    fetchMyServices();
    alert("✅ Service modifié avec succès !");
    
  } catch (err) {
    console.error('Erreur lors de la modification du service:', err);
    alert(err.response?.data?.error || 'Erreur lors de la modification du service');
  }
};
  // SUPPRIMER un service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      return;
    }

    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:5000/api/services/${serviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchMyServices();
      alert("✅ Service supprimé avec succès !");
      
    } catch (err) {
      console.error('Erreur lors de la suppression du service:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression du service');
    }
  };

  // SUPPRIMER une image
  const handleDeleteImage = async (serviceId, imageIndex) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      return;
    }

    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:5000/api/services/${serviceId}/images/${imageIndex}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchMyServices();
      alert("✅ Image supprimée avec succès !");
      
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression de l\'image');
    }
  };

  // Démarrer l'édition
  const startEditing = (service) => {
    setEditingService({ 
      ...service, 
      newImages: [] // Initialiser pour les nouvelles images
    });
    setEditImagePreviews([]);
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingService(null);
    setEditImagePreviews([]);
  };

  // Voir les images
  const viewImages = (service) => {
    setSelectedService(service);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  // Navigation dans le modal d'images
  const nextImage = () => {
    if (selectedService && selectedService.images) {
      setCurrentImageIndex(prev => 
        prev < selectedService.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (selectedService && selectedService.images) {
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : selectedService.images.length - 1
      );
    }
  };

  // Fermer le modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedService(null);
    setCurrentImageIndex(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingService) {
      setEditingService(prev => ({ ...prev, [name]: value }));
    } else {
      setNewService(prev => ({ ...prev, [name]: value }));
    }
  };

  // Villes tunisiennes
  const tunisianCities = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Kairouan",
    "Bizerte", "Monastir", "Nabeul", "Gabès", "Medenine", "Kasserine",
    "Gafsa", "Tozeur", "Kebili", "Tataouine", "Mahdia", "Zaghouan", "Siliana",
    "Beja", "Jendouba", "Le Kef"
  ];

  return (
    <div className="my-services-container">
      <Sidebar />
      <div className="my-services-main">
        <Navbar />
        <main className="my-services-content">
          <div className="my-services-header">
            <h2>🎯 Mes Services</h2>
            <p>Gérez vos services proposés sur SkillDropi</p>
          </div>

          {/* Formulaire d'AJOUT */}
          {!editingService && (
            <div className="add-service-section">
              <h3>➕ Ajouter un nouveau service</h3>
              
              <div className="form-grid">
                {/* Colonne 1 */}
                <div className="form-group">
                  <label>📝 Titre du service *</label>
                  <input 
                    name="title"
                    placeholder="Ex: Réparation ordinateur" 
                    value={newService.title} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>💰 Prix (DT) *</label>
                  <input 
                    name="price"
                    placeholder="Ex: 50" 
                    type="number" 
                    value={newService.price} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>📂 Catégorie *</label>
                  <select 
                    name="category"
                    value={newService.category} 
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- Choisir une catégorie --</option>
                    {Object.keys(categoryEmojis).map(cat => (
                      <option key={cat} value={cat}>
                        {categoryEmojis[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Colonne 2 */}
                <div className="form-group">
                  <label>📍 Localisation *</label>
                  <select 
                    name="location"
                    value={newService.location} 
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- Choisir une ville --</option>
                    {tunisianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>🏠 Ou autre localisation *</label>
                  <input 
                    name="location"
                    placeholder="Ex: Tunis Centre, Sfax Médina..." 
                    value={newService.location} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                {/* Upload d'images */}
                <div className="form-group image-upload-section">
                  <label>📷 Images (optionnel)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="form-input"
                  />
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Ajoutez des photos de votre travail (max 5 images)
                  </small>

                  {/* Prévisualisation des images */}
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview">
                          <img 
                            src={preview} 
                            alt={`Preview ${index}`}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="remove-image-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>📄 Description (optionnelle)</label>
                  <textarea 
                    name="description"
                    placeholder="Décrivez votre service en détail..." 
                    value={newService.description} 
                    onChange={handleInputChange}
                    rows="4"
                    className="form-textarea"
                  />
                </div>
                
                {/* Bouton d'ajout */}
                <div className="form-actions">
                  <button 
                    onClick={handleAddService}
                    className="add-btn"
                  >
                    ➕ Ajouter le service
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de MODIFICATION */}
          {editingService && (
            <div className="edit-service-section">
              <h3>✏️ Modifier le service</h3>
              
              <div className="form-grid">
                {/* Colonne 1 */}
                <div className="form-group">
                  <label>📝 Titre du service *</label>
                  <input 
                    name="title"
                    value={editingService.title} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>💰 Prix (DT) *</label>
                  <input 
                    name="price"
                    type="number" 
                    value={editingService.price} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>📂 Catégorie *</label>
                  <select 
                    name="category"
                    value={editingService.category} 
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- Choisir une catégorie --</option>
                    {Object.keys(categoryEmojis).map(cat => (
                      <option key={cat} value={cat}>
                        {categoryEmojis[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Colonne 2 */}
                <div className="form-group">
                  <label>📍 Localisation *</label>
                  <select 
                    name="location"
                    value={editingService.location} 
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- Choisir une ville --</option>
                    {tunisianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>🏠 Ou autre localisation *</label>
                  <input 
                    name="location"
                    value={editingService.location} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                {/* Upload d'images supplémentaires pour l'édition */}
                <div className="form-group image-upload-section">
                  <label>📷 Ajouter des images supplémentaires</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="form-input"
                  />

                  {/* Prévisualisation des nouvelles images pour l'édition */}
                  {editImagePreviews.length > 0 && (
                    <div className="image-previews">
                      {editImagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview">
                          <img 
                            src={preview} 
                            alt={`Preview ${index}`}
                          />
                          <button
                            onClick={() => removeEditImage(index)}
                            className="remove-image-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images existantes du service */}
                {editingService.images && editingService.images.length > 0 && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>🖼️ Images actuelles</label>
                    <div className="image-previews">
                      {editingService.images.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img 
                            src={`http://localhost:5000${image}`}
                            alt={`Image ${index}`}
                          />
                          <button
                            onClick={() => handleDeleteImage(editingService._id, index)}
                            className="remove-image-btn"
                          >
                            ×
                          </button>
                          <div style={{ 
                            fontSize: '10px', 
                            textAlign: 'center', 
                            marginTop: 2,
                            color: '#856404'
                          }}>
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>📄 Description (optionnelle)</label>
                  <textarea 
                    name="description"
                    value={editingService.description} 
                    onChange={handleInputChange}
                    rows="4"
                    className="form-textarea"
                  />
                </div>
                
                {/* Boutons d'action */}
                <div className="form-actions">
                  <button 
                    onClick={handleUpdateService}
                    className="save-btn"
                  >
                    💾 Sauvegarder
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="cancel-btn"
                  >
                    ❌ Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste de MES services */}
          <div className="services-list-section">
            <div className="services-list-header">
              <h3>📦 Mes services</h3>
              <span className="services-count">{services.length}</span>
            </div>
            
            {loading ? (
              <div className="loading">
                <p>⏳ Chargement de vos services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="empty-services">
                <div className="empty-services-icon">📭</div>
                <h3>Aucun service créé pour le moment</h3>
                <p>Ajoutez votre premier service ci-dessus !</p>
              </div>
            ) : (
              <div>
                {services.map(service => (
                  <div key={service._id} className="service-card">
                    {/* Badge de catégorie */}
                    <div>
                      <CategoryBadge category={service.category} />
                    </div>

                    <div className="service-content">
                      <div className="service-header">
                        <h4 className="service-title">{service.title}</h4>
                      </div>
                      
                      {service.description && (
                        <p className="service-description">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="service-meta">
                        <span className="meta-item price">
                          💰 {service.price} DT
                        </span>
                        <span className="meta-item location">
                          📍 {service.location}
                        </span>
                        <span className="meta-item date">
                          📅 {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Bouton pour voir les images */}
                      {service.images && service.images.length > 0 && (
                        <button 
                          onClick={() => viewImages(service)}
                          className="view-images-btn"
                        >
                          📸 Voir images ({service.images.length})
                        </button>
                      )}
                    </div>
                    
                    <div className="service-actions">
                      <button 
                        onClick={() => startEditing(service)}
                        className="edit-btn"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="delete-btn"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Modal pour afficher les images */}
        {showImageModal && selectedService && selectedService.images && selectedService.images.length > 0 && (
          <div className="image-modal">
            <div className="image-modal-content">
              <div className="image-modal-header">
                <h3>📸 Images - {selectedService.title}</h3>
                <button 
                  onClick={closeImageModal}
                  className="close-modal-btn"
                >
                  ×
                </button>
              </div>

              {/* Navigation (si plusieurs images) */}
              {selectedService.images.length > 1 && (
                <div className="image-navigation">
                  <button 
                    onClick={prevImage}
                    className="nav-btn"
                  >
                    ◀️ Précédent
                  </button>

                  <div className="image-counter">
                    Image {currentImageIndex + 1} sur {selectedService.images.length}
                  </div>

                  <button 
                    onClick={nextImage}
                    className="nav-btn"
                  >
                    Suivant ▶️
                  </button>
                </div>
              )}

              {/* Image principale */}
              <div className="main-image-container">
                <img 
                  src={`http://localhost:5000${selectedService.images[currentImageIndex]}`}
                  alt={selectedService.title}
                  className="main-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ 
                  display: 'none', 
                  width: 300, 
                  height: 300, 
                  background: '#444', 
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <span style={{ fontSize: '48px' }}>📷</span>
                  <p>Image non disponible</p>
                </div>
              </div>

              {/* Informations du service */}
              <div className="service-info-panel">
                <p><strong>Catégorie:</strong> {selectedService.category}</p>
                <p><strong>Prix:</strong> {selectedService.price} DT</p>
                <p><strong>Localisation:</strong> {selectedService.location}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}