const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Problem = sequelize.define('Problem', {
  problemId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'problem_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 255],
      is: /^[a-z0-9-]+$/
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    allowNull: false,
    defaultValue: 'EASY'
  },
  acceptanceRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'acceptance_rate',
    validate: {
      min: 0,
      max: 100
    }
  },
  totalSubmissions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_submissions',
    validate: {
      min: 0
    }
  },
  totalAccepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_accepted',
    validate: {
      min: 0
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  dislikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 5000,
    field: 'time_limit',
    validate: {
      min: 1000,
      max: 30000
    }
  },
  memoryLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 512,
    field: 'memory_limit',
    validate: {
      min: 64,
      max: 2048
    }
  },
  createdBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'problems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_premium']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['acceptance_rate']
    }
  ]
});

// Instance methods
Problem.prototype.updateStatistics = function() {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = (this.totalAccepted / this.totalSubmissions) * 100;
  }
  return this.save();
};

Problem.prototype.isAccessibleBy = function(user) {
  if (!this.isActive) return false;
  if (!this.isPremium) return true;
  return user && user.isPremium;
};

// Class methods
Problem.findBySlug = function(slug) {
  return this.findOne({ 
    where: { slug, isActive: true },
    include: ['problemSpecification', 'testCases']
  });
};

Problem.findByDifficulty = function(difficulty, options = {}) {
  return this.findAndCountAll({
    where: { difficulty, isActive: true },
    ...options
  });
};

Problem.searchByTitle = function(title, options = {}) {
  return this.findAndCountAll({
    where: {
      title: {
        [sequelize.Op.like]: `%${title}%`
      },
      isActive: true
    },
    ...options
  });
};

module.exports = Problem;
