const Tournament = require('../models/Tournament');
const { uploadImage } = require('../config/cloudinary');

const getAllTournaments = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;

    const tournaments = await Tournament.find(query)
      .populate('organizer', 'profile.firstName profile.lastName')
      .sort({ 'dates.start': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Tournament.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tournaments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'profile');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

const createTournament = async (req, res, next) => {
  try {
    const tournamentData = {
      ...req.body,
      organizer: req.user.id
    };

    if (req.file) {
      const result = await uploadImage(req.file, 'tournaments');
      tournamentData.coverImage = result.url;
    }

    const tournament = await Tournament.create(tournamentData);

    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

const updateTournament = async (req, res, next) => {
  try {
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (req.file) {
      const result = await uploadImage(req.file, 'tournaments');
      req.body.coverImage = result.url;
    }

    tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    await tournament.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const registerTeam = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (!tournament.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this tournament'
      });
    }

    const { teamId } = req.body;

    const existingTeam = tournament.teams.find(
      t => t.teamId.toString() === teamId
    );

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team already registered'
      });
    }

    tournament.teams.push({
      teamId,
      registrationDate: new Date(),
      status: 'pending'
    });

    await tournament.save();

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerTeam
};
