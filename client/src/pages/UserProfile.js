import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import "../styles/UserProfile.css";

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, apiCall, followUser, unfollowUser, checkFollowStatus } = useContext(AuthContext);
    
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError('');
                
                console.log(`👤 Chargement profil: ${userId}`);
                
                const response = await apiCall(`/api/users/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Utilisateur non trouvé');
                }
                
                const userData = await response.json();
                console.log("✅ Profil chargé:", userData);
                setUserProfile(userData);
                
                // Vérifier le statut follow si l'utilisateur est connecté et ce n'est pas son propre profil
                if (currentUser && currentUser._id !== userId) {
                    const followStatus = await checkFollowStatus(userId);
                    setIsFollowing(followStatus);
                }
                
            } catch (error) {
                console.error('❌ Erreur chargement profil:', error);
                setError('Utilisateur non trouvé');
                
                // Données de démonstration
                setUserProfile({
                    _id: userId,
                    name: 'Utilisateur Test',
                    email: 'test@example.com',
                    avatar: '',
                    bio: 'Ceci est un profil de démonstration',
                    skills: ['React', 'Node.js', 'MongoDB'],
                    followers: [],
                    following: [],
                    createdAt: new Date()
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, apiCall, currentUser, checkFollowStatus]);

    const handleFollowAction = async () => {
        if (!currentUser) {
            alert('Veuillez vous connecter');
            return;
        }

        if (!userProfile) return;

        // Empêcher de se suivre soi-même
        if (currentUser._id === userProfile._id) {
            alert('Vous ne pouvez pas vous suivre vous-même');
            return;
        }

        setActionLoading(true);
        try {
            let result;
            if (isFollowing) {
                result = await unfollowUser(userProfile._id);
            } else {
                result = await followUser(userProfile._id);
            }
            
            // Mettre à jour l'état local
            setIsFollowing(!isFollowing);
            
            // Mettre à jour les données du profil avec les données retournées par l'API
            if (result.user) {
                setUserProfile(result.user);
            }
            
        } catch (error) {
            console.error('❌ Erreur action follow:', error);
            alert('Erreur lors de l\'action: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const startConversation = async () => {
        if (!userProfile || !currentUser) {
            alert('Impossible d\'envoyer un message - utilisateur non connecté');
            return;
        }

        console.log("🚀 Démarrage conversation avec:", userProfile._id);
        setActionLoading(true);

        try {
            const response = await apiCall('/api/messages/conversations/start', {
                method: 'POST',
                body: JSON.stringify({ 
                    participantId: userProfile._id 
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }
            
            const conversation = await response.json();
            console.log("✅ Conversation créée:", conversation);
            
            navigate('/messenger', { 
                state: { 
                    selectedConversation: conversation 
                } 
            });
            
        } catch (error) {
            console.error('💥 Erreur démarrage conversation:', error);
            alert('Erreur lors du démarrage de la conversation: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="user-profile-container">
                <Sidebar />
                <div className="user-profile-main">
                    <Navbar />
                    <div className="loading-profile">
                        <div className="spinner"></div>
                        <p>Chargement du profil...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !userProfile) {
        return (
            <div className="user-profile-container">
                <Sidebar />
                <div className="user-profile-main">
                    <Navbar />
                    <div className="error-profile">
                        <h3>❌ Utilisateur non trouvé</h3>
                        <p>{error}</p>
                        <button onClick={() => navigate('/dashboard')}>
                            Retour au tableau de bord
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser && userProfile && currentUser._id === userProfile._id;

    return (
        <div className="user-profile-container">
            <Sidebar />
            <div className="user-profile-main">
                <Navbar />
                <div className="user-profile-content">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt={userProfile.name} />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        
                        <div className="profile-info">
                            <h1>{userProfile?.name || 'Utilisateur'}</h1>
                            <p className="profile-email">{userProfile?.email}</p>
                            <p className="profile-bio">{userProfile?.bio || 'Aucune biographie'}</p>
                            
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-number">{userProfile?.followers?.length || 0}</span>
                                    <span className="stat-label">Abonnés</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{userProfile?.following?.length || 0}</span>
                                    <span className="stat-label">Abonnements</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">
                                        {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : '2024'}
                                    </span>
                                    <span className="stat-label">Membre depuis</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="profile-actions">
                            {currentUser && !isOwnProfile && (
                                <>
                                    <button 
                                        onClick={handleFollowAction}
                                        disabled={actionLoading}
                                        className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
                                    >
                                        {actionLoading ? '⏳' : (isFollowing ? '✅ Abonné' : '👤 Suivre')}
                                    </button>
                                    
                                    <button 
                                        onClick={startConversation}
                                        disabled={actionLoading}
                                        className="message-btn"
                                    >
                                        💬 Message
                                    </button>
                                </>
                            )}
                            
                            {isOwnProfile && (
                                <button 
                                    onClick={() => navigate('/profile')}
                                    className="edit-profile-btn"
                                >
                                    ✏️ Modifier le profil
                                </button>
                            )}
                        </div>
                    </div>
                    

                    <div className="profile-skills">
                        <h3>Compétences</h3>
                        {userProfile?.skills && userProfile.skills.length > 0 ? (
                            <div className="skills-list">
                                {userProfile.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="no-skills">Aucune compétence</p>
                        )}
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="back-btn"
                    >
                        ← Retour au tableau de bord
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;