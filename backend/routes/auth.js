const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const auth = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');

const router = express.Router();

// Register - Simple registration with only email and password
router.post('/register', validate(authSchemas.register), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (profile will be created later)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profileCompleted: false
      },
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
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    res.status(201).json({
      message: 'User registered successfully. Please complete your profile.',
      user,
      token,
      requiresProfileCompletion: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete Profile - Called after registration or when profile is incomplete
router.post('/complete-profile', auth, validate(authSchemas.completeProfile), async (req, res) => {
  try {
    const { firstName, lastName, username, avatar, dateOfBirth, height, weight, country, city } = req.body;

    // Check if username is already taken (if provided)
    if (username) {
      const existingProfile = await prisma.profile.findUnique({
        where: { username }
      });

      if (existingProfile && existingProfile.userId !== req.user.id) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    // Create or update profile
    const profileData = {
      firstName,
      lastName,
      username,
      avatar,
      dateOfBirth,
      height,
      weight,
      country,
      city
    };

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: {
        userId: req.user.id,
        ...profileData
      },
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
    });

    // Mark profile as completed
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profileCompleted: true }
    });

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    });

    res.json({
      message: 'Profile completed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validate(authSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
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
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      profile: user.profile
    };

    res.json({
      message: 'Login successful',
      user: userData,
      token,
      requiresProfileCompletion: !user.profileCompleted
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Delete current session
    await prisma.session.delete({
      where: { id: req.session.id }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ 
      user: req.user,
      requiresProfileCompletion: !req.user.profileCompleted
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', auth, validate(authSchemas.updateProfile), async (req, res) => {
  try {
    const { firstName, lastName, username, avatar, dateOfBirth, height, weight, country, city } = req.body;

    // Check if username is already taken (if provided)
    if (username && username !== req.user.profile?.username) {
      const existingProfile = await prisma.profile.findUnique({
        where: { username }
      });

      if (existingProfile) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update profile
    const profileData = {
      firstName,
      lastName,
      username,
      avatar,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      height,
      weight,
      country,
      city
    };

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: {
        userId: req.user.id,
        ...profileData
      },
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
    });

    // Mark profile as completed if it wasn't before
    if (!req.user.profileCompleted) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { profileCompleted: true }
      });
    }

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 