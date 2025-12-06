import express from "express";
import Service from "../models/Service.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

// Configuration Multer (gardez votre configuration existante)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'), false);
    }
  }
});

const router = express.Router();

/*
 * GET ALL SERVICES (avec filtres optionnels)
 */
router.get("/", async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search } = req.query;
    
    // Construire le filtre
    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filter)
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    console.error("❌ Erreur récupération services:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des services",
    });
  }
});

/*
 * GET ALL CATEGORIES
 */
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Service.distinct("category", { isActive: true });
    
    res.status(200).json(
      categories.filter(cat => cat && cat.trim() !== "").sort()
    );
  } catch (error) {
    console.error("❌ Erreur récupération catégories:", error);
    res.status(500).json([]);
  }
});

/*
 * GET ALL LOCATIONS
 */
router.get("/locations/all", async (req, res) => {
  try {
    const locations = await Service.distinct("location", { isActive: true });
    
    res.status(200).json(
      locations.filter(loc => loc && loc.trim() !== "").sort()
    );
  } catch (error) {
    console.error("❌ Erreur récupération localisations:", error);
    res.status(500).json([]);
  }
});

/*
 * CREATE SERVICE - AVEC UPLOAD D'IMAGES
 */
router.post("/", protect, upload.array('images', 5), async (req, res) => {
  try {
    console.log("=== 🚨 REQUÊTE REÇUE ===");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("User:", req.user);
    console.log("=========================");

    // Vérifier si les champs requis sont présents
    const requiredFields = ['title', 'price', 'category', 'location', 'sellerName'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log("❌ Champs manquants:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Champs manquants: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Préparer les données du service
    const serviceData = {
      title: req.body.title,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description || '',
      location: req.body.location,
      sellerName: req.body.sellerName,
      userId: req.user._id,
    };

    // Ajouter les images si elles existent
    if (req.files && req.files.length > 0) {
      serviceData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const service = await Service.create(serviceData);

    console.log("✅ Service créé:", service);
    
    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("❌ Erreur création service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      errorDetails: error.errors
    });
  }
});

/*
 * GET ALL SERVICES OF CONNECTED USER
 */
router.get("/my-services", protect, async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user._id })
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("❌ Erreur récupération services:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des services",
    });
  }
});

/*
 * UPDATE SERVICE - AVEC UPLOAD D'IMAGES
 */
router.put("/:id", protect, upload.array('images', 5), async (req, res) => {
  try {
    console.log("=== 🚨 UPDATE REÇU ===");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("=========================");

    const updateData = {
      title: req.body.title,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description || '',
      location: req.body.location,
      sellerName: req.body.sellerName,
    };

    // Ajouter les nouvelles images si elles existent
    if (req.files && req.files.length > 0) {
      updateData.$push = { 
        images: { 
          $each: req.files.map(file => `/uploads/${file.filename}`) 
        } 
      };
    }

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    ).populate('userId', 'name email phone avatar');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service introuvable",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("❌ Erreur update service:", error);
    res.status(500).json({
      success: false,
      message: "Erreur modification",
    });
  }
});

/*
 * DELETE SERVICE
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service introuvable",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service supprimé",
    });
  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur suppression",
    });
  }
});

export default router;