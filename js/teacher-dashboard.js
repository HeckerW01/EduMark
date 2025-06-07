/**
 * Teacher Dashboard for ClassPDF
 * This script handles the teacher dashboard functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Teacher dashboard script loaded");
    
    // Check if user is logged in as a teacher
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    
    if (!userType || userType !== 'teacher' || !username) {
        // Redirect to login if not logged in as a teacher
        window.location.href = 'index.html';
        return;
    }
    
    // Set teacher name in header
    document.getElementById('teacher-name').textContent = username;
    
    // Tab navigation
    setupTabNavigation();
    
    // PDF upload functionality
    setupPdfUpload();
    
    // Assignment creation modal
    setupAssignmentModal();
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });
    
    initializeNotifications();
    
    // Initialize AI Chat System instead of human chat
    initializeAIChat();
});

/**
 * Sets up tab navigation for the dashboard
 */
function setupTabNavigation() {
    console.log("Setting up tab navigation");
    const tabs = document.querySelectorAll('.sidebar nav a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Tab clicked:", e.target.getAttribute('data-tab'));
            
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
 * Sets up PDF upload functionality
 */
function setupPdfUpload() {
    console.log("Setting up PDF upload");
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const uploadsList = document.getElementById('uploads-list');
    
    if (!dropArea || !fileInput || !uploadsList) {
        console.error("Required elements for PDF upload not found", {
            dropArea: !!dropArea,
            fileInput: !!fileInput,
            uploadsList: !!uploadsList
        });
        return;
    }
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when item is dragged over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            console.log("File dragged over drop area");
            dropArea.classList.add('highlight');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        });
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop);
    
    function handleDrop(e) {
        console.log("File dropped");
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    fileInput.addEventListener('change', (e) => {
        console.log("File selected via input", e.target.files);
        handleFiles(fileInput.files);
    });
    
    function handleFiles(files) {
        console.log("Handling files:", files);
        if (files && files.length > 0) {
            [...files].forEach(uploadFile);
        } else {
            console.error("No files to handle");
        }
    }
    
    function uploadFile(file) {
        console.log("Processing file:", file.name, file.type);
        // Only accept PDF files
        if (file.type !== 'application/pdf') {
            console.error("File is not a PDF:", file.type);
            alert('Only PDF files are accepted');
            return;
        }
        
        // In a real application, you would upload the file to a server here
        // For this demo, we'll just simulate the upload and store file data
        console.log("Uploading PDF file:", file.name);
        
        // Create a reader to get the file data
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const fileData = e.target.result;
                console.log("File read successfully, data length:", fileData.length);
                
                // Store file data in localStorage
                const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
                const newUpload = {
                    id: Date.now().toString(),
                    name: file.name,
                    size: file.size,
                    uploadedBy: localStorage.getItem('username') || 'unknown',
                    uploadedAt: new Date().toISOString(),
                    data: fileData // This can be very large for PDFs
                };
                
                console.log("Created upload object:", {
                    id: newUpload.id,
                    name: newUpload.name,
                    size: newUpload.size
                });
                
                uploads.push(newUpload);
                localStorage.setItem('teacherUploads', JSON.stringify(uploads));
                
                // Update the UI
                displayUploads();
                
                // Also update the assignment PDF dropdown
                updatePdfDropdown();
                
                // Show success message
                alert(`File "${file.name}" uploaded successfully!`);
            } catch (err) {
                console.error("Error processing file:", err);
                alert('Error processing file: ' + err.message);
            }
        };
        
        reader.onerror = function(err) {
            console.error("Error reading file:", file.name, err);
            alert('Error reading file. Please try again.');
        };
        
        // Read the file as data URL
        console.log("Starting to read file as data URL");
        reader.readAsDataURL(file);
    }
    
    // Display uploaded PDFs
    function displayUploads() {
        console.log("Displaying uploaded PDFs");
        try {
            const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
            console.log("Found uploads:", uploads.length);
            
            if (uploads.length === 0) {
                uploadsList.innerHTML = '<p class="empty-message">No PDFs uploaded yet.</p>';
                return;
            }
            
            uploadsList.innerHTML = '';
            uploads.forEach(upload => {
                const fileSize = formatFileSize(upload.size);
                const uploadDate = new Date(upload.uploadedAt).toLocaleDateString();
                
                const uploadItem = document.createElement('div');
                uploadItem.className = 'assignment-card';
                uploadItem.innerHTML = `
                    <div class="assignment-details">
                        <div class="assignment-title">${upload.name}</div>
                        <div class="assignment-metadata">
                            <span>${fileSize}</span>
                            <span>Uploaded: ${uploadDate}</span>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="view-btn" data-id="${upload.id}">View</button>
                        <button class="edit-btn" data-id="${upload.id}">Assign</button>
                        <button class="delete-btn" data-id="${upload.id}">Delete</button>
                    </div>
                `;
                uploadsList.appendChild(uploadItem);
            });
            
            // Add event listeners to buttons
            uploadsList.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const upload = uploads.find(u => u.id === id);
                    // Open PDF in a new tab if data exists
                    if (upload && upload.data) {
                        try {
                            // Store in session storage for PDF viewer
                            sessionStorage.setItem('currentViewPdf', JSON.stringify(upload));
                            window.open('pdf-viewer.html', '_blank');
                        } catch (err) {
                            console.error("Error opening PDF viewer:", err);
                            // Fallback to simple iframe view
                            const win = window.open();
                            win.document.write(`
                                <iframe width="100%" height="100%" src="${upload.data}"></iframe>
                            `);
                        }
                    } else {
                        alert('PDF data not available');
                    }
                });
            });
            
            uploadsList.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    // Switch to assignments tab and open the assignment creation modal
                    document.querySelector('a[data-tab="assignments"]').click();
                    document.getElementById('assignment-modal').style.display = 'block';
                    // Pre-select the PDF in the dropdown
                    const pdfSelect = document.getElementById('assignment-pdf');
                    pdfSelect.value = id;
                });
            });
            
            uploadsList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this PDF?')) {
                        const updatedUploads = uploads.filter(u => u.id !== id);
                        localStorage.setItem('teacherUploads', JSON.stringify(updatedUploads));
                        displayUploads();
                        updatePdfDropdown();
                    }
                });
            });
        } catch (err) {
            console.error("Error displaying uploads:", err);
            uploadsList.innerHTML = `<p class="empty-message">Error loading PDFs: ${err.message}</p>`;
        }
    }
    
    // Call the function on load
    displayUploads();
}

/**
 * Sets up the assignment creation modal and functionality
 */
function setupAssignmentModal() {
    console.log("Setting up assignment modal");
    const modal = document.getElementById('assignment-modal');
    const closeBtn = modal.querySelector('.close');
    const createAssignmentBtn = document.getElementById('create-assignment');
    const assignmentForm = document.getElementById('assignment-form');
    const assignmentsList = document.querySelector('.assignments-list');
    
    if (!modal || !closeBtn || !createAssignmentBtn || !assignmentForm || !assignmentsList) {
        console.error("Required elements for assignment modal not found");
        return;
    }
    
    // Update PDF dropdown options
    updatePdfDropdown();
    
    // Open modal when Create Assignment button is clicked
    createAssignmentBtn.addEventListener('click', () => {
        console.log("Create assignment button clicked");
        modal.style.display = 'block';
    });
    
    // Close modal when X button is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    assignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Assignment form submitted");
        
        const formData = new FormData(assignmentForm);
        const assignment = {
            id: Date.now().toString(),
            title: formData.get('title'),
            description: formData.get('description'),
            pdfId: formData.get('pdf'),
            assignedBy: localStorage.getItem('username') || 'unknown',
            dueDate: formData.get('dueDate'),
            classId: formData.get('class'),
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Store the assignment
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        assignments.push(assignment);
        localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
        
        // Close the modal and reset the form
        modal.style.display = 'none';
        assignmentForm.reset();
        
        // Display assignments
        displayAssignments();
    });
    
    function displayAssignments() {
        console.log("Displaying assignments");
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        console.log("Found assignments:", assignments.length);
        
        if (assignments.length === 0) {
            assignmentsList.innerHTML = '<p class="empty-message">No assignments created yet.</p>';
            return;
        }
        
        assignmentsList.innerHTML = '';
        assignments.forEach(assignment => {
            const dueDate = new Date(assignment.dueDate).toLocaleDateString();
            const createdDate = new Date(assignment.createdAt).toLocaleDateString();
            
            const assignmentItem = document.createElement('div');
            assignmentItem.className = 'assignment-card';
            assignmentItem.innerHTML = `
                <div class="assignment-details">
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-metadata">
                        <span>Due: ${dueDate}</span>
                        <span>Created: ${createdDate}</span>
                        <span>Status: ${assignment.status}</span>
                    </div>
                </div>
                <div class="assignment-actions">
                    <button class="view-btn" data-id="${assignment.id}">View</button>
                    <button class="edit-btn" data-id="${assignment.id}">Edit</button>
                    <button class="delete-btn" data-id="${assignment.id}">Delete</button>
                </div>
            `;
            assignmentsList.appendChild(assignmentItem);
        });
        
        // Add event listeners for the buttons
        assignmentsList.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                // In a real app, this would open the assignment viewer
                alert('Assignment viewer not implemented yet.');
            });
        });
        
        assignmentsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                // In a real app, this would open an edit form
                alert('Assignment editing not implemented yet.');
            });
        });
        
        assignmentsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const updatedAssignments = assignments.filter(a => a.id !== id);
                localStorage.setItem('teacherAssignments', JSON.stringify(updatedAssignments));
                displayAssignments();
            });
        });
    }
    
    // Display assignments on load
    displayAssignments();
}

/**
 * Updates the PDF dropdown in the assignment creation modal
 */
function updatePdfDropdown() {
    console.log("Updating PDF dropdown");
    const pdfSelect = document.getElementById('assignment-pdf');
    
    if (!pdfSelect) {
        console.error("PDF select element not found");
        return;
    }
    
    // Clear existing options except the first one
    while (pdfSelect.options.length > 1) {
        pdfSelect.remove(1);
    }
    
    // Get uploaded PDFs
    const uploads = JSON.parse(localStorage.getItem('teacherUploads') || '[]');
    
    // Add options for each PDF
    uploads.forEach(upload => {
        const option = document.createElement('option');
        option.value = upload.id;
        option.textContent = upload.name;
        pdfSelect.appendChild(option);
    });
}

/**
 * Format file size into human-readable format
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Initialize notifications system
 */
function initializeNotifications() {
    // Create notification counter in header
    const userInfo = document.querySelector('.user-info');
    const notificationCounter = document.createElement('div');
    notificationCounter.className = 'notification-counter';
    notificationCounter.innerHTML = `
        <span class="notification-icon">🔔</span>
        <span class="notification-count">0</span>
    `;
    userInfo.insertBefore(notificationCounter, document.getElementById('logout-btn'));
    
    // Create notifications panel
    const notificationsPanel = document.createElement('div');
    notificationsPanel.className = 'notifications-panel';
    notificationsPanel.innerHTML = `
        <div class="notifications-header">
            <h3>Notifications</h3>
            <button class="close-notifications">×</button>
        </div>
        <div class="notifications-list"></div>
    `;
    document.body.appendChild(notificationsPanel);
    
    // Add event listeners
    notificationCounter.addEventListener('click', () => {
        notificationsPanel.classList.toggle('active');
        updateNotifications();
    });
    
    document.querySelector('.close-notifications').addEventListener('click', () => {
        notificationsPanel.classList.remove('active');
    });
    
    // Check for new notifications
    updateNotifications();
    setInterval(updateNotifications, 30000); // Check every 30 seconds
}

/**
 * Update notifications
 */
function updateNotifications() {
    // Get all submissions
    const submissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
    const newSubmissions = submissions.filter(sub => sub.status === 'submitted' && !sub.viewed);
    
    // Update notification count
    const totalNew = newSubmissions.length;
    const countElement = document.querySelector('.notification-count');
    countElement.textContent = totalNew;
    
    if (totalNew > 0) {
        countElement.classList.add('has-notifications');
    } else {
        countElement.classList.remove('has-notifications');
    }
    
    // Update notifications list
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.innerHTML = '';
    
    // Add new submissions notifications
    newSubmissions.forEach(submission => {
        const assignments = JSON.parse(localStorage.getItem('teacherAssignments') || '[]');
        const assignment = assignments.find(a => a.id === submission.assignmentId);
        
        if (assignment) {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item submission-notification';
            notificationItem.innerHTML = `
                <div class="notification-content">
                    <strong>${submission.studentName}</strong> submitted 
                    <strong>${assignment.title}</strong>
                </div>
                <div class="notification-time">
                    ${formatDate(new Date(submission.submittedAt))}
                </div>
            `;
            
            notificationItem.addEventListener('click', () => {
                // Mark as viewed
                submission.viewed = true;
                localStorage.setItem('studentSubmissions', JSON.stringify(submissions));
                
                // Open grading tab and highlight this submission
                const gradingTab = document.querySelector('a[data-tab="grading"]');
                if (gradingTab) gradingTab.click();
                
                // Refresh notifications
                updateNotifications();
            });
            
            notificationsList.appendChild(notificationItem);
        }
    });
    
    if (totalNew === 0) {
        notificationsList.innerHTML = '<p class="empty-notification">No new notifications</p>';
    }
}

/**
 * Format date for notifications
 */
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Initialize AI Chat System instead of human chat
 */
function initializeAIChat() {
    // Implementation of AI Chat System
    console.log("AI Chat System initialized");
} 