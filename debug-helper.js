/**
 * ClassPDF Debug Helper
 * 
 * This script can be injected to diagnose and fix issues with the student assignment view.
 * It will analyze localStorage data, fix any issues, and provide details on what was fixed.
 */

(function() {
    // Create the debug panel UI
    createDebugPanel();
    
    /**
     * Creates a floating debug panel on the page
     */
    function createDebugPanel() {
        // Create the panel element
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '20px';
        panel.style.right = '20px';
        panel.style.width = '300px';
        panel.style.maxHeight = '500px';
        panel.style.backgroundColor = '#f8f8f8';
        panel.style.border = '1px solid #ccc';
        panel.style.borderRadius = '5px';
        panel.style.padding = '10px';
        panel.style.zIndex = '10000';
        panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        panel.style.overflow = 'auto';
        
        // Panel header
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #333;">ClassPDF Debug</h3>
                <button id="debug-close" style="background: none; border: none; cursor: pointer; font-weight: bold;">×</button>
            </div>
            <div id="debug-content" style="margin-bottom: 10px;"></div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <button id="debug-run" style="padding: 5px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Run Diagnostics</button>
                <button id="debug-fix" style="padding: 5px; background-color: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Fix Issues</button>
                <button id="debug-redirect" style="padding: 5px; background-color: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">Go To Assignment</button>
            </div>
        `;
        
        // Add the panel to the page
        document.body.appendChild(panel);
        
        // Set up event listeners
        document.getElementById('debug-close').addEventListener('click', () => {
            panel.remove();
        });
        
        document.getElementById('debug-run').addEventListener('click', runDiagnostics);
        document.getElementById('debug-fix').addEventListener('click', fixIssues);
        document.getElementById('debug-redirect').addEventListener('click', redirectToAssignment);
    }
    
    /**
     * Logs a message to the debug panel
     */
    function logMessage(message, type = 'info') {
        const content = document.getElementById('debug-content');
        const messageEl = document.createElement('div');
        
        // Set message styling based on type
        let color = '#333';
        switch(type) {
            case 'error':
                color = '#f44336';
                break;
            case 'warning':
                color = '#ff9800';
                break;
            case 'success':
                color = '#4caf50';
                break;
        }
        
        messageEl.style.color = color;
        messageEl.style.margin = '5px 0';
        messageEl.style.fontSize = '14px';
        messageEl.innerHTML = message;
        
        content.appendChild(messageEl);
    }
    
    /**
     * Runs diagnostics on the student dashboard and assignments
     */
    function runDiagnostics() {
        // Clear previous diagnostics
        document.getElementById('debug-content').innerHTML = '';
        
        logMessage('<strong>Running diagnostics...</strong>');
        
        // Check authentication
        const userType = localStorage.getItem('userType');
        const username = localStorage.getItem('username');
        
        if (!userType || !username) {
            logMessage('⚠️ Not logged in! Authentication required.', 'error');
        } else if (userType !== 'student') {
            logMessage(`⚠️ Logged in as ${userType}, not as student.`, 'error');
        } else {
            logMessage(`✓ Logged in as ${username} (${userType})`, 'success');
        }
        
        // Check for teacher assignments
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        
        if (assignments.length === 0) {
            logMessage('⚠️ No assignments found in localStorage!', 'error');
        } else {
            logMessage(`✓ Found ${assignments.length} assignments in localStorage`, 'success');
            
            // Check each assignment's status
            let activeCount = 0;
            assignments.forEach(assignment => {
                if (assignment.status === 'active') {
                    activeCount++;
                }
            });
            
            if (activeCount === 0) {
                logMessage('⚠️ No active assignments found!', 'warning');
            } else {
                logMessage(`✓ Found ${activeCount} active assignments`, 'success');
            }
        }
        
        // Check for PDFs
        const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
        
        if (uploads.length === 0) {
            logMessage('⚠️ No PDF uploads found in localStorage!', 'error');
        } else {
            logMessage(`✓ Found ${uploads.length} PDF uploads in localStorage`, 'success');
            
            // Check if PDFs are correctly linked to assignments
            let linkedCount = 0;
            assignments.forEach(assignment => {
                const pdf = uploads.find(u => u.id === assignment.pdfId);
                if (pdf) {
                    linkedCount++;
                } else {
                    logMessage(`⚠️ Assignment "${assignment.title}" references missing PDF ID: ${assignment.pdfId}`, 'warning');
                }
            });
            
            if (linkedCount === assignments.length) {
                logMessage('✓ All assignments have valid PDF references', 'success');
            }
        }
        
        // Check for student submissions
        const submissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
        
        if (submissions.length === 0) {
            logMessage('⚠️ No student submissions found in localStorage!', 'warning');
        } else {
            logMessage(`✓ Found ${submissions.length} student submissions in localStorage`, 'success');
            
            // Check if submissions are correctly linked to assignments
            let linkedCount = 0;
            submissions.forEach(submission => {
                const assignment = assignments.find(a => a.id === submission.assignmentId);
                if (assignment) {
                    linkedCount++;
                } else {
                    logMessage(`⚠️ Submission ID ${submission.id} references missing assignment ID: ${submission.assignmentId}`, 'warning');
                }
            });
            
            if (linkedCount === submissions.length) {
                logMessage('✓ All submissions have valid assignment references', 'success');
            }
        }
        
        // Check current page
        const currentPage = window.location.pathname.split('/').pop();
        logMessage(`Current page: ${currentPage || 'index.html'}`);
        
        // Summary
        logMessage('<strong>Diagnostic summary</strong>');
        if (
            userType === 'student' && 
            username && 
            assignments.length > 0 && 
            uploads.length > 0
        ) {
            logMessage('✓ Basic requirements for student assignments are met', 'success');
        } else {
            logMessage('⚠️ Issues found that may affect assignment viewing', 'warning');
        }
    }
    
    /**
     * Fixes potential issues with student assignments
     */
    function fixIssues() {
        document.getElementById('debug-content').innerHTML = '';
        logMessage('<strong>Attempting to fix issues...</strong>');
        
        // 1. Fix user authentication if needed
        const userType = localStorage.getItem('userType');
        const username = localStorage.getItem('username');
        
        if (!userType || userType !== 'student' || !username) {
            localStorage.setItem('userType', 'student');
            localStorage.setItem('username', 'student1');
            logMessage('Fixed: Set user as student1', 'success');
        }
        
        // 2. Check and add assignments if missing
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        let assignmentsModified = false;
        
        if (assignments.length === 0) {
            // Create sample assignments
            const now = new Date();
            const weekFromNow = new Date(now);
            weekFromNow.setDate(now.getDate() + 7);
            
            const newAssignments = [
                {
                    id: 'assignment1',
                    title: 'Math Homework 1',
                    description: 'Complete all problems on the worksheet',
                    pdfId: 'pdf1',
                    assignedBy: 'teacher1',
                    dueDate: weekFromNow.toISOString(),
                    status: 'active',
                    createdAt: now.toISOString()
                }
            ];
            
            localStorage.setItem('teacherAssignments', JSON.stringify(newAssignments));
            assignmentsModified = true;
            logMessage('Fixed: Added sample assignment', 'success');
        } else {
            // Make sure at least one assignment is active
            let activeCount = assignments.filter(a => a.status === 'active').length;
            
            if (activeCount === 0 && assignments.length > 0) {
                assignments[0].status = 'active';
                localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
                assignmentsModified = true;
                logMessage(`Fixed: Set "${assignments[0].title}" to active status`, 'success');
            }
        }
        
        // 3. Check and add PDF uploads if missing
        const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
        let uploadsModified = false;
        
        if (uploads.length === 0) {
            // Create sample PDFs
            const newUploads = [
                {
                    id: 'pdf1',
                    name: 'Sample Assignment.pdf',
                    url: 'https://www.africau.edu/images/default/sample.pdf', // Public sample PDF
                    uploadedBy: 'teacher1',
                    uploadedAt: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('teacherUploads', JSON.stringify(newUploads));
            uploadsModified = true;
            logMessage('Fixed: Added sample PDF', 'success');
        }
        
        // 4. Check that assignments reference valid PDFs
        if (assignmentsModified || uploadsModified) {
            const updatedAssignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
            const updatedUploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
            
            let assignmentsFixed = false;
            
            for (let i = 0; i < updatedAssignments.length; i++) {
                const assignment = updatedAssignments[i];
                const pdf = updatedUploads.find(u => u.id === assignment.pdfId);
                
                if (!pdf && updatedUploads.length > 0) {
                    // Link to first available PDF
                    assignment.pdfId = updatedUploads[0].id;
                    assignmentsFixed = true;
                    logMessage(`Fixed: Linked assignment "${assignment.title}" to available PDF`, 'success');
                }
            }
            
            if (assignmentsFixed) {
                localStorage.setItem('teacherAssignments', JSON.stringify(updatedAssignments));
            }
        }
        
        // 5. Check if displayCurrentAssignments function exists and run it
        if (typeof displayCurrentAssignments === 'function') {
            try {
                displayCurrentAssignments();
                logMessage('Refreshed assignment display', 'success');
            } catch (error) {
                logMessage(`Error refreshing assignments: ${error.message}`, 'error');
            }
        } else {
            logMessage('Note: Could not refresh assignment display (function not available)', 'warning');
        }
        
        logMessage('<strong>Fix complete!</strong> Refresh the page to see changes.', 'success');
    }
    
    /**
     * Redirects to the first available assignment
     */
    function redirectToAssignment() {
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        const activeAssignments = assignments.filter(a => a.status === 'active');
        
        if (activeAssignments.length > 0) {
            const assignmentId = activeAssignments[0].id;
            window.location.href = `assignment-viewer.html?id=${assignmentId}`;
        } else {
            logMessage('No active assignments found to redirect to', 'error');
        }
    }
})(); 