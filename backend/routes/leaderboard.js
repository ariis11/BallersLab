const express = require('express');
const prisma = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Get leaderboard by age group
 * GET /api/leaderboard?ageGroup=U18&timeRange=all_time&page=1&size=50
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      ageGroup = 'ALL_AGES',
      timeRange = 'all_time',
      page = 1,
      size = 50
    } = req.query;

    // Validate age group
    const validAgeGroups = ['U12', 'U14', 'U16', 'U18', 'OVER_18', 'ALL_AGES'];
    if (!validAgeGroups.includes(ageGroup)) {
      return res.status(400).json({ error: 'Invalid age group' });
    }

    // Validate time range (for future use)
    const validTimeRanges = ['all_time', 'monthly', 'yearly'];
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({ error: 'Invalid time range' });
    }

    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const offsetNum = (pageNum - 1) * sizeNum;

    // Build where clause
    const where = {};
    if (ageGroup !== 'ALL_AGES') {
      where.ageGroup = ageGroup;
    }

    // For now, we only support all_time
    // In the future, we can add time-based filtering here
    if (timeRange !== 'all_time') {
      // TODO: Implement time-based filtering
      return res.status(400).json({ error: 'Time range not yet implemented' });
    }

    // Get total count for pagination
    const totalUsers = await prisma.userPoints.count({ where });

    // Get leaderboard data
    const leaderboard = await prisma.userPoints.findMany({
      where,
      include: {
        user: {
          include: {
            profile: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { points: 'desc' },
      take: sizeNum,
      skip: offsetNum
    });

    // Calculate user's rank
    let userRank = null;
    if (totalUsers > 0) {
      const userPoints = await prisma.userPoints.findFirst({
        where: {
          ...where,
          userId: req.user.id
        }
      });

      if (userPoints) {
        // Count users with more points than current user
        const usersWithMorePoints = await prisma.userPoints.count({
          where: {
            ...where,
            points: { gt: userPoints.points }
          }
        });
        userRank = usersWithMorePoints + 1;
      }
    }

    // Format response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: offsetNum + index + 1,
      userId: entry.userId,
      name: entry.user.profile?.firstName || '',
      surname: entry.user.profile?.lastName || '',
      points: entry.points,
      tournamentsPlayed: entry.tournamentsPlayed,
      avatar: entry.user.profile?.avatar
    }));

    res.json({
      users: formattedLeaderboard,
      userRank,
      totalUsers,
      pagination: {
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(totalUsers / sizeNum),
        hasMore: pageNum < Math.ceil(totalUsers / sizeNum)
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 