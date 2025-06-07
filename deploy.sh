#!/bin/bash

# ClassPDF Surge.sh Deployment Script

echo "🚀 Starting ClassPDF deployment to Surge.sh..."

# Check if surge is installed
if ! command -v surge &> /dev/null; then
    echo "❌ Surge is not installed. Installing now..."
    npm install -g surge
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Surge. Please run: npm install -g surge"
        exit 1
    fi
fi

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the ClassPDF directory."
    exit 1
fi

echo "✅ Surge is installed and ready"
echo "📁 Current directory: $(pwd)"
echo ""

# Deploy with surge
echo "🌍 Deploying to Surge.sh..."
surge

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   • Test your site in a browser"
echo "   • Try creating teacher and student accounts" 
echo "   • Upload a PDF as a teacher"
echo "   • View assignments as a student"
echo ""
echo "🔧 To update your site:"
echo "   • Make changes to your files"
echo "   • Run 'surge' again from this directory"
echo ""
echo "🗑️  To remove your site:"
echo "   • Run 'surge teardown [your-domain].surge.sh'" 