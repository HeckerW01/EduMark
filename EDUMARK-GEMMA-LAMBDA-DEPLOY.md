# 🚀 EduMark Gemma Lambda Deployment Guide

This guide will walk you through deploying the EduMark AI Lambda function with Gemma integration.

## 📋 Prerequisites

1. AWS Account with Lambda access
2. HuggingFace API key
3. Python 3.11 installed locally
4. AWS CLI configured

## 🛠️ Setup Steps

### 1. Prepare Lambda Package

```bash
# Create a new directory
mkdir edumark-gemma-lambda
cd edumark-gemma-lambda

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create deployment package
pip install --target ./package -r requirements.txt
cd package
zip -r ../edumark-gemma-lambda.zip .
cd ..
zip -g edumark-gemma-lambda.zip lambda_function.py
```

### 2. AWS Lambda Setup

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click "Create function"
3. Choose "Author from scratch"
4. Configure:
   - Function name: `edumark-gemma-ai`
   - Runtime: Python 3.11
   - Architecture: x86_64
   - Permissions: Create new role with basic Lambda permissions

### 3. Upload Code

1. In the Lambda function page, click "Upload from" → ".zip file"
2. Upload `edumark-gemma-lambda.zip`
3. Click "Save"

### 4. Configure Environment Variables

Add these environment variables:
- `HUGGINGFACE_API_KEY`: Your HuggingFace API key

### 5. Configure Function Settings

1. Set timeout to 30 seconds
2. Set memory to 256 MB
3. Enable "Enhanced networking"

### 6. Add API Gateway Trigger

1. Click "Add trigger"
2. Select "API Gateway"
3. Configure:
   - API: Create new API
   - Security: Open
   - Enable CORS: Yes
4. Click "Add"

### 7. Configure CORS

In API Gateway:
1. Select your API
2. Go to Resources
3. Enable CORS for your endpoint
4. Add these headers:
   ```
   Access-Control-Allow-Origin: https://edumark.surge.sh
   Access-Control-Allow-Methods: POST,OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

### 8. Deploy API

1. In API Gateway, click "Actions" → "Deploy API"
2. Create new stage: "prod"
3. Note the invoke URL

## 🔍 Testing

1. Open `test-lambda-gemma.html` in your browser
2. Enter your API Gateway URL
3. Click "Test Connection"
4. Try the test queries

## 🔄 Updating Website

1. Open `js/edumark-ai-integration.js`
2. Update line 9 with your API Gateway URL:
   ```javascript
   this.apiEndpoint = 'https://your-api-id.execute-api.region.amazonaws.com/prod';
   ```

## 📊 Monitoring

Monitor your Lambda function in AWS CloudWatch:
- Logs: `/aws/lambda/edumark-gemma-ai`
- Metrics: Invocations, Duration, Errors

## 🔧 Troubleshooting

Common issues:
1. CORS errors: Check API Gateway CORS configuration
2. Timeout errors: Increase Lambda timeout
3. Memory errors: Increase Lambda memory
4. API key errors: Verify HuggingFace API key

## 📞 Support

For issues:
1. Check CloudWatch logs
2. Verify API Gateway configuration
3. Test with `test-lambda-gemma.html`
4. Contact support with error details

## 🔒 Security Notes

1. Keep your HuggingFace API key secure
2. Use environment variables for sensitive data
3. Enable AWS CloudWatch logging
4. Monitor for unusual activity

## 💰 Cost Optimization

1. Set appropriate timeout
2. Monitor memory usage
3. Use provisioned concurrency if needed
4. Set up CloudWatch alarms for costs

Happy deploying! 🎉 