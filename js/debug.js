/**
 * Debug script to check for JavaScript errors
 */

console.log('Debug script loaded successfully');

// Check if DOM elements are found
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Check for modal elements
    const modal = document.getElementById('login-modal');
    console.log('Modal element found:', !!modal);
    
    // Check for login buttons
    const teacherLoginBtn = document.getElementById('teacher-login');
    const studentLoginBtn = document.getElementById('student-login');
    console.log('Teacher login button found:', !!teacherLoginBtn);
    console.log('Student login button found:', !!studentLoginBtn);
    
    // Check for hero section buttons
    const btnTeacher = document.getElementById('btn-teacher');
    const btnStudent = document.getElementById('btn-student');
    console.log('Teacher hero button found:', !!btnTeacher);
    console.log('Student hero button found:', !!btnStudent);
    
    // Check if Auth is loaded
    console.log('Auth module loaded:', typeof window.Auth !== 'undefined');
    
    // Add test click listeners
    if (btnTeacher) {
        btnTeacher.addEventListener('click', () => {
            console.log('Teacher button clicked');
        });
    }
    
    if (btnStudent) {
        btnStudent.addEventListener('click', () => {
            console.log('Student button clicked');
        });
    }
}); 