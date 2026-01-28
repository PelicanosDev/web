const Member = require('../models/Member');
const User = require('../models/User');

const getAllMembers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (status) {
      query['membership.status'] = status;
    }

    let members = await Member.find(query)
      .populate('userId', 'email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (search) {
      const users = await User.find({
        $or: [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);
      members = members.filter(m => userIds.some(id => id.equals(m.userId._id)));
    }

    const count = await Member.countDocuments(query);

    res.status(200).json({
      success: true,
      data: members,
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

const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', 'email profile')
      .populate('physicalRecords.recordedBy', 'profile.firstName profile.lastName')
      .populate('gamification.badges.badgeId');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      email,
      password,
      role: 'member',
      profile: { firstName, lastName }
    });

    // Generar memberNumber único
    const memberCount = await Member.countDocuments();
    const memberNumber = `PEL${String(memberCount + 1).padStart(4, '0')}`;

    const member = await Member.create({
      userId: user._id,
      memberNumber,
      membership: {
        plan: 'basic',
        monthlyFee: 150000
      }
    });

    const populatedMember = await Member.findById(member._id).populate('userId', 'email profile');

    res.status(201).json({
      success: true,
      data: populatedMember
    });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const allowedUpdates = ['personalInfo', 'sportProfile', 'membership'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        updates[field] = { ...member[field].toObject(), ...req.body[field] };
      }
    });

    Object.assign(member, updates);
    await member.save();

    const updatedMember = await Member.findById(member._id).populate('userId', 'email profile');

    res.status(200).json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await User.findByIdAndUpdate(member.userId, { isActive: false });
    member.membership.status = 'inactive';
    await member.save();

    res.status(200).json({
      success: true,
      message: 'Member deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const assignBadge = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const { badgeId } = req.body;

    const existingBadge = member.gamification.badges.find(
      b => b.badgeId.toString() === badgeId
    );

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'Badge already assigned to this member'
      });
    }

    member.gamification.badges.push({
      badgeId,
      earnedAt: new Date(),
      progress: 100
    });

    member.addXP(100);

    await member.save();

    res.status(200).json({
      success: true,
      data: member.gamification
    });
  } catch (error) {
    next(error);
  }
};

const addPhysicalRecord = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const { exercise, result, unit, times, notes } = req.body;

    if (!exercise || !result || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Exercise, result, and unit are required'
      });
    }

    member.physicalRecords.push({
      date: new Date(),
      exercise,
      result,
      unit,
      times: times || 1,
      notes: notes || '',
      recordedBy: req.user.id
    });

    await member.save();

    const updatedMember = await Member.findById(member._id)
      .populate('userId', 'email profile')
      .populate('physicalRecords.recordedBy', 'profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Physical record added successfully',
      data: updatedMember.physicalRecords[updatedMember.physicalRecords.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  addPhysicalRecord,
  assignBadge
};
