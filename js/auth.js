// Updated authentication system for personal finance app
const Auth = {
    init: function() {
        this.setupLogoutButton();
        this.setupRegisterForm();
        this.setupLoginForm();
    },

    setupLogoutButton: function() {
        const logoutButton = document.querySelector('.logout-button');
        if (logoutButton) {
            // Set current user email if logged in
            if (localStorage.getItem('currentUser')) {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                logoutButton.textContent = user.email;
            }

            logoutButton.addEventListener('click', () => {
                if (confirm('Bạn có chắc muốn đăng xuất?')) {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                }
            });
        }
    },

    setupRegisterForm: function() {
        const form = document.getElementById('register-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    },

    setupLoginForm: function() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    handleRegister: function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const confirmError = document.getElementById('confirmPasswordError');

        // Reset errors
        emailError.style.display = 'none';
        passwordError.style.display = 'none';
        confirmError.style.display = 'none';

        // Validate inputs
        let isValid = true;
        
        if (!this.validateEmail(email)) {
            emailError.textContent = 'Email không hợp lệ';
            emailError.style.display = 'block';
            isValid = false;
        }
        
        if (password.length < 6) {
            passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
            passwordError.style.display = 'block';
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            confirmError.textContent = 'Mật khẩu xác nhận không khớp';
            confirmError.style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        // Save user
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            alert('Email đã được đăng ký');
            return;
        }

        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        window.location.href = 'login.html';
    },

    handleLogin: function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');

        // Reset errors
        emailError.style.display = 'none';
        passwordError.style.display = 'none';

        // Validate inputs
        if (!this.validateEmail(email)) {
            emailError.textContent = 'Email không hợp lệ';
            emailError.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
            passwordError.style.display = 'block';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            passwordError.textContent = 'Email hoặc mật khẩu không đúng';
            passwordError.style.display = 'block';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    },

    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});