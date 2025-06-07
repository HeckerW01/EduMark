/**
 * Authentication module for ClassPDF
 * Handles user registration, login, and session management
 */

// Create Auth as a global object instead of a class
window.Auth = {
  // Initialize users array from localStorage or create empty one
  users: JSON.parse(localStorage.getItem('users')) || [],

  /**
   * Hash a password using a simple but better-than-plaintext approach
   */
  hashPassword: function(password, username) {
    // This is a simple hash function for client-side demo purposes only
    // In a real app, you'd use a proper hashing library with salt
    let hash = 0;
    const combined = password + username + "ClassPDFSalt";
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  },

  /**
   * Register a new user
   */
  register: function(userData) {
    console.log("Registering user with data:", userData);
    
    // Check if username already exists
    const existingUser = this.users.find(user => user.username === userData.username);
    if (existingUser) {
      console.log("Username already exists:", userData.username);
      return { 
        success: false, 
        message: 'Username already exists' 
      };
    }
    
    // Hash the password
    const hashedPassword = this.hashPassword(userData.password, userData.username);
    console.log("Password hashed for user:", userData.username);
    
    // Create the user object (without storing plain password)
    const newUser = {
      username: userData.username,
      passwordHash: hashedPassword,
      fullname: userData.fullname,
      email: userData.email,
      type: userData.type,
      createdAt: new Date().toISOString()
    };
    
    // Add additional fields based on user type
    if (userData.type === 'teacher' && userData.school) {
      newUser.school = userData.school;
    }
    if (userData.type === 'student' && userData.grade) {
      newUser.grade = userData.grade;
    }
    
    console.log("New user object created:", newUser);
    
    // Add user to array and save to localStorage
    this.users.push(newUser);
    console.log("User added to users array. New length:", this.users.length);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(this.users));
    console.log("Users saved to localStorage:", JSON.parse(localStorage.getItem('users')));
    
    return { 
      success: true, 
      message: 'Registration successful' 
    };
  },

  /**
   * Login a user
   */
  login: function(username, password) {
    console.log("Login attempt for:", username);
    console.log("Current users in database:", this.users);
    
    // Find the user
    const user = this.users.find(user => user.username === username);
    
    if (!user) {
      console.log("User not found in database");
      return { 
        success: false, 
        message: 'User not found' 
      };
    }
    
    console.log("User found:", { username: user.username, type: user.type });
    
    // Hash the provided password and compare
    const hashedPassword = this.hashPassword(password, username);
    console.log("Password check:", { 
      storedHash: user.passwordHash,
      calculatedHash: hashedPassword,
      matches: user.passwordHash === hashedPassword
    });
    
    if (user.passwordHash !== hashedPassword) {
      return { 
        success: false, 
        message: 'Incorrect password' 
      };
    }
    
    // Set user session
    this.setSession(user);
    console.log("Session set for user:", user.username);
    
    return { 
      success: true, 
      message: 'Login successful',
      userType: user.type
    };
  },

  /**
   * Set user session
   */
  setSession: function(user) {
    // Create a session object
    const session = {
      username: user.username,
      userType: user.type,
      fullname: user.fullname,
      loggedInAt: new Date().toISOString()
    };

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(session));
    localStorage.setItem('userType', user.type);
    localStorage.setItem('username', user.username);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: function() {
    console.log("Checking if user is logged in");
    return localStorage.getItem('currentUser') !== null;
  },

  /**
   * Get current user
   */
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem('currentUser'));
  },

  /**
   * Logout user
   */
  logout: function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    return true;
  }
}; 