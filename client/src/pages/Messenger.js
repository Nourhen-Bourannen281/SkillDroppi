import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import "../styles/Messenger.css";

const Messenger = () => {
    const { user, apiCall } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // ✅ Connexion Socket.io
    useEffect(() => {
        console.log("🔌 Tentative de connexion Socket.io...");
        const newSocket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            timeout: 10000
        });

        newSocket.on('connect', () => {
            console.log('✅ Connecté à Socket.io:', newSocket.id);
            setError('');
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Erreur connexion Socket.io:', error.message);
            setError('Erreur de connexion en temps réel');
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Nettoyage connexion Socket.io');
            newSocket.close();
        };
    }, []);

    // ✅ Rejoindre la room utilisateur
    useEffect(() => {
        if (socket && user && socket.connected) {
            console.log(`👤 Rejoindre room utilisateur: ${user._id}`);
            socket.emit('join_user', user._id);
        }
    }, [socket, user]);

    // ✅ Rejoindre la conversation sélectionnée
    useEffect(() => {
        if (socket && selectedConversation && socket.connected) {
            console.log(`💬 Rejoindre conversation: ${selectedConversation._id}`);
            socket.emit('join_conversation', selectedConversation._id);
        }
    }, [socket, selectedConversation]);

    // ✅ Écouter les nouveaux messages
    useEffect(() => {
        if (socket) {
            console.log("👂 Écoute des messages Socket.io...");
            
            const handleReceiveMessage = (message) => {
                console.log('💬 Nouveau message reçu:', message);
                if (selectedConversation && message.conversation === selectedConversation._id) {
                    setMessages(prev => [...prev, message]);
                }
                updateConversationList(message);
            };

            socket.on('receive_message', handleReceiveMessage);

            return () => {
                socket.off('receive_message', handleReceiveMessage);
            };
        }
    }, [socket, selectedConversation]);

    // Mettre à jour la liste des conversations
    const updateConversationList = (message) => {
        setConversations(prev => 
            prev.map(conv => 
                conv._id === message.conversation 
                    ? { 
                        ...conv, 
                        lastMessage: message.content, 
                        lastMessageAt: new Date() 
                    }
                    : conv
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        );
    };

    // ✅ Scroll vers le bas
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ✅ Charger les conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError('');
            console.log("📨 Chargement des conversations...");
            
            const response = await apiCall('/api/messages/conversations');
            
            console.log("📊 Réponse API:", response.status, response.statusText);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('API messages non trouvée - Vérifiez le serveur');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${data.length} conversations chargées:`, data);
            setConversations(data);
            
        } catch (error) {
            console.error('❌ Erreur chargement conversations:', error);
            setError('Erreur: ' + error.message);
            
            // Données de démonstration en cas d'erreur
            setConversations([
                {
                    _id: 'demo1',
                    participants: [
                        { _id: 'other1', name: 'Jean Dupont', avatar: '' },
                        user
                    ],
                    lastMessage: 'Bonjour ! Comment allez-vous ?',
                    lastMessageAt: new Date()
                },
                {
                    _id: 'demo2', 
                    participants: [
                        { _id: 'other2', name: 'Marie Martin', avatar: '' },
                        user
                    ],
                    lastMessage: 'Merci pour votre service !',
                    lastMessageAt: new Date(Date.now() - 3600000)
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Charger les conversations au montage
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    // ✅ Charger les messages d'une conversation
    const fetchMessages = async (conversation) => {
        try {
            setLoading(true);
            setError('');
            console.log(`📩 Chargement messages conversation: ${conversation._id}`);
            
            const response = await apiCall(`/api/messages/conversations/${conversation._id}/messages`);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${data.length} messages chargés`);
            setMessages(data);
            setSelectedConversation(conversation);
            
        } catch (error) {
            console.error('❌ Erreur chargement messages:', error);
            setError('Erreur chargement messages: ' + error.message);
            
            // Messages de démonstration
            setMessages([
                {
                    _id: 'msg1',
                    content: 'Bonjour ! Comment allez-vous ?',
                    sender: { _id: 'other1', name: 'Jean Dupont', avatar: '' },
                    createdAt: new Date(Date.now() - 300000)
                },
                {
                    _id: 'msg2',
                    content: 'Je vais bien merci ! Et vous ?',
                    sender: user,
                    createdAt: new Date(Date.now() - 180000)
                },
                {
                    _id: 'msg3', 
                    content: 'Parfait, merci !',
                    sender: { _id: 'other1', name: 'Jean Dupont', avatar: '' },
                    createdAt: new Date()
                }
            ]);
            setSelectedConversation(conversation);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Envoyer un message
    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedConversation) return;

        setMessageLoading(true);
        try {
            const messageData = {
                conversationId: selectedConversation._id,
                content: newMessage.trim()
            };

            console.log("✉️  Envoi message:", messageData);

            // Envoyer via API REST
            const response = await apiCall('/api/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const sentMessage = await response.json();
            
            console.log("✅ Message envoyé via API:", sentMessage);
            
            // Mettre à jour l'état local
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            
            // Mettre à jour la conversation
            updateConversationList({
                conversation: selectedConversation._id,
                content: newMessage.trim()
            });
            
            // Émettre via socket
            if (socket && socket.connected) {
                const otherUser = selectedConversation.participants.find(p => p._id !== user._id);
                console.log("📤 Émission message via socket à:", otherUser?._id);
                
                socket.emit('send_message', {
                    ...sentMessage,
                    conversationId: selectedConversation._id,
                    senderId: user._id,
                    receiverId: otherUser?._id
                });
            }
            
        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            setError('Erreur envoi message: ' + error.message);
            
            // Message local en cas d'erreur
            const tempMessage = {
                _id: Date.now().toString(),
                content: newMessage.trim(),
                sender: user,
                createdAt: new Date(),
                temp: true
            };
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');
            
        } finally {
            setMessageLoading(false);
        }
    };

    // ✅ Recharger les conversations
    const refreshConversations = () => {
        setError('');
        fetchConversations();
    };

    // Formater la date
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Formater la date pour les conversations
    const formatConversationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <div className="messenger-container">
            <Sidebar />
            <div className="messenger-main">
                <Navbar />
                <div className="messenger-content">
                    <div className="messenger-header">
                        <h2>💬 Messagerie</h2>
                        <button onClick={refreshConversations} className="refresh-btn">
                            🔄 Actualiser
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="close-error">
                                ×
                            </button>
                        </div>
                    )}

                    <div className="messenger-layout">
                        {/* Sidebar des conversations */}
                        <div className="conversations-sidebar">
                            <div className="conversations-header">
                                <h3>Conversations</h3>
                                <div className={`socket-status ${socket?.connected ? 'connected' : 'disconnected'}`}>
                                    {socket?.connected ? '🟢 En ligne' : '🔴 Hors ligne'}
                                </div>
                            </div>
                            
                            <div className="conversations-list">
                                {loading ? (
                                    <div className="loading-conversations">
                                        <div className="spinner"></div>
                                        <span>Chargement des conversations...</span>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="no-conversations">
                                        <div className="no-conversations-icon">💬</div>
                                        <p>Aucune conversation</p>
                                        <small>Les conversations apparaîtront ici</small>
                                    </div>
                                ) : (
                                    conversations.map(conversation => {
                                        const otherUser = conversation.participants?.find(
                                            p => p._id !== user._id
                                        );
                                        
                                        return (
                                            <div
                                                key={conversation._id}
                                                className={`conversation-item ${
                                                    selectedConversation?._id === conversation._id ? 'active' : ''
                                                }`}
                                                onClick={() => fetchMessages(conversation)}
                                            >
                                                <div className="user-avatar">
                                                    {otherUser?.avatar ? (
                                                        <img src={otherUser.avatar} alt={otherUser.name} />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            {otherUser?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="conversation-info">
                                                    <div className="user-name">
                                                        {otherUser?.name || 'Utilisateur'}
                                                    </div>
                                                    <div className="last-message">
                                                        {conversation.lastMessage || 'Nouvelle conversation'}
                                                    </div>
                                                </div>
                                                <div className="conversation-meta">
                                                    <div className="conversation-time">
                                                        {formatConversationDate(conversation.lastMessageAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Zone de chat */}
                        <div className="chat-area">
                            {selectedConversation ? (
                                <>
                                    <div className="chat-header">
                                        {(() => {
                                            const otherUser = selectedConversation.participants?.find(
                                                p => p._id !== user._id
                                            );
                                            return (
                                                <>
                                                    <div className="chat-user-info">
                                                        <div className="user-avatar">
                                                            {otherUser?.avatar ? (
                                                                <img src={otherUser.avatar} alt={otherUser.name} />
                                                            ) : (
                                                                <div className="avatar-placeholder">
                                                                    {otherUser?.name?.charAt(0) || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="user-details">
                                                            <div className="user-name">
                                                                {otherUser?.name || 'Utilisateur'}
                                                            </div>
                                                            <div className="user-status">
                                                                {socket?.connected ? '🟢 En ligne' : '⚫ Indisponible'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="messages-container">
                                        {loading ? (
                                            <div className="loading-messages">
                                                <div className="spinner"></div>
                                                <span>Chargement des messages...</span>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="no-messages">
                                                <div className="no-messages-icon">💭</div>
                                                <p>Aucun message</p>
                                                <small>Soyez le premier à envoyer un message !</small>
                                            </div>
                                        ) : (
                                            messages.map(message => (
                                                <div
                                                    key={message._id}
                                                    className={`message ${
                                                        message.sender?._id === user._id ? 'sent' : 'received'
                                                    } ${message.temp ? 'temp' : ''}`}
                                                >
                                                    <div className="message-content">
                                                        {message.content}
                                                        {message.temp && <span className="sending"> (envoi...)</span>}
                                                    </div>
                                                    <div className="message-time">
                                                        {formatTime(message.createdAt)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form onSubmit={sendMessage} className="message-input-form">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Tapez votre message..."
                                            className="message-input"
                                            disabled={messageLoading || !socket?.connected}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim() || messageLoading || !socket?.connected}
                                            className="send-button"
                                        >
                                            {messageLoading ? '⏳' : '📤'}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="no-conversation-selected">
                                    <div className="welcome-message">
                                        <div className="welcome-icon">👋</div>
                                        <h3>Bienvenue dans la messagerie</h3>
                                        <p>Sélectionnez une conversation pour commencer à discuter</p>
                                        <div className="connection-info">
                                            <p>Statut: 
                                                <span className={socket?.connected ? 'status-online' : 'status-offline'}>
                                                    {socket?.connected ? ' Connecté' : ' Déconnecté'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messenger;