/**
 * EduMark AI Chat Integration
 * Adds AI chat functionality to both teacher and student dashboards
 */

class EduMarkAI {
    constructor() {
        // Default to local fallback if no API endpoint is set
        this.apiEndpoint = 'https://your-api-id.execute-api.region.amazonaws.com/prod';
        this.conversationHistory = [];
        this.model = 'gemma-3-27b';
        this.isInitialized = false;
    }

    /**
     * Initialize the AI chat interface
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🧠 Initializing EduMark AI...');
        
        // Add AI chat tab to sidebar
        this.addAITabToSidebar();
        
        // Create AI chat section
        this.createAIChatSection();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ EduMark AI initialized successfully');
    }

    /**
     * Add AI chat tab to the sidebar navigation
     */
    addAITabToSidebar() {
        const sidebarNav = document.querySelector('.sidebar nav ul');
        if (!sidebarNav) return;

        // Check if AI tab already exists
        if (document.querySelector('a[data-tab="ai-chat"]')) return;

        const aiTabLi = document.createElement('li');
        aiTabLi.innerHTML = '<a href="#" data-tab="ai-chat">🧠 EduMarkAI</a>';
        sidebarNav.appendChild(aiTabLi);
    }

    /**
     * Create the AI chat section in the dashboard
     */
    createAIChatSection() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        // Check if AI chat section already exists
        if (document.getElementById('ai-chat')) return;

        const aiChatSection = document.createElement('section');
        aiChatSection.id = 'ai-chat';
        aiChatSection.className = 'tab-content';
        
        aiChatSection.innerHTML = `
            <h2>🧠 EduMarkAI - Your Educational Assistant</h2>
            <div class="ai-chat-container">
                <div class="ai-sidebar">
                    <div class="ai-info">
                        <div class="ai-avatar">🧠</div>
                        <h3>EduMarkAI</h3>
                        <p>Powered by Gemma 3 27B</p>
                        <div id="ai-status" class="status-indicator">
                            <span class="status-dot ready"></span>
                            <span class="status-text">Ready to help!</span>
                        </div>
                    </div>
                    
                    <div class="ai-features">
                        <h4>I can help with:</h4>
                        <ul>
                            <li>📚 Assignment explanations</li>
                            <li>📄 PDF document analysis</li>
                            <li>💡 Teaching strategies</li>
                            <li>✍️ Writing assistance</li>
                            <li>🔍 Research guidance</li>
                        </ul>
                    </div>
                </div>
                
                <div class="chat-main">
                    <div id="ai-chat-messages" class="chat-messages">
                        <div class="message ai-message">
                            <div class="message-avatar">🧠</div>
                            <div class="message-content">
                                <div class="message-text">
                                    Hello! I'm EduMarkAI, your educational assistant powered by advanced AI. 
                                    I'm here to help with assignments, teaching strategies, PDF analysis, and more. 
                                    What would you like to work on today?
                                </div>
                                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-area">
                        <div class="quick-actions">
                            <button class="quick-btn" data-message="Explain a complex concept to me">📚 Explain Concepts</button>
                            <button class="quick-btn" data-message="Help me create an engaging assignment">📝 Create Assignment</button>
                            <button class="quick-btn" data-message="Analyze this PDF content">📄 PDF Analysis</button>
                            <button class="quick-btn" data-message="Give me study tips">💡 Study Tips</button>
                        </div>
                        <div class="input-container">
                            <textarea id="ai-chat-input" placeholder="Ask me anything about education, assignments, or learning..." rows="3"></textarea>
                            <button id="ai-send-btn" class="send-button">
                                <span class="send-icon">➤</span>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        dashboardContent.appendChild(aiChatSection);

        // Add AI chat styles
        this.addAIChatStyles();
    }

    /**
     * Add CSS styles for the AI chat interface
     */
    addAIChatStyles() {
        if (document.getElementById('edumark-ai-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'edumark-ai-styles';
        styles.textContent = `
            .ai-chat-container {
                display: flex;
                height: 600px;
                border: 1px solid #ddd;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                margin-top: 20px;
            }

            .ai-sidebar {
                width: 280px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                flex-direction: column;
            }

            .ai-info {
                text-align: center;
                margin-bottom: 25px;
            }

            .ai-avatar {
                font-size: 48px;
                margin-bottom: 10px;
            }

            .ai-info h3 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }

            .ai-info p {
                margin: 0;
                opacity: 0.9;
                font-size: 13px;
            }

            .status-indicator {
                margin-top: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 12px;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4caf50;
            }

            .status-dot.ready {
                background: #4caf50;
                animation: pulse 2s infinite;
            }

            .ai-features {
                background: rgba(255,255,255,0.1);
                padding: 15px;
                border-radius: 8px;
                flex: 1;
            }

            .ai-features h4 {
                margin-top: 0;
                font-size: 14px;
            }

            .ai-features ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .ai-features li {
                margin-bottom: 8px;
                font-size: 12px;
                opacity: 0.9;
            }

            .chat-main {
                flex: 1;
                display: flex;
                flex-direction: column;
            }

            .chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }

            .message {
                display: flex;
                margin-bottom: 15px;
                animation: fadeInUp 0.3s ease-out;
            }

            .message.user-message {
                justify-content: flex-end;
            }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                margin-right: 10px;
                flex-shrink: 0;
                background: #e3f2fd;
            }

            .user-message .message-avatar {
                margin-right: 0;
                margin-left: 10px;
                background: #e8f5e8;
            }

            .message-content {
                max-width: 70%;
            }

            .message-text {
                background: white;
                padding: 12px 16px;
                border-radius: 18px;
                line-height: 1.4;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }

            .user-message .message-text {
                background: #2196f3;
                color: white;
            }

            .message-time {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
                text-align: left;
            }

            .user-message .message-time {
                text-align: right;
            }

            .chat-input-area {
                padding: 20px;
                border-top: 1px solid #eee;
                background: white;
            }

            .quick-actions {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .quick-btn {
                padding: 6px 12px;
                background: #f0f0f0;
                border: none;
                border-radius: 16px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quick-btn:hover {
                background: #e0e0e0;
                transform: translateY(-1px);
            }

            .input-container {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }

            #ai-chat-input {
                flex: 1;
                border: 2px solid #e0e0e0;
                border-radius: 20px;
                padding: 12px 16px;
                resize: none;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.4;
                outline: none;
                transition: border-color 0.2s;
            }

            #ai-chat-input:focus {
                border-color: #2196f3;
            }

            .send-button {
                background: #2196f3;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 12px 20px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .send-button:hover {
                background: #1976d2;
                transform: translateY(-1px);
            }

            .send-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }

            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                color: #666;
                font-style: italic;
                font-size: 12px;
                margin-bottom: 10px;
            }

            .typing-dots {
                display: flex;
                gap: 2px;
            }

            .typing-dot {
                width: 4px;
                height: 4px;
                background: #666;
                border-radius: 50%;
                animation: typingDot 1.4s infinite ease-in-out;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            @keyframes typingDot {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .error-message {
                background: #ffebee;
                color: #c62828;
                padding: 10px;
                border-radius: 8px;
                margin: 10px 0;
                font-size: 12px;
                text-align: center;
            }

            @media (max-width: 768px) {
                .ai-chat-container {
                    flex-direction: column;
                    height: auto;
                }

                .ai-sidebar {
                    width: 100%;
                    padding: 15px;
                }

                .ai-features {
                    display: none;
                }

                .quick-actions {
                    flex-direction: column;
                }

                .input-container {
                    flex-direction: column;
                }

                .send-button {
                    align-self: flex-end;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners for the AI chat
     */
    setupEventListeners() {
        // Tab switching for AI chat
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-tab="ai-chat"]')) {
                e.preventDefault();
                this.showAITab();
            }
        });

        // Send button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#ai-send-btn') || e.target.closest('#ai-send-btn')) {
                this.sendMessage();
            }
        });

        // Enter key in input
        document.addEventListener('keypress', (e) => {
            if (e.target.matches('#ai-chat-input') && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quick-btn')) {
                const message = e.target.getAttribute('data-message');
                const input = document.getElementById('ai-chat-input');
                if (input && message) {
                    input.value = message;
                    this.sendMessage();
                }
            }
        });
    }

    /**
     * Show the AI chat tab
     */
    showAITab() {
        // Update sidebar active state
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        document.querySelector('a[data-tab="ai-chat"]').classList.add('active');
        
        // Show AI chat content
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById('ai-chat').classList.add('active');
    }

    /**
     * Send a message to the AI and get a response
     * @param {string} message - The user's message
     * @returns {Promise<string>} The AI's response
     */
    async sendMessage(message) {
        try {
            // Add loading message
            const messagesDiv = document.getElementById('ai-chat-messages');
            messagesDiv.innerHTML += `
                <div class="ai-message loading">
                    Thinking...
                </div>
            `;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Try to get response from API
            let response;
            try {
                response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        history: this.conversationHistory,
                        model: this.model,
                        parameters: {
                            max_new_tokens: 400,
                            temperature: 0.7,
                            top_p: 0.95,
                            do_sample: true
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('API request failed');
                }

                const data = await response.json();
                response = data.response || this.getFallbackResponse(message);
            } catch (error) {
                console.log('Falling back to local response:', error);
                response = this.getFallbackResponse(message);
            }

            // Remove loading message
            const loadingMessage = messagesDiv.querySelector('.ai-message.loading');
            if (loadingMessage) {
                loadingMessage.remove();
            }

            // Update conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

            // Keep history manageable
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            return response;
        } catch (error) {
            console.error('Error:', error);
            return this.getFallbackResponse(message);
        }
    }

    /**
     * Get a fallback response when API is unavailable
     * @param {string} message - The user's message
     * @returns {string} A fallback response
     */
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Greeting responses
        if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
            return "Hello! I'm your EduMark AI assistant. I can help you with homework, study strategies, and learning concepts. What would you like help with today?";
        }

        // Help requests
        if (lowerMessage.includes('help')) {
            return "I'd be happy to help! I can assist with:\n\n" +
                   "📚 Homework and assignments\n" +
                   "💡 Study strategies and techniques\n" +
                   "📝 Writing and essays\n" +
                   "🔢 Math problems\n" +
                   "🔬 Science concepts\n\n" +
                   "What specific topic would you like help with?";
        }

        // Math-related
        if (lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('calculus')) {
            return "I can help you with math! Let's break this down step by step. Could you share the specific problem or concept you're working on?";
        }

        // Science-related
        if (lowerMessage.includes('science') || lowerMessage.includes('biology') || lowerMessage.includes('chemistry')) {
            return "Science is fascinating! I can help explain concepts, lab procedures, or help with science homework. What specific topic are you studying?";
        }

        // Writing-related
        if (lowerMessage.includes('write') || lowerMessage.includes('essay') || lowerMessage.includes('paper')) {
            return "I can help you with writing! Whether it's an essay, research paper, or creative writing, I can assist with:\n\n" +
                   "• Planning and outlining\n" +
                   "• Thesis statements\n" +
                   "• Supporting arguments\n" +
                   "• Grammar and style\n\n" +
                   "What kind of writing are you working on?";
        }

        // Default response
        return "I'm here to help you learn! Could you tell me more about what you're studying or what kind of help you need? I can assist with homework, explain concepts, or help develop study strategies.";
    }

    /**
     * Update the API endpoint
     * @param {string} newEndpoint - The new API endpoint URL
     */
    updateApiEndpoint(newEndpoint) {
        this.apiEndpoint = newEndpoint;
    }

    /**
     * Clear the conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get the current model being used
     * @returns {string} The model name
     */
    getModel() {
        return this.model;
    }
}

// Initialize EduMark AI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a dashboard page
    if (document.querySelector('.dashboard-content')) {
        window.edumarkAI = new EduMarkAI();
        
        // Check for saved API endpoint
        const savedEndpoint = localStorage.getItem('edumarkAIEndpoint');
        if (savedEndpoint) {
            window.edumarkAI.apiEndpoint = savedEndpoint;
        }
        
        // Initialize AI chat
        setTimeout(() => {
            window.edumarkAI.init();
        }, 500); // Small delay to ensure dashboard is ready
        
        console.log('🚀 EduMark AI integration loaded');
    }
});

// Global function to update API endpoint
window.updateEduMarkAIEndpoint = function(endpoint) {
    if (window.edumarkAI) {
        window.edumarkAI.updateApiEndpoint(endpoint);
    }
}; 