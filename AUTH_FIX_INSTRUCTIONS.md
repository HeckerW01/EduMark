# ClassPDF Authentication Fix

This document provides solutions for the issue where your user authentication gets lost (you are logged out) when navigating between pages or viewing assignments.

## The Issue

When clicking "View Assignment" or "Work on Assignment" buttons, the application loses authentication data stored in localStorage, causing you to be logged out and redirected to the login page.

## Quick Fix Options

Here are three ways to fix the issue:

### Method 1: Use the Setup Tool

1. Open `setup.html` in your browser
2. Click "Login as Student"
3. Click "Go to Student Dashboard"
4. If you get logged out, return to `setup.html` and repeat steps 2-3

### Method 2: Use the Auth Fix Script (Recommended)

1. Open the page where you're having issues
2. Open your browser's developer tools:
   - Chrome/Edge: Press F12 or Ctrl+Shift+I
   - Firefox: Press F12 or Ctrl+Shift+I
   - Safari: Enable developer tools in preferences first, then Cmd+Option+I
3. Go to the Console tab
4. Copy and paste this one line:
   ```javascript
   const script = document.createElement('script'); script.src = 'auth-fix.js'; document.body.appendChild(script);
   ```
5. Press Enter to run it
6. A "Fix Authentication" button will appear in the top-right corner
7. Click the button to fix your authentication and reload the page

### Method 3: Direct Fix via Console

1. Open the page where you're having issues
2. Open browser's developer tools (F12)
3. Go to the Console tab
4. Copy and paste these two commands:
   ```javascript
   localStorage.setItem('userType', 'student');
   localStorage.setItem('username', 'student1');
   ```
5. Press Enter to run them
6. Reload the page with F5 or the reload button

## Why This Happens

The issue occurs due to how the PDF viewer iframe interacts with localStorage. When the iframe loads content from an external source (like the sample PDFs), it can sometimes clear localStorage data for security reasons.

## Permanent Fixes Implemented

We've implemented several fixes to prevent this issue:

1. Added backup authentication in sessionStorage
2. Modified the assignment viewer to check for backup authentication
3. Added automatic restoration of authentication data when needed
4. Created utility scripts to easily fix authentication when it occurs

## For Developers

If you're developing or modifying the ClassPDF application, note these improvements:

1. The `openAssignment()` and `viewSubmission()` functions now backup authentication to sessionStorage
2. The assignment viewer page checks sessionStorage if localStorage authentication is missing
3. Modal close events check and restore authentication if needed

These changes should prevent most authentication loss issues while navigating through the application. 