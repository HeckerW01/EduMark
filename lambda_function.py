import json
import logging
import os
import requests
import boto3
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AWS clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Constants
HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
GEMMA_MODEL = "google/gemma-3-27b"
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
    Query the Gemma 3 27B model through HuggingFace API.
    """
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Add educational system prompt
        system_prompt = """You are EduMarkAI, a helpful educational assistant powered by Gemma 3 27B. 
Your responses should be:
- Clear and easy to understand
- Educational and informative
- Encouraging and supportive
- Focused on learning and academic growth
- Appropriate for all school levels

Provide practical, actionable advice for educational topics including homework help, study strategies, concept explanations, and academic guidance."""

        # Build conversation context
        conversation_context = f"{system_prompt}\n\nStudent/Teacher: {payload['inputs']}\n\nEduMarkAI:"
        
        # Add recent history for context
        if 'history' in payload and payload['history']:
            recent_history = payload['history'][-6:]  # Last 3 user+assistant pairs
            context_parts = [system_prompt]
            
            for item in recent_history:
                role = item.get('role', 'user')
                content = item.get('content', '')
                if role == 'user':
                    context_parts.append(f"Student/Teacher: {content}")
                else:
                    context_parts.append(f"EduMarkAI: {content}")
            
            context_parts.append(f"Student/Teacher: {payload['inputs']}")
            context_parts.append("EduMarkAI:")
            conversation_context = "\n\n".join(context_parts)

        # Update payload with conversation context
        payload['inputs'] = conversation_context
        
        # Add Gemma 3 27B specific parameters
        payload['parameters'].update({
            'max_new_tokens': 400,
            'temperature': 0.7,
            'top_p': 0.95,
            'do_sample': True,
            'stop_sequences': ["\nStudent:", "\nTeacher:", "\nUser:"]
        })

        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying Gemma: {str(e)}")
        return None

def clean_ai_response(response: str) -> str:
    """
    Clean and format the AI response for better presentation.
    """
    # Remove any remaining conversation markers
    response = response.replace("Student/Teacher:", "").replace("EduMarkAI:", "")
    
    # Remove excessive whitespace
    response = " ".join(response.split())
    
    # Ensure response ends properly
    if response and not response.endswith(('.', '!', '?', ':')):
        response += "."
    
    return response.strip()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for processing educational queries with Gemma 3 27B.
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
                "max_new_tokens": 400,
                "temperature": 0.7,
                "top_p": 0.95,
                "do_sample": True
            }
        }
        
        # Try to get response from Gemma
        gemma_response = query_gemma(payload)
        
        if gemma_response and isinstance(gemma_response, list) and len(gemma_response) > 0:
            response_text = gemma_response[0].get('generated_text', '')
            response_text = clean_ai_response(response_text)
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
                "model": "gemma-3-27b",
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