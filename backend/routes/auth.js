// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// REGISTER - MIS À JOUR
router.post("/register", async (req, res) => {
  console.log("📝 Register body:", req.body);
  try {
    const { name, email, password, phone, location, securityAnswer } = req.body;

    if (!name || !email || !password || !phone || !location || !securityAnswer) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      phone,
      location,
      securityAnswer: hashedSecurityAnswer,
      bio: "",
      avatar: "",
      skills: [],
      followers: [],
      following: []
    });
    
    const savedUser = await user.save();
    console.log("✅ Utilisateur créé:", savedUser._id);

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET non défini dans .env !");
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    console.log("✅ Token généré pour l'utilisateur:", savedUser._id);

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      location: savedUser.location,
      bio: savedUser.bio,
      avatar: savedUser.avatar,
      skills: savedUser.skills,
      followers: savedUser.followers,
      following: savedUser.following,
      token
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

// LOGIN - INCHANGÉ
router.post("/login", async (req, res) => {
  console.log("🔑 Login body:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Utilisateur non trouvé pour email:", email);
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Mot de passe incorrect pour email:", email);
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET non défini dans .env !");
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    console.log("✅ Login réussi, token généré pour:", user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      avatar: user.avatar,
      skills: user.skills,
      followers: user.followers,
      following: user.following,
      token
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});

// NOUVELLES ROUTES POUR MOT DE PASSE OUBLIÉ
router.post("/get-security-question", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      securityQuestion: user.securityQuestion,
      message: "Question de sécurité récupérée"
    });
  } catch (err) {
    console.error("❌ Get security question error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isAnswerCorrect = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(), 
      user.securityAnswer
    );

    if (!isAnswerCorrect) {
      return res.status(400).json({ message: "Réponse de sécurité incorrecte" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Mot de passe réinitialisé pour:", user.email);

    res.status(200).json({
      message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la réinitialisation" });
  }
});

export default router;