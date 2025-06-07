# EduMark Lambda Deployment Instructions

## 🎯 What You Have
Your **complete Lambda deployment package** is ready: `edumark-lambda-deployment.zip` (1.07 MB)

This package contains:
- ✅ `lambda_function.py` - Main Lambda handler for EduMark.surge.sh
- ✅ `requests` library and all dependencies
- ✅ Proper CORS configuration for https://edumark.surge.sh
- ✅ Gemma 3 27B integration with HuggingFace fallback
- ✅ Educational AI context and error handling

## 🚀 AWS Lambda Deployment Steps

### Step 1: Create Lambda Function
1. **Go to AWS Lambda Console**: https://console.aws.amazon.com/lambda/
2. **Click "Create function"**
3. **Choose "Author from scratch"**
4. **Configuration**:
   - **Function name**: `edumark-ai-chat`
   - **Runtime**: `Python 3.11` (or 3.9/3.10)
   - **Architecture**: `x86_64`
   - **Permissions**: Use default execution role

### Step 2: Upload Your Package
1. **In the Lambda function page**:
   - **Code source** section → **Upload from** → **.zip file**
   - **Upload**: `edumark-lambda-deployment.zip`
   - **Wait** for upload to complete

### Step 3: Configure Function Settings
1. **Configuration** tab → **General configuration** → **Edit**:
   - **Timeout**: `30 seconds`
   - **Memory**: `512 MB` (or higher for better performance)

2. **Environment variables** (optional):
   - `HUGGINGFACE_TOKEN`: Your HuggingFace API token (free)
   - `GEMMA_ENDPOINT`: Custom Gemma endpoint if you have one
   - `GEMMA_API_KEY`: API key for custom endpoint
   - `DEBUG`: `true` for detailed error messages

### Step 4: Create API Gateway
1. **Go to API Gateway Console**: https://console.aws.amazon.com/apigateway/
2. **Create API** → **REST API** → **Build**
3. **API name**: `edumark-ai-api`
4. **Create API**

### Step 5: Configure API Methods
1. **Create Resource**:
   - **Resource Name**: `chat`
   - **Resource Path**: `/chat`

2. **Create POST Method**:
   - **Actions** → **Create Method** → **POST**
   - **Integration Type**: Lambda Function
   - **Lambda Function**: `edumark-ai-chat`
   - **Save**

3. **Enable CORS**:
   - **Actions** → **Enable CORS**
   - **Access-Control-Allow-Origin**: `https://edumark.surge.sh`
   - **Access-Control-Allow-Headers**: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - **Access-Control-Allow-Methods**: `POST,OPTIONS`
   - **Enable CORS and replace existing CORS headers**

### Step 6: Deploy API
1. **Actions** → **Deploy API**
2. **Deployment stage**: `[New Stage]`
3. **Stage name**: `prod`
4. **Deploy**

### Step 7: Get Your API URL
After deployment, you'll get an **Invoke URL** like:
```
https://your-api-id.execute-api.region.amazonaws.com/prod/chat
```

## 🌐 Frontend Integration

Add this JavaScript to your EduMark site:

```javascript
// AI Chat Integration for EduMark
const LAMBDA_API_URL = 'https://your-api-id.execute-api.region.amazonaws.com/prod/chat';

async function sendMessageToAI(message) {
    try {
        const response = await fetch(LAMBDA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: [] // Optional conversation history
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            return data.response;
        } else {
            console.error('AI API Error:', data.error);
            return 'Sorry, I encountered an error. Please try again.';
        }
    } catch (error) {
        console.error('Network Error:', error);
        return 'Connection error. Please check your internet connection.';
    }
}

// Example usage
sendMessageToAI('Help me understand calculus derivatives')
    .then(response => console.log('AI Response:', response));
```

## 🔧 Testing Your Deployment

### Test with curl:
```bash
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://edumark.surge.sh" \
  -d '{"message": "What is photosynthesis?"}'
```

### Expected Response:
```json
{
  "response": "Photosynthesis is the process by which plants...",
  "model": "gemma-3-27b",
  "timestamp": "request-id"
}
```

## 💰 Cost Estimation
- **Lambda**: ~$0.0000002 per request + execution time
- **API Gateway**: ~$0.0000035 per request
- **Estimated cost**: <$1/month for typical usage

## 🔒 Security Features
- ✅ CORS restricted to edumark.surge.sh only
- ✅ Input validation and sanitization
- ✅ Rate limiting via API Gateway (can be configured)
- ✅ No sensitive data stored in function

## 🛟 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure API Gateway CORS is properly configured
2. **Timeout**: Increase Lambda timeout if responses are slow
3. **Memory Issues**: Increase Lambda memory allocation
4. **HuggingFace API Loading**: Normal on first request, try again

### Check CloudWatch Logs:
1. **Lambda Console** → **Monitor** → **View logs in CloudWatch**
2. Look for error messages and debug information

## 🎉 You're Done!
Your EduMark AI chat is now powered by Gemma 3 27B and ready to help students and teachers with educational content!

---
**Package Created**: June 5, 2025  
**File**: `edumark-lambda-deployment.zip`  
**Size**: 1.07 MB  
**Ready for AWS Lambda deployment** 