const Member = require('../models/Member');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Event = require('../models/Event');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ 'membership.status': 'active' });
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = await Member.aggregate([
      {
        $match: {
          'membership.status': 'active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$membership.monthlyFee' }
        }
      }
    ]);

    const lastMonthMembers = await Member.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });

    const twoMonthsAgoMembers = await Member.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, currentMonth - 2, 1),
        $lt: new Date(currentYear, currentMonth - 1, 1)
      }
    });

    const memberGrowth = twoMonthsAgoMembers > 0 
      ? Math.round(((lastMonthMembers - twoMonthsAgoMembers) / twoMonthsAgoMembers) * 100)
      : 100;

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        memberGrowth: `${memberGrowth > 0 ? '+' : ''}${memberGrowth}%`,
        activePlayers: activeMembers
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMembershipGrowth = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const growth = await Member.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const formattedGrowth = growth.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: formattedGrowth
    });
  } catch (error) {
    next(error);
  }
};

const getRecentRegistrations = async (req, res, next) => {
  try {
    const recentMembers = await Member.find()
      .populate('userId', 'email profile')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedMembers = recentMembers.map(member => ({
      id: member._id,
      name: member.userId.getFullName(),
      email: member.userId.email,
      role: member.sportProfile.position || 'Player',
      status: member.membership.status,
      avatar: member.userId.profile.avatar
    }));

    res.status(200).json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    next(error);
  }
};

const getUpcomingEvents = async (req, res, next) => {
  try {
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(5)
      .populate('createdBy', 'profile.firstName profile.lastName');

    const formattedEvents = upcomingEvents.map(event => ({
      id: event._id,
      title: event.title,
      date: event.date,
      time: `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`,
      participants: event.getConfirmedCount(),
      type: event.type
    }));

    res.status(200).json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

const getNextBirthdays = async (req, res, next) => {
  try {
    const today = new Date();
    const members = await Member.find()
      .populate('userId', 'profile.firstName profile.lastName profile.dateOfBirth profile.avatar');

    const withBirthdays = members
      .filter(m => m.userId?.profile?.dateOfBirth)
      .map(m => {
        const dob = new Date(m.userId.profile.dateOfBirth);
        let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (next <= today) next.setFullYear(today.getFullYear() + 1);
        const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
        return {
          memberId: m._id,
          name: `${m.userId.profile.firstName} ${m.userId.profile.lastName}`,
          avatar: m.userId.profile.avatar || null,
          dateOfBirth: m.userId.profile.dateOfBirth,
          nextBirthday: next,
          daysUntil,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);

    res.status(200).json({
      success: true,
      data: withBirthdays.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getMembershipGrowth,
  getRecentRegistrations,
  getUpcomingEvents,
  getNextBirthdays
};
