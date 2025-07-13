const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is not expired
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
            profileCompleted: true,
            createdAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
                dateOfBirth: true,
                height: true,
                weight: true,
                country: true,
                city: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    if (!session.user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    req.user = session.user;
    req.session = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth; 