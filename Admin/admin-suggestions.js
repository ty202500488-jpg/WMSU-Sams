/**
 * WMSU-SAMS Admin Position Suggestion System
 * Admin suggests qualified positions to students based on:
 * - Student schedule availability
 * - Student qualifications (GPA, program)
 * - Position requirements
 * Students then decide to apply or not
 */

class PositionSuggestionSystem {
    constructor() {
        this.students = new Map();
        this.positions = new Map();
        this.suggestions = new Map();
        this.studentApplications = new Map();
        this.init();
    }

    init() {
        this.initializeData();
        this.attachSuggestionHandlers();
    }

    /**
     * Initialize student and position data
     */
    initializeData() {
        // Students with their schedules and qualifications
        this.students = new Map([
            {
                id: 'std-001', name: 'Maria Santos', studentId: '2022-00145',
                gpa: 1.75, verified: true, program: 'BSCS', year: 3,
                schedule: { monday: '09:00-12:00', wednesday: '09:00-12:00', friday: '09:00-12:00' },
                freeTimes: { monday: '13:00-17:00', tuesday: '09:00-17:00', wednesday: '13:00-17:00', thursday: '09:00-17:00', friday: '13:00-17:00' },
                email: 'maria.santos@wmsu.edu.ph'
            },
            {
                id: 'std-002', name: 'Juan dela Cruz', studentId: '2021-00388',
                gpa: 1.85, verified: true, program: 'BSBA', year: 4,
                schedule: { tuesday: '13:00-17:00', thursday: '13:00-17:00' },
                freeTimes: { monday: '09:00-17:00', tuesday: '09:00-12:00', wednesday: '09:00-17:00', thursday: '09:00-12:00', friday: '09:00-17:00', saturday: '09:00-17:00' },
                email: 'juan.delacruz@wmsu.edu.ph'
            },
            {
                id: 'std-003', name: 'Ana Reyes', studentId: '2023-00072',
                gpa: 2.00, verified: true, program: 'BSN', year: 2,
                schedule: { monday: '14:00-17:00', thursday: '14:00-17:00', saturday: '10:00-14:00' },
                freeTimes: { monday: '09:00-13:00', tuesday: '09:00-17:00', wednesday: '09:00-17:00', thursday: '09:00-13:00', friday: '09:00-17:00', sunday: '10:00-17:00' },
                email: 'ana.reyes@wmsu.edu.ph'
            },
            {
                id: 'std-004', name: 'Liza Torres', studentId: '2022-00299',
                gpa: 2.25, verified: true, program: 'BSCS', year: 3,
                schedule: { tuesday: '10:00-14:00', thursday: '10:00-14:00', friday: '14:00-17:00' },
                freeTimes: { monday: '09:00-17:00', tuesday: '14:00-17:00', wednesday: '09:00-17:00', thursday: '14:00-17:00', friday: '09:00-14:00' },
                email: 'liza.torres@wmsu.edu.ph'
            }
        ].map(s => [s.id, s]));

        // Available positions
        this.positions = new Map([
            {
                id: 'pos-001', name: 'Library Assistant', department: 'University Library',
                requiredGPA: 2.25, programs: [], hoursPerWeek: 20,
                schedule: { monday: '08:00-17:00', tuesday: '08:00-17:00', wednesday: '08:00-17:00', thursday: '08:00-17:00', friday: '08:00-17:00' },
                hourlyRate: 50, description: 'Assist in cataloging and reference services',
                status: 'open', slotsAvailable: 2
            },
            {
                id: 'pos-002', name: 'Laboratory Monitor', department: 'IT Department',
                requiredGPA: 1.75, programs: ['BSCS', 'BSBA'], hoursPerWeek: 25,
                schedule: { everyday: '09:00-18:00' },
                hourlyRate: 60, description: 'Monitor IT lab, assist students, maintain equipment',
                status: 'open', slotsAvailable: 3
            },
            {
                id: 'pos-003', name: 'Teaching Assistant', department: 'College of Engineering',
                requiredGPA: 1.50, programs: ['BSCS', 'BSED'], hoursPerWeek: 20,
                schedule: { monday: '08:00-12:00', wednesday: '08:00-12:00', friday: '08:00-12:00' },
                hourlyRate: 55, description: 'Assist faculty with grading and student support',
                status: 'open', slotsAvailable: 4
            },
            {
                id: 'pos-004', name: 'Office Clerk', department: 'Registrar Office',
                requiredGPA: 2.15, programs: [], hoursPerWeek: 30,
                schedule: { monday: '08:00-17:00', tuesday: '08:00-17:00', wednesday: '08:00-17:00', thursday: '08:00-17:00', friday: '08:00-17:00' },
                hourlyRate: 50, description: 'Handle documents, manage records, assist with registration',
                status: 'open', slotsAvailable: 2
            }
        ].map(p => [p.id, p]));
    }

    /**
     * Attach suggestion event handlers
     */
    attachSuggestionHandlers() {
        document.addEventListener('click', (e) => {
            // Suggest positions to student
            if (e.target.closest('[data-action="suggest-positions"]')) {
                const studentId = e.target.closest('[data-action="suggest-positions"]').dataset.studentId;
                this.showSuggestionModal(studentId);
            }

            // Send suggestion to student
            if (e.target.closest('[data-action="send-suggestion"]')) {
                const { studentId, positionId } = e.target.closest('[data-action="send-suggestion"]').dataset;
                this.sendSuggestionToStudent(studentId, positionId);
            }

            // Student applying for suggested position
            if (e.target.closest('[data-action="apply-position"]')) {
                const { studentId, positionId } = e.target.closest('[data-action="apply-position"]').dataset;
                this.applyForPosition(studentId, positionId);
            }
        });
    }

    /**
     * Get suggested positions for a student
     */
    getSuggestedPositions(studentId) {
        const student = this.students.get(studentId);
        if (!student || !student.verified) return [];

        const suggestions = [];

        for (const [posId, position] of this.positions) {
            if (position.status !== 'open' || position.slotsAvailable <= 0) continue;

            // Check GPA requirement
            if (student.gpa > position.requiredGPA) continue;

            // Check program requirement
            if (position.programs.length > 0 && !position.programs.includes(student.program)) continue;

            // Check schedule compatibility
            const hasConflict = this.checkScheduleConflict(student.freeTimes, position.schedule);
            if (hasConflict) continue;

            // Calculate match score
            const score = this.calculateMatchScore(student, position);
            suggestions.push({
                position,
                score,
                compatibility: {
                    gpaOk: student.gpa <= position.requiredGPA,
                    programMatch: position.programs.length === 0 || position.programs.includes(student.program),
                    scheduleOk: !hasConflict,
                    payPerWeek: position.hoursPerWeek * position.hourlyRate
                }
            });
        }

        return suggestions.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate match score
     */
    calculateMatchScore(student, position) {
        let score = 100;

        // GPA match (lower is better)
        const gpaDiff = position.requiredGPA - student.gpa;
        score += Math.max(0, 30 - (gpaDiff * 50));

        // Program match bonus
        if (position.programs.length > 0 && position.programs.includes(student.program)) {
            score += 20;
        }

        // Slot availability bonus
        const slotPercentage = position.slotsAvailable / 5; // Assume max 5 slots
        score += slotPercentage * 10;

        return score;
    }

    /**
     * Check if student's free time overlaps with position schedule
     */
    checkScheduleConflict(studentFreeTime, positionSchedule) {
        const studentDays = Object.keys(studentFreeTime);
        const posDays = Object.keys(positionSchedule);

        for (const studentDay of studentDays) {
            for (const posDay of posDays) {
                const dayMatch = studentDay === posDay || studentDay === 'everyday' || posDay === 'everyday';
                if (!dayMatch) continue;

                const studentTime = studentFreeTime[studentDay];
                const posTime = positionSchedule[posDay];

                if (this.timeOverlap(studentTime, posTime)) {
                    return false; // Compatible (no conflict in free time)
                }
            }
        }

        return true; // Has conflict
    }

    /**
     * Check if two time slots overlap
     */
    timeOverlap(time1, time2) {
        const [s1, e1] = this.parseTime(time1);
        const [s2, e2] = this.parseTime(time2);
        return !(e1 <= s2 || s1 >= e2);
    }

    /**
     * Parse time string
     */
    parseTime(timeStr) {
        const [start, end] = timeStr.split('-');
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        return [sH * 60 + sM, eH * 60 + eM];
    }

    /**
     * Show suggestion modal for admin
     */
    showSuggestionModal(studentId) {
        const student = this.students.get(studentId);
        if (!student) return;

        const suggestions = this.getSuggestedPositions(studentId);
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'suggestion-modal-' + studentId;

        let suggestionsHTML = '';

        if (suggestions.length === 0) {
            suggestionsHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    <i class="fas fa-info-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>No suitable positions available for this student based on their schedule.</p>
                </div>
            `;
        } else {
            suggestionsHTML = suggestions.map((suggestion, idx) => `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 15px;">${idx + 1}. ${suggestion.position.name}</h4>
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">
                                ${suggestion.position.department}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${suggestion.score > 110 ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                Match: ${suggestion.score.toFixed(0)}
                            </span>
                        </div>
                    </div>

                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #333;">
                        ${suggestion.position.description}
                    </p>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">
                        <div style="padding: 8px; background: #f3f4f6; border-radius: 4px;">
                            <span style="font-size: 11px; color: #666;">Schedule</span>
                            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">${Object.keys(suggestion.position.schedule).slice(0, 2).join(', ')}...</p>
                        </div>
                        <div style="padding: 8px; background: #f3f4f6; border-radius: 4px;">
                            <span style="font-size: 11px; color: #666;">Weekly Pay</span>
                            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">₱${suggestion.compatibility.payPerWeek.toLocaleString()}</p>
                        </div>
                    </div>

                    <div style="font-size: 12px; margin-bottom: 10px;">
                        ${suggestion.compatibility.gpaOk ? '<span style="color: #10b981; margin-right: 10px;"><i class="fas fa-check"></i> GPA OK</span>' : '<span style="color: #ef4444; margin-right: 10px;"><i class="fas fa-times"></i> GPA Below Required</span>'}
                        ${suggestion.compatibility.programMatch ? '<span style="color: #10b981; margin-right: 10px;"><i class="fas fa-check"></i> Program Match</span>' : ''}
                        ${suggestion.compatibility.scheduleOk ? '<span style="color: #10b981;"><i class="fas fa-check"></i> Schedule Compatible</span>' : '<span style="color: #ef4444;"><i class="fas fa-times"></i> Schedule Conflict</span>'}
                    </div>

                    <button class="btn btn-primary btn-sm" data-action="send-suggestion" data-student-id="${studentId}" data-position-id="${suggestion.position.id}" style="width: 100%;">
                        <i class="fas fa-paper-plane"></i> Send Suggestion to Student
                    </button>
                </div>
            `).join('');
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box large">
                <div class="modal-header">
                    <h3>Suggest Positions for ${student.name} (${student.studentId})</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
                    ${suggestionsHTML}
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
     * Send suggestion to student
     */
    async sendSuggestionToStudent(studentId, positionId) {
        const student = this.students.get(studentId);
        const position = this.positions.get(positionId);

        if (!student || !position) return;

        try {
            const suggestionId = `sug-${studentId}-${positionId}-${Date.now()}`;
            this.suggestions.set(suggestionId, {
                id: suggestionId,
                studentId,
                positionId,
                dateSuggested: new Date().toISOString(),
                status: 'pending',
                studentViewed: false
            });

            this.showNotification('success', `Suggestion sent to ${student.name}\nPosition: ${position.name}`);

            // In production, send email notification
            this.sendEmailNotification(student.email, position.name, student.name);

            // Close modal
            window.location.hash = '';
            setTimeout(() => {
                const modal = document.querySelector('.modal-overlay');
                if (modal) modal.remove();
            }, 300);

        } catch (error) {
            console.error('Error sending suggestion:', error);
            this.showNotification('error', 'Failed to send suggestion. Please try again.');
        }
    }

    /**
     * Student applies for a suggested position
     */
    async applyForPosition(studentId, positionId) {
        const student = this.students.get(studentId);
        const position = this.positions.get(positionId);

        if (!student || !position) return;

        try {
            const applicationId = `app-${studentId}-${positionId}-${Date.now()}`;
            this.studentApplications.set(applicationId, {
                id: applicationId,
                studentId,
                studentName: student.name,
                positionId,
                positionName: position.name,
                departmentName: position.department,
                dateApplied: new Date().toISOString(),
                status: 'pending',
                gpa: student.gpa,
                program: student.program
            });

            this.showNotification('success', `Application submitted for ${position.name}`);

            // Update UI - remove from suggested or mark as applied
            const applyBtn = document.querySelector(`[data-action="apply-position"][data-position-id="${positionId}"]`);
            if (applyBtn) {
                applyBtn.disabled = true;
                applyBtn.innerHTML = '<i class="fas fa-check"></i> Application Sent';
                applyBtn.style.background = '#10b981';
            }

        } catch (error) {
            console.error('Error applying for position:', error);
            this.showNotification('error', 'Failed to submit application.');
        }
    }

    /**
     * Get pending applications for admin review
     */
    getPendingApplications() {
        return Array.from(this.studentApplications.values()).filter(app => app.status === 'pending');
    }

    /**
     * Approve/Reject application
     */
    async reviewApplication(applicationId, action, notes = '') {
        const application = this.studentApplications.get(applicationId);
        if (!application) return;

        try {
            application.status = action === 'approve' ? 'approved' : 'rejected';
            application.reviewNotes = notes;
            application.dateReviewed = new Date().toISOString();

            this.studentApplications.set(applicationId, application);

            const message = action === 'approve' 
                ? `${application.studentName} approved for ${application.positionName}`
                : `${application.studentName} rejected for ${application.positionName}`;

            this.showNotification('success', message);

            // Send email notification to student
            this.sendEmailNotification(
                this.students.get(application.studentId)?.email,
                `Application ${action === 'approve' ? 'Approved' : 'Rejected'}`,
                application.studentName
            );

        } catch (error) {
            console.error('Error reviewing application:', error);
            this.showNotification('error', 'Failed to review application.');
        }
    }

    /**
     * Send email notification (mock)
     */
    sendEmailNotification(email, subject, studentName) {
        console.log(`📧 Email sent to: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Student: ${studentName}`);
        // In production: POST /api/emails/send
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
        window.suggestionSystem = new PositionSuggestionSystem();
    });
} else {
    window.suggestionSystem = new PositionSuggestionSystem();
}
