const Exercise = require('../models/Exercise');

const getAllExercises = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    
    const query = includeInactive === 'true' ? {} : { isActive: true };
    
    const exercises = await Exercise.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: exercises
    });
  } catch (error) {
    next(error);
  }
};

const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

const createExercise = async (req, res, next) => {
  try {
    const { name, description, defaultUnit, category } = req.body;
    
    const existingExercise = await Exercise.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingExercise) {
      return res.status(400).json({
        success: false,
        message: 'An exercise with this name already exists'
      });
    }
    
    const exercise = await Exercise.create({
      name,
      description,
      defaultUnit,
      category
    });
    
    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    const { name, description, defaultUnit, category } = req.body;
    
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    if (name && name !== exercise.name) {
      const existingExercise = await Exercise.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingExercise) {
        return res.status(400).json({
          success: false,
          message: 'An exercise with this name already exists'
        });
      }
    }
    
    if (name) exercise.name = name;
    if (description !== undefined) exercise.description = description;
    if (defaultUnit) exercise.defaultUnit = defaultUnit;
    if (category) exercise.category = category;
    
    await exercise.save();
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    exercise.isActive = false;
    await exercise.save();
    
    res.status(200).json({
      success: true,
      message: 'Exercise deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
