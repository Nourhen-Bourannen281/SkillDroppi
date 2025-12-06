import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/Todo.css";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Charger les todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = getAuthToken();
      if (!token) {
        setError("Token non trouvé. Veuillez vous reconnecter.");
        return;
      }

      console.log("🔄 Chargement des todos...");
      
      const response = await axios.get("http://localhost:5000/api/todos", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Todos chargées avec succès:", response.data);
      setTodos(response.data);
      
    } catch (err) {
      console.error("❌ Erreur détaillée chargement todos:");
      console.error("  Message:", err.message);
      console.error("  Status:", err.response?.status);
      console.error("  Data:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || "Erreur lors du chargement des tâches";
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Ajouter une todo
  const addTodo = async () => {
    if (!newTodo.trim()) {
      setError("Veuillez saisir une tâche");
      return;
    }

    try {
      setError("");
      const token = getAuthToken();
      
      console.log("➕ Ajout nouvelle todo:", newTodo);
      
      const response = await axios.post(
        "http://localhost:5000/api/todos",
        { 
          title: newTodo,
          completed: false 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ Todo ajoutée avec succès:", response.data);
      setTodos(prev => [response.data, ...prev]);
      setNewTodo("");
      
    } catch (err) {
      console.error("❌ Erreur ajout todo:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout de la tâche";
      setError(errorMessage);
    }
  };

  // Basculer completed
  const toggleTodo = async (id, completed) => {
    try {
      const token = getAuthToken();
      
      console.log("✏️ Toggle todo:", id, "completed:", !completed);
      
      const response = await axios.put(
        `http://localhost:5000/api/todos/${id}`,
        { completed: !completed },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ Todo mise à jour:", response.data);
      setTodos(prev => prev.map(t => 
        t._id === id ? response.data : t
      ));
      
    } catch (err) {
      console.error("❌ Erreur toggle todo:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour";
      setError(errorMessage);
    }
  };

  // Supprimer une todo
  const deleteTodo = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    try {
      const token = getAuthToken();
      
      console.log("🗑️ Suppression todo:", id);
      
      await axios.delete(`http://localhost:5000/api/todos/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Todo supprimée avec succès");
      setTodos(prev => prev.filter(t => t._id !== id));
      
    } catch (err) {
      console.error("❌ Erreur suppression todo:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression";
      setError(errorMessage);
    }
  };

  // Supprimer toutes les todos complétées
  const deleteCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
      setError("Aucune tâche complétée à supprimer");
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer les ${completedTodos.length} tâches complétées ?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      
      console.log("🗑️ Suppression des todos complétées");
      
      const response = await axios.delete("http://localhost:5000/api/todos", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Todos complétées supprimées:", response.data);
      setTodos(prev => prev.filter(t => !t.completed));
      
    } catch (err) {
      console.error("❌ Erreur suppression multiple:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression";
      setError(errorMessage);
    }
  };

  // Supprimer toutes les todos
  const deleteAll = async () => {
    if (todos.length === 0) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les ${todos.length} tâches ?`)) {
      return;
    }

    try {
      // Supprimer une par une
      for (const todo of todos) {
        await deleteTodo(todo._id);
      }
      
    } catch (err) {
      console.error("❌ Erreur suppression totale:", err);
    }
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // Statistiques
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="todo-container">
      {/* Particules de fond */}
      <div className="todo-particles">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="todo-particle"></div>
        ))}
      </div>
      
      <Sidebar />
      <div className="todo-main">
        <Navbar />
        <main className="todo-content">
          <div className="todo-header">
            <h2>📝 To-Do List</h2>
            <p>Gérez vos tâches quotidiennes</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
              <button onClick={() => setError("")} className="close-error">×</button>
            </div>
          )}

          {/* Section d'ajout */}
          <div className="add-todo-section">
            <div className="todo-input-group">
              <input
                type="text"
                placeholder="✏️ Nouvelle tâche..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="todo-input"
                disabled={loading}
              />
              <button 
                onClick={addTodo} 
                className="add-btn"
                disabled={loading || !newTodo.trim()}
              >
                {loading ? "⏳" : "➕"} Ajouter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          {todos.length > 0 && (
            <div className="todo-stats">
              <div className="stat-item">
                <span className="stat-number">{totalCount}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{completedCount}</span>
                <span className="stat-label">Terminées</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{progress}%</span>
                <span className="stat-label">Progression</span>
              </div>
              <div className="stat-actions">
                <button 
                  onClick={deleteCompleted}
                  className="delete-completed-btn"
                  disabled={completedCount === 0}
                >
                  🗑️ Supprimer terminées
                </button>
                <button 
                  onClick={deleteAll}
                  className="delete-all-btn"
                >
                  🗑️ Tout supprimer
                </button>
              </div>
            </div>
          )}

          {/* Liste des tâches */}
          <div className="todo-list-section">
            {loading ? (
              <div className="loading-todos">
                <div className="spinner"></div>
                <p>Chargement de vos tâches...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="empty-todos">
                <div className="empty-todos-icon">📝</div>
                <h3>Aucune tâche pour le moment</h3>
                <p>Commencez par ajouter votre première tâche !</p>
              </div>
            ) : (
              <ul className="todo-list">
                {todos.map(todo => (
                  <li 
                    key={todo._id} 
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo._id, todo.completed)}
                      className="todo-checkbox"
                      disabled={loading}
                    />
                    <span className="todo-text">{todo.title}</span>
                    <button 
                      onClick={() => deleteTodo(todo._id)} 
                      className="delete-btn"
                      disabled={loading}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}