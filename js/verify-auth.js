/**
 * Verification script for Auth module
 * This script will verify that the Auth module is working correctly
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Verification script loaded');
    
    // Verify that Auth object exists
    if (typeof window.Auth === 'undefined') {
        console.error('Auth object is not defined');
        return;
    }
    
    console.log('Auth object exists');
    
    // Verify that Auth methods exist
    const methods = ['hashPassword', 'register', 'login', 'isLoggedIn', 'getCurrentUser', 'logout'];
    const missingMethods = [];
    
    methods.forEach(method => {
        if (typeof Auth[method] !== 'function') {
            missingMethods.push(method);
            console.error(`Auth.${method} is not a function`);
        } else {
            console.log(`Auth.${method} is a function`);
        }
    });
    
    if (missingMethods.length > 0) {
        console.error('The following methods are missing:', missingMethods.join(', '));
    } else {
        console.log('All Auth methods are present');
    }
    
    // Verify that the users array is initialized
    console.log('Auth.users is', Array.isArray(Auth.users) ? 'an array' : 'not an array');
    console.log('Auth.users length:', Auth.users.length);
    
    // Add test users if none exist
    if (Auth.users.length === 0) {
        console.log('No users found, adding test users');
        const testTeacher = {
            username: 'test_teacher',
            password: 'password',
            fullname: 'Test Teacher',
            email: 'teacher@test.com',
            type: 'teacher',
            school: 'Test School'
        };
        
        const teacherResult = Auth.register(testTeacher);
        console.log('Teacher registration result:', teacherResult);
        
        const testStudent = {
            username: 'test_student',
            password: 'password',
            fullname: 'Test Student',
            email: 'student@test.com',
            type: 'student',
            grade: '10'
        };
        
        const studentResult = Auth.register(testStudent);
        console.log('Student registration result:', studentResult);
    }
    
    // Verify that the login function works
    console.log('Testing login with test_teacher');
    const loginResult = Auth.login('test_teacher', 'password');
    console.log('Login result:', loginResult);
    
    // Verify that isLoggedIn works
    console.log('isLoggedIn result:', Auth.isLoggedIn());
    
    // Verify that getCurrentUser works
    const currentUser = Auth.getCurrentUser();
    console.log('getCurrentUser result:', currentUser);
    
    // Verify that logout works
    console.log('Testing logout');
    const logoutResult = Auth.logout();
    console.log('Logout result:', logoutResult);
    console.log('isLoggedIn after logout:', Auth.isLoggedIn());
}); 