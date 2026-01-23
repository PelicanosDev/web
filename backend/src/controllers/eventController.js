const Event = require('../models/Event');
const { uploadImage } = require('../config/cloudinary');

const getAllEvents = async (req, res, next) => {
  try {
    const { type, isPublic, upcoming, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (type) query.type = type;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const events = await Event.find(query)
      .populate('createdBy', 'profile.firstName profile.lastName')
      .populate('participants.memberId', 'userId')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
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

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'profile')
      .populate('participants.memberId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    if (req.file) {
      const result = await uploadImage(req.file, 'events');
      eventData.coverImage = result.url;
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.file) {
      const result = await uploadImage(req.file, 'events');
      req.body.coverImage = result.url;
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const registerToEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    const { memberId } = req.body;

    const existingParticipant = event.participants.find(
      p => p.memberId.toString() === memberId
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    event.participants.push({
      memberId,
      status: 'confirmed',
      registeredAt: new Date()
    });

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent
};
