const Event = require('../models/Event');
const Member = require('../models/Member');
const { uploadImage } = require('../config/cloudinary');

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

const checkInToEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.type !== 'training') {
      return res.status(400).json({ success: false, message: 'Check-in only available for training events' });
    }

    const now = new Date();
    const todayDayOfWeek = now.getDay();

    // Validate timing: recurring events are valid on their configured days, fixed events within their date range
    if (event.recurring?.enabled && event.recurring.daysOfWeek?.length > 0) {
      if (!event.recurring.daysOfWeek.includes(todayDayOfWeek)) {
        return res.status(400).json({ success: false, message: 'Este entrenamiento no ocurre hoy' });
      }
    } else {
      const eventStart = new Date(event.date);
      const eventEnd = new Date(eventStart);
      eventEnd.setDate(eventEnd.getDate() + (event.totalDays || 1));
      if (now < eventStart || now > eventEnd) {
        return res.status(400).json({ success: false, message: 'Check-in is only available during the event dates' });
      }
    }

    const member = await Member.findOne({ userId: req.user.id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const isParticipant = event.participants.some(
      p => p.memberId.toString() === member._id.toString() && p.status === 'confirmed'
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not a confirmed participant of this event' });
    }

    const eventLat = parseFloat(event.coordinates?.lat);
    const eventLng = parseFloat(event.coordinates?.lng);
    if (event.coordinates == null || isNaN(eventLat) || isNaN(eventLng)) {
      return res.status(400).json({ success: false, message: 'El evento no tiene coordenadas de ubicación configuradas' });
    }

    const memberLat = parseFloat(req.body.lat);
    const memberLng = parseFloat(req.body.lng);
    if (isNaN(memberLat) || isNaN(memberLng)) {
      return res.status(400).json({ success: false, message: 'Coordenadas de ubicación inválidas' });
    }

    const maxRadius = parseFloat(event.radius) || 50;
    const distance = haversineDistance(memberLat, memberLng, eventLat, eventLng);
    if (distance > maxRadius) {
      return res.status(400).json({
        success: false,
        message: `Estás muy lejos del lugar del evento (${Math.round(distance)}m de distancia, máximo ${Math.round(maxRadius)}m)`
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const alreadyCheckedIn = event.dailyAttendance.some(
      a => a.memberId.toString() === member._id.toString() &&
        a.date >= todayStart && a.date <= todayEnd &&
        a.checkedIn
    );
    if (alreadyCheckedIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    event.dailyAttendance.push({
      memberId: member._id,
      date: new Date(),
      checkedIn: true,
      checkInTime: new Date(),
      checkInLocation: { lat: memberLat, lng: memberLng }
    });
    await event.save();

    member.attendance.push({
      date: new Date(),
      sessionType: 'training',
      present: true
    });
    member.addXP(50);
    await member.save();

    res.status(200).json({ success: true, message: 'Check-in successful! +50 XP earned' });
  } catch (error) {
    next(error);
  }
};

const getTodayTrainingEvents = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayDayOfWeek = new Date().getDay(); // 0=Sun...6=Sat
    const events = await Event.find({ type: 'training' });

    const pendingEvents = events.filter(event => {
      const isParticipant = event.participants.some(
        p => p.memberId.toString() === member._id.toString() && p.status === 'confirmed'
      );
      if (!isParticipant) return false;

      const alreadyCheckedIn = event.dailyAttendance.some(
        a => a.memberId.toString() === member._id.toString() &&
          a.date >= todayStart && a.date <= todayEnd &&
          a.checkedIn
      );
      if (alreadyCheckedIn) return false;

      // Recurring event: active if today is one of the configured days
      if (event.recurring?.enabled && event.recurring.daysOfWeek?.length > 0) {
        return event.recurring.daysOfWeek.includes(todayDayOfWeek);
      }

      // Non-recurring: active if today falls within the event date range
      const eventStart = new Date(event.date);
      const eventEnd = new Date(eventStart);
      eventEnd.setDate(eventEnd.getDate() + (event.totalDays || 1));
      return eventStart <= todayEnd && eventEnd >= todayStart;
    });

    res.status(200).json({ success: true, data: pendingEvents });
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
  registerToEvent,
  checkInToEvent,
  getTodayTrainingEvents
};
