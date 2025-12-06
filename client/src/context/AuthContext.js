import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier si un token est valide
    const isTokenValid = (token) => {
        if (!token || token === 'undefined' || token === 'null') return false;
        try {
            const parts = token.split('.');
            return parts.length === 3;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (token && userData && isTokenValid(token)) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Erreur initialisation:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const loginUser = (userData, token) => {
        if (!token || !isTokenValid(token)) {
            alert('Erreur d\'authentification. Token invalide.');
            return;
        }

        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // ✅ FONCTION API CORRECTE
    const apiCall = async (url, options = {}) => {
        const token = localStorage.getItem('token');

        // Utiliser l'URL de l'API depuis les variables d'environnement ou localhost par défaut
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Vérifier si l'URL est relative ou absolue
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        
        if (!token || !isTokenValid(token)) {
            throw new Error('Session expirée, veuillez vous reconnecter');
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            console.log(`🌐 API Call: ${fullUrl}`);
            const response = await fetch(fullUrl, config);

            if (response.status === 401) {
                logoutUser();
                throw new Error('Session expirée');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error ${response.status}:`, errorText);
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error('❌ API Call Error:', error);
            throw error;
        }
    };

    // ✅ RECHERCHE D'UTILISATEUR CORRIGÉE
    const searchUser = async (query) => {
        try {
            if (!query || query.trim() === '') {
                return null;
            }

            console.log(`🔍 Recherche: "${query}"`);
            
            const response = await apiCall(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
            
            const users = await response.json();
            console.log(`✅ ${users.length} utilisateur(s) trouvé(s)`);
            
            // Retourner le premier utilisateur trouvé
            return users && users.length > 0 ? users[0] : null;
            
        } catch (error) {
            console.error('❌ Recherche échouée:', error);
            return null;
        }
    };

    // ✅ FONCTIONS FOLLOW/UNFOLLOW
    const followUser = async (userId) => {
        try {
            const response = await apiCall(`/api/users/${userId}/follow`, {
                method: 'POST'
            });
            const result = await response.json();
            
            // Mettre à jour l'utilisateur actuel
            if (result.currentUser) {
                setUser(result.currentUser);
                localStorage.setItem('user', JSON.stringify(result.currentUser));
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erreur followUser:', error);
            throw error;
        }
    };

    const unfollowUser = async (userId) => {
        try {
            const response = await apiCall(`/api/users/${userId}/unfollow`, {
                method: 'POST'
            });
            const result = await response.json();
            
            // Mettre à jour l'utilisateur actuel
            if (result.currentUser) {
                setUser(result.currentUser);
                localStorage.setItem('user', JSON.stringify(result.currentUser));
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erreur unfollowUser:', error);
            throw error;
        }
    };

    const checkFollowStatus = async (userId) => {
        try {
            const response = await apiCall(`/api/users/${userId}/follow-status`);
            const result = await response.json();
            return result.isFollowing;
        } catch (error) {
            console.error('❌ Erreur checkFollowStatus:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginUser,
            logoutUser,
            loading,
            searchUser,
            apiCall,
            followUser,
            unfollowUser,
            checkFollowStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};