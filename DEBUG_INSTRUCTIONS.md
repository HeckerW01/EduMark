# ClassPDF - Debug Instructions

This document provides instructions for debugging issues with the student assignment view in ClassPDF.

## Issue Description

The problem occurs when students cannot view their assignments in the student dashboard. This may be due to several potential causes:

1. Missing or corrupted data in localStorage
2. Authentication issues (not correctly logged in as a student)
3. Missing or invalid assignment or PDF references
4. Issues with the assignment viewer

## Debugging Tools

We've provided several debugging tools to help diagnose and fix these issues:

### 1. Setup Page (setup.html)

This page allows you to:
- Set up test data in localStorage 
- Login as a student or teacher
- View all data currently in localStorage

### 2. Debug Helper Script (debug-helper.js)

This script can be injected into any page to:
- Run diagnostics on the current data
- Fix common issues automatically
- Redirect to a working assignment

## How to Debug

Follow these steps to debug the student assignment viewing issue:

### Step 1: Set Up Test Data

1. Open `setup.html` in your browser
2. Click "Setup Test Data" to populate localStorage with sample data
3. Click "Login as Student" to ensure you're logged in as a student
4. Verify that the localStorage data shows:
   - userType: "student"
   - username: "student1"
   - teacherAssignments: contains at least one active assignment
   - teacherUploads: contains at least one PDF
   - studentSubmissions: contains at least one submission (optional)

### Step 2: Test the Student Dashboard

1. Click "Go to Student Dashboard" from the setup page
2. Check if assignments appear in the dashboard
3. If assignments still don't appear, move to Step 3

### Step 3: Use the Debug Helper

Method 1: Through Console
1. Open DevTools in your browser (F12 or right-click > Inspect)
2. Go to the Console tab
3. Run this command to inject the debug helper:
   ```javascript
   const script = document.createElement('script'); 
   script.src = 'debug-helper.js'; 
   document.body.appendChild(script);
   ```
4. A debug panel should appear on the page
5. Click "Run Diagnostics" to see what might be wrong
6. Click "Fix Issues" to automatically fix common problems
7. If the issue is fixed, click "Go To Assignment" to test opening an assignment

Method 2: Bookmarklet (for quicker debugging)
1. Create a new bookmark in your browser
2. Name it "ClassPDF Debug"
3. Enter this as the URL:
   ```javascript
   javascript:(function(){const script=document.createElement('script');script.src='debug-helper.js';document.body.appendChild(script);})();
   ```
4. When on the student dashboard, click this bookmark to inject the debug helper

## Common Issues and Fixes

### No Assignments Showing

This is usually due to one of these issues:
- Not logged in as a student
- No assignments in localStorage
- No PDF references in localStorage
- All assignments have status that isn't "active"

The debug helper script will automatically fix these issues by:
1. Setting user as a student if needed
2. Adding sample assignments if none exist
3. Adding sample PDFs if none exist
4. Setting at least one assignment to "active" status

### Assignment Viewer Not Working

If you can see assignments but can't open them:
1. Use the debug helper to verify PDF references are correct
2. Check the URL when clicking an assignment (should be `assignment-viewer.html?id=XXX`)
3. Check the browser console for any JavaScript errors

### PDF Rendering Issues

If the assignment opens but the PDF doesn't display:
1. Check that the PDF URL is valid and accessible
2. Verify that the assignmentId in the URL matches an existing assignment
3. Use the debug helper's "Go To Assignment" button to test with a known good assignment

## Need More Help?

If these debugging tools don't resolve the issue, please provide:
1. Screenshots of the debug panel output
2. The contents of localStorage (from setup.html)
3. Any error messages from the browser console 