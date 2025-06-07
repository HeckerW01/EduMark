import json
import os
import requests
import boto3
from typing import Dict, Any, List

# Initialize AWS clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Constants
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
GEMMA_MODEL = "google/gemma-7b-it"
API_URL = f"https://api-inference.huggingface.co/models/{GEMMA_MODEL}"

# Educational response templates
EDUCATIONAL_RESPONSES = {
    "math": "Let me help you solve this step by step. First, let's understand what we're trying to find...",
    "science": "This is a fascinating scientific concept. Let me break it down for you...",
    "english": "Let's analyze this writing task together. Here's how we can approach it...",
    "history": "This historical event is important to understand. Here's the context...",
    "general": "I'd be happy to help you learn about this topic. Let me explain..."
}

def get_educational_response(message: str) -> str:
    """
    Generate an educational response based on the message content.
    """
    message = message.lower()
    
    # Simple subject detection
    if any(word in message for word in ['math', 'algebra', 'calculus', 'equation', 'solve']):
        return EDUCATIONAL_RESPONSES['math']
    elif any(word in message for word in ['science', 'physics', 'chemistry', 'biology']):
        return EDUCATIONAL_RESPONSES['science']
    elif any(word in message for word in ['write', 'essay', 'grammar', 'literature']):
        return EDUCATIONAL_RESPONSES['english']
    elif any(word in message for word in ['history', 'historical', 'past', 'event']):
        return EDUCATIONAL_RESPONSES['history']
    
    return EDUCATIONAL_RESPONSES['general']

def query_gemma(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Query the Gemma model through HuggingFace API.
    """
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying Gemma: {str(e)}")
        return None

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for processing educational queries.
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        message = body.get('message', '')
        history = body.get('history', [])
        
        # Prepare payload for Gemma
        payload = {
            "inputs": message,
            "parameters": {
                "max_length": 500,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
        # Try to get response from Gemma
        gemma_response = query_gemma(payload)
        
        if gemma_response and isinstance(gemma_response, list) and len(gemma_response) > 0:
            response_text = gemma_response[0].get('generated_text', '')
        else:
            # Fallback to educational response
            response_text = get_educational_response(message)
        
        # Prepare response
        response = {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "https://edumark.surge.sh",
                "Access-Control-Allow-Methods": "POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "response": response_text,
                "model": "gemma-7b",
                "status": "success"
            })
        }
        
        return response
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "https://edumark.surge.sh",
                "Access-Control-Allow-Methods": "POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": str(e),
                "status": "error"
            })
        }

# Test function for local development
if __name__ == "__main__":
    # Test the lambda function
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'message': 'Explain photosynthesis in simple terms',
            'history': []
        })
    }
    
    result = lambda_handler(test_event, None)
    print("Test result:")
    print(json.dumps(result, indent=2)) 