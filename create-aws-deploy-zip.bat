@echo off
echo Creating AWS deployment zip...

:: Create temp directory for deployment files
if exist aws-deploy rmdir /s /q aws-deploy
mkdir aws-deploy

:: Copy essential application files
copy package.json aws-deploy\
copy server.js aws-deploy\
copy index.html aws-deploy\
copy *.html aws-deploy\
copy Dockerfile aws-deploy\
copy env.example aws-deploy\

:: Copy directories
xcopy /s /e js aws-deploy\js\
xcopy /s /e css aws-deploy\css\
xcopy /s /e public aws-deploy\public\
xcopy /s /e config aws-deploy\config\
xcopy /s /e services aws-deploy\services\

:: Create the zip file
powershell -command "Compress-Archive -Path 'aws-deploy\*' -DestinationPath 'ClassPDF-AWS-Deploy.zip' -Force"

:: Cleanup
rmdir /s /q aws-deploy

echo Deployment zip created: ClassPDF-AWS-Deploy.zip
echo Ready to upload to your AWS EC2 instance!
pause 