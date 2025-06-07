# Deploying ClassPDF

## Option 1: Deploy using Netlify Drop (Easiest, No Command Line Required)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Simply drag and drop your entire ClassPDF folder onto the Netlify Drop zone
3. Wait for the upload to complete (usually takes less than a minute)
4. Your site will be deployed with a random subdomain (e.g., random-name.netlify.app)
5. You can customize the subdomain or add your own domain through the Netlify dashboard

## Option 2: Deploy using Surge.sh (Requires Node.js)

If you prefer command line deployment:

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Open a command prompt/terminal and navigate to your ClassPDF folder
3. Install Surge by running: `npm install -g surge`
4. Deploy by running: `surge`
5. Follow the prompts to create an account and deploy
6. Your site will be deployed with a random surge.sh subdomain

## Option 3: Deploy using GitHub Pages

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload your ClassPDF files to the repository
4. Go to repository Settings > Pages
5. Enable GitHub Pages and select the main branch
6. Your site will be published at username.github.io/repository-name

## Important Note About Data Storage

Since ClassPDF uses browser localStorage for data persistence, each user's data will be specific to their browser and device. This is perfect for demonstration purposes but for a production application, you would want to implement server-side storage. 