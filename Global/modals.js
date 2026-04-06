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
