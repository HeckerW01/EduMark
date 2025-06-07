#!/bin/bash

# Create a clean directory
rm -rf package
mkdir package

# Install dependencies
pip install --target ./package -r requirements.txt

# Add Lambda function
cp lambda_function.py package/

# Create deployment package
cd package
zip -r ../edumark-gemma-lambda.zip .
cd ..

echo "✅ Lambda package created: edumark-gemma-lambda.zip"
echo "📦 Package size: $(du -h edumark-gemma-lambda.zip | cut -f1)"
echo "🚀 Ready to deploy to AWS Lambda!" 