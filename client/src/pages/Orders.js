import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import "../styles/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);
  
  // ✅ CORRECTION : Fonction pour obtenir le token
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("🔑 Token récupéré:", token ? "✓ Présent" : "✗ Manquant");
    return token;
  };

  const userId = user?._id;

  // ✅ CORRECTION : Charger TOUTES les commandes
  const fetchAllOrders = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        setError("Token non trouvé. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      console.log("📦 Chargement des commandes...");
      
      const response = await axios.get("http://localhost:5000/api/orders", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Commandes chargées:", response.data);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
      }
      
    } catch (err) {
      console.error("❌ Erreur chargement orders:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Non autorisé. Token invalide ou expiré.");
      } else {
        setError("Erreur lors du chargement des commandes");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Charger les services disponibles
  const fetchServices = async () => {
    setServicesLoading(true);
    setError("");
    
    try {
      console.log("🛠️ Chargement des services...");
      const response = await axios.get("http://localhost:5000/api/services");
      
      let servicesData = [];
      
      if (Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response.data && Array.isArray(response.data.services)) {
        servicesData = response.data.services;
      } else if (response.data && typeof response.data === 'object') {
        servicesData = response.data.services || [];
      }
      
      console.log("✅ Services chargés:", servicesData.length);
      setServices(servicesData);
      
    } catch (err) {
      console.error("❌ Erreur chargement services:", err);
      setError("Erreur lors du chargement des services");
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchServices();
  }, [userId]);

  // ✅ CORRECTION : Commander un service
  const handleOrderService = async () => {
    if (!selectedService) {
      setError("❌ Veuillez choisir un service à commander !");
      return;
    }

    const service = services.find(s => s._id === selectedService);
    if (!service) {
      setError("❌ Service non trouvé !");
      return;
    }

    // Vérification si je suis le vendeur
    const serviceSellerId = service.userId?._id || service.userId;
    if (serviceSellerId === userId) {
      setError("❌ Vous ne pouvez pas commander votre propre service !");
      return;
    }

    const sellerId = serviceSellerId;
    const price = service.price;

    console.log("🆕 Données de la commande:", {
      serviceId: selectedService,
      buyerId: userId,
      sellerId: sellerId,
      price: price
    });

    setOrderLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      
      if (!token) {
        setError("Token non trouvé. Veuillez vous reconnecter.");
        setOrderLoading(false);
        return;
      }

      const response = await axios.post("http://localhost:5000/api/orders", {
        serviceId: selectedService,
        buyerId: userId,
        sellerId: sellerId,
        price: price
      }, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Commande créée:", response.data);
      
      // Recharger la liste des commandes
      await fetchAllOrders();
      setSelectedService("");
      setError("");
      
      alert("✅ Commande passée avec succès !");
      
    } catch (err) {
      console.error("❌ Erreur création commande:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Non autorisé. Token invalide ou expiré.");
      } else {
        const errorMessage = err.response?.data?.message || "Impossible de passer la commande";
        setError(`❌ Erreur: ${errorMessage}`);
      }
    } finally {
      setOrderLoading(false);
    }
  };

  // ✅ CORRECTION : Supprimer une commande
  const handleDeleteOrder = async (orderId, buyerId) => {
    const orderBuyerId = buyerId?._id || buyerId;
    if (orderBuyerId !== userId) {
      setError("❌ Vous ne pouvez supprimer que vos propres commandes !");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;

    try {
      const token = getAuthToken();
      
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchAllOrders();
      setError("");
      alert("✅ Commande annulée !");
      
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      setError("❌ Erreur lors de l'annulation de la commande");
    }
  };

  // ✅ CORRECTION : Changer le statut d'une commande
  const handleUpdateStatus = async (order, newStatus) => {
    const sellerId = order.sellerId?._id || order.sellerId;
    if (sellerId !== userId) {
      setError("❌ Vous ne pouvez modifier que le statut de vos services vendus !");
      return;
    }

    try {
      const token = getAuthToken();
      
      await axios.put(`http://localhost:5000/api/orders/${order._id}`, 
        { status: newStatus }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchAllOrders();
      setError("");
      alert("✅ Statut mis à jour !");
      
    } catch (err) {
      console.error("❌ Erreur mise à jour:", err);
      setError("❌ Erreur de mise à jour du statut");
    }
  };

  // Fonctions utilitaires
  const getSellerName = (order) => {
    if (typeof order.sellerId === 'object') {
      return order.sellerId.name || order.sellerId.email || 'Inconnu';
    }
    return 'Utilisateur';
  };

  const getBuyerName = (order) => {
    if (typeof order.buyerId === 'object') {
      return order.buyerId.name || order.buyerId.email || 'Inconnu';
    }
    return 'Utilisateur';
  };

  const isMyService = (order) => {
    const sellerId = order.sellerId?._id || order.sellerId;
    return sellerId === userId;
  };

  const isMyOrder = (order) => {
    const buyerId = order.buyerId?._id || order.buyerId;
    return buyerId === userId;
  };

  const getOtherUsersServices = () => {
    return services.filter(service => {
      const serviceSellerId = service.userId?._id || service.userId;
      return serviceSellerId !== userId;
    });
  };

  const otherUsersServices = getOtherUsersServices();

  const clearError = () => {
    setError("");
  };

  return (
    <div className="orders-container">
      <Sidebar />
      <div className="orders-main">
        <Navbar />
        <main className="orders-content">
          <div className="orders-header">
            <h2>🛒 Commandes</h2>
            <p>Gérez vos commandes et vos ventes sur SkillDropi</p>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
              <button onClick={clearError} className="close-error">×</button>
            </div>
          )}

          <div className="order-service-section">
            <h3>🎯 Commander un Service</h3>
            
            <div className="order-form">
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="service-select"
                disabled={servicesLoading || orderLoading}
              >
                <option value="">-- Choisir un service à commander --</option>
                {servicesLoading ? (
                  <option value="" disabled>Chargement des services...</option>
                ) : (
                  otherUsersServices.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.title} - {service.price} DT (par {service.sellerName || service.userId?.name || 'Anonyme'})
                    </option>
                  ))
                )}
              </select>

              <button 
                onClick={handleOrderService}
                disabled={orderLoading || !selectedService || servicesLoading}
                className="order-btn"
              >
                {orderLoading ? "⏳ Traitement..." : "🛒 Commander"}
              </button>
            </div>
          </div>

          <div className="orders-list-section">
            <div className="orders-list-header">
              <h3>📋 Toutes les Commandes</h3>
              <span className="orders-count">{orders.length}</span>
              <button 
                onClick={fetchAllOrders}
                disabled={loading}
                className="refresh-btn"
              >
                {loading ? "⏳" : "🔄"} Actualiser
              </button>
            </div>

            {loading ? (
              <div className="loading">
                <p>⏳ Chargement des commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-orders-icon">📭</div>
                <h3>Aucune commande pour le moment</h3>
                <p>Soyez le premier à commander un service !</p>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => {
                  const isMyOrderResult = isMyOrder(order);
                  const isMyServiceResult = isMyService(order);
                  
                  return (
                    <div key={order._id} className={`order-card ${isMyOrderResult ? 'my-order' : ''} ${isMyServiceResult ? 'my-service' : ''}`}>
                      {isMyOrderResult && (
                        <div className="order-badge my-order-badge">👤 Ma commande</div>
                      )}
                      {isMyServiceResult && (
                        <div className="order-badge my-service-badge">💼 Mon service</div>
                      )}

                      <div className="order-content">
                        <div className="order-info">
                          <h4 className="order-title">
                            {order.serviceId?.title || "Service sans titre"}
                          </h4>
                          
                          <div className="order-meta">
                            <span className="order-price">💰 {order.price} DT</span>
                            <span className={`order-status status-${order.status}`}>
                              {order.status === "pending" ? "⏳ En attente" : 
                               order.status === "in progress" ? "🔄 En cours" : 
                               order.status === "completed" ? "✅ Terminé" :
                               order.status === "cancelled" ? "❌ Annulé" :
                               "📦 " + order.status}
                            </span>
                          </div>

                          <div className="order-details">
                            <div className="order-detail">
                              <strong>Acheteur:</strong> {getBuyerName(order)}
                              {isMyOrderResult && " (Vous)"}
                            </div>
                            <div className="order-detail">
                              <strong>Vendeur:</strong> {getSellerName(order)}
                              {isMyServiceResult && " (Vous)"}
                            </div>
                            <div className="order-date">
                              📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>

                        <div className="order-actions">
                          {isMyServiceResult && order.status !== "completed" && order.status !== "cancelled" && (
                            <button 
                              onClick={() => handleUpdateStatus(order, 
                                order.status === "pending" ? "in progress" : "completed"
                              )}
                              className="action-btn status-btn"
                            >
                              {order.status === "pending" ? "🔄 Commencer" : "✅ Terminer"}
                            </button>
                          )}

                          {isMyOrderResult && order.status === "pending" && (
                            <button 
                              onClick={() => handleDeleteOrder(order._id, order.buyerId)}
                              className="action-btn cancel-btn"
                            >
                              ❌ Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}