# Deploying ClassPDF to Surge.sh

## Prerequisites

1. **Node.js** installed on your computer
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version

2. **Surge.sh account** (will be created during first deployment)

## Quick Deployment Steps

### 1. Install Surge globally
```bash
npm install -g surge
```

### 2. Navigate to your ClassPDF directory
```bash
cd /path/to/your/classpdf-folder
```

### 3. Deploy with one command
```bash
surge
```

### 4. Follow the prompts:
- **Email**: Enter your email (creates account on first use)
- **Password**: Choose a password
- **Project path**: Press Enter (uses current directory)
- **Domain**: Press Enter to use the default `classpdf.surge.sh` or enter your custom domain

## Alternative Deployment Methods

### Using npm scripts (after first deployment)
```bash
# Quick deploy
npm run deploy

# Deploy to a specific domain
npm run deploy-domain your-custom-name.surge.sh
```

### Custom Domain Deployment
```bash
surge --domain your-custom-name.surge.sh
```

## Managing Your Deployment

### Update your site
Just run `surge` again from the project directory to update your live site.

### View your deployed site
After deployment, your site will be available at:
- Default: `https://classpdf.surge.sh`
- Custom: `https://your-custom-name.surge.sh`

### Teardown (delete) your site
```bash
surge teardown your-domain.surge.sh
```

## Important Notes

1. **Data Storage**: ClassPDF uses browser localStorage, so data is stored locally on each user's device
2. **HTTPS**: Surge.sh automatically provides HTTPS for all deployments
3. **Custom Domains**: You can use your own domain by updating the CNAME file
4. **File Size**: Surge.sh has a 50MB limit per deployment (ClassPDF is well under this)

## Troubleshooting

### If you get permission errors:
```bash
sudo npm install -g surge
```

### If deployment fails:
1. Check your internet connection
2. Make sure you're in the correct directory
3. Try running `surge --verbose` for detailed error messages

### If the site doesn't work after deployment:
1. Check the browser console for errors
2. Ensure all file paths are relative (not absolute)
3. Clear your browser cache and try again

## File Structure

The following files will be deployed to surge.sh:
```
├── index.html              # Main landing page
├── teacher-dashboard.html  # Teacher interface
├── student-dashboard.html  # Student interface
├── assignment-viewer.html  # Assignment viewing
├── pdf-viewer.html         # PDF viewing interface
├── css/
│   ├── style.css          # Main styles
│   └── dashboard.css      # Dashboard styles
├── js/
│   ├── auth.js           # Authentication
│   ├── main.js           # Main application logic
│   ├── teacher-dashboard.js
│   ├── student-dashboard.js
│   ├── pdf.min.js        # PDF.js library
│   └── pdf.worker.min.js # PDF.js worker
└── CNAME                 # Domain configuration
```

## Test Your Deployment

After deployment, test these features:
1. ✅ Landing page loads
2. ✅ User registration/login works
3. ✅ Teacher can upload PDFs
4. ✅ Student can view assignments
5. ✅ PDF viewer functions correctly

## Support

If you encounter issues:
1. Check the browser developer console for errors
2. Verify all files uploaded correctly to surge.sh
3. Test locally first to ensure the application works 