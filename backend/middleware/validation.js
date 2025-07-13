const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};

// Validation schemas
const authSchemas = {
  // Simple registration - only email and password
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Profile completion - all optional fields
  completeProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    username: Joi.string().min(3).max(30).alphanum().optional(),
    avatar: Joi.string().uri().optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    height: Joi.number().min(0).max(300).optional(),
    weight: Joi.number().min(0).max(500).optional(),
    country: Joi.string().max(100).optional(),
    city: Joi.string().max(100).optional()
  }),

  // Update profile - all optional fields
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    username: Joi.string().min(3).max(30).alphanum().optional(),
    avatar: Joi.string().uri().optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    height: Joi.number().min(0).max(300).optional(),
    weight: Joi.number().min(0).max(500).optional(),
    country: Joi.string().max(100).optional(),
    city: Joi.string().max(100).optional()
  })
};

// Tournament validation schemas
const tournamentSchemas = {
  // Create tournament
  create: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(1000).optional(),
    locationName: Joi.string().min(2).max(200).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    startDate: Joi.date().greater('now').required(),
    skillLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL', 'ALL_LEVELS').required(),
    maxPlayers: Joi.number().integer().min(2).max(128).required(),
    isPublic: Joi.boolean().optional(),
    registrationDeadline: Joi.date().greater('now').optional()
  }),

  // Update tournament
  update: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(1000).optional(),
    locationName: Joi.string().min(2).max(200).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    startDate: Joi.date().greater('now').optional(),
    skillLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL', 'ALL_LEVELS').optional(),
    maxPlayers: Joi.number().integer().min(2).max(128).optional(),
    isPublic: Joi.boolean().optional(),
    registrationDeadline: Joi.date().greater('now').optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional()
  })
};

module.exports = {
  validate,
  authSchemas,
  tournamentSchemas
}; 