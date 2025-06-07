import json
import logging
import os
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for EduMark AI chat functionality using Gemma 3 27B
    Handles CORS, input validation, and AI model integration
    """
    
    # Handle preflight CORS requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': 'https://edumark.surge.sh',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': 'https://edumark.surge.sh',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    }
    
    try:
        # Parse request body
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Request body is required',
                    'message': 'Please provide a message in the request body'
                })
            }
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Invalid JSON in request body',
                    'message': 'Please provide valid JSON format'
                })
            }
        
        # Extract and validate message
        user_message = body.get('message', '').strip()
        if not user_message:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Message is required',
                    'message': 'Please provide a non-empty message'
                })
            }
        
        # Get conversation context (optional)
        conversation_history = body.get('history', [])
        
        # Log the incoming request
        logger.info(f"Processing AI chat request from EduMark.surge.sh")
        logger.info(f"Message length: {len(user_message)} characters")
        
        # Process with Gemma 3 27B
        ai_response = process_with_gemma3(user_message, conversation_history)
        
        # Return successful response
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'response': ai_response,
                'model': 'gemma-3-27b',
                'timestamp': context.aws_request_id
            })
        }
        
    except Exception as e:
        # Log the error
        logger.error(f"Error processing request: {str(e)}")
        
        # Return error response
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': 'An error occurred while processing your request',
                'details': str(e) if os.environ.get('DEBUG') == 'true' else None
            })
        }

def process_with_gemma3(message: str, history: list = None) -> str:
    """
    Process user message with Gemma 3 27B model
    Handles educational content and provides helpful responses
    """
    
    try:
        # Prepare the prompt with educational context
        system_prompt = """You are EduMark AI, an intelligent educational assistant. 
        You help students and teachers with:
        - Assignment explanations and guidance
        - PDF document analysis and summarization
        - Educational content creation
        - Learning support and tutoring
        - Academic writing assistance
        
        Provide clear, helpful, and educational responses. Be encouraging and supportive."""
        
        # Build conversation context
        conversation_context = []
        if history:
            for item in history[-10:]:  # Keep last 10 exchanges
                if isinstance(item, dict):
                    if item.get('role') == 'user':
                        conversation_context.append(f"User: {item.get('content', '')}")
                    elif item.get('role') == 'assistant':
                        conversation_context.append(f"Assistant: {item.get('content', '')}")
        
        # Add current message
        conversation_context.append(f"User: {message}")
        
        # Prepare full prompt
        full_prompt = f"{system_prompt}\n\n" + "\n".join(conversation_context) + "\n\nAssistant:"
        
        # Get Gemma 3 27B endpoint from environment variables
        gemma_endpoint = os.environ.get('GEMMA_ENDPOINT')
        gemma_api_key = os.environ.get('GEMMA_API_KEY')
        
        if not gemma_endpoint:
            # Fallback to Hugging Face Inference API
            return call_huggingface_api(full_prompt)
        
        # Call Gemma 3 27B model
        response = requests.post(
            gemma_endpoint,
            headers={
                'Authorization': f'Bearer {gemma_api_key}' if gemma_api_key else {},
                'Content-Type': 'application/json'
            },
            json={
                'inputs': full_prompt,
                'parameters': {
                    'max_new_tokens': 1024,
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'do_sample': True,
                    'repetition_penalty': 1.1
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract generated text
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
            elif isinstance(result, dict):
                generated_text = result.get('generated_text', result.get('response', ''))
            else:
                generated_text = str(result)
            
            # Clean up the response (remove the prompt part)
            if 'Assistant:' in generated_text:
                ai_response = generated_text.split('Assistant:')[-1].strip()
            else:
                ai_response = generated_text.strip()
            
            return ai_response if ai_response else "I understand your question, but I need a bit more context to provide a helpful response."
        
        else:
            logger.error(f"Gemma API error: {response.status_code} - {response.text}")
            return "I'm having trouble processing your request right now. Please try again in a moment."
    
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return "I'm currently experiencing connectivity issues. Please try again shortly."
    
    except Exception as e:
        logger.error(f"Gemma processing error: {str(e)}")
        return "I encountered an error while processing your request. Please try rephrasing your question."

def call_huggingface_api(prompt: str) -> str:
    """
    Fallback to Hugging Face Inference API for Gemma 3 27B
    Uses the free inference API as backup
    """
    
    try:
        hf_token = os.environ.get('HUGGINGFACE_TOKEN')
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/gemma-2-27b-it",
            headers={
                "Authorization": f"Bearer {hf_token}" if hf_token else {},
                "Content-Type": "application/json"
            },
            json={
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 512,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": True,
                    "return_full_text": False
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '').strip()
            elif isinstance(result, dict):
                return result.get('generated_text', '').strip()
        
        # If API is loading, return helpful message
        elif response.status_code == 503:
            return "The AI model is currently loading. Please try again in a few moments."
        
        else:
            logger.error(f"Hugging Face API error: {response.status_code}")
            return generate_fallback_response(prompt)
    
    except Exception as e:
        logger.error(f"Hugging Face API error: {str(e)}")
        return generate_fallback_response(prompt)

def generate_fallback_response(prompt: str) -> str:
    """
    Generate a helpful fallback response when AI model is unavailable
    Provides basic educational guidance based on common patterns
    """
    
    user_input = prompt.lower()
    
    # Educational content patterns
    if any(word in user_input for word in ['explain', 'what is', 'how does', 'help me understand']):
        return "I'd be happy to help explain that concept! Could you provide a bit more specific information about what you'd like me to explain? For example, which subject area or particular aspect you're focusing on?"
    
    elif any(word in user_input for word in ['essay', 'write', 'paper', 'assignment']):
        return "For writing assignments, I recommend starting with an outline: 1) Introduction with thesis statement, 2) Body paragraphs with supporting evidence, 3) Conclusion that ties everything together. What specific aspect of your writing would you like help with?"
    
    elif any(word in user_input for word in ['pdf', 'document', 'file', 'upload']):
        return "I can help analyze and explain content from documents. Once you upload a PDF, I can help summarize key points, explain concepts, or answer questions about the material. What type of document are you working with?"
    
    elif any(word in user_input for word in ['math', 'calculate', 'solve', 'equation']):
        return "I can help with math problems! Please share the specific equation or problem you're working on, and I'll walk you through the solution step by step."
    
    elif any(word in user_input for word in ['study', 'learn', 'understand', 'confused']):
        return "I'm here to help you learn! What subject or topic are you studying? I can break down complex concepts into simpler parts and provide examples to help you understand better."
    
    else:
        return "I'm here to help with your educational needs! I can assist with explanations, writing, document analysis, math problems, and general learning support. What would you like to work on today?"

# Environment variable validation
def validate_environment():
    """
    Validate required environment variables
    Called during Lambda initialization
    """
    
    required_vars = []
    optional_vars = ['GEMMA_ENDPOINT', 'GEMMA_API_KEY', 'HUGGINGFACE_TOKEN', 'DEBUG']
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    if missing_vars:
        logger.warning(f"Missing required environment variables: {missing_vars}")
    
    available_vars = [var for var in optional_vars if os.environ.get(var)]
    logger.info(f"Available optional environment variables: {available_vars}")

# Initialize environment check
validate_environment() 