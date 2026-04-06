/**
 * WMSU-SAMS Payroll Management System
 * Handles hourly tracking, salary calculation, and payroll management
 */

class PayrollSystem {
    constructor() {
        this.employees = new Map();
        this.payRecords = new Map();
        this.payRules = new Map();
        this.workLogs = new Map();
        this.init();
    }

    init() {
        this.initializePayRules();
        this.initializePayData();
        this.attachPayrollHandlers();
    }

    /**
     * Initialize pay rules (hourly rates)
     */
    initializePayRules() {
        this.payRules = new Map([
            ['librarian', { hourly: 50, fixed: null, type: 'hourly' }],
            ['lab-monitor', { hourly: 60, fixed: null, type: 'hourly' }],
            ['office-clerk', { hourly: 50, fixed: null, type: 'hourly' }],
            ['teaching-assistant', { hourly: 55, fixed: null, type: 'hourly' }],
            ['default', { hourly: 50, fixed: null, type: 'hourly' }]
        ]);
    }

    /**
     * Initialize payroll data
     */
    initializePayData() {
        this.employees = new Map([
            {
                id: 'sa-001', name: 'Ricardo Luna', studentId: '2021-00001',
                department: 'Library', position: 'librarian',
                status: 'active'
            },
            {
                id: 'sa-002', name: 'Maria Santos', studentId: '2022-00145',
                department: 'Library', position: 'librarian',
                status: 'active'
            },
            {
                id: 'sa-003', name: 'Juan dela Cruz', studentId: '2021-00388',
                department: 'IT Lab', position: 'lab-monitor',
                status: 'active'
            }
        ].map(emp => [emp.id, emp]));

        // Initialize work logs (in production, these would come from DTR submissions)
        this.workLogs = new Map([
            {
                id: 'log-001', employeeId: 'sa-001', date: '2026-03-24',
                startTime: '08:00', endTime: '12:30', hoursWorked: 4.5,
                status: 'approved'
            },
            {
                id: 'log-002', employeeId: 'sa-001', date: '2026-03-25',
                startTime: '08:00', endTime: '16:00', hoursWorked: 8,
                status: 'approved'
            },
            {
                id: 'log-003', employeeId: 'sa-002', date: '2026-03-24',
                startTime: '13:00', endTime: '17:00', hoursWorked: 4,
                status: 'pending'
            }
        ].map(log => [log.id, log]));
    }

    /**
     * Attach payroll event handlers
     */
    attachPayrollHandlers() {
        document.addEventListener('click', (e) => {
            // Approve DTR
            if (e.target.closest('[data-action="approve-dtr"]')) {
                const logId = e.target.closest('[data-action="approve-dtr"]').dataset.logId;
                this.approveDTR(logId);
            }

            // Reject DTR
            if (e.target.closest('[data-action="reject-dtr"]')) {
                const logId = e.target.closest('[data-action="reject-dtr"]').dataset.logId;
                this.rejectDTR(logId);
            }

            // Release pay
            if (e.target.closest('[data-action="release-pay"]')) {
                const employeeId = e.target.closest('[data-action="release-pay"]').dataset.employeeId;
                this.releasePay(employeeId);
            }

            // Set hourly rate
            if (e.target.closest('[data-action="set-rate"]')) {
                const positionType = e.target.closest('[data-action="set-rate"]').dataset.position;
                this.showSetRateModal(positionType);
            }
        });
    }

    /**
     * Calculate gross pay for an employee in a period
     */
    calculateGrossPay(employeeId, startDate, endDate) {
        const employee = this.employees.get(employeeId);
        if (!employee) return 0;

        const payRule = this.payRules.get(employee.position) || this.payRules.get('default');

        // Get all approved logs for this employee in the period
        const relevantLogs = Array.from(this.workLogs.values()).filter(log =>
            log.employeeId === employeeId &&
            log.status === 'approved' &&
            log.date >= startDate &&
            log.date <= endDate
        );

        const totalHours = relevantLogs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const grossPay = totalHours * (payRule.hourly || 50);

        return {
            totalHours,
            hourlyRate: payRule.hourly,
            grossPay,
            logs: relevantLogs
        };
    }

    /**
     * Approve a daily time record
     */
    async approveDTR(logId) {
        const log = this.workLogs.get(logId);
        if (!log) return;

        const button = document.querySelector(`[data-action="approve-dtr"][data-log-id="${logId}"]`);
        if (!button) return;

        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update status
            log.status = 'approved';
            this.workLogs.set(logId, log);

            // Update UI
            const row = document.querySelector(`tr[data-log-id="${logId}"]`);
            if (row) {
                const statusCell = row.querySelector('[data-status-cell]');
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge approved">Approved</span>';
                }
                const actionCell = row.querySelector('[data-action-cell]');
                if (actionCell) {
                    actionCell.innerHTML = '<span style="font-size: 12px; color: #10b981;"><i class="fas fa-check-circle"></i> Approved</span>';
                }
            }

            this.showNotification('success', 'Daily Time Record has been approved');

        } catch (error) {
            console.error('Error approving DTR:', error);
            this.showNotification('error', 'Failed to approve DTR. Please try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-check"></i> Approve';
        }
    }

    /**
     * Reject a daily time record
     */
    async rejectDTR(logId) {
        const log = this.workLogs.get(logId);
        if (!log) return;

        const modalManager = window.modalManager || new ModalManager();
        const reason = prompt('Enter reason for rejection:');
        if (!reason) return;

        const button = document.querySelector(`[data-action="reject-dtr"][data-log-id="${logId}"]`);

        try {
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            log.status = 'rejected';
            log.rejectionReason = reason;
            this.workLogs.set(logId, log);

            const row = document.querySelector(`tr[data-log-id="${logId}"]`);
            if (row) {
                const statusCell = row.querySelector('[data-status-cell]');
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge rejected">Rejected</span>';
                }
                const actionCell = row.querySelector('[data-action-cell]');
                if (actionCell) {
                    actionCell.innerHTML = '<span style="font-size: 12px; color: #ef4444;"><i class="fas fa-times-circle"></i> Rejected</span>';
                }
            }

            this.showNotification('success', 'DTR has been rejected');

        } catch (error) {
            console.error('Error rejecting DTR:', error);
            this.showNotification('error', 'Failed to reject DTR. Please try again.');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-times"></i> Reject';
            }
        }
    }

    /**
     * Release pay for an employee
     */
    async releasePay(employeeId) {
        const employee = this.employees.get(employeeId);
        if (!employee) return;

        const button = document.querySelector(`[data-action="release-pay"][data-employee-id="${employeeId}"]`);
        if (!button) return;

        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            await new Promise(resolve => setTimeout(resolve, 500));

            // Create pay record
            const payRecord = {
                id: `pay-${employeeId}-${Date.now()}`,
                employeeId,
                dateReleased: new Date().toISOString(),
                status: 'released'
            };

            // Record the payment
            this.showNotification('success', `Pay has been released to ${employee.name}`);

        } catch (error) {
            console.error('Error releasing pay:', error);
            this.showNotification('error', 'Failed to release pay. Please try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-money-bill"></i> Release';
        }
    }

    /**
     * Show modal to set hourly rate
     */
    showSetRateModal(positionType) {
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'set-rate-modal-' + positionType;
        const currentRule = this.payRules.get(positionType) || { hourly: 50 };

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Set Hourly Rate: ${positionType}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <form style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Hourly Rate (₱)</label>
                            <input type="number" id="hourly-rate" value="${currentRule.hourly}" min="0" step="5" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <a href="#" class="modal-close secondary-btn">Cancel</a>
                            <button type="submit" class="btn-primary" style="flex: 1;">Save Rate</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const rate = parseFloat(document.getElementById('hourly-rate').value);
            if (rate >= 0) {
                this.payRules.set(positionType, { hourly: rate, type: 'hourly' });
                this.showNotification('success', `Hourly rate for ${positionType} updated to ₱${rate}`);
                modalManager.hide(modalId);
                setTimeout(() => modal.remove(), 300);
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Generate monthly payroll report
     */
    generatePayrollReport(month, year) {
        const report = {
            month,
            year,
            employees: [],
            totalAmount: 0,
            totalHours: 0
        };

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        for (const [empId, employee] of this.employees) {
            const payInfo = this.calculateGrossPay(empId, startDate, endDate);
            report.employees.push({
                ...employee,
                ...payInfo
            });
            report.totalAmount += payInfo.grossPay;
            report.totalHours += payInfo.totalHours;
        }

        return report;
    }

    /**
     * Show notification toast
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
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.payrollSystem = new PayrollSystem();
    });
} else {
    window.payrollSystem = new PayrollSystem();
}
