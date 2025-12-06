// routes/analytics.js - VERSION COMPLÈTE CORRIGÉE
import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Route de santé
router.get("/health-test", (req, res) => {
  res.json({ 
    status: "✅ Analytics API fonctionne",
    timestamp: new Date().toISOString()
  });
});

// ✅ CORRECTION CRITIQUE : Dashboard stats - VERSION CORRIGÉE
router.get("/dashboard-stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🎯 Dashboard stats pour user:", userId);

    // ✅ CORRECTION : Vérifier que l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "ID utilisateur invalide",
        userId: userId
      });
    }

    // 1. ✅ CORRECTION : Services de l'utilisateur - champ corrigé
    const totalServices = await Service.countDocuments({ userId: userId });
    console.log("📊 Services trouvés pour user", userId + ":", totalServices);

    // 2. ✅ CORRECTION : Commandes où l'utilisateur est vendeur - champs corrigés
    const sellerOrders = await Order.find({
      $or: [
        { sellerId: userId }, // ✅ CORRECTION : sellerId au lieu de serviceProvider/seller
        { 'service.userId': userId }
      ]
    });
    console.log("📦 Commandes trouvées pour vendeur", userId + ":", sellerOrders.length);

    // Commandes actives (toutes sauf completed/annulées)
    const activeOrders = sellerOrders.filter(order => {
      const status = order.status?.toLowerCase() || '';
      return !status.includes('complete') && 
             !status.includes('done') && 
             !status.includes('cancel');
    }).length;

    // 3. ✅ CORRECTION : Avis reçus - champs corrigés
    const totalReviews = await Review.countDocuments({
      $or: [
        { sellerId: userId }, // ✅ CORRECTION : sellerId direct
        { 'service.userId': userId }
      ]
    });
    console.log("⭐ Avis trouvés pour vendeur", userId + ":", totalReviews);

    // 4. ✅ CORRECTION : Revenu mensuel - calcul amélioré
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Commandes complétées ce mois
    const completedOrdersThisMonth = await Order.find({
      sellerId: userId,
      status: { 
        $in: ['completed', 'done', 'delivered'] 
      },
      createdAt: {
        $gte: currentMonth,
        $lt: nextMonth
      }
    });

    let monthlyRevenue = 0;
    completedOrdersThisMonth.forEach(order => {
      monthlyRevenue += order.price || 0;
    });

    console.log("💰 Revenu mensuel calculé:", monthlyRevenue, "pour", completedOrdersThisMonth.length, "commandes");

    const finalStats = {
      totalServices,
      activeOrders,
      totalReviews,
      monthlyRevenue
    };

    console.log("🎉 STATS FINALES:", finalStats);
    res.json(finalStats);

  } catch (error) {
    console.error("❌ Erreur dashboard-stats:", error);
    res.status(500).json({ 
      error: "Erreur serveur lors du chargement des statistiques",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ CORRECTION : Chart data - VERSION CORRIGÉE
router.get("/chart-data", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📈 Chart data pour user:", userId);

    // ✅ CORRECTION : Vérifier que l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "ID utilisateur invalide",
        userId: userId
      });
    }

    // Dates des 7 derniers jours
    const days = [];
    const servicesData = [];
    const ordersData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      // ✅ CORRECTION : Services créés ce jour - champ corrigé
      const servicesCount = await Service.countDocuments({
        userId: userId, // ✅ CORRECTION : userId au lieu de user
        createdAt: {
          $gte: date,
          $lt: nextDay
        }
      });

      // ✅ CORRECTION : Commandes créées ce jour - champs corrigés
      const ordersCount = await Order.countDocuments({
        $or: [
          { sellerId: userId }, // ✅ CORRECTION : sellerId
          { buyerId: userId }
        ],
        createdAt: {
          $gte: date,
          $lt: nextDay
        }
      });

      days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
      servicesData.push(servicesCount);
      ordersData.push(ordersCount);
    }

    const chartData = {
      services: servicesData,
      orders: ordersData,
      days: days
    };

    console.log("✅ Chart data généré:", chartData);
    res.json(chartData);

  } catch (error) {
    console.error("❌ Erreur chart-data:", error);
    res.status(500).json({ 
      error: "Erreur serveur lors du chargement des données graphiques",
      message: error.message 
    });
  }
});

// ✅ CORRECTION : Debug des données utilisateur - VERSION CORRIGÉE
router.get("/debug-user-data", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log("🐛 Debug data pour user:", userId);

    // ✅ CORRECTION : Champs corrigés dans toutes les requêtes
    const services = await Service.find({ userId: userId });
    const orders = await Order.find({
      $or: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    });
    const reviews = await Review.find({
      $or: [
        { sellerId: userId },
        { userId: userId }
      ]
    });

    const debugData = {
      user: {
        id: userId,
        name: req.user.name,
        email: req.user.email
      },
      services: {
        count: services.length,
        items: services.map(s => ({ 
          id: s._id, 
          title: s.title, 
          price: s.price,
          userId: s.userId 
        }))
      },
      orders: {
        count: orders.length,
        items: orders.map(o => ({ 
          id: o._id, 
          status: o.status, 
          price: o.price,
          sellerId: o.sellerId,
          buyerId: o.buyerId,
          serviceId: o.serviceId
        }))
      },
      reviews: {
        count: reviews.length,
        items: reviews.map(r => ({ 
          id: r._id, 
          rating: r.rating,
          serviceId: r.serviceId,
          userId: r.userId,
          sellerId: r.sellerId
        }))
      },
      databaseInfo: {
        totalServices: await Service.countDocuments(),
        totalOrders: await Order.countDocuments(),
        totalReviews: await Review.countDocuments(),
        totalUsers: await User.countDocuments()
      }
    };

    console.log("🐛 DEBUG DATA:", {
      servicesCount: services.length,
      ordersCount: orders.length, 
      reviewsCount: reviews.length
    });

    res.json(debugData);

  } catch (error) {
    console.error("❌ Erreur debug:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ NOUVELLE ROUTE : Test de connexion base de données
router.get("/database-test", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tests = {
      userExists: await User.findById(userId) ? true : false,
      userServices: await Service.countDocuments({ userId: userId }),
      userOrdersAsSeller: await Order.countDocuments({ sellerId: userId }),
      userOrdersAsBuyer: await Order.countDocuments({ buyerId: userId }),
      userReviewsGiven: await Review.countDocuments({ userId: userId }),
      userReviewsReceived: await Review.countDocuments({ sellerId: userId }),
      databaseConnected: mongoose.connection.readyState === 1
    };

    res.json({
      message: "✅ Test de base de données réussi",
      userId: userId,
      tests: tests,
      mongooseState: mongoose.connection.readyState,
      databaseName: mongoose.connection.name
    });

  } catch (error) {
    console.error("❌ Erreur database-test:", error);
    res.status(500).json({ 
      error: "Erreur test base de données",
      message: error.message 
    });
  }
});

export default router;