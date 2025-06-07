# ClassPDF Authentication System

This document explains how the client-side authentication system works for the ClassPDF application.

## Overview

The ClassPDF application includes a client-side authentication system that works entirely in the browser using localStorage. While not as secure as a server-based authentication system, it provides a reasonable level of security for a client-side only application hosted on platforms like surge.sh.

## Key Security Features

1. **Password Hashing**: Passwords are never stored in plain text. They are hashed using a basic hashing algorithm with the username as a salt.

2. **Session Management**: User sessions are managed through localStorage, with separate storage for different session information.

3. **Authorization Checks**: Each dashboard checks if the user is logged in and has the correct user type before displaying content.

## Files Involved

- **js/auth.js**: Contains the main Auth class that handles all authentication functionality
- **js/main.js**: Handles the login/registration UI and form submissions
- **js/dashboard.js**: Shared dashboard functionality including session verification
- **setup-test-data.js**: Creates test users with properly hashed passwords

## How Registration Works

1. User fills out the registration form (either teacher or student)
2. Form data is collected and passed to the `Auth.register()` method
3. The password is hashed (never stored as plain text)
4. The user is added to the users array in localStorage
5. The user is redirected to login with their new credentials

## How Login Works

1. User enters their username and password
2. The `Auth.login()` method hashes the entered password and compares it to the stored hash
3. If valid, a session is created and stored in localStorage
4. The user is redirected to the appropriate dashboard based on their user type

## Security Limitations

This system has the following limitations that users should be aware of:

1. All data is stored client-side in localStorage, which is accessible to client-side code
2. The hashing algorithm is implemented in JavaScript and can be inspected
3. There is no protection against brute force attacks
4. The authentication is only for demonstration purposes and would not be suitable for a production application with sensitive data

## Test Users

The system comes with pre-configured test users:
- Teacher: username=teacher1, password=password
- Student: username=student1, password=password

## For Production Use

For a real production application that needs proper security:

1. Implement a proper backend authentication system with server-side storage
2. Use HTTPS for all communications
3. Utilize proper password hashing libraries (bcrypt, Argon2, etc.)
4. Implement token-based authentication with proper expiration and refresh mechanisms
5. Add rate limiting to prevent brute force attacks 