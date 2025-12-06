// App.js - Intégration du ChatBot avec HashRouter
import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Todo from "./pages/Todo";
import Services from "./pages/MyServices";
import Marketplace from "./pages/Marketplace";
import Orders from "./pages/Orders";
import Reviews from "./pages/Reviews";
import Messenger from "./pages/Messenger";
import Auth from "./pages/Auth";
import ChatBot from "./components/ChatBot";
import LandingPage from "./pages/LandingPage";

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Chargement...</div>;
  return user ? children : <Navigate to="/#/" />;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Chargement...</div>;
  return !user ? children : <Navigate to="/#/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>

          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentification */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todo"
            element={
              <ProtectedRoute>
                <Todo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Messenger />
              </ProtectedRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/#/dashboard" />} />

        </Routes>

        {/* Chatbot visible sur toutes les pages */}
        <ChatBot />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
