const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
// const logger = require('../config/logger');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    // const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MGQzZDE0YS1hY2E0LTQ1ZDQtYWQzMy02NzM2YmEwMGMyMjIiLCJ1c2VybmFtZSI6Imd1bmEiLCJlbWFpbCI6Imd1bmFAZ21haWwub20iLCJpc1ByZW1pdW0iOmZhbHNlLCJyb2xlcyI6IlVzZXIifQ.v6zsmiioYPGEiJ8t2JQbaQ7mT03m3MvKqLoV_nr1Suw"; // Bearer TOKEN
    console.log(token);  
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // logger.warn('Invalid JWT token:', err.message);
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        isPremium: decoded.isPremium,
        roles: decoded.roles || ['USER']
      };
      console.log(req.user);
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userRoles = req.user.roles || ['USER'];
      const hasRequiredRole = Array.isArray(requiredRoles)
        ? requiredRoles.some(role => userRoles.includes(role))
        : userRoles.includes(requiredRoles);

      if (!hasRequiredRole) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is premium
 */
const requirePremium = (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.isPremium) {
      throw new UnauthorizedError('Premium subscription required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware (doesn't throw error if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
          req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            isPremium: decoded.isPremium,
            roles: decoded.roles || ['USER']
          };
        }
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
const requireOwnership = (resourceIdParam = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const resourceUserId = parseInt(req.params[resourceIdParam]);
      
      if (req.user.userId !== resourceUserId && !req.user.roles.includes('ADMIN')) {
        throw new UnauthorizedError('Access denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require admin access
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.roles.includes('ADMIN')) {
      throw new UnauthorizedError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePremium,
  optionalAuth,
  requireOwnership,
  requireAdmin
};
