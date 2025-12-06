import express from "express";
import Todo from "../models/Todo.js";

const router = express.Router();

// Middleware de protection temporaire
const protect = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Token manquant - Accès non autorisé" 
    });
  }
  
  // Pour le moment, on utilise un user temporaire
  // Plus tard, vous pourrez intégrer votre vrai middleware d'authentification
  req.user = { 
    _id: '691f8cf1b4a3488ecc76a04f',
    name: 'Utilisateur Test'
  };
  
  console.log(`🔐 User authentifié: ${req.user.name} (${req.user._id})`);
  next();
};

// GET all todos de l'utilisateur connecté
router.get("/", protect, async (req, res) => {
  try {
    console.log("🔄 Récupération des todos pour user:", req.user._id);
    
    const todos = await Todo.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${todos.length} todos trouvées`);
    res.status(200).json(todos);
    
  } catch (err) {
    console.error("❌ Erreur récupération todos:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des tâches",
      error: err.message 
    });
  }
});

// POST new todo
router.post("/", protect, async (req, res) => {
  try {
    const { title, completed } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le titre de la tâche est requis"
      });
    }
    
    console.log("➕ Création nouvelle todo:", { title, completed });
    
    const todo = new Todo({ 
      title: title.trim(),
      completed: completed || false,
      userId: req.user._id
    });
    
    await todo.save();
    
    console.log("✅ Todo créée avec succès:", todo._id);
    res.status(201).json(todo);
    
  } catch (err) {
    console.error("❌ Erreur création todo:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la création de la tâche",
      error: err.message 
    });
  }
});

// PUT update todo
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    console.log("✏️ Mise à jour todo:", id, { title, completed });
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }
    
    console.log("✅ Todo mise à jour avec succès");
    res.status(200).json(todo);
    
  } catch (err) {
    console.error("❌ Erreur mise à jour todo:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la mise à jour de la tâche",
      error: err.message 
    });
  }
});

// DELETE todo
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🗑️ Suppression todo:", id);
    
    const todo = await Todo.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée"
      });
    }
    
    console.log("✅ Todo supprimée avec succès");
    res.status(200).json({
      success: true,
      message: "Tâche supprimée avec succès",
      deletedTodo: todo
    });
    
  } catch (err) {
    console.error("❌ Erreur suppression todo:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la suppression de la tâche",
      error: err.message 
    });
  }
});

// DELETE all completed todos
router.delete("/", protect, async (req, res) => {
  try {
    console.log("🗑️ Suppression de toutes les todos complétées");
    
    const result = await Todo.deleteMany({ 
      userId: req.user._id,
      completed: true 
    });
    
    console.log(`✅ ${result.deletedCount} todos complétées supprimées`);
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} tâches complétées supprimées`,
      deletedCount: result.deletedCount
    });
    
  } catch (err) {
    console.error("❌ Erreur suppression multiple:", err);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la suppression des tâches",
      error: err.message 
    });
  }
});

export default router;