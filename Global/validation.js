/**
 * WMSU-SAMS Form Validation Script
 * Reusable validation functions for all forms in the system
 */

// ==================== UTILITY FUNCTIONS ====================

/**
 * Show error message below a form field
 */
function showError(inputElement, message) {
    // Support legacy id="error-{name}" span placeholders (registration.html)
    if (inputElement && inputElement.name) {
        const spanEl = document.getElementById('error-' + inputElement.name);
        if (spanEl) {
            spanEl.textContent = message;
            spanEl.style.color = '#dc2626';
            spanEl.style.fontSize = '12px';
            spanEl.style.marginTop = '4px';
            spanEl.style.display = 'block';
            inputElement.classList.add('input-error');
            inputElement.style.borderColor = '#dc2626';
            return;
        }
    }

    // Dynamic approach: remove existing error then insert a new span
    removeError(inputElement);

    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;

    inputElement.classList.add('input-error');
    inputElement.style.borderColor = '#dc2626';

    inputElement.parentNode.insertBefore(errorEl, inputElement.nextSibling);
}

/**
 * Remove error message from a form field
 */
function removeError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('input-error');
    inputElement.style.borderColor = '';

    // Clear legacy id-based span first
    if (inputElement.name) {
        const spanEl = document.getElementById('error-' + inputElement.name);
        if (spanEl) {
            spanEl.textContent = '';
            spanEl.style.display = 'none';
        }
    }

    // Also remove a dynamically-inserted error span if present
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
    loginBtn.addEventListener('click', function (e) {
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
    emailInput.addEventListener('blur', function () {
        if (this.value.trim()) {
            if (!isValidEmail(this.value)) {
                showError(this, 'Please enter a valid email address');
            } else {
                removeError(this);
            }
        }
    });

    passwordInput.addEventListener('blur', function () {
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
    const allInputs = form.querySelectorAll('input, select');

    // Clear all previous errors
    allInputs.forEach(input => removeError(input));

    // ── Name fields ────────────────────────────────────────────
    const firstNameInput = form.querySelector('input[name="first_name"]');
    const lastNameInput = form.querySelector('input[name="last_name"]');

    if (firstNameInput && !firstNameInput.value.trim()) {
        showError(firstNameInput, 'First Name is required');
        isValid = false;
    }
    if (lastNameInput && !lastNameInput.value.trim()) {
        showError(lastNameInput, 'Last Name is required');
        isValid = false;
    }

    // ── Email ──────────────────────────────────────────────────
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid WMSU email (e.g. user@wmsu.edu.ph)');
            isValid = false;
        }
    }

    // ── Address fields ─────────────────────────────────────────
    const barangayInput = form.querySelector('input[name="barangay"]');
    if (barangayInput && !barangayInput.value.trim()) {
        showError(barangayInput, 'Barangay is required');
        isValid = false;
    }

    const streetInput = form.querySelector('input[name="street"]');
    if (streetInput && !streetInput.value.trim()) {
        showError(streetInput, 'Street / House No. is required');
        isValid = false;
    }

    const cityInput = form.querySelector('input[name="city"]');
    if (cityInput && !cityInput.value.trim()) {
        showError(cityInput, 'City is required');
        isValid = false;
    }

    // ── Phone ──────────────────────────────────────────────────
    // Support both name="phone" and name="phone_number"
    const phoneInput = form.querySelector('input[name="phone"]') || form.querySelector('input[name="phone_number"]');
    if (phoneInput) {
        if (!phoneInput.value.trim()) {
            showError(phoneInput, 'Phone Number is required');
            isValid = false;
        } else if (!/^(09|\+639)[0-9]{8,9}$/.test(phoneInput.value.trim())) {
            showError(phoneInput, 'Phone Number must start with 09 or +639 (e.g. 09123456789)');
            isValid = false;
        }
    }

    // ── Student ID ─────────────────────────────────────────────
    const studentIdInput = form.querySelector('input[name="student_id"]');
    if (studentIdInput) {
        if (!studentIdInput.value.trim()) {
            showError(studentIdInput, 'Student ID is required');
            isValid = false;
        } else if (!/^\d{4}-\d{4,5}$/.test(studentIdInput.value.trim())) {
            showError(studentIdInput, 'Student ID format must be YYYY-NNNNN (e.g. 2023-01234)');
            isValid = false;
        }
    }

    // ── Department ─────────────────────────────────────────────
    const departmentSelect = form.querySelector('select[name="department"]');
    if (departmentSelect && !departmentSelect.value) {
        showError(departmentSelect, 'Department is required');
        isValid = false;
    }

    // ── Program ────────────────────────────────────────────────
    const programSelect = form.querySelector('select[name="program"]');
    if (programSelect) {
        if (!programSelect.value) {
            showError(programSelect, 'Program is required — please select a Department first');
            isValid = false;
        }
    }

    // ── Year Level ─────────────────────────────────────────────
    const yearLevelSelect = form.querySelector('select[name="year_level"]');
    if (yearLevelSelect && !yearLevelSelect.value) {
        showError(yearLevelSelect, 'Year Level is required');
        isValid = false;
    }

    // ── Authorization Code (CPPESO form) ───────────────────────
    const authCodeInput = form.querySelector('input[placeholder*="Authorization Code"]');
    if (formId === 'cppesoForm' && authCodeInput) {
        if (!authCodeInput.value.trim()) {
            showError(authCodeInput, 'Authorization Code is required');
            isValid = false;
        }
    }

    // ── File Upload ────────────────────────────────────────────
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.hasAttribute('required')) {
        const dropzone = fileInput.closest('.dropzone');
        if (dropzone) {
            removeError(dropzone);
            if (!fileInput.files || fileInput.files.length === 0) {
                showError(dropzone, 'Please upload the required document');
                isValid = false;
            }
        } else if (!fileInput.files || fileInput.files.length === 0) {
            showError(fileInput, 'Please upload the required document');
            isValid = false;
        }
    }

    // ── Password ───────────────────────────────────────────────
    const passwordInputs = form.querySelectorAll('input[type="password"]');
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

    // ── Confirm Password ───────────────────────────────────────
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
    const forms = document.querySelectorAll('.account-form');

    if (!forms.length) return;

    // Attach click listener to the submit button of each form
    forms.forEach(form => {
        // Skip forms that already have their own inline submit handler (e.g. studentForm)
        const registerBtn = form.querySelector('#register-btn, button[type="submit"]');

        if (registerBtn && !registerBtn.dataset.validationBound) {
            registerBtn.dataset.validationBound = 'true';
            registerBtn.style.cursor = 'pointer';
            registerBtn.addEventListener('click', function (e) {
                e.preventDefault();

                const formId = form.id;

                if (validateRegistrationForm(formId)) {
                    showSuccessMessage('Registration successful - redirecting...');
                    setTimeout(() => {
                        if (registerBtn.hasAttribute('href')) {
                            window.location.href = registerBtn.getAttribute('href');
                        } else {
                            form.submit();
                        }
                    }, 800);
                }
            });
        }
    });

    // Real-time validation on blur
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
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
    if (!value && !input.hasAttribute('required')) {
        return;
    }

    // Email
    if (input.type === 'email') {
        if (value && !isValidEmail(value)) {
            showError(input, 'Please enter a valid email address');
        }
        // Password
    } else if (input.type === 'password') {
        if (value && !isValidPassword(value)) {
            showError(input, 'Password must be at least 8 characters');
        }
        // Student ID
    } else if (input.name === 'student_id') {
        if (!value) {
            showError(input, 'Student ID is required');
        } else if (!/^\d{4}-\d{4,5}$/.test(value)) {
            showError(input, 'Student ID format must be YYYY-NNNNN (e.g. 2023-01234)');
        }
        // Phone (supports both name="phone" and name="phone_number")
    } else if (input.name === 'phone' || input.name === 'phone_number') {
        if (!value) {
            showError(input, 'Phone Number is required');
        } else if (!/^(09|\+639)[0-9]{8,9}$/.test(value)) {
            showError(input, 'Phone Number must start with 09 or +639 (e.g. 09123456789)');
        }
        // Barangay
    } else if (input.name === 'barangay') {
        if (!value) showError(input, 'Barangay is required');
        // Street
    } else if (input.name === 'street') {
        if (!value) showError(input, 'Street / House No. is required');
        // City
    } else if (input.name === 'city') {
        if (!value) showError(input, 'City is required');
        // First / Last name
    } else if (input.name === 'first_name') {
        if (!value) showError(input, 'First Name is required');
    } else if (input.name === 'last_name') {
        if (!value) showError(input, 'Last Name is required');
        // Selects (department, program, year_level)
    } else if (input.tagName === 'SELECT') {
        if (!value) {
            const labels = { department: 'Department', program: 'Program', year_level: 'Year Level' };
            const label = labels[input.name] || 'This field';
            showError(input, `${label} is required`);
        }
        // Authorization Code
    } else if (input.placeholder && input.placeholder.includes('Authorization Code')) {
        if (!value) showError(input, 'Authorization Code is required');
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
        sendOtpBtn.addEventListener('click', function (e) {
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
        verifyOtpBtn.addEventListener('click', function (e) {
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
        resetPasswordBtn.addEventListener('click', function (e) {
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
        resendOtpLink.addEventListener('click', function (e) {
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

document.addEventListener('DOMContentLoaded', function () {
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
            margin-top: -8px;
            font-weight: 500;
        }
        .account-form > .error-message {
           transform: translateY(-15px);
        }
        .input-error {
            border-color: #dc2626 !important;
        }
    `;
    document.head.appendChild(style);
}
