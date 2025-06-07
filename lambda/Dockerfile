FROM public.ecr.aws/lambda/nodejs:18

# Install Python and dependencies
RUN yum update -y && \
    yum install -y python3 python3-pip && \
    yum clean all

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy application code
COPY . .

# Download Gemma 3 27B model
RUN python3 -c "from transformers import AutoTokenizer, AutoModelForCausalLM; \
    AutoTokenizer.from_pretrained('google/gemma-3-27b'); \
    AutoModelForCausalLM.from_pretrained('google/gemma-3-27b')"

# Set environment variables
ENV GEMMA_MODEL_PATH=/var/task/models/gemma-3-27b
ENV GEMMA_MAX_LENGTH=2048
ENV GEMMA_TEMPERATURE=0.7

# Set the CMD to your handler
CMD [ "ai-chat.handler" ] 