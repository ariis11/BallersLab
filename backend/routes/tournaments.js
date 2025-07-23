const express = require('express');
const prisma = require('../config/database');
const auth = require('../middleware/auth');
const { validate, tournamentSchemas } = require('../middleware/validation');

const router = express.Router();

// Create a new tournament
router.post('/create', auth, validate(tournamentSchemas.create), async (req, res) => {
  try {
    const {
      title,
      description,
      locationName,
      latitude,
      longitude,
      startDate,
      skillLevel,
      maxPlayers,
      isPublic,
      registrationDeadline
    } = req.body;

    const tournament = await prisma.tournament.create({
      data: {
        title,
        description,
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        startDate: new Date(startDate),
        skillLevel,
        maxPlayers: parseInt(maxPlayers),
        isPublic: isPublic !== undefined ? isPublic : true,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        status: 'REGISTRATION_OPEN',
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get all tournaments (with filtering and pagination)
router.get('/list', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      skillLevel,
      location,
      search,
      sortBy = 'startDate',
      sortOrder = 'asc',
      startDateFrom,
      startDateTo,
      maxPlayersFrom,
      maxPlayersTo,
      spotsLeftFrom,
      spotsLeftTo,
      registrationDeadlineFrom,
      registrationDeadlineTo,
      userLat,
      userLng,
      distance
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isPublic: true,
      status: { not: 'DRAFT' }
    };

    if (status) {
      where.status = status;
    }

    if (skillLevel) {
      where.skillLevel = skillLevel;
    }

    if (location) {
      where.locationName = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { locationName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Range filters
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
      if (startDateTo) where.startDate.lte = new Date(startDateTo);
    }
    if (maxPlayersFrom || maxPlayersTo) {
      where.maxPlayers = {};
      if (maxPlayersFrom) where.maxPlayers.gte = parseInt(maxPlayersFrom);
      if (maxPlayersTo) where.maxPlayers.lte = parseInt(maxPlayersTo);
    }
    if (registrationDeadlineFrom || registrationDeadlineTo) {
      where.registrationDeadline = {};
      if (registrationDeadlineFrom) where.registrationDeadline.gte = new Date(registrationDeadlineFrom);
      if (registrationDeadlineTo) where.registrationDeadline.lte = new Date(registrationDeadlineTo);
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [tournaments] = await Promise.all([
      prisma.tournament.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      username: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    // Filter by spotsLeft in Node.js
    let filteredTournaments = tournaments;
    if (spotsLeftFrom || spotsLeftTo) {
      filteredTournaments = filteredTournaments.filter(t => {
        const spotsLeft = t.maxPlayers - t.currentPlayers;
        if (spotsLeftFrom && spotsLeft < parseInt(spotsLeftFrom)) return false;
        if (spotsLeftTo && spotsLeft > parseInt(spotsLeftTo)) return false;
        return true;
      });
    }

    // Filter by distance if userLat, userLng, and distance are provided
    if (userLat && userLng && distance) {
      const userLatNum = parseFloat(userLat);
      const userLngNum = parseFloat(userLng);
      const maxDistance = parseFloat(distance);
      filteredTournaments = filteredTournaments.filter(t => {
        const d = getDistanceFromLatLonInKm(userLatNum, userLngNum, t.latitude, t.longitude);
        return d <= maxDistance;
      });
    }

    // Paginate after all filtering
    const total = filteredTournaments.length;
    const paginatedTournaments = filteredTournaments.slice(skip, skip + take);

    res.json({
      tournaments: paginatedTournaments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tournament by ID
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if tournament is public or user is creator
    if (!tournament.isPublic && (!req.user || req.user.id !== tournament.createdBy)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ tournament });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tournament (only creator can update)
router.put('/update/:id', auth, validate(tournamentSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if tournament exists and user is creator
    const existingTournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!existingTournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (existingTournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only tournament creator can update' });
    }

    // Prevent updates if tournament has started
    if (existingTournament.status === 'IN_PROGRESS' || existingTournament.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot update tournament that has started' });
    }

    // Convert numeric fields
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.maxPlayers) updateData.maxPlayers = parseInt(updateData.maxPlayers);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);

    const tournament = await prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Tournament updated successfully',
      tournament
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tournament (only creator can delete)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tournament exists and user is creator
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only tournament creator can delete' });
    }

    // Prevent deletion if tournament has participants
    if (tournament.currentPlayers > 0) {
      return res.status(400).json({ error: 'Cannot delete tournament with participants' });
    }

    await prisma.tournament.delete({
      where: { id }
    });

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join tournament
router.post('/join/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true
      }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if tournament is open for registration
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }

    // Check if registration deadline has passed
    if (tournament.registrationDeadline && new Date() > tournament.registrationDeadline) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if tournament is full
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if user is already registered
    const existingParticipant = tournament.participants.find(
      p => p.userId === req.user.id
    );

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    // Add participant
    const participant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId: id,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    // Update tournament player count
    await prisma.tournament.update({
      where: { id },
      data: {
        currentPlayers: {
          increment: 1
        }
      }
    });

    // IMMEDIATE STATUS CHECK: Check if tournament is now full
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id }
    });
    
    if (updatedTournament.currentPlayers >= updatedTournament.maxPlayers) {
      await prisma.tournament.update({
        where: { id },
        data: { status: 'REGISTRATION_CLOSED' }
      });
      console.log(`🔄 Tournament ${id} registration closed (now full)`);
    }

    res.json({
      message: 'Successfully joined tournament',
      participant
    });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join tournament by code
router.post('/join-by-code', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Tournament code is required' });
    }

    // Find tournament by code with filtered participants in a single query
    const tournament = await prisma.tournament.findUnique({
      where: { 
        code: code.toUpperCase()
      },
      include: {
        participants: {
          where: {
            userId: req.user.id
          }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found with this code' });
    }

    // Check if tournament is open for registration
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }

    // Check if tournament is full
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if user is already registered (using the filtered participants from the query)
    if (tournament.participants.length > 0) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    // Use a transaction to ensure data consistency and reduce DB calls
    const result = await prisma.$transaction(async (tx) => {
      // Add participant
      const participant = await tx.tournamentParticipant.create({
        data: {
          tournamentId: tournament.id,
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      // Update tournament player count and check if full in one operation
      const updatedTournament = await tx.tournament.update({
        where: { id: tournament.id },
        data: {
          currentPlayers: {
            increment: 1
          },
          // If the new count equals maxPlayers, close registration
          status: {
            set: tournament.currentPlayers + 1 >= tournament.maxPlayers ? 'REGISTRATION_CLOSED' : tournament.status
          }
        }
      });

      // Log if tournament is now full
      if (updatedTournament.status === 'REGISTRATION_CLOSED') {
        console.log(`🔄 Tournament ${tournament.id} registration closed (now full)`);
      }

      return { participant, updatedTournament };
    });

    res.json({
      message: 'Successfully joined tournament',
      tournament: {
        id: tournament.id,
        title: tournament.title,
        locationName: tournament.locationName,
        startDate: tournament.startDate
      },
      participant: result.participant
    });
  } catch (error) {
    console.error('Join tournament by code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave tournament
router.post('/leave/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if tournament is still open for registration
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ error: 'Cannot leave tournament after registration is closed' });
    }

    // Check if user is registered
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: req.user.id
        }
      }
    });

    if (!participant) {
      return res.status(400).json({ error: 'Not registered for this tournament' });
    }

    // Remove participant
    await prisma.tournamentParticipant.delete({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: req.user.id
        }
      }
    });

    // Update tournament player count
    await prisma.tournament.update({
      where: { id },
      data: {
        currentPlayers: {
          decrement: 1
        }
      }
    });

    // Is not needed in current application logic because user cant leave tournament if REGISTRATION_CLOSED
    // IMMEDIATE STATUS CHECK: Check if tournament is no longer full
    // const updatedTournament = await prisma.tournament.findUnique({
    //   where: { id }
    // });
    
    // if (updatedTournament.status === 'REGISTRATION_CLOSED' && 
    //     updatedTournament.currentPlayers < updatedTournament.maxPlayers) {
    //   await prisma.tournament.update({
    //     where: { id },
    //     data: { status: 'REGISTRATION_OPEN' }
    //   });
    //   console.log(`🔄 Tournament ${id} registration reopened (no longer full)`);
    // }

    res.json({ message: 'Successfully left tournament' });
  } catch (error) {
    console.error('Leave tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /my-tournaments
// type: 'created' (tournaments created by user)
// type: 'joined' (tournaments user joined)
// type: 'all' (created or joined)
// type: 'upcoming' (joined and status REGISTRATION_OPEN)
// type: 'active' (joined and status IN_PROGRESS)
// type: 'finished' (joined and status COMPLETED)
router.get('/my-tournaments', auth, async (req, res) => {
    try {
      const { type = 'all' } = req.query; // 'created', 'joined', 'all', 'upcoming', 'active', 'finished'
  
      let where = {};
  
      if (type === 'created') {
        where.createdBy = req.user.id;
      } else if (type === 'joined') {
        where.participants = {
          some: {
            userId: req.user.id
          }
        };
      } else if (type === 'upcoming') {
        where = {
          participants: {
            some: { userId: req.user.id }
          },
          status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED'] }
        };
      } else if (type === 'active') {
        where = {
          participants: {
            some: { userId: req.user.id }
          },
          status: 'IN_PROGRESS'
        };
      } else if (type === 'finished') {
        where = {
          participants: {
            some: { userId: req.user.id }
          },
          status: 'COMPLETED'
        };
      } else {
        // 'all' - tournaments created or joined
        where.OR = [
          { createdBy: req.user.id },
          {
            participants: {
              some: {
                userId: req.user.id
              }
            }
          }
        ];
      }
  
      const tournaments = await prisma.tournament.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true
                }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      username: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });
  
      res.json({ tournaments });
    } catch (error) {
      console.error('Get user tournaments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Get tournament participants
router.get('/participants/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    res.json({ participants });
  } catch (error) {
    console.error('Get tournament participants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual status update (admin/creator only)
router.put('/update-status/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Import the simple service
    const tournamentStatusService = require('../services/tournamentStatusService');

    // Perform the status update
    await tournamentStatusService.manualStatusUpdate(id, status);

    // Get updated tournament
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Tournament status updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Manual status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tournament status history (for debugging)
router.get('/status-history/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Only creator can view status history
    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, return current status and last update time
    // In a real system, you might want to track status changes in a separate table
    res.json({
      currentStatus: tournament.status,
      lastUpdated: tournament.updatedAt,
      createdAt: tournament.createdAt,
      startDate: tournament.startDate,
      registrationDeadline: tournament.registrationDeadline
    });
  } catch (error) {
    console.error('Get status history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 