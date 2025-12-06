import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Récupérer les conversations d'un utilisateur
router.get("/conversations", protect, async (req, res) => {
  try {
    console.log("📨 Récupération conversations pour:", req.user.id);
    
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email avatar')
    .sort({ lastMessageAt: -1 });

    console.log(`✅ ${conversations.length} conversations trouvées`);
    res.json(conversations);
  } catch (error) {
    console.error("❌ Erreur récupération conversations:", error);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: error.message 
    });
  }
});

// ✅ Récupérer les messages d'une conversation
router.get("/conversations/:conversationId/messages", protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log("📩 Récupération messages pour conversation:", conversationId);

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    console.log(`✅ ${messages.length} messages chargés`);
    res.json(messages);
  } catch (error) {
    console.error("❌ Erreur récupération messages:", error);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: error.message 
    });
  }
});

// ✅ Démarrer une nouvelle conversation
router.post("/conversations/start", protect, async (req, res) => {
  try {
    const { participantId } = req.body;

    console.log("💬 Début création conversation:", { 
      userId: req.user.id, 
      participantId 
    });

    // Validation
    if (!participantId) {
      return res.status(400).json({ message: "ID participant requis" });
    }

    // Vérifier que l'utilisateur ne démarre pas une conversation avec lui-même
    if (req.user.id === participantId) {
      return res.status(400).json({ message: "Impossible de démarrer une conversation avec vous-même" });
    }

    // Vérifier si le participant existe
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { 
        $all: [req.user.id, participantId],
        $size: 2
      }
    })
    .populate('participants', 'name email avatar');

    if (!conversation) {
      console.log("🆕 Création nouvelle conversation");
      conversation = new Conversation({
        participants: [req.user.id, participantId],
        lastMessage: "💬 Conversation démarrée",
        lastMessageAt: new Date()
      });
      await conversation.save();
      
      // Repopuler après sauvegarde
      await conversation.populate('participants', 'name email avatar');
    } else {
      console.log("✅ Conversation existante trouvée:", conversation._id);
    }

    console.log("📨 Conversation retournée:", conversation._id);
    res.json(conversation);

  } catch (error) {
    console.error("❌ Erreur détaillée création conversation:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }
    
    if (error.code === 11000) {
      // En cas de duplicate key, trouver et retourner la conversation existante
      try {
        const existingConversation = await Conversation.findOne({
          participants: { 
            $all: [req.user.id, req.body.participantId],
            $size: 2
          }
        }).populate('participants', 'name email avatar');
        
        if (existingConversation) {
          return res.json(existingConversation);
        }
      } catch (findError) {
        console.error("❌ Erreur recherche conversation existante:", findError);
      }
    }
    
    res.status(500).json({ 
      message: "Erreur serveur lors de la création de la conversation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ Envoyer un message
router.post("/", protect, async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    console.log("✉️  Nouveau message reçu:", { conversationId, content });

    if (!conversationId || !content) {
      return res.status(400).json({ 
        message: "ID de conversation et contenu requis" 
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Créer le message
    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      content: content.trim()
    });

    await message.save();

    // Mettre à jour la dernière activité de la conversation
    conversation.lastMessage = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populer les données pour la réponse
    await message.populate('sender', 'name avatar');

    console.log("✅ Message envoyé avec succès:", message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Erreur envoi message:", error);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: error.message 
    });
  }
});

// ✅ Route de santé pour les messages
router.get("/health", (req, res) => {
  res.json({ 
    status: "✅ Messenger API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /conversations": "Get user conversations",
      "GET /conversations/:id/messages": "Get conversation messages", 
      "POST /conversations/start": "Start new conversation",
      "POST /": "Send message"
    }
  });
});

export default router;