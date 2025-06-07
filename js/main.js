// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js DOM loaded");
    
    // Login modal elements
    const modal = document.getElementById('login-modal');
    const teacherLoginBtn = document.getElementById('teacher-login');
    const studentLoginBtn = document.getElementById('student-login');
    const closeBtn = document.querySelector('.close');
    const loginFormContainer = document.getElementById('login-form-container');
    
    // Hero section buttons
    const btnTeacher = document.getElementById('btn-teacher');
    const btnStudent = document.getElementById('btn-student');
    
    // Check if elements exist
    if (!modal) console.error("Modal element not found");
    if (!teacherLoginBtn) console.error("Teacher login button not found");
    if (!studentLoginBtn) console.error("Student login button not found");
    if (!closeBtn) console.error("Close button not found");
    if (!loginFormContainer) console.error("Login form container not found");
    if (!btnTeacher) console.error("Teacher button not found");
    if (!btnStudent) console.error("Student button not found");
    
    // Event Listeners
    if (teacherLoginBtn) {
        teacherLoginBtn.addEventListener('click', () => {
            console.log("Teacher login button clicked");
            openLoginModal('teacher');
        });
    }
    
    if (studentLoginBtn) {
        studentLoginBtn.addEventListener('click', () => {
            console.log("Student login button clicked");
            openLoginModal('student');
        });
    }
    
    if (btnTeacher) {
        btnTeacher.addEventListener('click', () => {
            console.log("Teacher hero button clicked");
            openLoginModal('teacher');
        });
    }
    
    if (btnStudent) {
        btnStudent.addEventListener('click', () => {
            console.log("Student hero button clicked");
            openLoginModal('student');
        });
    }
    
    if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    }
    
    // Check if Auth is defined
    if (typeof Auth === 'undefined') {
        console.error("Auth module is not loaded");
    } else {
        console.log("Auth module loaded correctly");
        
        // Check if user is already logged in
        if (Auth.isLoggedIn()) {
            const currentUser = Auth.getCurrentUser();
            console.log("User is already logged in:", currentUser);
            redirectToDashboard(currentUser.userType);
        }
    }
    
    // Close modal when clicking outside of it
    if (modal) {
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    }
    
    // Functions
    function openLoginModal(userType) {
        console.log("Opening login modal for", userType);
        if (!loginFormContainer || !modal) {
            console.error("Cannot open login modal - required elements not found");
            return;
        }
        
        loginFormContainer.innerHTML = createLoginForm(userType);
        modal.style.display = 'block';
        
        // Add event listener to the form
        const form = document.getElementById(`${userType}-login-form`);
        if (form) {
        form.addEventListener('submit', handleLogin);
        } else {
            console.error(`${userType}-login-form not found after creation`);
        }
    }
    
    function createLoginForm(userType) {
        const capitalizedType = userType.charAt(0).toUpperCase() + userType.slice(1);
        
        return `
            <h2>${capitalizedType} Login</h2>
            <form id="${userType}-login-form">
                <div class="form-group">
                    <label for="${userType}-username">Username</label>
                    <input type="text" id="${userType}-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="${userType}-password">Password</label>
                    <input type="password" id="${userType}-password" name="password" required>
                </div>
                <div id="${userType}-login-error" class="error-message"></div>
                <button type="submit" class="submit-btn">Login</button>
                <p class="form-footer">Don't have an account? <a href="#" class="register-link" data-type="${userType}">Register</a></p>
            </form>
        `;
    }
    
    function createRegisterForm(userType) {
        const capitalizedType = userType.charAt(0).toUpperCase() + userType.slice(1);
        
        return `
            <h2>${capitalizedType} Registration</h2>
            <form id="${userType}-register-form">
                <div class="form-group">
                    <label for="${userType}-reg-fullname">Full Name</label>
                    <input type="text" id="${userType}-reg-fullname" name="fullname" required>
                </div>
                <div class="form-group">
                    <label for="${userType}-reg-email">Email</label>
                    <input type="email" id="${userType}-reg-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="${userType}-reg-username">Username</label>
                    <input type="text" id="${userType}-reg-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="${userType}-reg-password">Password</label>
                    <input type="password" id="${userType}-reg-password" name="password" required minlength="6">
                </div>
                ${userType === 'teacher' ? `
                <div class="form-group">
                    <label for="teacher-reg-school">School Name</label>
                    <input type="text" id="teacher-reg-school" name="school" required>
                </div>
                ` : ''}
                ${userType === 'student' ? `
                <div class="form-group">
                    <label for="student-reg-grade">Grade</label>
                    <input type="text" id="student-reg-grade" name="grade" required>
                </div>
                ` : ''}
                <div id="${userType}-register-error" class="error-message"></div>
                <button type="submit" class="submit-btn">Register</button>
                <p class="form-footer">Already have an account? <a href="#" class="login-link" data-type="${userType}">Login</a></p>
            </form>
        `;
    }
    
    function closeModal() {
        if (modal) {
        modal.style.display = 'none';
        }
    }
    
    function redirectToDashboard(userType) {
        window.location.href = userType === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    }
    
    function handleLogin(e) {
        e.preventDefault();
        console.log("Login form submitted");
        const form = e.target;
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');
        const userType = form.id.includes('teacher') ? 'teacher' : 'student';
            
        console.log("Login attempt with:", { username, userType });
        
        // Try to log in using the Auth module
        if (typeof Auth === 'undefined') {
            console.error("Auth module not available for login");
            return;
        }
        
        const loginResult = Auth.login(username, password);
        console.log("Login result:", loginResult);
        
        if (loginResult.success) {
            console.log("Login successful, redirecting to dashboard");
            // Redirect to the appropriate dashboard
            redirectToDashboard(loginResult.userType);
        } else {
            console.log("Login failed:", loginResult.message);
            // Show error message
            const errorElement = document.getElementById(`${userType}-login-error`);
            if (errorElement) {
                errorElement.textContent = loginResult.message;
                errorElement.style.display = 'block';
            } else {
                console.error("Error element not found for displaying login error");
            }
        }
    }
    
    function handleRegister(e) {
        e.preventDefault();
        console.log("Register form submitted");
        const form = e.target;
        const formData = new FormData(form);
        const userType = form.id.includes('teacher') ? 'teacher' : 'student';
        
        // Create user data object
        const userData = {
            username: formData.get('username'),
            password: formData.get('password'),
            fullname: formData.get('fullname'),
            email: formData.get('email'),
            type: userType
        };
        
        // Add user type specific fields
        if (userType === 'teacher') {
            userData.school = formData.get('school');
        } else if (userType === 'student') {
            userData.grade = formData.get('grade');
        }
        
        console.log("Registering user:", userData);
        
        // Register the user using Auth module
        if (typeof Auth === 'undefined') {
            console.error("Auth module not available for registration");
            return;
        }
        
        // Show all existing users before registration
        console.log("Existing users before registration:", Auth.users);
        
        const registerResult = Auth.register(userData);
        console.log("Registration result:", registerResult);
        
        // Show all users after registration
        console.log("Users after registration:", Auth.users);
        
        if (registerResult.success) {
            // Show success and redirect to login
            alert(`${userType.charAt(0).toUpperCase() + userType.slice(1)} registration successful! Please login with username: ${userData.username}`);
        openLoginModal(userType);
            
            // Pre-fill the username field
            const usernameField = document.getElementById(`${userType}-username`);
            if (usernameField) {
                usernameField.value = userData.username;
            }
        } else {
            // Show error message
            const errorElement = document.getElementById(`${userType}-register-error`);
            if (errorElement) {
                errorElement.textContent = registerResult.message;
                errorElement.style.display = 'block';
            } else {
                console.error("Error element not found for displaying registration error");
            }
        }
    }
    
    // Event delegation for register and login links inside the modal
    if (loginFormContainer) {
    loginFormContainer.addEventListener('click', (e) => {
            console.log("Click in login form container", e.target);
            
        // Register link clicked
        if (e.target.classList.contains('register-link')) {
                console.log("Register link clicked");
            const userType = e.target.getAttribute('data-type');
            loginFormContainer.innerHTML = createRegisterForm(userType);
            
            const registerForm = document.getElementById(`${userType}-register-form`);
                if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
                } else {
                    console.error(`${userType}-register-form not found after creation`);
                }
        }
        
        // Login link clicked
        if (e.target.classList.contains('login-link')) {
                console.log("Login link clicked");
            const userType = e.target.getAttribute('data-type');
            openLoginModal(userType);
        }
    });
    } else {
        console.error("loginFormContainer not found, cannot set up event delegation");
    }
}); 