#!/bin/bash

# ClassPDF Oracle Cloud Deployment Script
# This script automates deployment to Oracle Cloud Infrastructure

set -e

# Configuration
PROJECT_NAME="classpdf"
REGION=${OCI_REGION:-"us-ashburn-1"}
COMPARTMENT_ID=${OCI_COMPARTMENT_ID}
REGISTRY_URL="<region>.ocir.io"
NAMESPACE=${OCI_NAMESPACE}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if OCI CLI is installed
    if ! command -v oci &> /dev/null; then
        error "OCI CLI is not installed. Please install OCI CLI first."
    fi
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        warn "kubectl is not installed. Kubernetes deployment will be skipped."
    fi
    
    # Check environment variables
    if [ -z "$OCI_COMPARTMENT_ID" ]; then
        error "OCI_COMPARTMENT_ID environment variable is not set."
    fi
    
    if [ -z "$OCI_NAMESPACE" ]; then
        error "OCI_NAMESPACE environment variable is not set."
    fi
    
    log "Prerequisites check completed successfully."
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    # Get version from package.json
    VERSION=$(node -p "require('./package.json').version")
    IMAGE_TAG="${REGION}.ocir.io/${NAMESPACE}/${PROJECT_NAME}:${VERSION}"
    LATEST_TAG="${REGION}.ocir.io/${NAMESPACE}/${PROJECT_NAME}:latest"
    
    log "Building image with tags: ${IMAGE_TAG} and ${LATEST_TAG}"
    
    # Build the image
    docker build -t ${IMAGE_TAG} -t ${LATEST_TAG} .
    
    if [ $? -eq 0 ]; then
        log "Docker image built successfully."
    else
        error "Failed to build Docker image."
    fi
}

# Push image to Oracle Container Registry
push_image() {
    log "Pushing image to Oracle Container Registry..."
    
    # Login to OCIR
    echo ${OCI_AUTH_TOKEN} | docker login ${REGION}.ocir.io -u ${NAMESPACE}/${OCI_USERNAME} --password-stdin
    
    # Push both tags
    docker push ${IMAGE_TAG}
    docker push ${LATEST_TAG}
    
    if [ $? -eq 0 ]; then
        log "Image pushed successfully to OCIR."
    else
        error "Failed to push image to OCIR."
    fi
}

# Create Oracle Cloud Infrastructure resources
create_infrastructure() {
    log "Creating Oracle Cloud Infrastructure resources..."
    
    # Create VCN if it doesn't exist
    VCN_ID=$(oci network vcn list --compartment-id ${COMPARTMENT_ID} --display-name "${PROJECT_NAME}-vcn" --query 'data[0].id' --raw-output 2>/dev/null || echo "null")
    
    if [ "$VCN_ID" = "null" ]; then
        log "Creating VCN..."
        VCN_ID=$(oci network vcn create \
            --compartment-id ${COMPARTMENT_ID} \
            --display-name "${PROJECT_NAME}-vcn" \
            --cidr-block "10.0.0.0/16" \
            --query 'data.id' --raw-output)
        log "VCN created with ID: ${VCN_ID}"
    else
        log "Using existing VCN: ${VCN_ID}"
    fi
    
    # Create subnet if it doesn't exist
    SUBNET_ID=$(oci network subnet list --compartment-id ${COMPARTMENT_ID} --vcn-id ${VCN_ID} --display-name "${PROJECT_NAME}-subnet" --query 'data[0].id' --raw-output 2>/dev/null || echo "null")
    
    if [ "$SUBNET_ID" = "null" ]; then
        log "Creating subnet..."
        SUBNET_ID=$(oci network subnet create \
            --compartment-id ${COMPARTMENT_ID} \
            --vcn-id ${VCN_ID} \
            --display-name "${PROJECT_NAME}-subnet" \
            --cidr-block "10.0.1.0/24" \
            --query 'data.id' --raw-output)
        log "Subnet created with ID: ${SUBNET_ID}"
    else
        log "Using existing subnet: ${SUBNET_ID}"
    fi
    
    log "Infrastructure setup completed."
}

# Deploy to Oracle Container Engine for Kubernetes (OKE)
deploy_to_oke() {
    if ! command -v kubectl &> /dev/null; then
        warn "kubectl not found. Skipping Kubernetes deployment."
        return
    fi
    
    log "Deploying to Oracle Container Engine for Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${PROJECT_NAME} --dry-run=client -o yaml | kubectl apply -f -
    
    # Create deployment YAML
    cat > deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${PROJECT_NAME}
  namespace: ${PROJECT_NAME}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${PROJECT_NAME}
  template:
    metadata:
      labels:
        app: ${PROJECT_NAME}
    spec:
      containers:
      - name: ${PROJECT_NAME}
        image: ${LATEST_TAG}
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: ${PROJECT_NAME}-secrets
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ${PROJECT_NAME}-secrets
              key: db-password
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ${PROJECT_NAME}-service
  namespace: ${PROJECT_NAME}
spec:
  selector:
    app: ${PROJECT_NAME}
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
EOF
    
    # Apply the deployment
    kubectl apply -f deployment.yaml
    
    log "Kubernetes deployment completed."
    
    # Get service information
    kubectl get services -n ${PROJECT_NAME}
}

# Create database
create_database() {
    log "Setting up database..."
    
    # This would typically involve creating a MySQL or PostgreSQL instance
    # For now, we'll just log the requirement
    warn "Database setup requires manual configuration in Oracle Cloud Console."
    warn "Please create a MySQL or PostgreSQL database and update the .env file."
}

# Main deployment function
deploy() {
    log "Starting ClassPDF deployment to Oracle Cloud..."
    
    check_prerequisites
    build_image
    push_image
    create_infrastructure
    create_database
    deploy_to_oke
    
    log "Deployment completed successfully!"
    log "Next steps:"
    log "1. Configure your database connection in the .env file"
    log "2. Update DNS settings to point to your load balancer"
    log "3. Configure SSL/TLS certificates"
    log "4. Monitor your application logs"
}

# Cleanup function
cleanup() {
    log "Cleaning up resources..."
    
    # Remove Kubernetes deployment
    if command -v kubectl &> /dev/null; then
        kubectl delete namespace ${PROJECT_NAME} --ignore-not-found
    fi
    
    # Note: VCN and other infrastructure cleanup would go here
    warn "Manual cleanup of VCN and other infrastructure may be required."
}

# Script usage
usage() {
    echo "Usage: $0 [deploy|cleanup|build|push]"
    echo "  deploy  - Full deployment to Oracle Cloud"
    echo "  cleanup - Remove deployed resources"
    echo "  build   - Build Docker image only"
    echo "  push    - Push image to OCIR only"
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    cleanup)
        cleanup
        ;;
    build)
        check_prerequisites
        build_image
        ;;
    push)
        check_prerequisites
        push_image
        ;;
    *)
        usage
        exit 1
        ;;
esac 