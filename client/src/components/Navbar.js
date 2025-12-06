import React, { useContext, useState } from "react";
import "../styles/Navbar.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { logoutUser, searchUser, user } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);

    const logout = () => {
        logoutUser();
        navigate('/');
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    const goToHome = () => {
        navigate('/dashboard');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchError("");
        
        if (!searchQuery.trim()) {
            setSearchError("Veuillez entrer un nom d'utilisateur");
            return;
        }
        
        setSearchLoading(true);
        
        try {
            console.log(`🔍 Recherche: "${searchQuery}"`);
            const foundUser = await searchUser(searchQuery.trim());
            
            if (foundUser) {
                console.log("✅ Utilisateur trouvé:", foundUser.name);
                navigate(`/user/${foundUser._id}`);
                setSearchQuery("");
            } else {
                setSearchError(`Aucun utilisateur trouvé pour "${searchQuery}"`);
                console.log(`❌ Aucun utilisateur nommé "${searchQuery}" dans la base`);
            }
        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            setSearchError("Erreur lors de la recherche");
        } finally {
            setSearchLoading(false);
        }
    };

    const getUserInitial = () => {
        return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <header className="navbar">
            <div className="nav-brand" onClick={goToHome}>
                <div className="brand-icon">
                    <i className="fas fa-code"></i>
                </div>
                <div className="brand-text">Skill<span>Drop</span></div>
            </div>

            <div className="nav-center">
                <form onSubmit={handleSearch} className="search-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Rechercher des utilisateurs..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSearchError("");
                            }}
                            className="search-input"
                            disabled={searchLoading}
                        />
                        <button 
                            type="submit" 
                            className="search-submit"
                            disabled={searchLoading}
                        >
                            <i className={`fas ${searchLoading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
                        </button>
                    </div>
                </form>
                
                {searchError && (
                    <div className="search-error">
                        {searchError}
                    </div>
                )}

                
            </div>

            <div className="nav-actions">
                <button onClick={logout} className="nav-btn logout">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                </button>
                <div className="user-avatar" onClick={goToProfile}>
                    {getUserInitial()}
                </div>
            </div>
        </header>
    );
}