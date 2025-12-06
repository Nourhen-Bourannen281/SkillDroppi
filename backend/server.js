import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);

// ✅ INITIALISATION SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('👤 Utilisateur connecté via Socket.io:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(userId);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, senderId, receiverId, ...messageData } = data;
      
      socket.to(conversationId).emit('receive_message', {
        ...messageData,
        conversation: conversationId,
        createdAt: new Date()
      });

      if (receiverId) {
        socket.to(receiverId).emit('new_message_notification', {
          conversationId,
          senderId,
          content: messageData.content,
          preview: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : '')
        });
      }

    } catch (error) {
      console.error('Erreur envoi message socket:', error);
      socket.emit('message_error', { error: 'Erreur envoi message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('👤 Utilisateur déconnecté:', socket.id);
  });
});

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ IMPORTS DES ROUTES
let authRoutes, userRoutes, qrRoutes, todoRoutes, serviceRoutes, orderRoutes, reviewRoutes, messengerRoutes;

try {
  authRoutes = (await import("./routes/auth.js")).default;
  console.log('✅ Auth routes importées');
} catch (error) {
  console.error('❌ Erreur import auth routes:', error.message);
  authRoutes = express.Router();
}

try {
  const userModule = await import("./routes/users.js");
  userRoutes = userModule.default;
  console.log('✅ User routes importées');
} catch (error) {
  console.error('❌ Erreur import user routes:', error.message);
  userRoutes = express.Router();
}

try {
  qrRoutes = (await import("./routes/qr.js")).default;
  console.log('✅ QR routes importées');
} catch (error) {
  console.error('❌ Erreur import QR routes:', error);
  qrRoutes = express.Router();
}

try {
  todoRoutes = (await import("./routes/todos.js")).default;
  console.log("✅ Todos routes importées");
} catch (error) {
  console.error("❌ Erreur import routes todos:", error.message);
  todoRoutes = express.Router();
}

try {
  serviceRoutes = (await import("./routes/services.js")).default;
  console.log("✅ Services routes importées");
} catch (error) {
  console.error("❌ Erreur import routes services:", error.message);
  serviceRoutes = express.Router();
}

try {
  orderRoutes = (await import("./routes/orders.js")).default;
  console.log("✅ Orders routes importées");
} catch (error) {
  console.error("❌ Erreur import routes orders:", error.message);
  orderRoutes = express.Router();
}

try {
  reviewRoutes = (await import("./routes/reviews.js")).default;
  console.log("✅ Reviews routes importées");
} catch (error) {
  console.error("❌ Erreur import routes reviews:", error.message);
  reviewRoutes = express.Router();
}

try {
  messengerRoutes = (await import("./routes/messenger.js")).default;
  console.log("✅ Messenger routes importées");
} catch (error) {
  console.error("❌ Erreur import routes messenger:", error.message);
  messengerRoutes = express.Router();
}

// ✅ MONTER TOUTES LES ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messengerRoutes);

// ✅ ROUTE POUR VOIR TOUS LES UTILISATEURS RÉELS
app.get("/api/all-users", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    
    const users = await User.find()
      .select('name email bio skills createdAt')
      .sort({ createdAt: -1 });

    res.json({
      total: users.length,
      users: users
    });

  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route de santé principale
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ Backend fonctionne!",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    routes: {
      auth: "✅",
      users: "✅", 
      search: "✅",
      messages: "✅"
    }
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route non trouvée',
    path: req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/all-users',
      '/api/users/search?q=nom',
      '/api/users/profile'
    ]
  });
});

// ✅ CONNEXION MONGODB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skilldrop", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Afficher le nombre d'utilisateurs
    setTimeout(async () => {
      try {
        const User = (await import("./models/User.js")).default;
        const userCount = await User.countDocuments();
        console.log(`📊 Base de données: ${userCount} utilisateur(s)`);
        
        if (userCount > 0) {
          const users = await User.find().select('name email').limit(5);
          console.log("👥 Utilisateurs disponibles pour la recherche:");
          users.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
          });
        } else {
          console.log("📝 Aucun utilisateur dans la base - La recherche retournera des résultats vides");
        }
      } catch (error) {
        console.log("⚠️  Impossible de vérifier les utilisateurs");
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();
  
  server.listen(PORT, () => {
    console.log(`🎉 BACKEND DÉMARRÉ`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(" ");
    console.log("🔍 ROUTE DE RECHERCHE DISPONIBLE:");
    console.log(`   GET http://localhost:${PORT}/api/users/search?q=nom`);
    console.log(" ");
    console.log("👥 POUR VOIR LES UTILISATEURS:");
    console.log(`   GET http://localhost:${PORT}/api/all-users`);
    console.log(" ");
  });
};

startServer();

export default app;