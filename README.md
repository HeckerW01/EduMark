# 🎓 ClassPDF - Full-Stack Educational Platform

> **Advanced PDF sharing and AI-powered educational platform with real TensorFlow.js neural networks, designed for Oracle Cloud deployment.**

## 🚀 Architecture Overview

ClassPDF has been completely refactored from a client-side application to a robust full-stack server application optimized for Oracle Cloud Infrastructure (OCI) deployment.

### Key Features

- **🧠 Real AI Processing**: Server-side TensorFlow.js with advanced neural networks
- **☁️ Oracle Cloud Ready**: Optimized for OCI deployment with Docker and Kubernetes
- **📊 Database Integration**: Support for MySQL, PostgreSQL, and Oracle Autonomous Database
- **🔒 Enterprise Security**: JWT authentication, session management, and security middleware
- **📈 Scalable Architecture**: Kubernetes deployment with auto-scaling capabilities
- **🎯 Professional Grade**: Production-ready with monitoring, logging, and health checks

## 🏗️ Technology Stack

### Backend
- **Node.js + Express**: RESTful API server
- **TensorFlow.js Node**: Server-side AI processing
- **Sequelize ORM**: Database abstraction layer
- **Natural Language Processing**: Advanced text analysis
- **Docker**: Containerized deployment
- **Kubernetes**: Orchestration and scaling

### Frontend
- **Vanilla JavaScript**: Client-side interface
- **Responsive Design**: Mobile-optimized UI
- **Real-time Communication**: WebSocket-like API calls
- **Progressive Enhancement**: Works without JavaScript

### Database Options
- **MySQL**: Oracle Cloud MySQL Database Service
- **PostgreSQL**: Self-hosted or managed PostgreSQL
- **Oracle Database**: Oracle Autonomous Database integration

### Infrastructure
- **Oracle Cloud Infrastructure (OCI)**
- **Container Registry (OCIR)**
- **Container Engine for Kubernetes (OKE)**
- **Load Balancer**: OCI Load Balancer
- **SSL/TLS**: Let's Encrypt or OCI Certificates

## 📦 Quick Start

### 1. Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd classpdf-server

# Install dependencies
npm install

# Setup environment
cp env.example .env
# Edit .env with your database configuration

# Start development server
npm run dev
```

### 2. Oracle Cloud Deployment

```bash
# Set Oracle Cloud environment variables
export OCI_COMPARTMENT_ID="ocid1.compartment.oc1..xxxxx"
export OCI_NAMESPACE="your-namespace"
export OCI_REGION="us-ashburn-1"

# Deploy to Oracle Cloud
chmod +x deploy-oracle-cloud.sh
./deploy-oracle-cloud.sh deploy
```

### 3. Docker Deployment

```bash
# Build Docker image
docker build -t classpdf:latest .

# Run with Docker Compose
docker-compose up -d
```

## 🧠 AI Architecture

### Server-Side Neural Networks

ClassPDF now features a sophisticated AI system powered by TensorFlow.js running on the server:

- **Advanced Tokenizer**: 10,000 vocabulary size with BPE-like encoding
- **Bidirectional LSTM**: Deep neural language understanding
- **Attention Mechanisms**: Context-aware response generation
- **Nucleus Sampling**: Creative and diverse text generation
- **Semantic Analysis**: TF-IDF and natural language processing
- **Context Memory**: Conversation history and learning

### AI Capabilities

- **Educational Expertise**: Trained on educational content and pedagogical best practices
- **Real-time Processing**: Server-side neural networks for instant responses
- **Context Awareness**: Maintains conversation history and user context
- **Multi-modal Understanding**: Text analysis, sentiment detection, and intent recognition
- **Continuous Learning**: Adapts responses based on user interactions

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-domain.com

# Database (Oracle Cloud MySQL)
DB_TYPE=mysql
DB_HOST=your-mysql-host.mysql.database.oracle.com
DB_PORT=3306
DB_NAME=classpdf
DB_USER=classpdf
DB_PASSWORD=your-secure-password

# Security
SESSION_SECRET=your-super-secure-session-secret
JWT_SECRET=your-jwt-secret

# AI Configuration
AI_TRAINING_ENABLED=true
AI_MAX_CONVERSATION_HISTORY=100

# Oracle Cloud Specific
OCI_REGION=us-ashburn-1
OCI_COMPARTMENT_ID=your-compartment-id
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### AI Service
- `GET /api/ai/status` - AI service health check
- `POST /api/ai/chat` - Send message to AI
- `POST /api/ai/conversation/start` - Start new conversation
- `GET /api/ai/conversations` - Get conversation history

### PDF Management
- `POST /api/pdf/upload` - Upload PDF files
- `GET /api/pdf/list` - List user PDFs
- `GET /api/pdf/:id` - Get PDF details
- `DELETE /api/pdf/:id` - Delete PDF

### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment

### System
- `GET /health` - Application health check
- `GET /api/status` - API status and version

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Server-side session handling
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API rate limiting and abuse prevention
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries with Sequelize
- **XSS Prevention**: Content Security Policy and output encoding

## 📈 Monitoring and Logging

### Health Checks
- Application health endpoint: `/health`
- Database connectivity monitoring
- AI service status tracking
- Kubernetes liveness and readiness probes

### Logging
- Structured JSON logging with Winston
- Request/response logging with Morgan
- Error tracking and stack traces
- Performance metrics collection

### Oracle Cloud Integration
- OCI Logging service integration
- Application Performance Monitoring
- Infrastructure monitoring with OCI Monitoring
- Alerting and notification setup

## 🚀 Deployment Guide

### Oracle Cloud Infrastructure

Detailed deployment instructions are available in [ORACLE_CLOUD_DEPLOYMENT.md](./ORACLE_CLOUD_DEPLOYMENT.md).

#### Prerequisites
- Oracle Cloud account with appropriate permissions
- OCI CLI installed and configured
- Docker and kubectl installed locally
- Valid domain name for SSL/TLS

#### Deployment Steps
1. **Setup OCI Infrastructure**: VCN, subnets, security lists
2. **Create Database**: MySQL, PostgreSQL, or Oracle Autonomous Database
3. **Container Registry**: Push Docker image to OCIR
4. **Kubernetes Deployment**: Deploy to OKE cluster
5. **Load Balancer**: Configure OCI Load Balancer
6. **SSL/TLS**: Setup certificates and HTTPS
7. **DNS Configuration**: Point domain to load balancer
8. **Monitoring Setup**: Configure logging and alerting

### Performance Optimization

- **Horizontal Pod Autoscaler**: Automatic scaling based on CPU/memory usage
- **Resource Limits**: Optimized container resource allocation
- **Database Connection Pooling**: Efficient database connections
- **Caching Strategies**: In-memory caching for frequently accessed data
- **CDN Integration**: Static asset delivery optimization

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Load testing
npm run test:load

# Security scanning
npm audit
```

## 📚 Documentation

- [Oracle Cloud Deployment Guide](./ORACLE_CLOUD_DEPLOYMENT.md)
- [API Documentation](./docs/api.md)
- [AI Service Documentation](./docs/ai-service.md)
- [Database Schema](./docs/database.md)
- [Security Guidelines](./docs/security.md)

## 🔄 Migration from Client-Side Version

If you're migrating from the previous client-side version:

1. **Database Setup**: Install and configure a supported database
2. **Environment Configuration**: Update environment variables
3. **AI Migration**: The AI system now runs server-side with real neural networks
4. **File Storage**: PDF files are now stored server-side
5. **Authentication**: Implement proper user authentication
6. **API Integration**: Update frontend to use REST API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Database Connection**: Ensure database credentials are correct and server is accessible
2. **AI Service Startup**: TensorFlow.js requires sufficient memory and CPU resources
3. **File Uploads**: Check upload directory permissions and disk space
4. **Oracle Cloud**: Verify OCI credentials and permissions

### Getting Help

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the docs/ directory
- **Oracle Cloud**: Refer to OCI documentation
- **Community**: Join our discussions

## 🎉 Acknowledgments

- **TensorFlow.js Team**: For the amazing machine learning framework
- **Oracle Cloud**: For the robust cloud infrastructure
- **Open Source Community**: For the various libraries and tools used
- **Educational Technology**: For inspiring the mission of this platform

---

**Built with ❤️ for educators and students worldwide**

*Transform your educational experience with AI-powered PDF management and intelligent assistance.*

# EduMarkAI

EduMarkAI is the educational AI assistant for ClassPDF. It is designed to:
- Encourage learning and critical thinking, not just provide direct answers.
- Never give direct answers to homework or factual questions, but instead offer hints, guidance, or encouragement.
- Respond as "EduMarkAI" if asked about its name, identity, or what it is powered by.
- Provide a safe, supportive, and growth-oriented environment for students and teachers.

// Add or update documentation for all functions to describe their general idea. 