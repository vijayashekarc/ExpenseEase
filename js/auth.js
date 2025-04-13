// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = await ExpenseeaseConfig.isAuthenticated();
    const currentPath = window.location.pathname;
    
    if (isAuth) {
        // User is authenticated
        if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('signup.html')) {
            window.location.href = 'home.html';
        }
        
        // Set up user info button
        const userInfoBtn = document.getElementById('userInfo');
        if (userInfoBtn) {
            userInfoBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('/api/user-info', {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        console.log('User data fetched:', userData);
                        const userAvatar = document.getElementById('userAvatar');
                        if (userAvatar && userData.avatar_url) {
                            userAvatar.src = userData.avatar_url;
                            console.log('Profile picture updated:', userData.avatar_url);
                        } else {
                            console.log('Profile picture not updated. Element or avatar_url missing.');
                        }
                    } else {
                        console.log('Failed to fetch user information');
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }
            });
        }
    } else {
        // User is not authenticated
        if (!currentPath.endsWith('index.html') && !currentPath.endsWith('signup.html') && currentPath !== '/') {
            window.location.href = 'index.html';
        }
    }

    // Set up login form tabs if on login page
    if (currentPath.endsWith('index.html') || currentPath === '/') {
        setupLoginTabs();
        setupLoginForm();
    }

    // Set up signup form if on signup page
    if (currentPath.endsWith('signup.html')) {
        setupSignupForm();
    }
});

// Setup login tabs functionality
function setupLoginTabs() {
    const emailTab = document.getElementById('emailTab');
    const googleTab = document.getElementById('googleTab');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const googleLoginForm = document.getElementById('googleLoginForm');

    if (emailTab && googleTab) {
        emailTab.addEventListener('click', () => {
            emailTab.classList.add('active');
            googleTab.classList.remove('active');
            emailLoginForm.style.display = 'block';
            googleLoginForm.style.display = 'none';
        });

        googleTab.addEventListener('click', () => {
            googleTab.classList.add('active');
            emailTab.classList.remove('active');
            googleLoginForm.style.display = 'block';
            emailLoginForm.style.display = 'none';
        });
    }
}

// Setup login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                loginError.textContent = '';
                
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    window.location.href = 'home.html';
                } else {
                    loginError.textContent = data.error || 'Invalid email or password';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'An error occurred during login';
            }
        });
    }
}

// Setup signup form submission
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                signupError.textContent = 'Passwords do not match';
                return;
            }
            
            try {
                signupError.textContent = '';
                
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    window.location.href = 'home.html';
                } else {
                    signupError.textContent = data.error || 'Registration failed';
                }
            } catch (error) {
                console.error('Signup error:', error);
                signupError.textContent = 'An error occurred during registration';
            }
        });
    }
}

// Handle Google login
document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    window.location.href = ExpenseeaseConfig.AUTH_ENDPOINTS.GOOGLE_LOGIN;
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        // Call the logout endpoint
        const response = await fetch('/auth/logout', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear any local storage or session storage if needed
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = 'index.html';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to login page even if there's an error
        window.location.href = 'index.html';
    }
});

// Add event listener for user info button
document.getElementById('userInfoBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
}); 