const Member = require('../models/Member');
const User = require('../models/User');
const Exercise = require('../models/Exercise');

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

const updateMemberUser = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).populate('userId');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const { email, firstName, lastName, phone, gender, dateOfBirth, idType, idNumber, address } = req.body;

    if (email && email !== member.userId.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      member.userId.email = email;
    }

    if (firstName) member.userId.profile.firstName = firstName;
    if (lastName) member.userId.profile.lastName = lastName;
    if (phone) member.userId.profile.phone = phone;
    if (gender) member.userId.profile.gender = gender;
    if (dateOfBirth) member.userId.profile.dateOfBirth = dateOfBirth;
    if (idType) member.userId.profile.idType = idType;
    if (idNumber) member.userId.profile.idNumber = idNumber;
    if (address) member.userId.profile.address = address;

    await member.userId.save();

    const updatedMember = await Member.findById(member._id).populate('userId', 'email profile');

    res.status(200).json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

const permanentlyDeleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await User.findByIdAndDelete(member.userId);
    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Member and user permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

const addBulkPhysicalRecords = async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Records array is required'
      });
    }

    const exerciseIds = [...new Set(records.map(r => r.exerciseId))];
    const exercises = await Exercise.find({ _id: { $in: exerciseIds }, isActive: true });
    
    if (exercises.length !== exerciseIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more exercises not found or inactive'
      });
    }

    const exerciseMap = {};
    exercises.forEach(ex => {
      exerciseMap[ex._id.toString()] = ex;
    });

    const memberIds = [...new Set(records.map(r => r.memberId))];
    const members = await Member.find({ _id: { $in: memberIds } });
    
    if (members.length !== memberIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more members not found'
      });
    }

    let recordsCreated = 0;
    const errors = [];

    for (const record of records) {
      try {
        const { memberId, exerciseId, result, unit, times, notes } = record;

        if (!result || result === '' || result === null) {
          continue;
        }

        const member = members.find(m => m._id.toString() === memberId);
        const exercise = exerciseMap[exerciseId];

        if (!member || !exercise) {
          errors.push({ memberId, exerciseId, error: 'Member or exercise not found' });
          continue;
        }

        member.physicalRecords.push({
          date: new Date(),
          exercise: exercise.name,
          result: parseFloat(result),
          unit: unit || exercise.defaultUnit,
          times: times || 1,
          notes: notes || '',
          recordedBy: req.user.id
        });

        await member.save();
        recordsCreated++;
      } catch (error) {
        errors.push({ 
          memberId: record.memberId, 
          exerciseId: record.exerciseId, 
          error: error.message 
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${recordsCreated} records created successfully`,
      data: {
        recordsCreated,
        totalRecords: records.length,
        errors: errors.length > 0 ? errors : undefined
      }
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
  assignBadge,
  updateMemberUser,
  permanentlyDeleteMember,
  addBulkPhysicalRecords
};
