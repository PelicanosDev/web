const Badge = require('../models/Badge');

const getAllBadges = async (req, res, next) => {
  try {
    const { category, rarity, isActive } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const badges = await Badge.find(query).sort({ rarity: -1, name: 1 });

    res.status(200).json({
      success: true,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

const getBadgeById = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

const createBadge = async (req, res, next) => {
  try {
    const badge = await Badge.create(req.body);

    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

const updateBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

const deleteBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    await badge.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge
};
