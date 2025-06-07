/**
 * Middleware Setup for ClassPDF
 * Configures security, performance, and monitoring middleware
 */

const rateLimit = require('express-rate-limit');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Setup all middleware for the application
 */
function setupMiddleware(app) {
    // Request logging
    app.use(logger.requestLogger);
    
    // Rate limiting
    setupRateLimiting(app);
    
    // Security headers
    setupSecurityHeaders(app);
    
    // Performance optimization
    setupPerformanceOptimization(app);
    
    // Error handling
    setupErrorHandling(app);
}

/**
 * Setup rate limiting middleware
 */
function setupRateLimiting(app) {
    // General API rate limiter
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false
    });
    
    // Apply rate limiting to all API routes
    app.use('/api/', apiLimiter);
    
    // MongoDB-based rate limiter for more precise control
    const rateLimiterMongo = new RateLimiterMongo({
        storeClient: mongoose.connection,
        points: 10, // Number of points
        duration: 1, // Per second
        blockDuration: 60 // Block for 1 minute if consumed
    });
    
    // Apply MongoDB rate limiter to specific routes
    app.use('/api/auth/login', async (req, res, next) => {
        try {
            await rateLimiterMongo.consume(req.ip);
            next();
        } catch (error) {
            res.status(429).json({
                error: 'Too many login attempts, please try again later'
            });
        }
    });
}

/**
 * Setup security headers middleware
 */
function setupSecurityHeaders(app) {
    // Security headers
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Strict Transport Security
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        // Content Security Policy
        res.setHeader('Content-Security-Policy', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "img-src 'self' data: blob: https:",
            "font-src 'self' https://cdn.jsdelivr.net",
            "connect-src 'self' https://cdn.jsdelivr.net",
            "frame-ancestors 'none'",
            "form-action 'self'"
        ].join('; '));
        
        next();
    });
}

/**
 * Setup performance optimization middleware
 */
function setupPerformanceOptimization(app) {
    // Compression
    app.use((req, res, next) => {
        // Skip compression for small responses
        if (req.headers['content-length'] && parseInt(req.headers['content-length']) < 1024) {
            return next();
        }
        
        // Enable compression for larger responses
        res.setHeader('Vary', 'Accept-Encoding');
        next();
    });
    
    // Cache control
    app.use((req, res, next) => {
        // Cache static assets
        if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        next();
    });
}

/**
 * Setup error handling middleware
 */
function setupErrorHandling(app) {
    // Error logging
    app.use(logger.errorLogger);
    
    // 404 handler
    app.use((req, res, next) => {
        res.status(404).json({
            error: 'Not Found',
            path: req.path,
            method: req.method
        });
    });
    
    // Global error handler
    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        const message = process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message;
            
        res.status(statusCode).json({
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    });
}

module.exports = {
    setupMiddleware
}; 