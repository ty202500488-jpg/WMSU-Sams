/**
 * WMSU-SAMS Student Position Applications
 * Students view admin suggestions and apply for positions
 */

class StudentApplicationSystem {
    constructor() {
        this.suggestedPositions = new Map();
        this.studentApplications = new Map();
        this.init();
    }

    init() {
        this.attachApplicationHandlers();
        this.loadSuggestedPositions();
        this.renderSuggestedPositions();
    }

    /**
     * Load suggested positions for logged-in student
     */
    loadSuggestedPositions() {
        // In production: GET /api/students/{studentId}/suggestions
        // Mock data for demonstration
        const currentStudentId = 'std-001'; // Would come from session
        
        this.suggestedPositions = new Map([
            {
                id: 'pos-001',
                name: 'Library Assistant',
                department: 'University Library',
                description: 'Assist in cataloging, reference services, and shelving',
                schedule: 'Mon-Fri 8:00 AM - 5:00 PM',
                hoursPerWeek: 20,
                hourlyRate: 50,
                weeklyPay: 1000,
                gpa: 2.25,
                program: 'Any',
                dateSuggested: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
                compatibility: 'Your schedule perfectly matches this position',
                applicationStatus: 'pending',
                suggestingAdmin: 'System Administrator'
            },
            {
                id: 'pos-002',
                name: 'Laboratory Monitor',
                department: 'IT Department',
                description: 'Monitor IT lab, assist students, maintain equipment',
                schedule: 'Everyday 9:00 AM - 6:00 PM',
                hoursPerWeek: 25,
                hourlyRate: 60,
                weeklyPay: 1500,
                gpa: 1.75,
                program: 'BSCS recommended',
                dateSuggested: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
                compatibility: 'Your qualifications exceed requirements',
                applicationStatus: 'not-applied',
                suggestingAdmin: 'Department Head'
            }
        ].map(pos => [pos.id, pos]));
    }

    /**
     * Attach application event handlers
     */
    attachApplicationHandlers() {
        document.addEventListener('click', (e) => {
            // Apply for suggested position
            if (e.target.closest('[data-action="apply-suggested-position"]')) {
                const positionId = e.target.closest('[data-action="apply-suggested-position"]').dataset.positionId;
                this.submitApplication(positionId);
            }

            // View position details
            if (e.target.closest('[data-action="view-position-details"]')) {
                const positionId = e.target.closest('[data-action="view-position-details"]').dataset.positionId;
                this.showPositionDetails(positionId);
            }

            // Withdraw application
            if (e.target.closest('[data-action="withdraw-application"]')) {
                const positionId = e.target.closest('[data-action="withdraw-application"]').dataset.positionId;
                this.withdrawApplication(positionId);
            }
        });
    }

    /**
     * Get suggested positions for current student
     */
    getSuggestedPositions() {
        // In production: Filter by current logged-in student
        return Array.from(this.suggestedPositions.values());
    }

    /**
     * Render suggested positions in dashboard
     */
    renderSuggestedPositions() {
        const container = document.getElementById('suggested-positions-container');
        if (!container) return;

        const positions = this.getSuggestedPositions();

        if (positions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p style="margin: 0; font-size: 16px;">No suggestions yet</p>
                    <p style="margin: 6px 0 0 0; font-size: 13px;">Complete your profile to receive position suggestions</p>
                </div>
            `;
            return;
        }

        container.innerHTML = positions.map(position => `
            <article class="position-suggestion-card" data-position-id="${position.id}">
                <div class="application-header">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3>${position.name}</h3>
                            <p style="margin: 6px 0 0 0; color: #666; font-size: 13px;">
                                <i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 4px;"></i>
                                Recommended match for you
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="padding: 4px 8px; background: #eff6ff; border-radius: 4px; font-size: 12px; color: #1d4ed8; font-weight: 600;">
                                Excellent Fit
                            </div>
                        </div>
                    </div>
                    <hr>
                    <p>${position.description}</p>
                </div>

                <div class="application-info">
                    <div class="column">
                        <p><i class="fas fa-building"></i> <strong>Department:</strong> ${position.department}</p>
                        <p><i class="fas fa-money-bill-wave"></i> <strong>Pay:</strong> ₱${position.hourlyRate}/hour</p>
                        <p><i class="fas fa-hourglass-half"></i> <strong>Hours:</strong> ${position.hoursPerWeek} hrs/week</p>
                    </div>

                    <div class="column">
                        <p><i class="fas fa-calendar"></i> <strong>Schedule:</strong> ${position.schedule}</p>
                        <p><i class="fas fa-coins"></i> <strong>Estimated Weekly:</strong> ₱${position.weeklyPay.toLocaleString()}</p>
                        <p><i class="fas fa-check-circle"></i> <strong>Min GPA:</strong> ${position.gpa}</p>
                    </div>

                    <div style="padding: 12px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; margin-top: 12px;">
                        <p style="margin: 0; font-size: 13px; color: #15803d;">
                            <i class="fas fa-check-circle" style="margin-right: 6px;"></i>
                            <strong>Why this match:</strong> ${position.compatibility}
                        </p>
                    </div>
                </div>

                <div class="application-action">
                    <button class="secondary-btn" data-action="view-position-details" data-position-id="${position.id}" style="text-decoration: none;">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                    ${position.applicationStatus === 'pending' 
                        ? `<button class="btn-success" disabled style="background: #10b981; border: none; color: white; cursor: not-allowed;">
                            <i class="fas fa-check"></i> Application Sent
                        </button>`
                        : `<button class="primary-btn" data-action="apply-suggested-position" data-position-id="${position.id}" style="text-decoration: none;">
                            <i class="fas fa-file-alt"></i> Apply Now
                        </button>`
                    }
                </div>
            </article>
        `).join('');

        this.attachApplicationHandlers();
    }

    /**
     * Submit application for position
     */
    async submitApplication(positionId) {
        const position = this.suggestedPositions.get(positionId);
        if (!position) return;

        const currentStudentId = 'std-001'; // Would come from session

        try {
            const button = document.querySelector(
                `[data-action="apply-suggested-position"][data-position-id="${positionId}"]`
            );
            
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update position status
            position.applicationStatus = 'applied';
            this.suggestedPositions.set(positionId, position);

            // Update UI
            if (button) {
                button.innerHTML = '<i class="fas fa-check"></i> Application Sent';
                button.style.background = '#10b981';
                button.disabled = true;
            }

            this.showNotification('success', `Application submitted for ${position.name}!\n\nThe admin will review your application shortly.`);

            // In production: POST /api/applications POST.Send to backend
            console.log(`Application submitted for ${position.name} by student ${currentStudentId}`);

        } catch (error) {
            console.error('Error submitting application:', error);
            this.showNotification('error', 'Failed to submit application. Please try again.');
            
            const button = document.querySelector(
                `[data-action="apply-suggested-position"][data-position-id="${positionId}"]`
            );
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-file-alt"></i> Apply Now';
            }
        }
    }

    /**
     * Show detailed position information
     */
    showPositionDetails(positionId) {
        const position = this.suggestedPositions.get(positionId);
        if (!position) return;

        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'position-details-modal-' + positionId;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>${position.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <div style="padding-bottom: 12px; border-bottom: 1px solid #eee;">
                            <span style="color: #666; font-size: 14px;">Department</span>
                            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600;">${position.department}</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div style="padding: 12px; background: #f3f4f6; border-radius: 6px;">
                            <span style="font-size: 12px; color: #666;">Hours per Week</span>
                            <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: 700;">${position.hoursPerWeek}h</p>
                        </div>
                        <div style="padding: 12px; background: #f3f4f6; border-radius: 6px;">
                            <span style="font-size: 12px; color: #666;">Hourly Rate</span>
                            <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: 700;">₱${position.hourlyRate}/h</p>
                        </div>
                        <div style="padding: 12px; background: #f3f4f6; border-radius: 6px;">
                            <span style="font-size: 12px; color: #666;">Weekly Earnings</span>
                            <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: 700; color: #10b981;">₱${position.weeklyPay.toLocaleString()}</p>
                        </div>
                        <div style="padding: 12px; background: #f3f4f6; border-radius: 6px;">
                            <span style="font-size: 12px; color: #666;">Monthly (approx.)</span>
                            <p style="margin: 6px 0 0 0; font-size: 18px; font-weight: 700; color: #10b981;">₱${(position.weeklyPay * 4).toLocaleString()}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Position Description</h4>
                        <p style="margin: 0; color: #555; line-height: 1.5; font-size: 13px;">${position.description}</p>
                    </div>

                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Work Schedule</h4>
                        <p style="margin: 0; color: #555; font-size: 13px;">
                            <i class="fas fa-clock" style="margin-right: 6px; color: #666;"></i>
                            ${position.schedule}
                        </p>
                    </div>

                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Requirements</h4>
                        <div style="font-size: 13px;">
                            <p style="margin: 0 0 6px 0;">
                                <i class="fas fa-check-circle" style="margin-right: 6px; color: #10b981;"></i>
                                Minimum GPA: ${position.gpa}
                            </p>
                            <p style="margin: 0;">
                                <i class="fas fa-check-circle" style="margin-right: 6px; color: #10b981;"></i>
                                Program: ${position.program}
                            </p>
                        </div>
                    </div>

                    <div style="padding: 12px; background: #eff6ff; border-left: 4px solid #1d4ed8; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #1d4ed8;">
                            <i class="fas fa-lightbulb" style="margin-right: 6px;"></i>
                            <strong>Why this position:</strong> ${position.compatibility}
                        </p>
                    </div>

                    <div style="padding: 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 15px; font-size: 12px; color: #666;">
                        <p style="margin: 0 0 6px 0;">
                            <i class="fas fa-user-tie" style="margin-right: 6px;"></i>
                            <strong>Suggested by:</strong> ${position.suggestingAdmin}
                        </p>
                        <p style="margin: 0;">
                            <i class="fas fa-calendar" style="margin-right: 6px;"></i>
                            <strong>Date:</strong> ${new Date(position.dateSuggested).toLocaleDateString()}
                        </p>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <a href="#" class="modal-close secondary-btn" style="flex: 1; text-align: center;">Close</a>
                        ${position.applicationStatus === 'not-applied' 
                            ? `<button class="btn-primary" data-action="apply-suggested-position" data-position-id="${positionId}" style="flex: 1;">
                                <i class="fas fa-file-alt"></i> Apply Now
                            </button>`
                            : `<button class="btn-success" disabled style="flex: 1; background: #10b981; cursor: not-allowed; border: none; color: white; padding: 10px; border-radius: 6px;">
                                <i class="fas fa-check"></i> Application Sent
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        // Close handlers
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modalManager.hide(modalId);
                setTimeout(() => modal.remove(), 300);
            });
        });
    }

    /**
     * Withdraw application
     */
    async withdrawApplication(positionId) {
        const position = this.suggestedPositions.get(positionId);
        if (!position) return;

        const modalManager = window.modalManager || new ModalManager();
        modalManager.showConfirmation(
            'Withdraw Application',
            `Are you sure you want to withdraw your application for ${position.name}?`,
            async () => {
                try {
                    position.applicationStatus = 'withdrawn';
                    this.suggestedPositions.set(positionId, position);

                    this.showNotification('success', 'Application withdrawn');

                    // Update UI
                    const card = document.querySelector(`[data-position-id="${positionId}"]`).closest('.position-suggestion-card');
                    if (card) {
                        const btn = card.querySelector('[data-action="apply-suggested-position"]');
                        if (btn) {
                            btn.disabled = false;
                            btn.innerHTML = '<i class="fas fa-file-alt"></i> Apply Now';
                            btn.style.background = '';
                        }
                    }

                } catch (error) {
                    this.showNotification('error', 'Failed to withdraw application');
                }
            }
        );
    }

    /**
     * Show notification
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            max-width: 400px;
            white-space: pre-wrap;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.applicationSystem = new StudentApplicationSystem();
    });
} else {
    window.applicationSystem = new StudentApplicationSystem();
}
