import express from "express";
import Review from "../models/Review.js";
import Service from "../models/Service.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// ✅ GET all reviews (public)
router.get("/", async (req, res) => {
  try {
    console.log("📝 Chargement de tous les avis...");
    
    const reviews = await Review.find()
      .populate("userId", "name avatar")
      .populate("serviceId", "title category price")
      .populate("sellerId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`✅ ${reviews.length} avis chargés`);
    res.json(reviews);
    
  } catch (err) {
    console.error("❌ Error GET /reviews:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors du chargement des avis",
      details: err.message 
    });
  }
});

// ✅ GET reviews for a specific service
router.get("/service/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    console.log(`📝 Avis pour le service: ${serviceId}`);
    
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: "ID de service invalide" });
    }

    const reviews = await Review.find({ serviceId })
      .populate("userId", "name avatar")
      .populate("sellerId", "name")
      .sort({ createdAt: -1 });
    
    // Calculer la note moyenne
    const averageRatingResult = await Review.aggregate([
      { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);
    
    const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].average : 0;
    
    console.log(`✅ ${reviews.length} avis trouvés pour le service, note moyenne: ${averageRating}`);
    
    res.json({
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
    
  } catch (err) {
    console.error("❌ Error GET /reviews/service:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors du chargement des avis",
      details: err.message 
    });
  }
});

// ✅ GET my reviews (as buyer - PROTECTED)
router.get("/my-reviews", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`👤 Chargement des avis de l'utilisateur: ${userId}`);
    
    const reviews = await Review.find({ userId: userId })
      .populate("serviceId", "title price category images")
      .populate("sellerId", "name avatar")
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${reviews.length} avis trouvés pour l'utilisateur`);
    res.json(reviews);
    
  } catch (err) {
    console.error("❌ Error GET /reviews/my-reviews:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors du chargement de vos avis",
      details: err.message 
    });
  }
});

// ✅ GET reviews I received (as seller - PROTECTED)
router.get("/received", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`⭐ Avis reçus par le vendeur: ${userId}`);
    
    const reviews = await Review.find({ sellerId: userId })
      .populate("userId", "name avatar")
      .populate("serviceId", "title")
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${reviews.length} avis reçus trouvés`);
    res.json(reviews);
    
  } catch (err) {
    console.error("❌ Error GET /reviews/received:", err);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: err.message 
    });
  }
});

// ✅ POST new review (PROTECTED)
router.post("/", protect, async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;
    const userId = req.user.id;
    
    console.log("➕ Nouvel avis reçu:", { serviceId, rating, userId });
    
    // Validation des champs requis
    if (!serviceId || !rating) {
      return res.status(400).json({ 
        error: "Service ID et note sont requis",
        received: { serviceId, rating }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ 
        error: "ID de service invalide",
        serviceId 
      });
    }
    
    // Vérifier si le service existe
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ 
        error: "Service non trouvé",
        serviceId 
      });
    }
    
    // Vérifier si l'utilisateur a déjà review ce service
    const existingReview = await Review.findOne({ 
      serviceId, 
      userId: userId 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        error: "Vous avez déjà évalué ce service",
        existingReviewId: existingReview._id 
      });
    }
    
    // Vérifier que l'utilisateur ne review pas son propre service
    const serviceOwnerId = service.userId?.toString() || service.userId.toString();
    if (serviceOwnerId === userId) {
      return res.status(400).json({ 
        error: "Vous ne pouvez pas évaluer votre propre service" 
      });
    }
    
    // Créer la review
    const newReview = new Review({
      serviceId,
      userId: userId,
      sellerId: serviceOwnerId,
      rating: parseInt(rating),
      comment: comment || "",
      likes: [],
      dislikes: []
    });
    
    await newReview.save();
    
    // Populer les données pour la réponse
    const populatedReview = await Review.findById(newReview._id)
      .populate("userId", "name avatar")
      .populate("serviceId", "title category")
      .populate("sellerId", "name avatar");
    
    console.log("✅ Nouvel avis créé avec succès:", {
      id: populatedReview._id,
      service: populatedReview.serviceId?.title,
      user: populatedReview.userId?.name,
      rating: populatedReview.rating
    });
    
    res.status(201).json(populatedReview);
    
  } catch (err) {
    console.error("❌ Error POST /reviews:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Données invalides",
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Vous avez déjà évalué ce service" 
      });
    }
    
    res.status(500).json({ 
      error: "Erreur serveur lors de l'ajout de l'avis",
      details: err.message 
    });
  }
});

// ✅ DELETE review (PROTECTED)
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Suppression avis: ${id} par utilisateur: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID d'avis invalide" });
    }

    const review = await Review.findOne({ 
      _id: id, 
      userId: userId 
    });
    
    if (!review) {
      return res.status(404).json({ 
        error: "Avis non trouvé ou non autorisé" 
      });
    }
    
    await Review.findByIdAndDelete(id);
    
    console.log("✅ Avis supprimé avec succès");
    res.json({ 
      message: "Avis supprimé avec succès", 
      deletedId: id 
    });
    
  } catch (err) {
    console.error("❌ Error DELETE /reviews:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors de la suppression",
      details: err.message 
    });
  }
});

// ✅ LIKE a review (PROTECTED)
router.post("/:id/like", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`👍 Like avis: ${id} par utilisateur: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID d'avis invalide" });
    }

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: "Avis non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà disliké
    const hasDisliked = review.dislikes.includes(userId);
    if (hasDisliked) {
      review.dislikes = review.dislikes.filter(dislikeId => 
        dislikeId.toString() !== userId
      );
    }

    // Toggle like
    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      review.likes = review.likes.filter(likeId => 
        likeId.toString() !== userId
      );
    } else {
      review.likes.push(userId);
    }

    await review.save();
    
    console.log(`✅ Like mis à jour - likes: ${review.likes.length}, dislikes: ${review.dislikes.length}`);
    
    res.json({ 
      likes: review.likes, 
      dislikes: review.dislikes,
      message: hasLiked ? "Like retiré" : "Review likée"
    });
    
  } catch (err) {
    console.error("❌ Error POST /reviews/like:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors du like",
      details: err.message 
    });
  }
});

// ✅ DISLIKE a review (PROTECTED)
router.post("/:id/dislike", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`👎 Dislike avis: ${id} par utilisateur: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID d'avis invalide" });
    }

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: "Avis non trouvé" });
    }

    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      review.likes = review.likes.filter(likeId => 
        likeId.toString() !== userId
      );
    }

    // Toggle dislike
    const hasDisliked = review.dislikes.includes(userId);
    if (hasDisliked) {
      review.dislikes = review.dislikes.filter(dislikeId => 
        dislikeId.toString() !== userId
      );
    } else {
      review.dislikes.push(userId);
    }

    await review.save();
    
    console.log(`✅ Dislike mis à jour - likes: ${review.likes.length}, dislikes: ${review.dislikes.length}`);
    
    res.json({ 
      likes: review.likes, 
      dislikes: review.dislikes,
      message: hasDisliked ? "Dislike retiré" : "Review dislikée"
    });
    
  } catch (err) {
    console.error("❌ Error POST /reviews/dislike:", err);
    res.status(500).json({ 
      error: "Erreur serveur lors du dislike",
      details: err.message 
    });
  }
});

// ✅ GET review stats (PROTECTED)
router.get("/stats/me", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reviewsGiven = await Review.countDocuments({ userId: userId });
    const reviewsReceived = await Review.countDocuments({ sellerId: userId });
    
    // Note moyenne reçue
    const avgRatingResult = await Review.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);
    
    const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].average : 0;
    
    res.json({
      reviewsGiven,
      reviewsReceived,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution: {
        5: await Review.countDocuments({ sellerId: userId, rating: 5 }),
        4: await Review.countDocuments({ sellerId: userId, rating: 4 }),
        3: await Review.countDocuments({ sellerId: userId, rating: 3 }),
        2: await Review.countDocuments({ sellerId: userId, rating: 2 }),
        1: await Review.countDocuments({ sellerId: userId, rating: 1 })
      }
    });
    
  } catch (err) {
    console.error("❌ Error GET /reviews/stats/me:", err);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: err.message 
    });
  }
});

// ✅ Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "✅ Reviews API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /": "Get all reviews",
      "GET /my-reviews": "Get my reviews (protected)",
      "GET /received": "Get reviews received (protected)",
      "POST /": "Create new review (protected)",
      "GET /service/:serviceId": "Get reviews for service",
      "GET /stats/me": "Get review stats (protected)"
    }
  });
});

export default router;