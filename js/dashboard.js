/**
 * Common dashboard functionality for ClassPDF
 * Handles basic dashboard interactions shared between teacher and student dashboards
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard script loaded");
    
    // Set user name in header
    const username = localStorage.getItem('username');
    const userNameElement = document.getElementById('user-name') || document.getElementById('teacher-name');
    
    if (userNameElement && username) {
        userNameElement.textContent = username;
    }
    
    // Logout functionality if button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userType');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }
    
    // Utility functions that can be used by both dashboards
    window.formatDate = function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    window.formatFileSize = function(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };
}); 