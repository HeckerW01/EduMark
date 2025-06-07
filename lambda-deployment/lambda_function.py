import json
import requests
import os
import time

def lambda_handler(event, context):
    """
    EduMark Gemma AI Lambda Function
    Uses HuggingFace Inference API with Gemma models for educational assistance
    """
    
    # CORS headers for EduMark.surge.sh
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://edumark.surge.sh',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    # Handle preflight CORS requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        user_message = body.get('message', '').strip()
        conversation_history = body.get('history', [])
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Message is required',
                    'response': 'Please provide a message to get educational assistance.'
                })
            }
        
        # Generate educational response using Gemma
        response_text = generate_gemma_response(user_message, conversation_history)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'response': response_text,
                'model': 'gemma-7b-it',
                'timestamp': int(time.time()),
                'status': 'success'
            })
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        
        # Fallback to educational response
        fallback_response = generate_educational_fallback(
            body.get('message', '') if 'body' in locals() else 'help'
        )
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'response': fallback_response,
                'model': 'educational-fallback',
                'timestamp': int(time.time()),
                'status': 'fallback'
            })
        }

def generate_gemma_response(user_message, history=None):
    """
    Generate response using HuggingFace Inference API with Gemma
    """
    try:
        # HuggingFace API endpoint for Gemma
        api_url = "https://api-inference.huggingface.co/models/google/gemma-7b-it"
        
        # Get API token from environment (optional, works without for free tier)
        hf_token = os.environ.get('HUGGINGFACE_TOKEN')
        
        # Educational system prompt
        system_prompt = """You are EduMarkAI, a helpful educational assistant for students and teachers. 
Your responses should be:
- Clear and easy to understand
- Educational and informative
- Encouraging and supportive
- Focused on learning and academic growth
- Appropriate for all school levels

Provide practical, actionable advice for educational topics including homework help, study strategies, concept explanations, and academic guidance."""
        
        # Build conversation context
        conversation_context = f"{system_prompt}\n\nStudent/Teacher: {user_message}\n\nEduMarkAI:"
        
        # Add recent history for context (last 3 exchanges)
        if history:
            recent_history = history[-6:]  # Last 3 user+assistant pairs
            context_parts = [system_prompt]
            
            for item in recent_history:
                role = item.get('role', 'user')
                content = item.get('content', '')
                if role == 'user':
                    context_parts.append(f"Student/Teacher: {content}")
                else:
                    context_parts.append(f"EduMarkAI: {content}")
            
            context_parts.append(f"Student/Teacher: {user_message}")
            context_parts.append("EduMarkAI:")
            conversation_context = "\n\n".join(context_parts)
        
        # Request payload
        payload = {
            "inputs": conversation_context,
            "parameters": {
                "max_new_tokens": 400,
                "temperature": 0.7,
                "top_p": 0.95,
                "do_sample": True,
                "stop_sequences": ["\nStudent:", "\nTeacher:", "\nUser:"]
            }
        }
        
        # Headers
        request_headers = {
            "Content-Type": "application/json"
        }
        
        if hf_token:
            request_headers["Authorization"] = f"Bearer {hf_token}"
        
        # Make request to HuggingFace
        response = requests.post(
            api_url,
            headers=request_headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
                
                # Extract only the AI response part
                if "EduMarkAI:" in generated_text:
                    ai_response = generated_text.split("EduMarkAI:")[-1].strip()
                    
                    # Clean up the response
                    ai_response = clean_ai_response(ai_response)
                    
                    if ai_response and len(ai_response) > 10:
                        return ai_response
            
            # If we couldn't parse the response properly, use educational fallback
            return generate_educational_fallback(user_message)
            
        elif response.status_code == 503:
            # Model is loading, return helpful message
            return f"🔄 **EduMarkAI is initializing...** \n\nWhile I'm getting ready, here's some quick help:\n\n{generate_educational_fallback(user_message)}\n\n*Please try your question again in a moment for a more detailed response.*"
            
        else:
            print(f"HuggingFace API error: {response.status_code} - {response.text}")
            return generate_educational_fallback(user_message)
            
    except requests.exceptions.Timeout:
        return f"⏱️ **Response taking longer than expected.** Here's immediate help:\n\n{generate_educational_fallback(user_message)}"
        
    except Exception as e:
        print(f"Error in generate_gemma_response: {str(e)}")
        return generate_educational_fallback(user_message)

def clean_ai_response(response):
    """
    Clean and format the AI response for better presentation
    """
    # Remove any remaining conversation markers
    response = response.replace("Student/Teacher:", "").replace("EduMarkAI:", "")
    
    # Remove excessive whitespace
    response = " ".join(response.split())
    
    # Ensure response ends properly
    if response and not response.endswith(('.', '!', '?', ':')):
        response += "."
    
    return response.strip()

def generate_educational_fallback(user_message):
    """
    Generate educational fallback responses when Gemma is unavailable
    """
    message_lower = user_message.lower()
    
    # Greeting responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
        return "Hello! I'm EduMarkAI, your educational assistant. I'm here to help with homework, study strategies, concept explanations, and academic guidance. What can I help you learn today? 📚"
    
    # Help requests
    if any(word in message_lower for word in ['help', 'assist', 'support']):
        return """🎓 **EduMarkAI Help Menu**

I can assist you with:

📚 **Subject Help**
• Math problems and concepts
• Science explanations and experiments  
• Writing and literature analysis
• History and social studies
• Foreign languages

💡 **Study Support**
• Effective study techniques
• Test preparation strategies
• Note-taking methods
• Time management tips

📝 **Assignment Guidance**
• Essay planning and structure
• Research strategies
• Citation help
• Project organization

**What specific topic would you like help with?**"""
    
    # Math-related
    if any(word in message_lower for word in ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics']):
        return """🧮 **Math Help Available!**

I can help you with:

• **Problem-solving strategies** - Breaking down complex problems
• **Step-by-step solutions** - Clear explanations for each step
• **Key formulas and when to use them**
• **Common mistakes to avoid**
• **Practice techniques for mastery**

**Math Study Tips:**
1. Practice regularly, not just before tests
2. Understand the 'why' behind formulas
3. Work through examples step-by-step
4. Explain solutions to someone else

Share your specific math problem or concept, and I'll walk you through it!"""
    
    # Science-related
    if any(word in message_lower for word in ['science', 'biology', 'chemistry', 'physics', 'experiment', 'lab']):
        return """🔬 **Science Help Ready!**

I can explain concepts in:

🧬 **Biology**
• Cell structure and function
• Genetics and DNA
• Evolution and natural selection
• Ecosystems and environment

⚗️ **Chemistry** 
• Atomic structure and periodic table
• Chemical reactions and equations
• Molecular bonding
• Lab safety and procedures

⚡ **Physics**
• Forces and motion
• Energy and waves
• Electricity and magnetism
• Thermodynamics

**Science Study Strategy:**
Connect concepts to real-world examples and use visual aids like diagrams and charts.

What science topic interests you?"""
    
    # Writing and English
    if any(word in message_lower for word in ['writing', 'essay', 'paper', 'english', 'literature', 'grammar']):
        return """✍️ **Writing Support Available!**

I can help with:

📝 **Essay Writing**
• Structure: Introduction, body, conclusion
• Thesis statement development
• Supporting arguments with evidence
• Smooth transitions between ideas

📚 **Literature Analysis**
• Character development
• Themes and symbolism
• Literary devices
• Critical thinking skills

📖 **Research Papers**
• Topic selection and narrowing
• Finding credible sources
• Proper citation formats (MLA, APA)
• Avoiding plagiarism

**Writing Process Tips:**
1. Brainstorm and outline first
2. Write a rough draft without editing
3. Revise for content and organization
4. Proofread for grammar and mechanics

What writing project are you working on?"""
    
    # Study techniques
    if any(word in message_lower for word in ['study', 'studying', 'exam', 'test', 'quiz', 'memory', 'learn']):
        return """💡 **Study Strategies That Work!**

**Evidence-Based Techniques:**

🔄 **Active Recall**
• Test yourself regularly
• Use flashcards effectively
• Summarize without looking at notes

📅 **Spaced Repetition**
• Review material at increasing intervals
• Don't cram - spread out study sessions
• Use apps like Anki for scheduling

🧩 **Elaborative Learning**
• Connect new info to what you know
• Ask "why" and "how" questions
• Create analogies and examples

👥 **Teaching Others**
• Explain concepts to friends/family
• Join study groups
• Create your own practice questions

🎯 **Focus Techniques**
• Pomodoro Technique (25-min focused sessions)
• Eliminate distractions
• Take regular breaks

What subject or upcoming test would you like study strategies for?"""
    
    # History and social studies
    if any(word in message_lower for word in ['history', 'historical', 'social studies', 'government', 'politics']):
        return """📚 **History Help Ready!**

I can assist with:

🏛️ **Historical Analysis**
• Understanding cause and effect
• Analyzing primary sources
• Comparing different time periods
• Developing historical arguments

📜 **Study Strategies for History**
• Create timelines for chronology
• Use maps for geographical context
• Connect events to modern issues
• Practice with DBQ (Document-Based Questions)

🗳️ **Government & Civics**
• Constitutional principles
• Branches of government
• Rights and responsibilities
• Democratic processes

**History Study Tip:**
Think of history as stories about real people making decisions. Ask yourself: What were they thinking? What were their options? What were the consequences?

What historical period or event are you studying?"""
    
    # Homework help
    if any(word in message_lower for word in ['homework', 'assignment', 'project', 'due']):
        return """📝 **Homework Help Strategy**

**Let's tackle your assignment step by step:**

1️⃣ **Understand the Task**
• Read instructions carefully
• Identify key requirements
• Note the due date and format

2️⃣ **Break It Down**
• Divide large assignments into smaller tasks
• Create a timeline working backwards from due date
• Set mini-deadlines for each part

3️⃣ **Gather Resources**
• Textbooks and class notes
• Reliable online sources
• Library databases
• Teacher's examples

4️⃣ **Create and Execute**
• Start with an outline
• Work in focused sessions
• Take breaks to maintain quality
• Leave time for revision

**Share your specific assignment details and I'll provide more targeted help!**

What subject is your homework in, and what type of assignment is it?"""
    
    # General encouragement
    if any(word in message_lower for word in ['hard', 'difficult', 'struggling', 'confused', 'frustrated']):
        return """💪 **You've Got This!**

Remember that learning is a process, and struggling with challenging material is completely normal. Here's how to push through:

🌟 **Growth Mindset Tips:**
• Mistakes are learning opportunities
• "I don't understand this YET"
• Focus on progress, not perfection
• Ask for help when needed

🎯 **When Something Feels Too Hard:**
1. Break it into smaller pieces
2. Find a simpler example to start with
3. Look for patterns or connections
4. Take a short break and come back fresh
5. Explain what you DO understand

✨ **Remember:**
Every expert was once a beginner. Every pro was once an amateur. Every success story started with someone who kept trying.

What specific topic or concept is giving you trouble? Let's work through it together!"""
    
    # Default educational response
    return """🎓 **Welcome to EduMarkAI!**

I'm your educational assistant, ready to help with:

📚 **Academic Subjects**
• Math, Science, English, History
• Step-by-step problem solving
• Concept explanations

💡 **Study Success**
• Effective study techniques
• Test preparation strategies
• Memory and retention tips

📝 **Writing & Research**
• Essay structure and development
• Research strategies
• Citation help

🎯 **Learning Support**
• Homework guidance
• Project planning
• Time management

**To get the most helpful response, please tell me:**
• What subject you're working on
• Your specific question or challenge
• What level you're studying (elementary, middle school, high school, college)

**What can I help you learn today?**"""

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