#!/usr/bin/env python3
"""
Gemma 3 27B Server for ClassPDF
Handles AI model loading and inference in AWS Lambda
"""

import os
import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GemmaServer:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load configuration from environment
        self.model_path = os.getenv("GEMMA_MODEL_PATH", "/var/task/models/gemma-3-27b")
        self.max_length = int(os.getenv("GEMMA_MAX_LENGTH", 2048))
        self.temperature = float(os.getenv("GEMMA_TEMPERATURE", 0.7))
        self.top_p = float(os.getenv("GEMMA_TOP_P", 0.9))
        self.top_k = int(os.getenv("GEMMA_TOP_K", 40))
        self.repetition_penalty = float(os.getenv("GEMMA_REPETITION_PENALTY", 1.1))

    def load_model(self):
        """Load Gemma 3 27B model and tokenizer"""
        try:
            print("Loading Gemma 3 27B model...", file=sys.stderr)
            
            # Use half precision for memory efficiency
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16,
                device_map="auto",
                low_cpu_mem_usage=True
            )
            
            print("Model loaded successfully", file=sys.stderr)
            return True
            
        except Exception as e:
            print(f"Error loading model: {str(e)}", file=sys.stderr)
            return False

    def generate_response(self, prompt):
        """Generate response using Gemma 3 27B"""
        try:
            # Tokenize input
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=self.max_length,
                    temperature=self.temperature,
                    top_p=self.top_p,
                    top_k=self.top_k,
                    repetition_penalty=self.repetition_penalty,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the assistant's response
            response = response.split("Assistant:")[-1].strip()
            
            return response
            
        except Exception as e:
            print(f"Error generating response: {str(e)}", file=sys.stderr)
            return "I apologize, but I encountered an error while processing your request."

    def run(self):
        """Run the server and handle requests"""
        if not self.load_model():
            sys.exit(1)
        
        print("Gemma 3 27B server is ready", file=sys.stderr)
        
        while True:
            try:
                # Read request from stdin
                request = sys.stdin.readline().strip()
                if not request:
                    continue
                
                # Parse request
                data = json.loads(request)
                prompt = data.get("prompt", "")
                
                if not prompt:
                    response = {"error": "No prompt provided"}
                else:
                    # Generate response
                    text = self.generate_response(prompt)
                    response = {"text": text}
                
                # Send response
                print(json.dumps(response), flush=True)
                
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON request"}), flush=True)
            except Exception as e:
                print(json.dumps({"error": str(e)}), flush=True)

if __name__ == "__main__":
    server = GemmaServer()
    server.run() 