import express from "express";
import Order from "../models/Order.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";

const router = express.Router();

// ✅ CORRECTION : Middleware de protection SIMPLIFIÉ
const protect = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  console.log("🔐 Headers reçus:", req.headers);
  console.log("🔐 Authorization header:", authHeader);
  
  if (!authHeader) {
    console.log("❌ Header Authorization manquant");
    return res.status(401).json({ 
      success: false, 
      message: "Token manquant" 
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log("❌ Format Bearer manquant");
    return res.status(401).json({ 
      success: false, 
      message: "Format de token invalide. Utilisez 'Bearer <token>'" 
    });
  }
  
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token || token === 'null' || token === 'undefined') {
    console.log("❌ Token vide ou invalide");
    return res.status(401).json({ 
      success: false, 
      message: "Token invalide" 
    });
  }
  
  console.log("✅ Token reçu:", token);
  
  // ✅ CORRECTION : User temporaire - À REMPLACER par votre vrai middleware JWT
  req.user = { 
    _id: '6921a3e7bd79c28558577456', // ID de l'utilisateur connecté
    name: 'Utilisateur Connecté'
  };
  
  console.log(`🔐 User authentifié: ${req.user.name} (${req.user._id})`);
  next();
};

// GET all orders
router.get("/", protect, async (req, res) => {
  try {
    console.log("📦 Récupération de toutes les commandes...");
    console.log("🔐 User making request:", req.user._id);
    
    const orders = await Order.find()
      .populate("serviceId", "title price description category sellerName images location")
      .populate("buyerId", "name email avatar phone location")
      .populate("sellerId", "name email avatar phone location")
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${orders.length} commandes trouvées`);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (err) {
    console.error("❌ Erreur récupération commandes:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors du chargement des commandes",
      error: err.message 
    });
  }
});

// GET orders by user ID
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📦 Récupération commandes pour user: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide"
      });
    }

    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    })
      .populate("serviceId", "title price description category sellerName images")
      .populate("buyerId", "name email avatar")
      .populate("sellerId", "name email avatar")
      .sort({ createdAt: -1 });

    console.log(`✅ ${orders.length} commandes trouvées pour l'utilisateur`);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (err) {
    console.error("❌ Erreur récupération commandes utilisateur:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors du chargement des commandes utilisateur",
      error: err.message 
    });
  }
});

// GET my orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`📦 Récupération des commandes de l'utilisateur: ${userId}`);
    
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    })
      .populate("serviceId", "title price description category sellerName images location")
      .populate("buyerId", "name email avatar phone")
      .populate("sellerId", "name email avatar phone")
      .sort({ createdAt: -1 });

    console.log(`✅ ${orders.length} commandes personnelles trouvées`);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (err) {
    console.error("❌ Erreur récupération commandes personnelles:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors du chargement de vos commandes",
      error: err.message 
    });
  }
});

// POST new order
router.post("/", protect, async (req, res) => {
  try {
    const { serviceId, buyerId, sellerId, price } = req.body;

    console.log("🆕 Création nouvelle commande:", { serviceId, buyerId, sellerId, price });

    // Validation des champs requis
    if (!serviceId || !buyerId || !sellerId || price === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs sont requis: serviceId, buyerId, sellerId, price",
        received: { serviceId, buyerId, sellerId, price }
      });
    }

    // Validation des IDs MongoDB
    const isValidObjectId = (id) => {
      return mongoose.Types.ObjectId.isValid(id);
    };

    if (!isValidObjectId(serviceId) || !isValidObjectId(buyerId) || !isValidObjectId(sellerId)) {
      return res.status(400).json({ 
        success: false,
        message: "Un ou plusieurs IDs sont invalides"
      });
    }

    // Vérifier que l'acheteur n'est pas le vendeur
    if (buyerId === sellerId) {
      return res.status(400).json({ 
        success: false,
        message: "Vous ne pouvez pas commander votre propre service" 
      });
    }

    // Vérifier l'existence du service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: "Service non trouvé"
      });
    }

    // Vérifier que le vendeur correspond au propriétaire du service
    const serviceOwnerId = service.userId.toString();
    if (serviceOwnerId !== sellerId) {
      return res.status(400).json({ 
        success: false,
        message: "Le vendeur ne correspond pas au propriétaire du service"
      });
    }

    // Vérifier si une commande similaire existe déjà
    const existingOrder = await Order.findOne({
      serviceId: serviceId,
      buyerId: buyerId,
      status: { $in: ["pending", "in progress"] }
    });

    if (existingOrder) {
      return res.status(400).json({ 
        success: false,
        message: "Vous avez déjà une commande en cours pour ce service"
      });
    }

    // Créer la nouvelle commande
    const newOrder = new Order({ 
      serviceId: serviceId, 
      buyerId: buyerId, 
      sellerId: sellerId, 
      price: Number(price),
      status: "pending"
    });
    
    await newOrder.save();
    
    // Récupérer la commande avec les données peuplées
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("serviceId", "title price description category sellerName images location")
      .populate("buyerId", "name email avatar phone")
      .populate("sellerId", "name email avatar phone");
    
    console.log("✅ Commande créée avec succès:", populatedOrder._id);
    
    res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      order: populatedOrder
    });
    
  } catch (err) {
    console.error("❌ Erreur création commande:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Données de commande invalides",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la création de la commande",
      error: err.message 
    });
  }
});

// PUT update order status
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Mise à jour commande ${id} - Nouveau statut: ${status}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID commande invalide"
      });
    }

    // Statuts valides
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Statut invalide", 
        validStatuses: validStatuses 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { 
        status: status, 
        updatedAt: new Date() 
      }, 
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate("serviceId", "title price description sellerName")
      .populate("buyerId", "name email avatar")
      .populate("sellerId", "name email avatar");
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée"
      });
    }
    
    console.log("✅ Commande mise à jour avec succès");
    
    res.status(200).json({
      success: true,
      message: "Statut de commande mis à jour",
      order: updatedOrder
    });
    
  } catch (err) {
    console.error("❌ Erreur mise à jour commande:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la mise à jour de la commande",
      error: err.message 
    });
  }
});

// DELETE order
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Suppression commande: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID commande invalide"
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée"
      });
    }
    
    console.log("✅ Commande supprimée avec succès");
    
    res.status(200).json({
      success: true,
      message: "Commande supprimée avec succès",
      deletedOrder: {
        id: deletedOrder._id,
        serviceId: deletedOrder.serviceId,
        buyerId: deletedOrder.buyerId
      }
    });
    
  } catch (err) {
    console.error("❌ Erreur suppression commande:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la suppression de la commande",
      error: err.message 
    });
  }
});

export default router;