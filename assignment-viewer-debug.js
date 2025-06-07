/**
 * Assignment Viewer Debug Script
 * This script helps diagnose and fix authentication issues when viewing assignments
 */

(function() {
    console.log('Assignment Viewer Debug Script loaded');
    
    // Store the original authentication state
    const originalUserType = localStorage.getItem('userType');
    const originalUsername = localStorage.getItem('username');
    
    console.log('Current authentication:', { userType: originalUserType, username: originalUsername });
    
    // Store the assignment ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('id');
    
    console.log('Assignment ID from URL:', assignmentId);
    
    // Create debug UI
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'fixed';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugContainer.style.color = 'white';
    debugContainer.style.padding = '10px';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.zIndex = '9999';
    debugContainer.style.maxHeight = '300px';
    debugContainer.style.overflowY = 'auto';
    debugContainer.style.width = '300px';
    debugContainer.style.fontFamily = 'monospace';
    debugContainer.style.fontSize = '12px';
    
    // Add buttons
    const fixAuthButton = document.createElement('button');
    fixAuthButton.textContent = 'Fix Authentication';
    fixAuthButton.style.marginRight = '5px';
    fixAuthButton.style.padding = '5px';
    fixAuthButton.style.backgroundColor = '#4CAF50';
    fixAuthButton.style.color = 'white';
    fixAuthButton.style.border = 'none';
    fixAuthButton.style.borderRadius = '3px';
    fixAuthButton.style.cursor = 'pointer';
    
    const checkDataButton = document.createElement('button');
    checkDataButton.textContent = 'Check Assignment Data';
    checkDataButton.style.marginRight = '5px';
    checkDataButton.style.padding = '5px';
    checkDataButton.style.backgroundColor = '#2196F3';
    checkDataButton.style.color = 'white';
    checkDataButton.style.border = 'none';
    checkDataButton.style.borderRadius = '3px';
    checkDataButton.style.cursor = 'pointer';
    
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Page';
    reloadButton.style.padding = '5px';
    reloadButton.style.backgroundColor = '#FF9800';
    reloadButton.style.color = 'white';
    reloadButton.style.border = 'none';
    reloadButton.style.borderRadius = '3px';
    reloadButton.style.cursor = 'pointer';
    
    // Log area
    const logArea = document.createElement('div');
    logArea.style.marginTop = '10px';
    logArea.style.borderTop = '1px solid #555';
    logArea.style.paddingTop = '10px';
    
    // Assemble UI
    debugContainer.appendChild(fixAuthButton);
    debugContainer.appendChild(checkDataButton);
    debugContainer.appendChild(reloadButton);
    debugContainer.appendChild(logArea);
    
    // Initialize once DOM is ready
    if (document.body) {
        document.body.appendChild(debugContainer);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(debugContainer);
        });
    }
    
    // Event handlers
    fixAuthButton.addEventListener('click', () => {
        logMessage('Fixing authentication...');
        localStorage.setItem('userType', 'student');
        localStorage.setItem('username', 'student1');
        logMessage('Authentication set to: student/student1');
    });
    
    checkDataButton.addEventListener('click', () => {
        checkAssignmentData();
    });
    
    reloadButton.addEventListener('click', () => {
        window.location.reload();
    });
    
    // Log helper
    function logMessage(message) {
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.style.margin = '5px 0';
        logArea.appendChild(logEntry);
    }
    
    // Check assignment data
    function checkAssignmentData() {
        logMessage('Checking assignment data...');
        
        if (!assignmentId) {
            logMessage('ERROR: No assignment ID in URL');
            return;
        }
        
        // Check assignments in localStorage
        try {
            const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
            logMessage(`Found ${assignments.length} assignments in localStorage`);
            
            const assignment = assignments.find(a => a.id === assignmentId);
            if (assignment) {
                logMessage(`Found assignment: ${assignment.title}`);
                
                // Check PDF
                const pdfId = assignment.pdfId;
                const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
                const pdf = uploads.find(u => u.id === pdfId);
                
                if (pdf) {
                    logMessage(`Found PDF: ${pdf.name}`);
                } else {
                    logMessage(`ERROR: PDF with ID ${pdfId} not found`);
                }
            } else {
                logMessage(`ERROR: Assignment with ID ${assignmentId} not found`);
            }
        } catch (error) {
            logMessage(`Error: ${error.message}`);
        }
    }
    
    // Add event listener to monitor localStorage changes
    window.addEventListener('storage', (event) => {
        if (event.key === 'userType' || event.key === 'username') {
            logMessage(`Storage change: ${event.key} changed from "${event.oldValue}" to "${event.newValue}"`);
        }
    });
    
    // Check if authentication is lost on navigation
    window.addEventListener('beforeunload', () => {
        // Store current auth state before unloading
        const currentUserType = localStorage.getItem('userType');
        const currentUsername = localStorage.getItem('username');
        
        if (currentUserType !== originalUserType || currentUsername !== originalUsername) {
            console.log('Authentication changed before unload:', { 
                original: { userType: originalUserType, username: originalUsername },
                current: { userType: currentUserType, username: currentUsername }
            });
        }
    });
})(); 