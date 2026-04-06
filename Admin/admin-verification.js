/**
 * WMSU-SAMS Admin Verification System
 * Handles student and department verification/approval/rejection
 */

class VerificationSystem {
    constructor() {
        this.studentVerifications = new Map();
        this.departmentVerifications = new Map();
        this.processingIds = new Set(); // Prevent duplicate actions
        this.init();
    }

    /**
     * Initialize the verification system
     */
    init() {
        this.attachStudentVerificationHandlers();
        this.attachDepartmentVerificationHandlers();
        this.initializeVerificationData();
    }

    /**
     * Initialize mock data (in production, this would come from a backend)
     */
    initializeVerificationData() {
        // Student verification data
        this.studentVerifications = new Map([
            { id: 'std-001', name: 'Maria Santos', studentId: '2022-00145', status: 'pending', gwa: 1.75 },
            { id: 'std-002', name: 'Juan dela Cruz', studentId: '2021-00388', status: 'pending', gwa: 1.85 },
            { id: 'std-003', name: 'Ana Reyes', studentId: '2023-00072', status: 'pending', gwa: 2.00 },
            { id: 'std-004', name: 'Carlos Mendez', studentId: '2020-00561', status: 'approved', gwa: 1.60 },
            { id: 'std-005', name: 'Liza Torres', studentId: '2022-00299', status: 'pending', gwa: 2.25 },
            { id: 'std-006', name: 'Rico Garcia', studentId: '2021-00431', status: 'rejected', gwa: 2.75 }
        ].map(item => [item.id, item]));

        // Department verification data
        this.departmentVerifications = new Map([
            { id: 'dept-001', name: 'College of Nursing', status: 'pending', slots: 8 },
            { id: 'dept-002', name: 'College of Engineering', status: 'pending', slots: 12 },
            { id: 'dept-003', name: 'Information Technology Dept.', status: 'pending', slots: 10 },
            { id: 'dept-004', name: 'College of Education', status: 'approved', slots: 6 },
            { id: 'dept-005', name: 'University Library', status: 'approved', slots: 5 }
        ].map(item => [item.id, item]));
    }

    /**
     * Attach handlers to student verification buttons
     */
    attachStudentVerificationHandlers() {
        document.addEventListener('click', (e) => {
            // Approve button
            if (e.target.closest('.btn-approve[data-student-id]')) {
                const studentId = e.target.closest('.btn-approve').dataset.studentId;
                this.approveStudent(studentId);
            }

            // Reject button
            if (e.target.closest('.btn-reject[data-student-id]')) {
                const studentId = e.target.closest('.btn-reject').dataset.studentId;
                this.rejectStudent(studentId);
            }

            // View docs button
            if (e.target.closest('.btn-view[data-student-id]')) {
                const studentId = e.target.closest('.btn-view').dataset.studentId;
                this.viewStudentDocs(studentId);
            }
        });
    }

    /**
     * Attach handlers to department verification buttons
     */
    attachDepartmentVerificationHandlers() {
        document.addEventListener('click', (e) => {
            // Approve department button
            if (e.target.closest('.btn-approve[data-dept-id]')) {
                const deptId = e.target.closest('.btn-approve').dataset.deptId;
                this.approveDepartment(deptId);
            }

            // Reject department button
            if (e.target.closest('.btn-reject[data-dept-id]')) {
                const deptId = e.target.closest('.btn-reject').dataset.deptId;
                this.rejectDepartment(deptId);
            }

            // View department docs
            if (e.target.closest('.btn-view[data-dept-id]')) {
                const deptId = e.target.closest('.btn-view').dataset.deptId;
                this.viewDeptDocs(deptId);
            }
        });
    }

    /**
     * Approve a student
     */
    async approveStudent(studentId) {
        // Prevent duplicate actions
        if (this.processingIds.has(studentId)) return;
        this.processingIds.add(studentId);

        const student = this.studentVerifications.get(studentId);
        if (!student) return;

        const button = document.querySelector(`.btn-approve[data-student-id="${studentId}"]`);
        if (!button) return;

        try {
            // Show loading state
            this.setButtonLoading(button, true);

            // Simulate API call
            await this.simulateApiCall(500);

            // Update data
            student.status = 'approved';
            this.studentVerifications.set(studentId, student);

            // Update UI
            this.updateStudentRow(studentId, student);
            this.showNotification('success', `${student.name} has been approved successfully`);

            // Log action
            this.logAction('APPROVE_STUDENT', student);

        } catch (error) {
            console.error('Error approving student:', error);
            this.showNotification('error', 'Failed to approve student. Please try again.');
        } finally {
            this.setButtonLoading(button, false);
            this.processingIds.delete(studentId);
        }
    }

    /**
     * Reject a student
     */
    async rejectStudent(studentId) {
        // Prevent duplicate actions
        if (this.processingIds.has(studentId)) return;
        this.processingIds.add(studentId);

        const student = this.studentVerifications.get(studentId);
        if (!student) return;

        const button = document.querySelector(`.btn-reject[data-student-id="${studentId}"]`);
        if (!button) return;

        // Show confirmation
        const modalManager = window.modalManager || new ModalManager();
        modalManager.showConfirmation(
            'Reject Student',
            `Are you sure you want to reject ${student.name}'s application?`,
            async () => {
                try {
                    this.setButtonLoading(button, true);
                    await this.simulateApiCall(500);

                    student.status = 'rejected';
                    this.studentVerifications.set(studentId, student);
                    this.updateStudentRow(studentId, student);
                    this.showNotification('success', `${student.name}'s application has been rejected`);
                    this.logAction('REJECT_STUDENT', student);

                } catch (error) {
                    console.error('Error rejecting student:', error);
                    this.showNotification('error', 'Failed to reject student. Please try again.');
                } finally {
                    this.setButtonLoading(button, false);
                    this.processingIds.delete(studentId);
                }
            },
            () => {
                this.processingIds.delete(studentId);
            }
        );
    }

    /**
     * View student documents (shows modal or redirects)
     */
    viewStudentDocs(studentId) {
        const student = this.studentVerifications.get(studentId);
        if (!student) return;

        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'student-docs-modal-' + studentId;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay docs-modal';
        modal.innerHTML = `
            <div class="modal-box large">
                <div class="modal-header">
                    <h3>Documents: ${student.name} (${student.studentId})</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <div class="doc-preview">
                        <div class="doc-item">
                            <i class="fas fa-file-pdf" style="font-size: 48px; color: #dc2626;"></i>
                            <p>Certificate of Registration (COR)</p>
                            <a href="#" class="doc-link"><i class="fas fa-download"></i> Download</a>
                        </div>
                        <div class="doc-item">
                            <i class="fas fa-file-alt" style="font-size: 48px; color: #2563eb;"></i>
                            <p>Resume</p>
                            <a href="#" class="doc-link"><i class="fas fa-download"></i> Download</a>
                        </div>
                    </div>
                    <div class="doc-meta">
                        <p><strong>GWA:</strong> ${student.gwa}</p>
                        <p><strong>Status:</strong> <span class="badge ${student.status}">${student.status}</span></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        // Close handler
        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Approve a department
     */
    async approveDepartment(deptId) {
        if (this.processingIds.has(deptId)) return;
        this.processingIds.add(deptId);

        const dept = this.departmentVerifications.get(deptId);
        if (!dept) return;

        const button = document.querySelector(`.btn-approve[data-dept-id="${deptId}"]`);
        if (!button) return;

        try {
            this.setButtonLoading(button, true);
            await this.simulateApiCall(500);

            dept.status = 'approved';
            this.departmentVerifications.set(deptId, dept);
            this.updateDepartmentRow(deptId, dept);
            this.showNotification('success', `${dept.name} has been approved successfully`);
            this.logAction('APPROVE_DEPARTMENT', dept);

        } catch (error) {
            console.error('Error approving department:', error);
            this.showNotification('error', 'Failed to approve department. Please try again.');
        } finally {
            this.setButtonLoading(button, false);
            this.processingIds.delete(deptId);
        }
    }

    /**
     * Reject a department
     */
    async rejectDepartment(deptId) {
        if (this.processingIds.has(deptId)) return;
        this.processingIds.add(deptId);

        const dept = this.departmentVerifications.get(deptId);
        if (!dept) return;

        const button = document.querySelector(`.btn-reject[data-dept-id="${deptId}"]`);
        if (!button) return;

        const modalManager = window.modalManager || new ModalManager();
        modalManager.showConfirmation(
            'Reject Department',
            `Are you sure you want to reject ${dept.name}'s registration?`,
            async () => {
                try {
                    this.setButtonLoading(button, true);
                    await this.simulateApiCall(500);

                    dept.status = 'rejected';
                    this.departmentVerifications.set(deptId, dept);
                    this.updateDepartmentRow(deptId, dept);
                    this.showNotification('success', `${dept.name} has been rejected`);
                    this.logAction('REJECT_DEPARTMENT', dept);

                } catch (error) {
                    console.error('Error rejecting department:', error);
                    this.showNotification('error', 'Failed to reject department. Please try again.');
                } finally {
                    this.setButtonLoading(button, false);
                    this.processingIds.delete(deptId);
                }
            },
            () => this.processingIds.delete(deptId)
        );
    }

    /**
     * View department documents
     */
    viewDeptDocs(deptId) {
        const dept = this.departmentVerifications.get(deptId);
        if (!dept) return;

        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'dept-docs-modal-' + deptId;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay docs-modal';
        modal.innerHTML = `
            <div class="modal-box large">
                <div class="modal-header">
                    <h3>Documents: ${dept.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <div class="doc-preview">
                        <div class="doc-item">
                            <i class="fas fa-file-contract" style="font-size: 48px; color: #7c3aed;"></i>
                            <p>Memorandum of Agreement (MOA)</p>
                            <a href="#" class="doc-link"><i class="fas fa-download"></i> Download</a>
                        </div>
                        <div class="doc-item">
                            <i class="fas fa-envelope" style="font-size: 48px; color: #f59e0b;"></i>
                            <p>Authorization Letter</p>
                            <a href="#" class="doc-link"><i class="fas fa-download"></i> Download</a>
                        </div>
                    </div>
                    <div class="doc-meta">
                        <p><strong>SA Slots:</strong> ${dept.slots}</p>
                        <p><strong>Status:</strong> <span class="badge ${dept.status}">${dept.status}</span></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Update student row in table
     */
    updateStudentRow(studentId, student) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        if (!row) return;

        // Update status badge
        const statusCell = row.querySelector('[data-status-cell]');
        if (statusCell) {
            const badgeClass = student.status === 'approved' ? 'approved' : 
                              student.status === 'rejected' ? 'rejected' : 'pending';
            statusCell.innerHTML = `<span class="badge ${badgeClass}">${student.status}</span>`;
        }

        // Update action buttons
        const actionCell = row.querySelector('[data-action-cell]');
        if (actionCell) {
            if (student.status === 'approved') {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-student-id="${studentId}"><i class="fas fa-eye"></i> View Docs</button>
                        <span style="font-size:12px;color:var(--green);font-weight:600;"><i class="fas fa-check-circle"></i> Verified</span>
                    </div>
                `;
            } else if (student.status === 'rejected') {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-student-id="${studentId}"><i class="fas fa-eye"></i> View Docs</button>
                        <span style="font-size:12px;color:var(--red);font-weight:600;"><i class="fas fa-times-circle"></i> Rejected</span>
                    </div>
                `;
            } else {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-student-id="${studentId}"><i class="fas fa-eye"></i> View Docs</button>
                        <button class="btn btn-approve btn-sm" data-student-id="${studentId}"><i class="fas fa-check"></i> Approve</button>
                        <button class="btn btn-reject btn-sm" data-student-id="${studentId}"><i class="fas fa-times"></i> Reject</button>
                    </div>
                `;
            }
        }
    }

    /**
     * Update department row in table
     */
    updateDepartmentRow(deptId, dept) {
        const row = document.querySelector(`tr[data-dept-id="${deptId}"]`);
        if (!row) return;

        const statusCell = row.querySelector('[data-status-cell]');
        if (statusCell) {
            const badgeClass = dept.status === 'approved' ? 'approved' : 
                              dept.status === 'rejected' ? 'rejected' : 'pending';
            statusCell.innerHTML = `<span class="badge ${badgeClass}">${dept.status}</span>`;
        }

        const actionCell = row.querySelector('[data-action-cell]');
        if (actionCell) {
            if (dept.status === 'approved') {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-dept-id="${deptId}"><i class="fas fa-eye"></i> View</button>
                        <button class="btn btn-edit btn-sm"><i class="fas fa-edit"></i> Edit</button>
                    </div>
                `;
            } else if (dept.status === 'rejected') {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-dept-id="${deptId}"><i class="fas fa-eye"></i> View</button>
                        <span style="font-size:12px;color:var(--red);font-weight:600;"><i class="fas fa-times-circle"></i> Rejected</span>
                    </div>
                `;
            } else {
                actionCell.innerHTML = `
                    <div class="action-btns">
                        <button class="btn btn-view btn-sm" data-dept-id="${deptId}"><i class="fas fa-eye"></i> View</button>
                        <button class="btn btn-approve btn-sm" data-dept-id="${deptId}"><i class="fas fa-check"></i> Approve</button>
                        <button class="btn btn-reject btn-sm" data-dept-id="${deptId}"><i class="fas fa-times"></i> Reject</button>
                    </div>
                `;
            }
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            button.style.opacity = '0.6';
        } else {
            button.disabled = false;
            const originalHTML = button.dataset.originalHtml || button.innerHTML;
            button.innerHTML = originalHTML;
            button.style.opacity = '1';
        }
    }

    /**
     * Show notification toast
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notif-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
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
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Log actions for audit trail
     */
    logAction(action, data) {
        const log = {
            timestamp: new Date().toISOString(),
            action: action,
            user: 'admin', // In production, get from session
            data: data
        };
        console.log('Action logged:', log);
        // In production, send to backend: POST /api/logs
    }

    /**
     * Simulate API call delay
     */
    simulateApiCall(delay = 500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.verificationSystem = new VerificationSystem();
    });
} else {
    window.verificationSystem = new VerificationSystem();
}
