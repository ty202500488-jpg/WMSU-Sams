/**
 * WMSU-SAMS Smart Student Deployment System
 * Handles intelligent assignment of students to departments based on
 * grades, schedule availability, and department requirements
 */

class DeploymentSystem {
    constructor() {
        this.students = new Map();
        this.departments = new Map();
        this.deployments = new Map();
        this.scheduleConflicts = new Map();
        this.init();
    }

    init() {
        this.initializeData();
        this.attachDeploymentHandlers();
    }

    /**
     * Initialize student and department data
     */
    initializeData() {
        // Initialize students with their details
        this.students = new Map([
            {
                id: 'std-001', name: 'Maria Santos', studentId: '2022-00145',
                gwa: 1.75, verified: true, program: 'BSCS', year: 3,
                schedule: { monday: '09:00-12:00', wednesday: '09:00-12:00', friday: '09:00-12:00' },
                maxHoursPerWeek: 20
            },
            {
                id: 'std-002', name: 'Juan dela Cruz', studentId: '2021-00388',
                gwa: 1.85, verified: true, program: 'BSBA', year: 4,
                schedule: { tuesday: '13:00-17:00', thursday: '13:00-17:00' },
                maxHoursPerWeek: 15
            },
            {
                id: 'std-003', name: 'Ana Reyes', studentId: '2023-00072',
                gwa: 2.00, verified: true, program: 'BSN', year: 2,
                schedule: { monday: '14:00-17:00', thursday: '14:00-17:00', saturday: '10:00-14:00' },
                maxHoursPerWeek: 18
            },
            {
                id: 'std-004', name: 'Carlos Mendez', studentId: '2020-00561',
                gwa: 1.60, verified: true, program: 'BSED', year: 4,
                schedule: { everyday: '08:00-12:00' },
                maxHoursPerWeek: 25
            },
            {
                id: 'std-005', name: 'Liza Torres', studentId: '2022-00299',
                gwa: 2.25, verified: true, program: 'BSCS', year: 3,
                schedule: { tuesday: '10:00-14:00', thursday: '10:00-14:00', friday: '14:00-17:00' },
                maxHoursPerWeek: 16
            }
        ].map(item => [item.id, item]));

        // Initialize departments with their requirements
        this.departments = new Map([
            {
                id: 'dept-001', name: 'College of Nursing',
                verified: true, requiredGPA: 2.50,
                schedule: { monday: '08:00-17:00', tuesday: '08:00-17:00', wednesday: '08:00-17:00', thursday: '08:00-17:00', friday: '08:00-17:00' },
                totalSlots: 8, filledSlots: 0, requiredPrograms: ['BSN', 'BSCS']
            },
            {
                id: 'dept-002', name: 'Information Technology Dept.',
                verified: true, requiredGPA: 1.75,
                schedule: { everyday: '09:00-18:00' },
                totalSlots: 10, filledSlots: 3, requiredPrograms: ['BSCS', 'BSBA']
            },
            {
                id: 'dept-003', name: 'University Library',
                verified: true, requiredGPA: 2.25,
                schedule: { monday: '08:00-17:00', tuesday: '08:00-17:00', wednesday: '08:00-17:00', thursday: '08:00-17:00', friday: '08:00-17:00' },
                totalSlots: 5, filledSlots: 3, requiredPrograms: []
            },
            {
                id: 'dept-004', name: 'College of Education',
                verified: true, requiredGPA: 2.00,
                schedule: { everyday: '07:00-17:00' },
                totalSlots: 6, filledSlots: 4, requiredPrograms: ['BSED']
            }
        ].map(item => [item.id, item]));
    }

    /**
     * Attach deployment event handlers
     */
    attachDeploymentHandlers() {
        document.addEventListener('click', (e) => {
            // Deploy student button
            if (e.target.closest('[data-action="deploy-student"]')) {
                const studentId = e.target.closest('[data-action="deploy-student"]').dataset.studentId;
                this.showDeploymentSuggestions(studentId);
            }

            // Confirm deployment
            if (e.target.closest('[data-action="confirm-deployment"]')) {
                const { studentId, deptId } = e.target.closest('[data-action="confirm-deployment"]').dataset;
                this.confirmDeployment(studentId, deptId);
            }
        });
    }

    /**
     * Get deployment suggestions for a student
     */
    getDeploymentSuggestions(studentId) {
        const student = this.students.get(studentId);
        if (!student || !student.verified) return [];

        const suggestions = [];

        for (const [deptId, dept] of this.departments) {
            if (!dept.verified) continue;

            // Check if department is full
            if (dept.filledSlots >= dept.totalSlots) continue;

            // Check GPA requirement
            if (student.gwa > dept.requiredGPA) continue;

            // Check program requirement
            if (dept.requiredPrograms.length > 0 && !dept.requiredPrograms.includes(student.program)) continue;

            // Check schedule compatibility
            const hasConflict = this.detectScheduleConflict(student.schedule, dept.schedule);
            if (hasConflict) continue;

            // Calculate match score
            const score = this.calculateMatchScore(student, dept);
            suggestions.push({
                dept,
                score,
                compatibility: this.getCompatibilityDetails(student, dept)
            });
        }

        // Sort by score (higher score = better match)
        return suggestions.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate match score between student and department
     */
    calculateMatchScore(student, dept) {
        let score = 100;

        // GPA factor (lower GPA = better match, up to 30 points)
        const gpaFactor = (dept.requiredGPA - student.gwa) / dept.requiredGPA * 30;
        score += Math.max(0, gpaFactor);

        // Program match bonus (20 points)
        if (dept.requiredPrograms.length > 0 && dept.requiredPrograms.includes(student.program)) {
            score += 20;
        }

        // Slot availability bonus (10 points max)
        const slotPercentage = (dept.totalSlots - dept.filledSlots) / dept.totalSlots;
        score += slotPercentage * 10;

        return score;
    }

    /**
     * Get compatibility details
     */
    getCompatibilityDetails(student, dept) {
        return {
            gpaOk: student.gwa <= dept.requiredGPA,
            programMatch: dept.requiredPrograms.length === 0 || dept.requiredPrograms.includes(student.program),
            scheduleOk: !this.detectScheduleConflict(student.schedule, dept.schedule),
            slotsAvailable: dept.filledSlots < dept.totalSlots
        };
    }

    /**
     * Detect schedule conflicts between student and department
     */
    detectScheduleConflict(studentSchedule, deptSchedule) {
        // If department operates everyday, only check based on intersection
        const deptDays = Object.keys(deptSchedule);
        const studentDays = Object.keys(studentSchedule);

        for (const studentDay of studentDays) {
            if (studentDay === 'everyday') {
                // Student available everyday, always compatible
                continue;
            }

            if (!deptDays.includes(studentDay) && deptDays[0] !== 'everyday') {
                // Department doesn't operate on student's available day
                continue;
            }

            // Check time overlap
            const studentTime = studentSchedule[studentDay];
            const deptTime = deptSchedule[studentDay] || deptSchedule['everyday'];

            if (studentTime && deptTime) {
                const [sStart, sEnd] = this.parseTime(studentTime);
                const [dStart, dEnd] = this.parseTime(deptTime);

                // Check if times overlap
                if (!(sEnd <= dStart || sStart >= dEnd)) {
                    return true; // Conflict found
                }
            }
        }

        return false; // No conflict
    }

    /**
     * Parse time string (HH:MM) to minutes
     */
    parseTime(timeStr) {
        const [start, end] = timeStr.split('-');
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return [startH * 60 + startM, endH * 60 + endM];
    }

    /**
     * Show deployment suggestions modal
     */
    showDeploymentSuggestions(studentId) {
        const student = this.students.get(studentId);
        if (!student) return;

        if (!student.verified) {
            this.showNotification('error', 'Only verified students can be deployed');
            return;
        }

        const suggestions = this.getDeploymentSuggestions(studentId);
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'deployment-modal-' + studentId;

        let suggestionsHTML = '';

        if (suggestions.length === 0) {
            suggestionsHTML = '<p style="text-align: center; color: #999;">No suitable departments found for this student.</p>';
        } else {
            suggestionsHTML = suggestions.map((suggestion, idx) => `
                <div class="suggestion-card" style="padding: 12px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0 0 4px 0;">${idx + 1}. ${suggestion.dept.name}</h4>
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                                Match Score: <strong>${suggestion.score.toFixed(1)}/130</strong>
                            </p>
                            <div style="font-size: 12px;">
                                ${suggestion.compatibility.gpaOk ? '<span style="color: #10b981;"><i class="fas fa-check"></i> GPA OK</span>' : '<span style="color: #ef4444;"><i class="fas fa-times"></i> GPA Mismatch</span>'} |
                                ${suggestion.compatibility.scheduleOk ? '<span style="color: #10b981;"><i class="fas fa-check"></i> Schedule OK</span>' : '<span style="color: #ef4444;"><i class="fas fa-times"></i> Schedule Conflict</span>'} |
                                ${suggestion.compatibility.slotsAvailable ? '<span style="color: #10b981;"><i class="fas fa-check"></i> Slots Available</span>' : '<span style="color: #ef4444;"><i class="fas fa-times"></i> No Slots</span>'}
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm" data-action="confirm-deployment" data-student-id="${studentId}" data-dept-id="${suggestion.dept.id}">
                            Assign
                        </button>
                    </div>
                </div>
            `).join('');
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Deployment Suggestions for ${student.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${suggestionsHTML}
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
     * Confirm and save deployment
     */
    async confirmDeployment(studentId, deptId) {
        const student = this.students.get(studentId);
        const dept = this.departments.get(deptId);

        if (!student || !dept) return;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Record deployment
            const deploymentId = `deploy-${studentId}-${deptId}-${Date.now()}`;
            this.deployments.set(deploymentId, {
                id: deploymentId,
                studentId,
                deptId,
                dateAssigned: new Date().toISOString(),
                status: 'active'
            });

            // Update department filled slots
            dept.filledSlots += 1;

            // Show success
            this.showNotification('success', `${student.name} has been assigned to ${dept.name}`);

            // Close modal and refresh
            window.location.hash = '';
            setTimeout(() => {
                location.reload(); // In production, update UI without reload
            }, 1000);

        } catch (error) {
            console.error('Error confirming deployment:', error);
            this.showNotification('error', 'Failed to assign student. Please try again.');
        }
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
        window.deploymentSystem = new DeploymentSystem();
    });
} else {
    window.deploymentSystem = new DeploymentSystem();
}
