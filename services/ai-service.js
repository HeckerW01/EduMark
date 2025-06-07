/**
 * Server-Side AI Service with Gemma 3 27B
 * Advanced language model for educational assistance
 */

const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');
const { AIConversation } = require('../models/AIConversation');

class AIService {
    constructor() {
        this.model = null;
        this.isReady = false;
        this.conversationHistory = new Map();
        this.gemmaProcess = null;
    }

    /**
     * Initialize the AI service with Gemma 3 27B
     */
    async initialize() {
        try {
            logger.info('Initializing AI Service with Gemma 3 27B...');
            
            // Start the Gemma process
            this.gemmaProcess = spawn('python', [
                path.join(__dirname, '../run_gemma3_27b.py')
            ]);

            // Handle process output
            this.gemmaProcess.stdout.on('data', (data) => {
                logger.info(`Gemma process output: ${data}`);
            });

            this.gemmaProcess.stderr.on('data', (data) => {
                logger.error(`Gemma process error: ${data}`);
            });

            this.gemmaProcess.on('close', (code) => {
                logger.info(`Gemma process exited with code ${code}`);
                this.isReady = false;
            });

            // Wait for model to be ready
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            this.isReady = true;
            logger.info('AI Service initialized successfully with Gemma 3 27B');
            
        } catch (error) {
            logger.error('Failed to initialize AI Service:', error);
            throw error;
        }
    }

    /**
     * Generate response using Gemma 3 27B
     */
    async generateResponse(inputText, userId = null) {
        try {
            if (!this.isReady) {
                throw new Error('AI Service is not ready');
            }

            // Get conversation context
            const context = await this.getConversationContext(userId);
            
            // Prepare prompt with context
            const prompt = this.preparePrompt(inputText, context);
            
            // Send request to Gemma process
            const response = await this.queryGemma(prompt);
            
            // Save conversation
            if (userId) {
                await this.saveConversation(userId, inputText, response);
            }
            
            return response;
            
        } catch (error) {
            logger.error('Error generating AI response:', error);
            return this.generateFallbackResponse();
        }
    }

    /**
     * Prepare prompt with conversation context
     */
    preparePrompt(inputText, context) {
        let prompt = "You are an educational AI assistant. Provide helpful, accurate, and concise responses.\n\n";
        
        if (context && context.length > 0) {
            prompt += "Previous conversation:\n";
            context.forEach(msg => {
                prompt += `${msg.role}: ${msg.content}\n`;
            });
            prompt += "\n";
        }
        
        prompt += `User: ${inputText}\nAssistant:`;
        return prompt;
    }

    /**
     * Query Gemma model through Python process
     */
    async queryGemma(prompt) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Gemma query timeout'));
            }, 30000);

            this.gemmaProcess.stdin.write(JSON.stringify({ prompt }) + '\n');
            
            this.gemmaProcess.stdout.once('data', (data) => {
                clearTimeout(timeout);
                try {
                    const response = JSON.parse(data.toString());
                    resolve(response.text);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Get conversation context for a user
     */
    async getConversationContext(userId) {
        if (!userId) return [];
        
        try {
            const conversation = await AIConversation.findOne({ userId })
                .sort({ timestamp: -1 })
                .limit(5);
                
            return conversation ? conversation.messages : [];
        } catch (error) {
            logger.error('Error getting conversation context:', error);
            return [];
        }
    }

    /**
     * Save conversation to database
     */
    async saveConversation(userId, userMessage, aiResponse) {
        try {
            const conversation = await AIConversation.findOne({ userId }) || new AIConversation({ userId });
            
            conversation.messages.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );
            
            await conversation.save();
        } catch (error) {
            logger.error('Error saving conversation:', error);
        }
    }

    /**
     * Generate fallback response when AI fails
     */
    generateFallbackResponse() {
        return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }

    /**
     * Get health status of AI service
     */
    getHealthStatus() {
        return {
            status: this.isReady ? 'healthy' : 'unhealthy',
            model: 'Gemma 3 27B',
            timestamp: new Date().toISOString(),
            conversationHistory: this.conversationHistory.size
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.gemmaProcess) {
            this.gemmaProcess.kill();
            this.gemmaProcess = null;
        }
        this.isReady = false;
    }
}

// Initialize AI service
let aiService = null;

async function initializeAI() {
    if (!aiService) {
        aiService = new AIService();
        await aiService.initialize();
    }
    return aiService;
}

async function generateAIResponse(inputText, userId = null) {
    if (!aiService) {
        await initializeAI();
    }
    return aiService.generateResponse(inputText, userId);
}

function getAIHealthStatus() {
    return aiService ? aiService.getHealthStatus() : { status: 'uninitialized' };
}

module.exports = {
    initializeAI,
    generateAIResponse,
    getAIHealthStatus
}; 