/**
 * ClassPDF Client-Side AI Chat Interface
 * Communicates with server-side TensorFlow.js AI service
 */

class AIChat {
    constructor() {
        // Replace this with your actual Lambda API Gateway URL when deployed
        this.apiBase = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/chat';
        this.conversationHistory = [];
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * Initialize AI chat interface
     */
    async initialize() {
        console.log('Initializing AI Chat Client...');
        
        try {
            // Check AI service status
            await this.checkServiceStatus();
            
            // Setup UI if not already present
            if (!document.getElementById('ai-chat')) {
                this.createChatInterface();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start conversation
            await this.startConversation();
            
            console.log('AI Chat Client initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize AI Chat:', error);
            this.showError('Failed to connect to AI service. Please refresh the page.');
        }
    }

    /**
     * Check AI service status (AWS Lambda endpoint)
     */
    async checkServiceStatus() {
        try {
            // For Lambda, we'll just update status as ready since we can't check a /status endpoint
            this.isConnected = true;
            this.updateConnectionStatus('Ready to connect to EduMarkAI', 'success');
            
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus('AI service configuration needed', 'error');
            console.warn('AI service status check:', error);
        }
    }

    /**
     * Create chat interface UI
     */
    createChatInterface() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        // Add AI chat tab to sidebar
        const sidebarNav = document.querySelector('.sidebar nav ul');
        if (sidebarNav && !document.querySelector('a[data-tab="ai-chat"]')) {
            const chatLi = document.createElement('li');
            chatLi.innerHTML = '<a href="#" data-tab="ai-chat">🧠 EduMarkAI</a>';
            sidebarNav.appendChild(chatLi);
        }

        // Create AI chat section
        const aiChatSection = document.createElement('section');
        aiChatSection.id = 'ai-chat';
        aiChatSection.className = 'tab-content';
        aiChatSection.innerHTML = `
            <h2>🧠 EduMarkAI - Advanced Neural Language Model</h2>
            <div class="ai-chat-container">
                <div class="ai-sidebar">
                    <div class="ai-info">
                        <div class="ai-avatar">🧠</div>
                        <h3>EduMarkAI</h3>
                        <p>Server-Side Neural Language Model</p>
                        <div id="ai-status" class="status-indicator">
                            <span class="status-dot"></span>
                            <span class="status-text">Connecting...</span>
                        </div>
                    </div>
                    
                    <div class="ai-features">
                        <h4>AI Capabilities:</h4>
                        <ul>
                            <li>🧠 Advanced Neural Networks</li>
                            <li>⚡ Real-time Processing</li>
                            <li>📚 Educational Context</li>
                            <li>🎯 Intelligent Responses</li>
                            <li>🔄 Learning from Context</li>
                        </ul>
                    </div>
                </div>
                
                <div class="chat-main">
                    <div id="ai-chat-messages" class="chat-messages">
                        <div class="welcome-message">
                            <div class="message ai-message">
                                <div class="message-avatar">🧠</div>
                                <div class="message-content">
                                    <div class="message-text">
                                        Hello! I'm EduMarkAI, powered by server-side TensorFlow.js neural networks. 
                                        I'm ready to help you with educational questions, PDF management, and teaching strategies. 
                                        What would you like to know?
                                    </div>
                                    <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-area">
                        <div class="quick-actions">
                            <button class="quick-btn" data-message="How do your neural networks work?">🧠 AI Architecture</button>
                            <button class="quick-btn" data-message="Help me with PDF uploads and management">📄 PDF Help</button>
                            <button class="quick-btn" data-message="What are effective teaching strategies?">💡 Teaching Tips</button>
                            <button class="quick-btn" data-message="How to create engaging assignments?">📝 Assignments</button>
                        </div>
                        <div class="input-container">
                            <textarea id="ai-chat-input" placeholder="Ask me anything about education, AI, or ClassPDF..." rows="3"></textarea>
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

        // Add CSS styles
        this.addChatStyles();
    }

    /**
     * Add CSS styles for chat interface
     */
    addChatStyles() {
        if (document.getElementById('ai-chat-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-chat-styles';
        styles.textContent = `
            .ai-chat-container {
                display: flex;
                height: 600px;
                border: 1px solid #ddd;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .ai-sidebar {
                width: 300px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                flex-direction: column;
            }

            .ai-info {
                text-align: center;
                margin-bottom: 30px;
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
                font-size: 14px;
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
                background: #ffa726;
                animation: pulse 2s infinite;
            }

            .status-dot.success {
                background: #4caf50;
            }

            .status-dot.error {
                background: #f44336;
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
            }

            .user-message .message-avatar {
                margin-right: 0;
                margin-left: 10px;
                background: #e3f2fd;
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
                text-align: center;
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
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab navigation
        const aiChatTab = document.querySelector('a[data-tab="ai-chat"]');
        if (aiChatTab) {
            aiChatTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab();
            });
        }

        // Send button
        const sendBtn = document.getElementById('ai-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Chat input
        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                const chatInput = document.getElementById('ai-chat-input');
                if (chatInput && message) {
                    chatInput.value = message;
                    this.sendMessage();
                }
            });
        });
    }

    /**
     * Show AI chat tab
     */
    showTab() {
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        document.querySelector('a[data-tab="ai-chat"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById('ai-chat').classList.add('active');
    }

    /**
     * Initialize conversation (no separate start needed for Lambda)
     */
    async startConversation() {
        // Lambda handles each message independently, no conversation start needed
        console.log('EduMarkAI conversation ready');
    }

    /**
     * Send message to the AWS Lambda Gemma 3 27B AI service
     */
    async sendMessage() {
        const input = document.getElementById('ai-chat-input').value.trim();
        if (!input) return;

        // Add user message to chat
        this.addMessage(input, 'user');
        document.getElementById('ai-chat-input').value = '';
        this.showTypingIndicator();

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: input
        });

        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Origin': 'https://edumark.surge.sh'
                },
                body: JSON.stringify({ 
                    message: input,
                    history: this.conversationHistory.slice(-10) // Keep last 10 exchanges
                })
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                this.addMessage(data.response, 'ai');
                
                // Add AI response to history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: data.response
                });
                
                // Update connection status
                this.updateConnectionStatus('Connected to EduMarkAI', 'success');
                this.isConnected = true;
            } else {
                throw new Error('No response from AI');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.updateConnectionStatus('Connection issue', 'error');
            this.isConnected = false;
            
            // Show user-friendly error message
            if (error.message.includes('status 404')) {
                this.addMessage('🔧 The AI service is currently being set up. Please check back soon!', 'system');
            } else if (error.message.includes('fetch')) {
                this.addMessage('📡 Connection error. Please check your internet connection and try again.', 'system');
            } else {
                this.addMessage('⚠️ EduMarkAI is temporarily unavailable. Please try again in a moment.', 'system');
            }
        } finally {
            this.hideTypingIndicator();
        }
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let avatarIcon;
        switch (sender) {
            case 'ai':
                avatarIcon = '🧠';
                break;
            case 'user':
                avatarIcon = '👤';
                break;
            case 'system':
                avatarIcon = '⚠️';
                break;
            default:
                avatarIcon = '💬';
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Format message text
     */
    formatMessage(text) {
        // Basic text formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            🧠 EduMarkAI is thinking
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(message, status) {
        const statusIndicator = document.getElementById('ai-status');
        if (!statusIndicator) return;

        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');

        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }

        if (statusText) {
            statusText.textContent = message;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (!messagesContainer) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize AI Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aiChat = new AIChat();
    aiChat.initialize().catch(error => {
        console.error('Failed to initialize AI Chat:', error);
    });

    // Make AI chat globally available
    window.aiChat = aiChat;
});

// Auto-retry connection on page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.aiChat && !window.aiChat.isConnected) {
        window.aiChat.checkServiceStatus().catch(console.error);
    }
}); 