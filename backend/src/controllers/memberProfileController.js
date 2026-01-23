const Member = require('../models/Member');
const User = require('../models/User');

const getMyProfile = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate('userId', 'email profile')
      .populate('gamification.badges.badgeId');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
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

const getMyStats = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    const stats = {
      level: member.gamification.level,
      xp: member.gamification.xp,
      totalBadges: member.gamification.badges.length,
      attendanceRate: member.getAttendanceRate(),
      totalMatches: member.matches.length,
      wins: member.matches.filter(m => m.result === 'win').length,
      losses: member.matches.filter(m => m.result === 'loss').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getMyProgress = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    if (!member.physicalRecords || member.physicalRecords.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          records: [],
          message: 'No physical records available yet'
        }
      });
    }

    // Agrupar récords por ejercicio
    const recordsByExercise = {};
    member.physicalRecords.forEach(record => {
      if (!recordsByExercise[record.exercise]) {
        recordsByExercise[record.exercise] = [];
      }
      recordsByExercise[record.exercise].push(record);
    });

    // Calcular progreso para cada ejercicio
    const progress = {};
    Object.keys(recordsByExercise).forEach(exercise => {
      const records = recordsByExercise[exercise].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstRecord = records[0];
      const latestRecord = records[records.length - 1];
      
      progress[exercise] = {
        start: firstRecord.result,
        current: latestRecord.result,
        improvement: latestRecord.result - firstRecord.result,
        unit: latestRecord.unit,
        recordCount: records.length
      };
    });

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

const getMyBadges = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate('gamification.badges.badgeId');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member.gamification.badges
    });
  } catch (error) {
    next(error);
  }
};

const getMyMatches = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate('matches.matchId')
      .populate('matches.tournamentId', 'name');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member.matches
    });
  } catch (error) {
    next(error);
  }
};

const getMyGallery = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate('gallery.eventId', 'title date');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member.gallery
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);

    if (!member || !user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const {
      // Datos personales (User)
      phone,
      gender,
      dateOfBirth,
      idType,
      idNumber,
      address,
      
      // Información médica (Member)
      eps,
      bloodType,
      allergies,
      
      // Contacto de emergencia (Member)
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      
      // Perfil deportivo (Member)
      position,
      experience,
      height,
      weight,
      shirtSize,
      pantsSize,
      shoeSize,
      
      // Información adicional (Member)
      occupation,
      studyLevel,
      instagram
    } = req.body;

    // Actualizar User profile
    if (phone !== undefined) user.profile.phone = phone;
    if (gender !== undefined) user.profile.gender = gender;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (idType !== undefined) user.profile.idType = idType;
    if (idNumber !== undefined) user.profile.idNumber = idNumber;
    if (address !== undefined) user.profile.address = address;

    // Actualizar información médica
    if (eps !== undefined) member.medicalInfo.eps = eps;
    if (bloodType !== undefined) member.medicalInfo.bloodType = bloodType;
    if (allergies !== undefined) member.medicalInfo.allergies = allergies;

    // Actualizar contacto de emergencia
    if (emergencyContactName !== undefined) member.emergencyContact.name = emergencyContactName;
    if (emergencyContactPhone !== undefined) member.emergencyContact.phone = emergencyContactPhone;
    if (emergencyContactRelation !== undefined) member.emergencyContact.relation = emergencyContactRelation;

    // Actualizar perfil deportivo
    if (position !== undefined) member.sportProfile.position = position;
    if (experience !== undefined) member.sportProfile.experience = experience;
    if (height !== undefined) member.sportProfile.height = height;
    if (weight !== undefined) member.sportProfile.weight = weight;
    if (shirtSize !== undefined) member.sportProfile.shirtSize = shirtSize;
    if (pantsSize !== undefined) member.sportProfile.pantsSize = pantsSize;
    if (shoeSize !== undefined) member.sportProfile.shoeSize = shoeSize;

    // Actualizar información adicional
    if (occupation !== undefined) member.additionalInfo.occupation = occupation;
    if (studyLevel !== undefined) member.additionalInfo.studyLevel = studyLevel;
    if (instagram !== undefined) member.socialMedia.instagram = instagram;

    await user.save();
    await member.save();

    // Recargar con populate
    const updatedMember = await Member.findOne({ userId: req.user.id })
      .populate('userId', 'email profile');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

const uploadPersonalPhoto = async (req, res, next) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const { uploadImage } = require('../config/cloudinary');
    const result = await uploadImage(req.file, 'members/gallery');

    member.gallery.push({
      imageUrl: result.url,
      caption: req.body.caption || '',
      uploadedAt: new Date(),
      eventId: req.body.eventId || null
    });

    await member.save();

    res.status(201).json({
      success: true,
      data: member.gallery[member.gallery.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  getMyStats,
  getMyProgress,
  getMyBadges,
  getMyMatches,
  getMyGallery,
  updateMyProfile,
  uploadPersonalPhoto
};
