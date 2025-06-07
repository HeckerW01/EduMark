/**
 * Database Configuration for Oracle Cloud
 * Supports MySQL, PostgreSQL, and Oracle Database
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

let sequelize;

/**
 * Initialize database connection based on environment
 */
async function initializeDatabase() {
    const dbType = process.env.DB_TYPE || 'mysql';
    
    try {
        switch (dbType.toLowerCase()) {
            case 'mysql':
                sequelize = await initializeMySQL();
                break;
            case 'postgresql':
            case 'postgres':
                sequelize = await initializePostgreSQL();
                break;
            case 'oracle':
                sequelize = await initializeOracle();
                break;
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
        
        // Test the connection
        await sequelize.authenticate();
        logger.info(`Database connection established successfully (${dbType})`);
        
        // Sync models (create tables if they don't exist)
        await syncModels();
        
        return sequelize;
        
    } catch (error) {
        logger.error('Database connection failed:', error);
        throw error;
    }
}

/**
 * Initialize MySQL connection for Oracle Cloud MySQL
 */
async function initializeMySQL() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'classpdf',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        dialect: 'mysql',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false,
            connectTimeout: 30000,
            acquireTimeout: 30000
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
    
    logger.info('Initializing MySQL connection');
    return new Sequelize(config);
}

/**
 * Initialize PostgreSQL connection for Oracle Cloud PostgreSQL
 */
async function initializePostgreSQL() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'classpdf',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
    
    logger.info('Initializing PostgreSQL connection');
    return new Sequelize(config);
}

/**
 * Initialize Oracle Database connection
 */
async function initializeOracle() {
    // Note: Oracle dialect requires additional setup
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1521,
        database: process.env.DB_NAME || 'CLASSPDF',
        username: process.env.DB_USER || 'classpdf',
        password: process.env.DB_PASSWORD || '',
        dialect: 'oracle',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production'
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
    
    logger.info('Initializing Oracle Database connection');
    return new Sequelize(config);
}

/**
 * Sync database models
 */
async function syncModels() {
    try {
        // Import models
        const User = require('../models/User');
        const PDF = require('../models/PDF');
        const Assignment = require('../models/Assignment');
        const Submission = require('../models/Submission');
        const AIConversation = require('../models/AIConversation');
        
        // Define associations
        defineAssociations();
        
        // Sync all models
        await sequelize.sync({ 
            alter: process.env.NODE_ENV === 'development',
            force: false // Never force in production
        });
        
        logger.info('Database models synchronized successfully');
        
    } catch (error) {
        logger.error('Failed to sync database models:', error);
        throw error;
    }
}

/**
 * Define model associations
 */
function defineAssociations() {
    const User = require('../models/User');
    const PDF = require('../models/PDF');
    const Assignment = require('../models/Assignment');
    const Submission = require('../models/Submission');
    const AIConversation = require('../models/AIConversation');
    
    // User associations
    User.hasMany(PDF, { foreignKey: 'uploadedBy', as: 'uploadedPDFs' });
    User.hasMany(Assignment, { foreignKey: 'createdBy', as: 'createdAssignments' });
    User.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
    User.hasMany(AIConversation, { foreignKey: 'userId', as: 'conversations' });
    
    // PDF associations
    PDF.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
    PDF.hasMany(Assignment, { foreignKey: 'pdfId', as: 'assignments' });
    
    // Assignment associations
    Assignment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
    Assignment.belongsTo(PDF, { foreignKey: 'pdfId', as: 'pdf' });
    Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });
    
    // Submission associations
    Submission.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
    Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
    
    // AI Conversation associations
    AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

/**
 * Get database instance
 */
function getDatabase() {
    if (!sequelize) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return sequelize;
}

/**
 * Close database connection
 */
async function closeDatabase() {
    if (sequelize) {
        await sequelize.close();
        logger.info('Database connection closed');
    }
}

/**
 * Health check for database
 */
async function healthCheck() {
    try {
        await sequelize.authenticate();
        return {
            status: 'healthy',
            type: sequelize.getDialect(),
            version: await sequelize.databaseVersion()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

module.exports = {
    initializeDatabase,
    getDatabase,
    closeDatabase,
    healthCheck,
    sequelize: () => sequelize
}; 