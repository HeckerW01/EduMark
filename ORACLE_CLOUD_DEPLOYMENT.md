# 🚀 ClassPDF Oracle Cloud Deployment Guide

Complete guide for deploying ClassPDF to Oracle Cloud Infrastructure (OCI) with real TensorFlow.js AI processing.

## 📋 Prerequisites

### 1. Oracle Cloud Account
- Active Oracle Cloud Infrastructure account
- Appropriate permissions for:
  - Container Registry (OCIR)
  - Container Engine for Kubernetes (OKE)
  - Database services (MySQL/PostgreSQL)
  - Virtual Cloud Networks (VCN)
  - Compute instances

### 2. Local Development Tools
```bash
# Install required tools
npm install -g @oracle/oci-cli
npm install -g kubectl
# Docker Desktop or Docker Engine
```

### 3. Environment Setup
```bash
# Clone and setup the project
git clone <your-repo>
cd classpdf-server
npm install

# Copy environment template
cp env.example .env
```

## 🔧 Oracle Cloud Infrastructure Setup

### 1. Create Compartment
```bash
# Create a dedicated compartment for ClassPDF
oci iam compartment create \
  --compartment-id <root-compartment-id> \
  --name "ClassPDF" \
  --description "ClassPDF Educational Platform"
```

### 2. Setup Container Registry
```bash
# Login to Oracle Container Registry
docker login <region>.ocir.io -u '<namespace>/<username>'

# Example for US Ashburn region:
docker login us-ashburn-1.ocir.io -u 'idxxxxxx/oracleidentitycloudservice/john.doe@company.com'
```

### 3. Create Database Service

#### Option A: MySQL Database Service
```bash
# Create MySQL DB System
oci mysql db-system create \
  --compartment-id <compartment-id> \
  --display-name "classpdf-mysql" \
  --subnet-id <subnet-id> \
  --admin-password <secure-password> \
  --admin-username classpdf \
  --shape-name MySQL.VM.Standard.E3.1.8GB \
  --data-storage-size-in-gbs 50
```

#### Option B: PostgreSQL (Compute + PostgreSQL)
```bash
# Create compute instance with PostgreSQL
oci compute instance launch \
  --compartment-id <compartment-id> \
  --display-name "classpdf-postgres" \
  --image-id <ubuntu-image-id> \
  --shape VM.Standard.E3.Flex \
  --subnet-id <subnet-id>
```

#### Option C: Oracle Autonomous Database
```bash
# Create Autonomous Database
oci db autonomous-database create \
  --compartment-id <compartment-id> \
  --display-name "ClassPDF-ADB" \
  --db-name CLASSPDF \
  --admin-password <secure-password> \
  --cpu-core-count 1 \
  --data-storage-size-in-tbs 1
```

## 🐳 Docker Deployment

### 1. Build and Push Image
```bash
# Make deployment script executable
chmod +x deploy-oracle-cloud.sh

# Set environment variables
export OCI_COMPARTMENT_ID="ocid1.compartment.oc1..xxxxx"
export OCI_NAMESPACE="your-namespace"
export OCI_REGION="us-ashburn-1"
export OCI_USERNAME="your-username"
export OCI_AUTH_TOKEN="your-auth-token"

# Build and push image
./deploy-oracle-cloud.sh build
./deploy-oracle-cloud.sh push
```

### 2. Manual Docker Build (Alternative)
```bash
# Build the image
docker build -t classpdf:latest .

# Tag for Oracle Container Registry
docker tag classpdf:latest us-ashburn-1.ocir.io/namespace/classpdf:latest

# Push to OCIR
docker push us-ashburn-1.ocir.io/namespace/classpdf:latest
```

## ☸️ Kubernetes Deployment (OKE)

### 1. Create OKE Cluster
```bash
# Create OKE cluster
oci ce cluster create \
  --compartment-id <compartment-id> \
  --name "classpdf-cluster" \
  --vcn-id <vcn-id> \
  --kubernetes-version "v1.27.2" \
  --service-lb-subnet-ids '["<service-subnet-id>"]'
```

### 2. Setup kubectl Access
```bash
# Generate kubeconfig
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-id> \
  --file ~/.kube/config \
  --region us-ashburn-1

# Verify connection
kubectl get nodes
```

### 3. Deploy Application
```bash
# Create secrets for database connection
kubectl create secret generic classpdf-secrets \
  --from-literal=db-host="your-db-host" \
  --from-literal=db-password="your-db-password" \
  --from-literal=session-secret="your-session-secret"

# Deploy using the script
./deploy-oracle-cloud.sh deploy
```

### 4. Manual Kubernetes Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: classpdf
  namespace: classpdf
spec:
  replicas: 3
  selector:
    matchLabels:
      app: classpdf
  template:
    metadata:
      labels:
        app: classpdf
    spec:
      containers:
      - name: classpdf
        image: us-ashburn-1.ocir.io/namespace/classpdf:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_TYPE
          value: "mysql"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: classpdf-secrets
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: classpdf-secrets
              key: db-password
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
```

```bash
# Apply deployment
kubectl apply -f deployment.yaml
```

## 🌐 Load Balancer Setup

### 1. Create Load Balancer Service
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: classpdf-service
  namespace: classpdf
  annotations:
    service.beta.kubernetes.io/oci-load-balancer-shape: "flexible"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-min: "10"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-max: "100"
spec:
  type: LoadBalancer
  selector:
    app: classpdf
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  - port: 443
    targetPort: 3000
    protocol: TCP
```

```bash
kubectl apply -f service.yaml
```

### 2. Get Load Balancer IP
```bash
# Get external IP
kubectl get services -n classpdf
# Note the EXTERNAL-IP for DNS configuration
```

## 🔒 SSL/TLS Configuration

### 1. Using OCI Certificates Service
```bash
# Create certificate
oci certs-mgmt certificate create \
  --compartment-id <compartment-id> \
  --name "classpdf-cert" \
  --certificate-config file://cert-config.json
```

### 2. Using Let's Encrypt with cert-manager
```bash
# Install cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 📊 Monitoring and Logging

### 1. Enable OCI Logging
```bash
# Create log group
oci logging log-group create \
  --compartment-id <compartment-id> \
  --display-name "ClassPDF-Logs"

# Create log
oci logging log create \
  --log-group-id <log-group-id> \
  --display-name "classpdf-app-logs" \
  --log-type SERVICE
```

### 2. Setup Application Monitoring
```yaml
# monitoring-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-config
  namespace: classpdf
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'classpdf'
      static_configs:
      - targets: ['classpdf-service:3000']
      metrics_path: '/metrics'
```

## 🗄️ Database Migration

### 1. Run Database Migrations
```bash
# Connect to your pod
kubectl exec -it deployment/classpdf -n classpdf -- /bin/sh

# Run migrations
npm run setup-db
```

### 2. Initial Data Setup
```bash
# Create admin user (inside pod)
node scripts/create-admin-user.js

# Setup initial data
node scripts/setup-initial-data.js
```

## 🔧 Environment Configuration

### Update .env for Production
```bash
# Required environment variables for Oracle Cloud
NODE_ENV=production
PORT=3000

# Database (Update with your actual values)
DB_TYPE=mysql
DB_HOST=your-mysql-host.mysql.database.oracle.com
DB_PORT=3306
DB_NAME=classpdf
DB_USER=classpdf
DB_PASSWORD=your-secure-password

# Security
SESSION_SECRET=your-super-secure-session-secret
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12

# File uploads
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=50000000

# AI Configuration
AI_TRAINING_ENABLED=true
AI_MAX_CONVERSATION_HISTORY=100

# Oracle Cloud specific
OCI_REGION=us-ashburn-1
OCI_COMPARTMENT_ID=your-compartment-id
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] Database configured and accessible
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Load balancer configured
- [ ] Monitoring setup complete

### Post-Deployment
- [ ] Health checks passing
- [ ] Database migrations completed
- [ ] AI service initialized
- [ ] File uploads working
- [ ] DNS configured
- [ ] SSL/TLS working
- [ ] Monitoring alerts configured

### Testing
- [ ] User registration/login
- [ ] PDF upload functionality
- [ ] AI chat system
- [ ] Assignment creation
- [ ] Performance under load

## 📈 Scaling Configuration

### Horizontal Pod Autoscaler
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: classpdf-hpa
  namespace: classpdf
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: classpdf
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Cluster Autoscaler
```bash
# Enable cluster autoscaler
oci ce node-pool update \
  --node-pool-id <node-pool-id> \
  --size 3 \
  --is-kubernetes-dashboard-enabled true
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Pod Startup Issues
```bash
# Check pod logs
kubectl logs deployment/classpdf -n classpdf

# Check pod events
kubectl describe pod <pod-name> -n classpdf
```

#### 2. Database Connection Issues
```bash
# Test database connectivity from pod
kubectl exec -it deployment/classpdf -n classpdf -- /bin/sh
nc -zv $DB_HOST $DB_PORT
```

#### 3. AI Service Issues
```bash
# Check AI service status
curl http://localhost:3000/api/ai/status

# Check TensorFlow.js logs
kubectl logs deployment/classpdf -n classpdf | grep "tensorflow"
```

#### 4. Load Balancer Issues
```bash
# Check load balancer status
kubectl get services -n classpdf

# Check load balancer events
kubectl describe service classpdf-service -n classpdf
```

## 📞 Support and Resources

### Oracle Cloud Documentation
- [Container Engine for Kubernetes](https://docs.oracle.com/en-us/iaas/Content/ContEng/home.htm)
- [Container Registry](https://docs.oracle.com/en-us/iaas/Content/Registry/home.htm)
- [MySQL Database Service](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-mysql-database-service.html)

### Monitoring and Alerts
- Setup OCI Monitoring for resource usage
- Configure alerting for application errors
- Monitor AI model performance
- Track user engagement metrics

### Backup and Recovery
- Database automated backups
- Container image versioning
- Configuration backup strategy
- Disaster recovery procedures

## 🎉 Deployment Complete!

Your ClassPDF application with real TensorFlow.js AI is now running on Oracle Cloud Infrastructure!

**Next Steps:**
1. Configure your domain DNS to point to the load balancer IP
2. Setup monitoring and alerting
3. Test all functionality thoroughly
4. Configure automated backups
5. Set up CI/CD pipeline for future deployments

**Access your application:**
- Web Interface: `https://your-domain.com`
- Health Check: `https://your-domain.com/health`
- API Status: `https://your-domain.com/api/status` 