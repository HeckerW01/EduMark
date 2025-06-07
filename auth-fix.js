/**
 * ClassPDF Authentication Fix Utility
 * 
 * This script can be loaded in any page to fix authentication issues.
 * To use it:
 * 1. Open your browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute it
 */

(function() {
    console.log('ClassPDF Authentication Fix Utility loaded');
    
    // Check current authentication
    const currentUserType = localStorage.getItem('userType');
    const currentUsername = localStorage.getItem('username');
    
    console.log('Current authentication state:', { 
        userType: currentUserType || 'null', 
        username: currentUsername || 'null'
    });
    
    // Check for backup in sessionStorage
    const backupUserType = sessionStorage.getItem('backup_userType');
    const backupUsername = sessionStorage.getItem('backup_username');
    
    if (backupUserType && backupUsername) {
        console.log('Found backup authentication in sessionStorage:', {
            userType: backupUserType,
            username: backupUsername
        });
    }
    
    // Create the fix button
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Fix Authentication';
    fixButton.style.position = 'fixed';
    fixButton.style.top = '10px';
    fixButton.style.right = '10px';
    fixButton.style.zIndex = '10000';
    fixButton.style.padding = '10px 15px';
    fixButton.style.backgroundColor = '#4CAF50';
    fixButton.style.color = 'white';
    fixButton.style.border = 'none';
    fixButton.style.borderRadius = '4px';
    fixButton.style.fontWeight = 'bold';
    fixButton.style.cursor = 'pointer';
    
    // Create the status container
    const statusContainer = document.createElement('div');
    statusContainer.style.position = 'fixed';
    statusContainer.style.top = '60px';
    statusContainer.style.right = '10px';
    statusContainer.style.padding = '10px';
    statusContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    statusContainer.style.color = 'white';
    statusContainer.style.borderRadius = '4px';
    statusContainer.style.maxWidth = '300px';
    statusContainer.style.zIndex = '10000';
    statusContainer.style.display = 'none';
    
    // Add elements to the page
    document.body.appendChild(fixButton);
    document.body.appendChild(statusContainer);
    
    // Event listener for the fix button
    fixButton.addEventListener('click', () => {
        statusContainer.style.display = 'block';
        statusContainer.innerHTML = '<p>Fixing authentication...</p>';
        
        // Try to restore from backup first
        if (backupUserType && backupUsername) {
            localStorage.setItem('userType', backupUserType);
            localStorage.setItem('username', backupUsername);
            
            statusContainer.innerHTML += '<p>✅ Restored authentication from backup</p>';
        } else {
            // If no backup, set to default student account
            localStorage.setItem('userType', 'student');
            localStorage.setItem('username', 'student1');
            
            statusContainer.innerHTML += '<p>✅ Set authentication to default student account</p>';
        }
        
        // Also back up to sessionStorage
        sessionStorage.setItem('backup_userType', localStorage.getItem('userType'));
        sessionStorage.setItem('backup_username', localStorage.getItem('username'));
        
        statusContainer.innerHTML += '<p>✅ Created backup in sessionStorage</p>';
        statusContainer.innerHTML += '<p>Authentication fixed. Reloading page in 3 seconds...</p>';
        
        // Reload the page after a delay
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    });
    
    // Automatically fix if both localStorage and sessionStorage are empty
    if ((!currentUserType || !currentUsername) && (!backupUserType || !backupUsername)) {
        console.log('No authentication found in localStorage or sessionStorage. Auto-fixing...');
        
        localStorage.setItem('userType', 'student');
        localStorage.setItem('username', 'student1');
        sessionStorage.setItem('backup_userType', 'student');
        sessionStorage.setItem('backup_username', 'student1');
        
        console.log('Authentication set to default student account');
        console.log('Reload the page to apply changes');
    }
    
    // Return the fix function for manual use in console
    return {
        fix: function(userType = 'student', username = 'student1') {
            localStorage.setItem('userType', userType);
            localStorage.setItem('username', username);
            sessionStorage.setItem('backup_userType', userType);
            sessionStorage.setItem('backup_username', username);
            
            console.log(`Authentication set to ${userType}/${username}`);
            console.log('Reload the page to apply changes');
        },
        status: function() {
            console.log('Current localStorage:', {
                userType: localStorage.getItem('userType') || 'null',
                username: localStorage.getItem('username') || 'null'
            });
            console.log('Backup in sessionStorage:', {
                userType: sessionStorage.getItem('backup_userType') || 'null',
                username: sessionStorage.getItem('backup_username') || 'null'
            });
        },
        reload: function() {
            window.location.reload();
        }
    };
})(); 