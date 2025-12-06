import User from "../models/User.js";
import mongoose from "mongoose";

// ✅ RECHERCHE D'UTILISATEURS
export const searchUsers = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    console.log("🔍 Recherche utilisateur:", query);

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: "Veuillez entrer un terme de recherche" 
      });
    }

    // Recherche par nom ou email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclure l'utilisateur connecté
    })
    .select('name email avatar bio skills followers following createdAt')
    .limit(10);

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s) pour "${query}"`);
    
    res.json(users);

  } catch (error) {
    console.error("❌ Erreur recherche utilisateurs:", error);
    res.status(500).json({ 
      error: "Erreur serveur lors de la recherche",
      details: error.message 
    });
  }
};

// ✅ GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("👤 Récupération utilisateur par ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID utilisateur invalide" });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    console.log("✅ Utilisateur trouvé:", user.name);
    res.json(user);

  } catch (error) {
    console.error("❌ Erreur récupération utilisateur:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Erreur récupération profil:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, skills, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        bio,
        skills,
        avatar,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error("❌ Erreur mise à jour profil:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email avatar bio skills')
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const currentUserId = req.user.id;

    console.log(`➕ Follow: ${currentUserId} -> ${userId}`);

    if (userId === currentUserId) {
      return res.status(400).json({ error: "Impossible de se suivre soi-même" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const isAlreadyFollowing = currentUser.following.includes(userId);
    
    if (isAlreadyFollowing) {
      return res.status(400).json({ error: "Vous suivez déjà cet utilisateur" });
    }

    currentUser.following.push(userId);
    await currentUser.save();

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    const updatedCurrentUser = await User.findById(currentUserId)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    const updatedUserToFollow = await User.findById(userId)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    res.json({
      message: "Utilisateur suivi avec succès",
      currentUser: updatedCurrentUser,
      user: updatedUserToFollow
    });

  } catch (error) {
    console.error("❌ Erreur follow:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const currentUserId = req.user.id;

    console.log(`➖ Unfollow: ${currentUserId} -> ${userId}`);

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    await currentUser.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );
    await userToUnfollow.save();

    const updatedCurrentUser = await User.findById(currentUserId)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    const updatedUserToUnfollow = await User.findById(userId)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    res.json({
      message: "Utilisateur unfollow avec succès",
      currentUser: updatedCurrentUser,
      user: updatedUserToUnfollow
    });

  } catch (error) {
    console.error("❌ Erreur unfollow:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};

// ✅ CHECK FOLLOW STATUS
export const checkFollowStatus = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(userId);

    console.log(`📊 Statut follow ${currentUserId} -> ${userId}: ${isFollowing}`);

    res.json({ isFollowing });

  } catch (error) {
    console.error("❌ Erreur check follow status:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: error.message 
    });
  }
};