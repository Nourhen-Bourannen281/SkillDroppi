// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Générer token - CORRECTION ICI
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' } // Fallback si JWT_EXPIRE n'est pas défini
    );

    // Répondre avec infos utilisateur + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Erreur inscription:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer token - CORRECTION ICI AUSSI
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Répondre avec infos utilisateur + token
    res.json({
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
      token,
    });
  } catch (err) {
    console.error("Erreur connexion:", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};