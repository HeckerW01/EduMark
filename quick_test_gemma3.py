#!/usr/bin/env python3
"""
Quick test for Gemma 3 27B installation
Tests if the model can be loaded and generates a simple response
"""

from vllm import LLM, SamplingParams

def quick_test():
    """Quick test to verify Gemma 3 27B works"""
    print("🧪 Quick test: Loading Gemma 3 27B...")
    
    try:
        # Use minimal settings for quick test
        llm = LLM(
            model="google/gemma-3-27b-it",
            tensor_parallel_size=1,
            gpu_memory_utilization=0.7,  # Conservative memory usage
            trust_remote_code=True,
            dtype="bfloat16",
            max_model_len=2048,          # Smaller context for quick test
        )
        
        print("✅ Model loaded successfully!")
        
        # Simple test prompt
        prompt = "Hello! Can you tell me what you are?"
        
        sampling_params = SamplingParams(
            temperature=0.7,
            max_tokens=100,  # Short response for quick test
        )
        
        print(f"🤖 Testing with prompt: {prompt}")
        
        # Generate response
        outputs = llm.generate([prompt], sampling_params)
        response = outputs[0].outputs[0].text
        
        print(f"✅ SUCCESS! Model response:")
        print(f"📝 {response}")
        print("\n🎉 Gemma 3 27B is working correctly!")
        
    except Exception as e:
        print(f"❌ Error during test: {e}")
        print("\n💡 This might be normal if:")
        print("- You don't have enough GPU memory (need 24GB+)")
        print("- Model is still downloading from Hugging Face")
        print("- You're running on CPU (will be very slow)")

if __name__ == "__main__":
    quick_test() 