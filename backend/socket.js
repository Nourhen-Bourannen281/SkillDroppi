import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('👤 Utilisateur connecté:', socket.id);

    // Rejoindre la room de l'utilisateur
    socket.on('join_user', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} a rejoint sa room (socket: ${socket.id})`);
    });

    // Rejoindre une conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`💬 Socket ${socket.id} a rejoint la conversation ${conversationId}`);
    });

    // Quitter une conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`💬 Socket ${socket.id} a quitté la conversation ${conversationId}`);
    });

    // Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, senderId, receiverId, ...messageData } = data;
        
        console.log('💬 Nouveau message via socket:', { conversationId, senderId });
        
        // Émettre le message à tous les participants de la conversation
        socket.to(conversationId).emit('receive_message', {
          ...messageData,
          conversation: conversationId,
          createdAt: new Date()
        });

        // Notifier l'expéditeur que le message a été envoyé
        socket.emit('message_sent', {
          ...messageData,
          conversation: conversationId,
          createdAt: new Date()
        });

        // Notifier le receiver dans sa room personnelle
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

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit('user_typing', { userId, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit('user_typing', { userId, isTyping: false });
    });

    // Marquer un message comme lu
    socket.on('mark_as_read', (data) => {
      const { conversationId, messageId, userId } = data;
      socket.to(conversationId).emit('message_read', { messageId, userId });
    });

    socket.on('disconnect', () => {
      console.log('👤 Utilisateur déconnecté:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('❌ Erreur Socket.io:', error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io non initialisé");
  }
  return io;
};