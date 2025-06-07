# 🚀 Quick Start: Deploy ClassPDF to Surge.sh

## ⚡ Super Quick Deployment (3 commands)

```bash
# 1. Install surge (one-time setup)
npm install -g surge

# 2. Deploy your site
surge

# 3. Follow the prompts and you're live!
```

## 📋 What You'll Need

- ✅ Node.js installed
- ✅ Internet connection
- ✅ Email address (for surge.sh account)

## 🎯 Step-by-Step Guide

### 1. Open Terminal/Command Prompt
- **Windows**: Open PowerShell or Command Prompt
- **Mac/Linux**: Open Terminal

### 2. Navigate to Your ClassPDF Folder
```bash
cd path/to/your/classpdf-folder
```

### 3. Install Surge (One-Time Setup)
```bash
npm install -g surge
```

### 4. Deploy to Surge.sh
```bash
surge
```

### 5. Follow the Prompts
- **Email**: Enter your email (creates surge.sh account)
- **Password**: Choose a secure password
- **Project path**: Press Enter (uses current folder)
- **Domain**: Press Enter for default OR type custom domain

## 🌐 Your Site is Live!

After deployment, your ClassPDF application will be available at:
- `https://classpdf.surge.sh` (default)
- `https://your-custom-name.surge.sh` (if you chose custom)

## 🔄 Updating Your Site

Made changes? Just run surge again:
```bash
surge
```

## 🎉 Test Your Deployment

1. **Visit your site** in a browser
2. **Create accounts**: Try both teacher and student registration
3. **Upload PDFs**: Test the teacher upload functionality
4. **View assignments**: Check the student interface

## 🛠️ Automation Scripts

### Windows Users
Double-click `deploy.bat` for easy deployment

### Mac/Linux Users
Run `./deploy.sh` for easy deployment

## 🆘 Need Help?

### Common Issues:

**"surge: command not found"**
```bash
npm install -g surge
```

**"Permission denied"**
```bash
sudo npm install -g surge  # Mac/Linux
```

**Site not loading properly**
- Clear browser cache
- Check browser console for errors
- Try incognito/private browsing mode

## 📁 What Gets Deployed

Only the essential files are deployed:
- ✅ HTML pages (index.html, dashboards, etc.)
- ✅ CSS stylesheets
- ✅ JavaScript files
- ✅ PDF.js libraries
- ❌ Development files (excluded via .surgeignore)

## 🔗 Useful Commands

```bash
# Deploy to specific domain
surge --domain my-custom-name.surge.sh

# Check surge help
surge --help

# Remove/delete your site
surge teardown your-domain.surge.sh

# List your surge projects
surge list
```

## 🎊 You're Done!

Your ClassPDF application is now live on the internet and ready to use! 