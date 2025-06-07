document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in as a student
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    
    if (!userType || userType !== 'student' || !username) {
        // Redirect to login if not logged in as a student
        window.location.href = 'index.html';
        return;
    }
    
    // Set student name in header
    document.getElementById('student-name').textContent = username;
    
    // Tab navigation
    setupTabNavigation();
    
    // Display assignments
    displayCurrentAssignments();
    displayCompletedAssignments();
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });
});

/**
 * Sets up tab navigation for the dashboard
 */
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.sidebar nav a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            const targetTab = e.target.getAttribute('data-tab');
            e.target.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

/**
 * Displays current assignments for the student
 */
function displayCurrentAssignments() {
    const assignmentsList = document.querySelector('#assignments .assignments-list');
    
    // In a real app, this would fetch assignments from a server
    // For this demo, we'll just get the assignments from localStorage
    const teacherAssignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
    
    // Filter for active assignments
    const currentAssignments = teacherAssignments.filter(assignment => 
        assignment.status === 'active'
    );
    
    if (currentAssignments.length === 0) {
        assignmentsList.innerHTML = '<p class="empty-message">No current assignments.</p>';
        return;
    }
    
    // Get submission data to check which assignments are already started
    const submissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
    
    assignmentsList.innerHTML = '';
    currentAssignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate).toLocaleDateString();
        
        // Get PDF name from the teacher uploads
        const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
        const pdf = uploads.find(u => u.id === assignment.pdfId);
        const pdfName = pdf ? pdf.name : 'Unknown PDF';
        
        // Check if this assignment has a submission in progress
        const submission = submissions.find(sub => sub.assignmentId === assignment.id);
        const status = submission ? 'In Progress' : 'Not Started';
        const statusClass = submission ? 'in-progress' : 'not-started';
        
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'assignment-card';
        assignmentItem.innerHTML = `
            <div class="assignment-details">
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-metadata">
                    <span>PDF: ${pdfName}</span>
                    <span>Due: ${dueDate}</span>
                    <span class="${statusClass}">Status: ${status}</span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="view-btn" data-id="${assignment.id}">Work on Assignment</button>
            </div>
        `;
        assignmentsList.appendChild(assignmentItem);
    });
    
    // Add event listeners to view buttons
    assignmentsList.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assignmentId = e.target.getAttribute('data-id');
            openAssignment(assignmentId);
        });
    });
}

/**
 * Displays completed assignments for the student
 */
function displayCompletedAssignments() {
    const completedList = document.querySelector('#completed .assignments-list');
    
    // Get submission data
    const submissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
    const completedSubmissions = submissions.filter(sub => sub.status === 'submitted');
    
    if (completedSubmissions.length === 0) {
        completedList.innerHTML = '<p class="empty-message">No completed assignments yet.</p>';
        return;
    }
    
    // Get assignments data
    const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
    
    completedList.innerHTML = '';
    completedSubmissions.forEach(submission => {
        const assignment = assignments.find(a => a.id === submission.assignmentId);
        if (!assignment) return;
        
        const submittedDate = new Date(submission.submittedAt).toLocaleDateString();
        
        // Get PDF name from the teacher uploads
        const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
        const pdf = uploads.find(u => u.id === assignment.pdfId);
        const pdfName = pdf ? pdf.name : 'Unknown PDF';
        
        const completedItem = document.createElement('div');
        completedItem.className = 'assignment-card';
        completedItem.innerHTML = `
            <div class="assignment-details">
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-metadata">
                    <span>PDF: ${pdfName}</span>
                    <span>Submitted: ${submittedDate}</span>
                    <span class="grade">${submission.grade ? 'Grade: ' + submission.grade : 'Not graded yet'}</span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="view-btn" data-id="${submission.id}">View Submission</button>
            </div>
        `;
        completedList.appendChild(completedItem);
    });
    
    // Add event listeners to view buttons
    completedList.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const submissionId = e.target.getAttribute('data-id');
            viewSubmission(submissionId);
        });
    });
}

/**
 * Opens an assignment to work on
 */
function openAssignment(assignmentId) {
    // Backup authentication data to sessionStorage
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    
    if (userType && username) {
        sessionStorage.setItem('backup_userType', userType);
        sessionStorage.setItem('backup_username', username);
    }
    
    // Redirect to the assignment viewer page
    window.location.href = `assignment-viewer.html?id=${assignmentId}`;
}

/**
 * Views a submitted assignment
 */
function viewSubmission(submissionId) {
    // Backup authentication data before proceeding
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    
    if (userType && username) {
        sessionStorage.setItem('backup_userType', userType);
        sessionStorage.setItem('backup_username', username);
    }
    
    // Get submission details
    const submissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
    const submission = submissions.find(sub => sub.id === submissionId);
    
    if (!submission) {
        alert('Submission not found');
        return;
    }
    
    // Get assignment details
    const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    
    if (!assignment) {
        alert('Assignment not found');
        return;
    }
    
    // Get PDF details
    const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
    const pdf = uploads.find(u => u.id === assignment.pdfId);
    
    if (!pdf || !pdf.url) {
        alert('PDF not found');
        return;
    }
    
    // Create submission viewer modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="width: 95%; max-width: 1200px;">
            <span class="close">&times;</span>
            <h2>${assignment.title} - Submission</h2>
            
            <div class="submission-info" style="margin-bottom: 1rem;">
                <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
                ${submission.grade ? `<p><strong>Grade:</strong> ${submission.grade}</p>` : '<p><strong>Status:</strong> Not graded yet</p>'}
                ${submission.feedback ? `<p><strong>Feedback:</strong> ${submission.feedback}</p>` : ''}
            </div>
            
            <div class="pdf-container">
                <iframe class="pdf-viewer" src="${pdf.url}" frameborder="0"></iframe>
                <!-- In a real app, this would show the PDF with the student's annotations -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        
        // Verify authentication data wasn't lost
        if (!localStorage.getItem('userType') || !localStorage.getItem('username')) {
            // Restore from backup if needed
            const backupUserType = sessionStorage.getItem('backup_userType');
            const backupUsername = sessionStorage.getItem('backup_username');
            
            if (backupUserType && backupUsername) {
                localStorage.setItem('userType', backupUserType);
                localStorage.setItem('username', backupUsername);
                console.log('Auth restored after modal close');
            }
        }
    });
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            
            // Verify authentication data wasn't lost
            if (!localStorage.getItem('userType') || !localStorage.getItem('username')) {
                // Restore from backup if needed
                const backupUserType = sessionStorage.getItem('backup_userType');
                const backupUsername = sessionStorage.getItem('backup_username');
                
                if (backupUserType && backupUsername) {
                    localStorage.setItem('userType', backupUserType);
                    localStorage.setItem('username', backupUsername);
                    console.log('Auth restored after modal close');
                }
            }
        }
    });
} 