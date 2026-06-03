const ExternalTournament = require('../models/ExternalTournament');
const { uploadImage, deleteImage } = require('../config/cloudinary');

const getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { isPublic: true };
    if (status) query.status = status;

    const tournaments = await ExternalTournament.find(query).sort({ date: 1 });

    res.status(200).json({ success: true, data: tournaments });
  } catch (error) {
    next(error);
  }
};

const getAllAdmin = async (req, res, next) => {
  try {
    const tournaments = await ExternalTournament.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: tournaments });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      const result = await uploadImage(req.file, 'external-tournaments');
      data.imageUrl = result.url;
      data.publicId = result.publicId;
    }

    const tournament = await ExternalTournament.create(data);
    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    let tournament = await ExternalTournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    }

    const data = { ...req.body };

    if (req.file) {
      if (tournament.publicId) await deleteImage(tournament.publicId);
      const result = await uploadImage(req.file, 'external-tournaments');
      data.imageUrl = result.url;
      data.publicId = result.publicId;
    }

    tournament = await ExternalTournament.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const tournament = await ExternalTournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    }
    if (tournament.publicId) await deleteImage(tournament.publicId);
    await ExternalTournament.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Torneo eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getAllAdmin, create, update, remove };
