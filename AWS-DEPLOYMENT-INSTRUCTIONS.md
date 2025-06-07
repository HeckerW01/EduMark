# AWS EC2 Deployment Instructions

## Step 1: Create the Deployment Zip
Run the batch file to create your deployment package:
```bash
create-aws-deploy-zip.bat
```
This creates `ClassPDF-AWS-Deploy.zip` with all necessary files.

## Step 2: Upload to AWS EC2

### Upload the zip file to your EC2 instance:
```bash
scp ClassPDF-AWS-Deploy.zip ec2-user@your-aws-ip:/home/ec2-user/
```

### Or use SFTP/SCP client like WinSCP or FileZilla

## Step 3: Setup on AWS EC2

### SSH into your EC2 instance:
```bash
ssh ec2-user@your-aws-ip
```

### Install Node.js (if not already installed):
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Unzip and setup the application:
```bash
unzip ClassPDF-AWS-Deploy.zip
cd ClassPDF-AWS-Deploy
npm install
```

### Copy environment file:
```bash
cp env.example .env
```

## Step 4: Configure Security Group
Make sure your EC2 security group allows:
- Port 3000 (or your chosen port) for HTTP traffic
- Port 22 for SSH

## Step 5: Run the Application

### Start the server:
```bash
npm start
```

### Or run with PM2 for production:
```bash
sudo npm install -g pm2
pm2 start server.js --name "classpdf"
pm2 startup
pm2 save
```

## Step 6: Access Your App
Your app will be available at:
```
http://your-aws-public-ip:3000
```

## Troubleshooting
- Check if port 3000 is open in security groups
- Verify Node.js is installed: `node --version`
- Check server logs: `pm2 logs classpdf` (if using PM2)
- Make sure your EC2 instance has enough storage space 