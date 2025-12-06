const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Message = require('../models/Message');

// GET /api/freelancer/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les projets complétés
    const completedProjects = await Project.countDocuments({
      freelancer: userId,
      status: 'completed'
    });

    // Calculer le revenu total
    const revenueResult = await Project.aggregate([
      {
        $match: {
          freelancer: mongoose.Types.ObjectId(userId),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$budget' }
        }
      }
    ]);

    // Calculer le taux de réponse
    const totalProposals = await Proposal.countDocuments({ freelancer: userId });
    const acceptedProposals = await Proposal.countDocuments({ 
      freelancer: userId, 
      status: 'accepted' 
    });

    const responseRate = totalProposals > 0 
      ? Math.round((acceptedProposals / totalProposals) * 100) 
      : 0;

    res.json({
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      completedProjects,
      responseRate,
      totalProposals,
      acceptedProposals
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/projects/active
router.get('/active', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      freelancer: req.user.id,
      status: { $in: ['active', 'in_progress'] }
    })
    .populate('client', 'firstName lastName companyName')
    .sort({ deadline: 1 })
    .limit(10);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/proposals/pending
router.get('/pending', auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({
      freelancer: req.user.id,
      status: 'pending'
    })
    .populate('project', 'title')
    .sort({ submittedAt: -1 })
    .limit(5);

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;