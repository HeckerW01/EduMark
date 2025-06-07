/**
 * AI Routes for ClassPDF
 * Handles AI assistant interactions using Gemma 3 27B
 */

const express = require('express');
const router = express.Router();
const { generateAIResponse, getAIHealthStatus } = require('../services/ai-service');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Generate AI response for user query
 * @route POST /api/ai/chat
 * @access Private
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Invalid message format',
                details: 'Message must be a non-empty string'
            });
        }

        logger.info(`Processing AI chat request from user ${userId}`);
        
        const response = await generateAIResponse(message, userId);
        
        res.json({
            response,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error in AI chat endpoint:', error);
        res.status(500).json({
            error: 'Failed to generate AI response',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get AI service health status
 * @route GET /api/ai/health
 * @access Private
 */
router.get('/health', authenticateToken, (req, res) => {
    try {
        const healthStatus = getAIHealthStatus();
        res.json(healthStatus);
    } catch (error) {
        logger.error('Error getting AI health status:', error);
        res.status(500).json({
            error: 'Failed to get AI health status',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get conversation history for user
 * @route GET /api/ai/history
 * @access Private
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { AIConversation } = require('../models/AIConversation');
        
        const conversation = await AIConversation.findOne({ userId })
            .sort({ timestamp: -1 })
            .limit(10);
            
        res.json({
            history: conversation ? conversation.messages : [],
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting AI conversation history:', error);
        res.status(500).json({
            error: 'Failed to get conversation history',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Clear conversation history for user
 * @route DELETE /api/ai/history
 * @access Private
 */
router.delete('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { AIConversation } = require('../models/AIConversation');
        
        await AIConversation.deleteMany({ userId });
        
        res.json({
            message: 'Conversation history cleared successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error clearing AI conversation history:', error);
        res.status(500).json({
            error: 'Failed to clear conversation history',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 