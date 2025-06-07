/**
 * EduMark Local Gemma AI Implementation
 * Runs Gemma 2B model directly in the browser using MediaPipe WebGPU
 */

class LocalGemmaAI {
    constructor() {
        this.llmInference = null;
        this.isLoading = false;
        this.isReady = false;
        this.currentOutput = '';
        
        // Educational prompts and responses
        this.educationalContext = `You are EduMarkAI, an educational AI assistant specialized in helping students and teachers. 
Focus on educational content, learning support, assignment help, and academic guidance. 
Be encouraging, clear, and pedagogical in your responses.`;
        
        this.fallbackResponses = {
            'hello': 'Hello! I\'m EduMarkAI, your educational assistant. I can help with homework, explanations, study tips, and more!',
            'help': 'I can assist with: 📚 Subject explanations, 📝 Assignment guidance, 💡 Study strategies, ✍️ Writing help, 🔍 Research support',
            'homework': 'I\'d love to help with your homework! What subject are you working on? Please share the specific question or topic.',
            'assignment': 'For assignments, I can help with planning, research, writing, and organization. What type of assignment is it?',
            'explain': 'I\'m great at explaining complex concepts simply! What topic would you like me to break down for you?',
            'study': 'Here are proven study techniques: 1) Active recall (test yourself), 2) Spaced repetition, 3) Break into chunks, 4) Teach others',
            'math': 'I can help with math problems! Please share the specific problem or concept you\'re working on.',
            'science': 'Science is fascinating! What science topic or experiment would you like help with?',
            'writing': 'I can help improve your writing! Share your draft or tell me what type of writing you\'re working on.',
            'default': 'I\'m here to help with your educational needs! Could you be more specific about what you\'d like assistance with?'
        };
    }

    /**
     * Initialize the Gemma AI model
     */
    async init() {
        if (this.isLoading || this.isReady) return;
        
        console.log('🧠 Initializing local Gemma AI...');
        this.isLoading = true;
        
        try {
            // Check WebGPU support
            if (!navigator.gpu) {
                throw new Error('WebGPU not supported in this browser');
            }
            
            // Load MediaPipe GenAI
            const {FilesetResolver, LlmInference} = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai');
            
            console.log('📦 Loading MediaPipe GenAI...');
            const genaiFileset = await FilesetResolver.forGenAiTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
            );
            
            console.log('🔄 Loading Gemma 2B model (this may take a few minutes)...');
            
            // Try to load the model - you'll need to provide the model file
            this.llmInference = await LlmInference.createFromOptions(genaiFileset, {
                baseOptions: {
                    modelAssetPath: './models/gemma-2b-it-gpu-int8.bin' // You'll need to download this
                },
                maxTokens: 512,
                temperature: 0.7,
                topK: 40
            });
            
            this.isReady = true;
            this.isLoading = false;
            
            console.log('✅ Gemma AI initialized successfully!');
            this.updateStatus('Local Gemma AI Ready', 'ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Gemma AI:', error);
            this.isLoading = false;
            this.isReady = false;
            
            // Use fallback mode
            this.updateStatus('Using fallback responses', 'fallback');
        }
    }

    /**
     * Send message to local Gemma AI
     */
    async sendMessage(message, onPartialResponse, onComplete) {
        if (!message.trim()) return;
        
        try {
            if (this.isReady && this.llmInference) {
                // Use local Gemma model
                this.currentOutput = '';
                
                // Add educational context to the prompt
                const contextualPrompt = `${this.educationalContext}\n\nStudent/Teacher: ${message}\n\nEduMarkAI:`;
                
                await this.llmInference.generateResponse(
                    contextualPrompt,
                    (partialResult, complete) => {
                        this.currentOutput += partialResult;
                        
                        if (onPartialResponse) {
                            onPartialResponse(this.currentOutput);
                        }
                        
                        if (complete && onComplete) {
                            onComplete(this.currentOutput || 'I\'m processing your request. Please try again.');
                        }
                    }
                );
                
            } else {
                // Use fallback responses
                const response = this.generateFallbackResponse(message);
                
                if (onPartialResponse) {
                    // Simulate typing effect
                    this.simulateTyping(response, onPartialResponse, onComplete);
                } else if (onComplete) {
                    onComplete(response);
                }
            }
            
        } catch (error) {
            console.error('Error generating response:', error);
            const fallbackResponse = 'I encountered an issue. Let me try a different approach to help you.';
            
            if (onComplete) {
                onComplete(fallbackResponse);
            }
        }
    }

    /**
     * Generate educational fallback responses
     */
    generateFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for educational keywords
        for (const [keyword, response] of Object.entries(this.fallbackResponses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        // Subject-specific responses
        if (lowerMessage.includes('calculus') || lowerMessage.includes('derivative')) {
            return 'Calculus help: A derivative measures the rate of change. For example, if f(x) = x², then f\'(x) = 2x. Would you like me to explain a specific derivative rule?';
        }
        
        if (lowerMessage.includes('essay') || lowerMessage.includes('paragraph')) {
            return 'Essay writing tips: 1) Start with a clear thesis, 2) Use topic sentences, 3) Provide evidence, 4) Connect ideas with transitions. What type of essay are you writing?';
        }
        
        if (lowerMessage.includes('chemistry') || lowerMessage.includes('element')) {
            return 'Chemistry help: I can explain chemical reactions, periodic table trends, molecular structures, and more. What specific chemistry topic interests you?';
        }
        
        if (lowerMessage.includes('history') || lowerMessage.includes('historical')) {
            return 'History assistance: I can help analyze historical events, understand timelines, examine cause and effect, and develop arguments. What historical period or event are you studying?';
        }
        
        if (lowerMessage.includes('biology') || lowerMessage.includes('cell')) {
            return 'Biology help: From cell structure to ecosystems, I can explain biological concepts clearly. Are you studying molecular biology, genetics, ecology, or another area?';
        }
        
        if (lowerMessage.includes('physics') || lowerMessage.includes('force')) {
            return 'Physics support: I can help with mechanics, thermodynamics, waves, electricity, and more. What physics concept or problem are you working with?';
        }
        
        // Default educational response
        return this.fallbackResponses.default;
    }

    /**
     * Simulate typing effect for fallback responses
     */
    simulateTyping(text, onPartialResponse, onComplete) {
        let currentText = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                currentText += text[index];
                index++;
                onPartialResponse(currentText);
            } else {
                clearInterval(typeInterval);
                if (onComplete) {
                    onComplete(currentText);
                }
            }
        }, 30); // Typing speed
    }

    /**
     * Update status indicator
     */
    updateStatus(message, status) {
        // Try to update status in the UI if available
        const statusElement = document.getElementById('ai-status');
        if (statusElement) {
            const statusDot = statusElement.querySelector('.status-dot');
            const statusText = statusElement.querySelector('.status-text');
            
            if (statusDot) {
                statusDot.className = `status-dot ${status}`;
            }
            
            if (statusText) {
                statusText.textContent = message;
            }
        }
        
        console.log(`🔄 Status: ${message}`);
    }

    /**
     * Download model instructions
     */
    getModelDownloadInstructions() {
        return `
To use local Gemma AI, you need to download the model:

1. **Visit Kaggle**: https://kaggle.com/models/google/gemma/frameworks/TensorFlowLite
2. **Download**: gemma-2b-it-gpu-int8.bin (about 2.5GB)
3. **Create folder**: Create a 'models' folder in your project
4. **Place file**: Put the .bin file in ./models/
5. **Refresh page**: The AI will automatically detect and load the model

Alternative: The AI will work with fallback responses until you add the model.
        `.trim();
    }

    /**
     * Check if model file exists
     */
    async checkModelAvailability() {
        try {
            const response = await fetch('./models/gemma-2b-it-gpu-int8.bin', { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export for use in other modules
window.LocalGemmaAI = LocalGemmaAI;

// Auto-initialize if running on a compatible page
document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector('.dashboard-content')) {
        console.log('🚀 Local Gemma AI integration detected');
        
        // Initialize local Gemma AI
        window.localGemmaAI = new LocalGemmaAI();
        
        // Check model availability
        const modelAvailable = await window.localGemmaAI.checkModelAvailability();
        
        if (!modelAvailable) {
            console.log('📥 Model not found - will use fallback responses');
            console.log(window.localGemmaAI.getModelDownloadInstructions());
        }
        
        // Try to initialize (will fallback gracefully if model not available)
        await window.localGemmaAI.init();
    }
}); 