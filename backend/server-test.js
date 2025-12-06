import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

// Middlewares ESSENTIELS
app.use(cors());
app.use(express.json());

// SIMULATION de base de données en mémoire
const users = [];
let nextUserId = 1;

// ✅ ROUTES D'AUTHENTIFICATION - ESSENTIELLES !
app.post("/api/auth/register", async (req, res) => {
  console.log('✅ /api/auth/register appelé', req.body);
  
  try {
    const { name, email, password, phone, location, securityAnswer } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !location || !securityAnswer) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si l'email existe déjà
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

    // Créer l'utilisateur
    const newUser = {
      _id: `user${nextUserId++}`,
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
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log('✅ Utilisateur créé:', newUser._id);

    // Générer token
    const token = jwt.sign(
      { id: newUser._id },
      "test-secret-key", // Clé secrète pour le test
      { expiresIn: "30d" }
    );

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      location: newUser.location,
      bio: newUser.bio,
      avatar: newUser.avatar,
      skills: newUser.skills,
      followers: newUser.followers,
      following: newUser.following,
      token
    });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  console.log('✅ /api/auth/login appelé', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer token
    const token = jwt.sign(
      { id: user._id },
      "test-secret-key",
      { expiresIn: "30d" }
    );

    console.log('✅ Login réussi pour:', user._id);

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

// Routes de récupération de mot de passe
app.post("/api/auth/get-security-question", async (req, res) => {
  console.log('✅ /api/auth/get-security-question appelé', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      securityQuestion: "Quel est le nom de votre animal de compagnie ?",
      message: "Question de sécurité récupérée"
    });

  } catch (err) {
    console.error("❌ Get security question error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  console.log('✅ /api/auth/reset-password appelé', req.body);
  
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier la réponse de sécurité
    const isAnswerCorrect = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(), 
      user.securityAnswer
    );

    if (!isAnswerCorrect) {
      return res.status(400).json({ message: "Réponse de sécurité incorrecte" });
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();

    console.log('✅ Mot de passe réinitialisé pour:', user.email);

    res.status(200).json({
      message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
    });

  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la réinitialisation" });
  }
});

// ✅ ROUTES DE TEST EXISTANTES
app.get("/api/test", (req, res) => {
  console.log('✅ /api/test appelé');
  res.json({ 
    success: true,
    message: "Backend TEST fonctionne!",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/users/profile", (req, res) => {
  console.log('✅ /api/users/profile appelé');
  
  // Simuler un utilisateur connecté
  const sampleUser = {
    success: true,
    name: "Jean Dupont",
    email: "jean.dupont@example.com", 
    bio: "Développeur full-stack passionné par React et Node.js",
    location: "Paris, France",
    phone: "+33 1 23 45 67 89",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    _id: "user123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  };
  
  res.json(sampleUser);
});

// ✅ ROUTES QR CODE
app.get("/api/qr/debug", (req, res) => {
  console.log('✅ /api/qr/debug appelé');
  res.json({ 
    success: true,
    message: "QR API TEST fonctionne!",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/qr/generate", (req, res) => {
  console.log('✅ /api/qr/generate appelé');
  
  // QR Code de test (1x1 pixel blanc)
  const testQR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  res.json({
    success: true,
    qrCode: testQR,
    message: "QR Code généré avec succès!",
    profileData: {
      userId: "user123",
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      profileUrl: "http://localhost:3000/profile"
    }
  });
});

app.get("/api/qr/my-qrcode", (req, res) => {
  console.log('✅ /api/qr/my-qrcode appelé');
  const testQR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  res.json({
    success: true,
    qrCode: testQR,
    lastGenerated: new Date().toISOString(),
    message: "QR Code existant chargé"
  });
});

// ✅ Gestion des routes inconnues
app.use('*', (req, res) => {
  console.log('❌ Route inconnue:', req.originalUrl);
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée: ' + req.originalUrl
  });
});

// Port
const PORT = 5000;

// Démarrage
app.listen(PORT, () => {
  console.log('🎉🎉🎉 BACKEND TEST COMPLET DÉMARRÉ 🎉🎉🎉');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(" ");
  console.log("🔐 ROUTES AUTHENTIFICATION:");
  console.log("   ✅ POST http://localhost:5000/api/auth/register");
  console.log("   ✅ POST http://localhost:5000/api/auth/login");
  console.log("   ✅ POST http://localhost:5000/api/auth/get-security-question");
  console.log("   ✅ POST http://localhost:5000/api/auth/reset-password");
  console.log(" ");
  console.log("📡 ROUTES UTILISATEURS:");
  console.log("   ✅ GET  http://localhost:5000/api/users/profile");
  console.log("   ✅ GET  http://localhost:5000/api/test");
  console.log(" ");
  console.log("📱 ROUTES QR CODE:");
  console.log("   ✅ GET  http://localhost:5000/api/qr/debug"); 
  console.log("   ✅ POST http://localhost:5000/api/qr/generate");
  console.log("   ✅ GET  http://localhost:5000/api/qr/my-qrcode");
  console.log(" ");
  console.log("🌐 Frontend: http://localhost:3000");
  console.log(" ");
});