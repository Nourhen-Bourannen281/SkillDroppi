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

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://skilldroppi-1.onrender.com", // frontend Render
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('👤 Utilisateur connecté via Socket.io:', socket.id);

  socket.on('join_user', (userId) => socket.join(userId));
  socket.on('join_conversation', (conversationId) => socket.join(conversationId));

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
          content,
          preview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        });
      }

    } catch (error) {
      console.error('Erreur envoi message socket:', error);
      socket.emit('message_error', { error: 'Erreur envoi message' });
    }
  });

  socket.on('disconnect', () => console.log('👤 Utilisateur déconnecté:', socket.id));
});

// ✅ MIDDLEWARES
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://skilldroppi-1.onrender.com", 
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
let authRoutes, userRoutes, qrRoutes, todoRoutes, serviceRoutes, orderRoutes, reviewRoutes, messengerRoutes;

try { authRoutes = (await import("./routes/auth.js")).default; } catch { authRoutes = express.Router(); }
try { userRoutes = (await import("./routes/users.js")).default; } catch { userRoutes = express.Router(); }
try { qrRoutes = (await import("./routes/qr.js")).default; } catch { qrRoutes = express.Router(); }
try { todoRoutes = (await import("./routes/todos.js")).default; } catch { todoRoutes = express.Router(); }
try { serviceRoutes = (await import("./routes/services.js")).default; } catch { serviceRoutes = express.Router(); }
try { orderRoutes = (await import("./routes/orders.js")).default; } catch { orderRoutes = express.Router(); }
try { reviewRoutes = (await import("./routes/reviews.js")).default; } catch { reviewRoutes = express.Router(); }
try { messengerRoutes = (await import("./routes/messenger.js")).default; } catch { messengerRoutes = express.Router(); }

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messengerRoutes);

// ✅ ROUTE UTILS
app.get("/api/all-users", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const users = await User.find().select('name email bio skills createdAt').sort({ createdAt: -1 });
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "✅ Backend fonctionne!",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ✅ ROUTE 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ✅ MONGODB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skilldrop", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

// ✅ DÉMARRAGE
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  const dbConnected = await connectDB();
  server.listen(PORT, () => {
    console.log(`🎉 Backend démarré sur http://localhost:${PORT}`);
  });
};

startServer();

export default app;
