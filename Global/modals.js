/**
 * WMSU-SAMS Modal Manager
 * Reusable modal component handler
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.initializeModals();
        this.attachCloseHandlers();
    }

    /**
     * Find all modals in the page
     */
    initializeModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            const id = modal.id;
            if (id) {
                this.modals.set(id, modal);
            }
        });
    }

    /**
     * Show a modal
     */
    show(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            window.location.hash = '#' + modalId;
        }
    }

    /**
     * Hide a modal (by removing hash)
     */
    hide(modalId = null) {
        if (modalId) {
            // Navigate away from the modal hash
            history.pushState(null, '', window.location.pathname);
        } else {
            // Hide current modal
            window.location.hash = '';
        }
    }

    /**
     * Create and show a confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {function} onConfirm - Callback when confirmed
     * @param {function} onCancel - Callback when cancelled (optional)
     * @param {object} options - Additional options
     */
    showConfirmation(title, message, onConfirm, onCancel = null, options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmColor = 'danger-btn'
        } = options;

        const modalId = 'confirmation-modal-' + Date.now();
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay confirm-dialog';
        modal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fa-solid fa-exclamation-triangle"></i> ${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <a href="#" class="secondary-btn cancel-btn">
                        <i class="fa-solid fa-times"></i> ${cancelText}
                    </a>
                    <button class="confirm-btn ${confirmColor}">
                        <i class="fa-solid fa-check"></i> ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modals.set(modalId, modal);

        // Attach event handlers
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hide(modalId);
            if (onCancel) onCancel();
            // Remove modal from DOM after hiding
            setTimeout(() => modal.remove(), 300);
        });

        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (onConfirm) onConfirm();
            this.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });

        // Show modal
        this.show(modalId);
    }

    /**
     * Create and show an alert modal
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {string} type - 'success', 'error', 'info'
     * @param {function} onClose - Callback when closed (optional)
     */
    showAlert(title, message, type = 'success', onClose = null) {
        const modalId = 'alert-modal-' + Date.now();
        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        const icon = iconMap[type] || 'fa-info-circle';
        const modalClass = type === 'error' ? 'error-alert' : type === 'success' ? 'success-alert' : 'error-alert';

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = `modal-overlay ${modalClass}`;
        modal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fa-solid ${icon}"></i> ${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="success-btn" style="width: 100%;">
                        <i class="fa-solid fa-check"></i> OK
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modals.set(modalId, modal);

        const okBtn = modal.querySelector('.success-btn');
        okBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hide(modalId);
            if (onClose) onClose();
            setTimeout(() => modal.remove(), 300);
        });

        // Also close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide(modalId);
                if (onClose) onClose();
                document.removeEventListener('keydown', escapeHandler);
                setTimeout(() => modal.remove(), 300);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        this.show(modalId);
    }

    /**
     * Attach close handlers to existing modals
     */
    attachCloseHandlers() {
        document.addEventListener('click', (e) => {
            // Close modal when clicking cancel/secondary button
            if (e.target.closest('.cancel-btn') || e.target.closest('.secondary-btn')) {
                e.preventDefault();
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    window.location.hash = '';
                }
            }
        });

        // Close modal when clicking overlay background
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') && e.target.id) {
                e.preventDefault();
                window.location.hash = '';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.location.hash) {
                window.location.hash = '';
            }
        });
    }

    /**
     * Create and show a rejection reason modal
     * @param {string} studentName - Name of the student being rejected
     * @param {function} onSubmit - Callback with reason when submitted (reason object with type, customReason, etc)
     * @param {function} onCancel - Callback when cancelled (optional)
     */
    showRejectionReasonModal(studentName, onSubmit, onCancel = null) {
        const modalId = 'rejection-modal-' + Date.now();
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay rejection-modal';
        modal.innerHTML = `
            <div class="modal-box">
                <h3><i class="fa-solid fa-times-circle"></i> Reject Application</h3>
                <p>Rejecting application from <strong>${studentName}</strong></p>
                
                <form class="rejection-form" id="rejection-form-${Date.now()}">
                    <div class="form-group">
                        <label>Reason for Rejection <span class="required">*</span></label>
                        <div class="preset-reasons">
                            <div class="reason-option">
                                <input type="radio" id="reason-schedule" name="reason-type" value="schedule" required>
                                <label for="reason-schedule">Schedule conflict or unavailability</label>
                            </div>
                            <div class="reason-option">
                                <input type="radio" id="reason-gpa" name="reason-type" value="gpa" required>
                                <label for="reason-gpa">GPA requirement not met</label>
                            </div>
                            <div class="reason-option">
                                <input type="radio" id="reason-qualifications" name="reason-type" value="qualifications" required>
                                <label for="reason-qualifications">Missing required qualifications</label>
                            </div>
                            <div class="reason-option">
                                <input type="radio" id="reason-documents" name="reason-type" value="documents" required>
                                <label for="reason-documents">Incomplete or missing documents</label>
                            </div>
                            <div class="reason-option">
                                <input type="radio" id="reason-other" name="reason-type" value="other" required>
                                <label for="reason-other">Other (please specify)</label>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Additional Comments <span class="required">*</span></label>
                        <textarea name="rejection-reason" id="rejection-reason" placeholder="Please provide specific feedback for the student..." required></textarea>
                        <div class="char-count"><span id="char-count">0</span>/500</div>
                        <div class="error-message" id="reason-error">Please provide a reason (minimum 10 characters)</div>
                    </div>

                    <div class="rejection-actions">
                        <button type="button" class="cancel-btn" id="cancel-rejection">
                            <i class="fa-solid fa-times"></i> Cancel
                        </button>
                        <button type="submit" class="confirm-btn" id="confirm-rejection">
                            <i class="fa-solid fa-check"></i> Submit Rejection
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.modals.set(modalId, modal);

        // Get form elements
        const form = modal.querySelector('form');
        const reasonTypeInputs = modal.querySelectorAll('input[name="reason-type"]');
        const reasonTextarea = modal.querySelector('textarea[name="rejection-reason"]');
        const charCount = modal.querySelector('#char-count');
        const errorMessage = modal.querySelector('#reason-error');
        const submitBtn = modal.querySelector('#confirm-rejection');
        const cancelBtn = modal.querySelector('#cancel-rejection');

        // Character counter
        reasonTextarea.addEventListener('input', () => {
            charCount.textContent = reasonTextarea.value.length;
            if (reasonTextarea.value.length >= 10) {
                reasonTextarea.classList.remove('required-field');
                errorMessage.classList.remove('show');
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        });

        // Form validation on submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedReason = Array.from(reasonTypeInputs).find(r => r.checked)?.value;
            const customReason = reasonTextarea.value.trim();

            if (!selectedReason) {
                alertify.error('Please select a reason');
                return;
            }

            if (customReason.length < 10) {
                reasonTextarea.classList.add('required-field');
                errorMessage.classList.add('show');
                return;
            }

            // Submit the form with the rejection data
            const rejectionData = {
                type: selectedReason,
                reason: customReason,
                submittedAt: new Date().toISOString()
            };

            this.hide(modalId);
            if (onSubmit) onSubmit(rejectionData);
            setTimeout(() => modal.remove(), 300);
        });

        // Cancel button
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hide(modalId);
            if (onCancel) onCancel();
            setTimeout(() => modal.remove(), 300);
        });

        // Show modal
        this.show(modalId);
    }

    /**
     * Convert existing HTML modals to use this manager
     * Call this if you have modals already in HTML
     */
    registerExistingModals() {
        this.initializeModals();
    }
}

// Create global instance
const modalManager = new ModalManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    modalManager.registerExistingModals();
});

// Helper functions for easy use
function confirmAction(title, message, onConfirm, onCancel = null, options = {}) {
    modalManager.showConfirmation(title, message, onConfirm, onCancel, options);
}

function showAlert(title, message, type = 'success', onClose = null) {
    modalManager.showAlert(title, message, type, onClose);
}

function hideModal(modalId) {
    modalManager.hide(modalId);
}

function showModal(modalId) {
    modalManager.show(modalId);
}

/**
 * Show rejection reason modal for employers rejecting applications
 * @param {string} studentName - Name of the student being rejected
 * @param {function} onSubmit - Callback with rejection reason
 * @param {function} onCancel - Optional cancel callback
 */
function showRejectionReasonModal(studentName, onSubmit, onCancel = null) {
    modalManager.showRejectionReasonModal(studentName, onSubmit, onCancel);
}
