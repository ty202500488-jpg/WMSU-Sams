/**
 * WMSU-SAMS Form Validation Script
 * Reusable validation functions for all forms in the system
 */

// ==================== UTILITY FUNCTIONS ====================

/**
 * Show error message below a form field
 */
function showError(inputElement, message) {
    // Remove existing error if present
    removeError(inputElement);
    
    // Create error message element
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    
    // Add red border to input
    inputElement.classList.add('input-error');
    inputElement.style.borderColor = '#dc2626';
    
    // Insert error after input
    inputElement.parentNode.insertBefore(errorEl, inputElement.nextSibling);
}

/**
 * Remove error message from a form field
 */
function removeError(inputElement) {
    inputElement.classList.remove('input-error');
    inputElement.style.borderColor = '';
    
    const errorEl = inputElement.nextElementSibling;
    if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.remove();
    }
}

/**
 * Clear all errors from a form
 */
function clearFormErrors(formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => removeError(input));
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate password strength (min 8 chars)
 */
function isValidPassword(password) {
    return password && password.length >= 8;
}

/**
 * Check if two passwords match
 */
function passwordsMatch(pwd1, pwd2) {
    return pwd1 === pwd2 && pwd1.length > 0;
}

// ==================== LOGIN VALIDATION ====================

function validateLoginForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    let isValid = true;
    
    // Clear previous errors
    removeError(emailInput);
    removeError(passwordInput);
    
    // Validate email
    if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Initialize login form validation
 */
function initLoginValidation() {
    const loginBtn = document.getElementById('login');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (!loginBtn) return;
    
    // Convert anchor to button-like behavior
    loginBtn.style.cursor = 'pointer';
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (validateLoginForm()) {
            // Show success message
            showSuccessMessage('Login successful - redirecting...');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = loginBtn.href;
            }, 800);
        }
    });
    
    // Real-time validation on blur
    emailInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            if (!isValidEmail(this.value)) {
                showError(this, 'Please enter a valid email address');
            } else {
                removeError(this);
            }
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            if (!isValidPassword(this.value)) {
                showError(this, 'Password must be at least 8 characters');
            } else {
                removeError(this);
            }
        }
    });
}

// ==================== REGISTRATION VALIDATION ====================

function validateRegistrationForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');
    const allInputs = form.querySelectorAll('input, select');
    
    // Clear all previous errors
    allInputs.forEach(input => removeError(input));
    
    // Get specific inputs
    const firstNameInput = form.querySelector('input[name="first_name"]');
    const middleNameInput = form.querySelector('input[name="middle_name"]');
    const lastNameInput = form.querySelector('input[name="last_name"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInputs = form.querySelectorAll('input[type="password"]');
    const selectInputs = form.querySelectorAll('select');
    
    // Validate name fields (all required)
    if (firstNameInput) {
        if (!firstNameInput.value.trim()) {
            showError(firstNameInput, 'First Name is required');
            isValid = false;
        }
    }
    
    if (middleNameInput) {
        if (!middleNameInput.value.trim()) {
            showError(middleNameInput, 'Middle Name is required');
            isValid = false;
        }
    }
    
    if (lastNameInput) {
        if (!lastNameInput.value.trim()) {
            showError(lastNameInput, 'Last Name is required');
            isValid = false;
        }
    }
    
    // Validate email
    if (emailInput) {
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
    }
    
    // Validate Student ID if present
    const studentIdInput = form.querySelector('input[pattern="[0-9-]*"]');
    if (studentIdInput && studentIdInput.value) {
        if (!/^[0-9-]*$/.test(studentIdInput.value)) {
            showError(studentIdInput, 'Student ID must contain only numbers and dashes');
            isValid = false;
        }
    }
    
    // Validate Year Level if present (for student form)
    const yearLevelSelect = form.querySelector('select');
    if (yearLevelSelect && yearLevelSelect.name !== 'role') {
        if (formId === 'studentForm' && !yearLevelSelect.value) {
            showError(yearLevelSelect, 'Year Level is required');
            isValid = false;
        }
    }
    
    // Validate Password
    if (passwordInputs.length >= 1) {
        const passwordInput = passwordInputs[0];
        if (!passwordInput.value.trim()) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (!isValidPassword(passwordInput.value)) {
            showError(passwordInput, 'Password must be at least 8 characters');
            isValid = false;
        }
    }
    
    // Validate Confirm Password and match
    if (passwordInputs.length >= 2) {
        const passwordInput = passwordInputs[0];
        const confirmPasswordInput = passwordInputs[1];
        
        if (!confirmPasswordInput.value.trim()) {
            showError(confirmPasswordInput, 'Please confirm your password');
            isValid = false;
        } else if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Initialize registration form validation
 */
function initRegistrationValidation() {
    const registerBtn = document.getElementById('register-btn');
    const forms = document.querySelectorAll('.account-form');
    
    if (!registerBtn || !forms.length) return;
    
    registerBtn.style.cursor = 'pointer';
    registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Determine which form is visible
        const activeForm = document.querySelector('.account-form[style*="display: flex"]') || 
                           document.querySelector('.account-form:not([style*="display: none"])') ||
                           (document.getElementById('student').checked ? document.getElementById('studentForm') :
                            document.getElementById('employer').checked ? document.getElementById('employerForm') :
                            document.getElementById('cppeso').checked ? document.getElementById('cppesoForm') : null);
        
        if (!activeForm) return;
        
        const formId = activeForm.id;
        
        if (validateRegistrationForm(formId)) {
            showSuccessMessage('Registration successful - redirecting...');
            setTimeout(() => {
                activeForm.submit();
            }, 800);
        }
    });
    
    // Real-time validation on blur
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateSingleField(this);
            });
        });
    });
}

/**
 * Validate a single field in real-time
 */
function validateSingleField(input) {
    removeError(input);
    
    const value = input.value.trim();
    
    // Skip validation for empty optional fields
    if (!value && !input.hasAttribute('required') && !input.parentElement.parentElement.querySelector('label')?.textContent.includes('*')) {
        return;
    }
    
    // Check field type
    if (input.type === 'email') {
        if (value && !isValidEmail(value)) {
            showError(input, 'Please enter a valid email address');
        }
    } else if (input.type === 'password') {
        if (value && !isValidPassword(value)) {
            showError(input, 'Password must be at least 8 characters');
        }
    } else if (input.name && input.name.includes('name')) {
        if (!value && (input.name === 'first_name' || input.name === 'last_name' || input.name === 'middle_name')) {
            showError(input, input.name.replace('_', ' ').charAt(0).toUpperCase() + input.name.replace('_', ' ').slice(1) + ' is required');
        }
    }
}

// ==================== FORGOT PASSWORD VALIDATION ====================

function validateForgotPasswordEmail() {
    const emailInput = document.getElementById('forgot-email');
    if (!emailInput) return false;
    
    removeError(emailInput);
    
    let isValid = true;
    
    if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function validateOTP() {
    const otpInput = document.getElementById('otp-input');
    if (!otpInput) return false;
    
    removeError(otpInput);
    
    let isValid = true;
    
    if (!otpInput.value.trim()) {
        showError(otpInput, 'OTP is required');
        isValid = false;
    } else if (otpInput.value.length < 6) {
        showError(otpInput, 'OTP must be at least 6 digits');
        isValid = false;
    }
    
    return isValid;
}

function validatePasswordReset() {
    const newPwdInput = document.getElementById('new-password');
    const confirmPwdInput = document.getElementById('confirm-new-password');
    
    if (!newPwdInput || !confirmPwdInput) return false;
    
    removeError(newPwdInput);
    removeError(confirmPwdInput);
    
    let isValid = true;
    
    if (!newPwdInput.value.trim()) {
        showError(newPwdInput, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(newPwdInput.value)) {
        showError(newPwdInput, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (!confirmPwdInput.value.trim()) {
        showError(confirmPwdInput, 'Please confirm your password');
        isValid = false;
    } else if (newPwdInput.value !== confirmPwdInput.value) {
        showError(confirmPwdInput, 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Initialize forgot password form
 */
function initForgotPasswordForm() {
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const resendOtpLink = document.getElementById('resend-otp-link');
    
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateForgotPasswordEmail()) {
                showSuccessMessage('OTP sent to your email');
                // Show Step 2
                document.getElementById('step1').style.display = 'none';
                document.getElementById('step2').style.display = 'block';
                document.getElementById('otp-input').focus();
            }
        });
    }
    
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateOTP()) {
                // Accept demo OTP: 123456
                const otpValue = document.getElementById('otp-input').value;
                if (otpValue === '123456') {
                    showSuccessMessage('OTP verified successfully');
                    // Show Step 3
                    document.getElementById('step2').style.display = 'none';
                    document.getElementById('step3').style.display = 'block';
                    document.getElementById('new-password').focus();
                } else {
                    showError(document.getElementById('otp-input'), 'Invalid OTP. Demo OTP is 123456');
                }
            }
        });
    }
    
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validatePasswordReset()) {
                showSuccessMessage('Password reset successful - redirecting...');
                setTimeout(() => {
                    window.location.href = 'password_reset_success.html';
                }, 800);
            }
        });
    }
    
    if (resendOtpLink) {
        resendOtpLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSuccessMessage('OTP resent to your email');
            document.getElementById('otp-input').value = '';
            document.getElementById('otp-input').focus();
        });
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Show temporary success message
 */
function showSuccessMessage(message) {
    // Remove existing message if present
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();
    
    const msgEl = document.createElement('div');
    msgEl.className = 'success-message';
    msgEl.textContent = message;
    msgEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #15803d;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(msgEl);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        msgEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msgEl.remove(), 300);
    }, 3000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const currentUrl = window.location.pathname;
    
    if (currentUrl.includes('login.html')) {
        initLoginValidation();
    } else if (currentUrl.includes('registration.html')) {
        initRegistrationValidation();
    } else if (currentUrl.includes('forgot_password.html')) {
        initForgotPasswordForm();
    }
});

// Add CSS animation for success message
if (document.head) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .error-message {
            display: block;
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
            font-weight: 500;
        }
        .input-error {
            border-color: #dc2626 !important;
        }
    `;
    document.head.appendChild(style);
}
