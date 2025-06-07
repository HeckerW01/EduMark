/**
 * EduMark Local Gemma AI Integration
 * Connects local Gemma model to existing AI chat interface
 */

class GemmaIntegration {
    constructor() {
        this.isInitialized = false;
        this.isModelLoaded = false;
        this.llmInference = null;
        
        // Educational responses for when model isn't available
        this.educationalResponses = {
            'hello': 'Hello! I\'m EduMarkAI. I can help with homework, explanations, study tips, and academic guidance!',
            'help': 'I can assist with:\n📚 Subject explanations\n📝 Assignment help\n💡 Study strategies\n✍️ Writing support\n🔍 Research guidance',
            'homework': 'I\'d love to help with your homework! What subject are you working on? Please share your specific question.',
            'assignment': 'For assignments, I can help with planning, research, writing, and organization. What type of assignment is it?',
            'explain': 'I\'m great at explaining complex concepts simply! What topic would you like me to break down?',
            'study': 'Effective study techniques:\n1. Active recall (test yourself)\n2. Spaced repetition\n3. Break material into chunks\n4. Teach concepts to others',
            'math': 'Math help available! Share your specific problem or concept. I can explain step-by-step solutions.',
            'science': 'Science is fascinating! What topic would you like help with? Biology, chemistry, physics, or earth science?',
            'writing': 'Writing assistance ready! Share your draft or tell me what type of writing project you\'re working on.',
            'calculus': 'Calculus help: Derivatives measure rates of change. For f(x) = x², the derivative f\'(x) = 2x. What specific calculus topic?',
            'essay': 'Essay writing tips:\n1. Clear thesis statement\n2. Strong topic sentences\n3. Supporting evidence\n4. Smooth transitions\nWhat\'s your essay topic?',
            'default': 'I\'m here to help with your educational needs! What specific topic or subject would you like assistance with?'
        };
    }

    /**
     * Initialize Gemma AI integration
     */
    async init() {
        if (this.isInitialized) return;
        
        console.log('🧠 Initializing Gemma AI...');
        
        try {
            // Try to load local Gemma model
            await this.loadGemmaModel();
        } catch (error) {
            console.log('📝 Using educational fallback responses');
        }
        
        this.isInitialized = true;
        this.connectToAIChat();
    }

    /**
     * Attempt to load local Gemma model
     */
    async loadGemmaModel() {
        try {
            // Check if WebGPU is available
            if (!navigator.gpu) {
                throw new Error('WebGPU not supported');
            }

            // Import MediaPipe GenAI
            const { FilesetResolver, LlmInference } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai');
            
            console.log('📦 Loading MediaPipe...');
            const genaiFileset = await FilesetResolver.forGenAiTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
            );

            // Try to load Gemma model (will fail gracefully if not available)
            console.log('🔄 Attempting to load Gemma model...');
            this.llmInference = await LlmInference.createFromOptions(genaiFileset, {
                baseOptions: {
                    modelAssetPath: './models/gemma-2b-it-gpu-int8.bin'
                },
                maxTokens: 512,
                temperature: 0.7,
                topK: 40
            });

            this.isModelLoaded = true;
            console.log('✅ Gemma model loaded successfully!');
            
        } catch (error) {
            console.log('⚠️ Local Gemma model not available:', error.message);
            this.isModelLoaded = false;
        }
    }

    /**
     * Connect to existing AI chat interface
     */
    connectToAIChat() {
        // Override the existing AI chat's sendMessage function
        if (window.edumarkAI) {
            console.log('🔗 Connecting to existing AI chat...');
            
            // Store original function as backup
            window.edumarkAI.originalSendMessage = window.edumarkAI.sendMessage;
            
            // Replace with our Gemma integration
            window.edumarkAI.sendMessage = async () => {
                const input = document.getElementById('ai-chat-input');
                if (!input) return;

                const message = input.value.trim();
                if (!message) return;

                // Add user message to chat
                window.edumarkAI.addMessage(message, 'user');
                input.value = '';
                window.edumarkAI.showTypingIndicator();

                try {
                    // Generate response using our Gemma integration
                    const response = await this.generateResponse(message);
                    window.edumarkAI.addMessage(response, 'ai');
                    window.edumarkAI.updateStatus('EduMarkAI Ready', 'ready');
                    
                } catch (error) {
                    console.error('Response generation error:', error);
                    window.edumarkAI.addMessage('I apologize, but I encountered an issue. Please try rephrasing your question.', 'system');
                } finally {
                    window.edumarkAI.hideTypingIndicator();
                }
            };
            
            // Update status
            window.edumarkAI.updateStatus(
                this.isModelLoaded ? 'Local Gemma AI Active' : 'Educational AI Ready', 
                'ready'
            );
            
            console.log('✅ AI chat connected to Gemma integration');
        }
    }

    /**
     * Generate response using Gemma or fallback
     */
    async generateResponse(message) {
        if (this.isModelLoaded && this.llmInference) {
            return await this.generateGemmaResponse(message);
        } else {
            return this.generateEducationalResponse(message);
        }
    }

    /**
     * Generate response using local Gemma model
     */
    async generateGemmaResponse(message) {
        return new Promise((resolve, reject) => {
            try {
                const educationalPrompt = `You are EduMarkAI, a helpful educational assistant. Provide clear, encouraging, and educational responses.

Student/Teacher question: ${message}

EduMarkAI response:`;

                let fullResponse = '';
                
                this.llmInference.generateResponse(educationalPrompt, (partialResult, complete) => {
                    fullResponse += partialResult;
                    
                    if (complete) {
                        resolve(fullResponse || 'I\'m here to help! Could you please rephrase your question?');
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate educational fallback response
     */
    generateEducationalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific educational keywords
        for (const [keyword, response] of Object.entries(this.educationalResponses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }

        // Subject-specific responses
        if (lowerMessage.includes('chemistry') || lowerMessage.includes('periodic table')) {
            return 'Chemistry help available! I can explain chemical reactions, periodic trends, molecular structures, and more. What specific chemistry concept interests you?';
        }
        
        if (lowerMessage.includes('history') || lowerMessage.includes('historical')) {
            return 'History assistance ready! I can help analyze events, understand timelines, and examine causes and effects. What historical period are you studying?';
        }
        
        if (lowerMessage.includes('biology') || lowerMessage.includes('cell') || lowerMessage.includes('dna')) {
            return 'Biology support available! From cells to ecosystems, I can explain biological concepts clearly. What area of biology are you exploring?';
        }
        
        if (lowerMessage.includes('physics') || lowerMessage.includes('force') || lowerMessage.includes('energy')) {
            return 'Physics help ready! I can assist with mechanics, waves, electricity, thermodynamics, and more. What physics concept are you working with?';
        }

        // Question types
        if (lowerMessage.includes('how to') || lowerMessage.includes('how do')) {
            return 'Great question! I love helping explain processes and procedures. Could you be more specific about what you\'d like to learn how to do?';
        }
        
        if (lowerMessage.includes('what is') || lowerMessage.includes('define')) {
            return 'I\'m excellent at providing clear definitions and explanations! What term or concept would you like me to define for you?';
        }
        
        if (lowerMessage.includes('why') || lowerMessage.includes('because')) {
            return 'Understanding the "why" behind concepts is crucial for learning! What phenomenon or process would you like me to explain?';
        }

        // Default educational response
        return this.educationalResponses.default;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on dashboard pages
    if (document.querySelector('.dashboard-content')) {
        console.log('🚀 Starting Gemma AI integration...');
        
        // Wait a moment for other scripts to load
        setTimeout(async () => {
            window.gemmaIntegration = new GemmaIntegration();
            await window.gemmaIntegration.init();
        }, 1000);
    }
});

// Global function to check Gemma status
window.checkGemmaStatus = function() {
    if (window.gemmaIntegration) {
        console.log('Gemma Integration Status:');
        console.log('- Initialized:', window.gemmaIntegration.isInitialized);
        console.log('- Model Loaded:', window.gemmaIntegration.isModelLoaded);
        console.log('- Ready for chat:', !!window.edumarkAI);
        
        return {
            initialized: window.gemmaIntegration.isInitialized,
            modelLoaded: window.gemmaIntegration.isModelLoaded,
            ready: !!window.edumarkAI
        };
    }
    return { status: 'Not initialized' };
}; 