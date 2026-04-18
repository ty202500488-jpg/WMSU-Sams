/**
 * WMSU-SAMS Admin Managers
 * Handles management of employers (departments), locations, and payroll rules
 */

class AdminManagers {
    constructor() {
        this.employers = new Map();
        this.locations = new Map();
        this.assignmentMap = new Map();
        this.init();
    }

    init() {
        this.initializeData();
        this.attachManagerHandlers();
    }

    /**
     * Initialize employer and location data
     */
    initializeData() {
        this.employers = new Map([
            {
                id: 'emp-001', name: 'College of Nursing',
                head: 'Dean Patricia Lim', email: 'patricia.lim@wmsu.edu.ph',
                phone: '(064) 123-4567', address: 'Health Sciences Building',
                status: 'active'
            },
            {
                id: 'emp-002', name: 'Information Technology Department',
                head: 'Dean Alma Fernandez', email: 'alma.fernandez@wmsu.edu.ph',
                phone: '(064) 123-4568', address: 'ICT Building, 2nd Floor',
                status: 'active'
            },
            {
                id: 'emp-003', name: 'University Library',
                head: 'Head Rosario Bautista', email: 'rosario.bautista@wmsu.edu.ph',
                phone: '(064) 123-4569', address: 'Main Library Building',
                status: 'active'
            }
        ].map(emp => [emp.id, emp]));

        this.locations = new Map([
            {
                id: 'loc-001', name: 'WMSU Main Campus',
                address: 'Kabacan, Cotabato', province: 'North Cotabato',
                campus: 'Main'
            },
            {
                id: 'loc-002', name: 'WMSU Pagadian Campus',
                address: 'Pagadian City, Zamboanga del Sur', province: 'Zamboanga del Sur',
                campus: 'Pagadian'
            }
        ].map(loc => [loc.id, loc]));

        // Map employers to locations
        this.assignmentMap = new Map([
            ['emp-001', 'loc-001'],
            ['emp-002', 'loc-001'],
            ['emp-003', 'loc-001']
        ]);
    }

    /**
     * Attach manager event handlers
     */
    attachManagerHandlers() {
        document.addEventListener('click', (e) => {
            // Add employer
            if (e.target.closest('[data-action="add-employer"]')) {
                this.showAddEmployerModal();
            }

            // Edit employer
            if (e.target.closest('[data-action="edit-employer"]')) {
                const empId = e.target.closest('[data-action="edit-employer"]').dataset.employerId;
                this.showEditEmployerModal(empId);
            }

            // Delete employer
            if (e.target.closest('[data-action="delete-employer"]')) {
                const empId = e.target.closest('[data-action="delete-employer"]').dataset.employerId;
                this.deleteEmployer(empId);
            }

            // Add location
            if (e.target.closest('[data-action="add-location"]')) {
                this.showAddLocationModal();
            }

            // Edit location
            if (e.target.closest('[data-action="edit-location"]')) {
                const locId = e.target.closest('[data-action="edit-location"]').dataset.locationId;
                this.showEditLocationModal(locId);
            }

            // Delete location
            if (e.target.closest('[data-action="delete-location"]')) {
                const locId = e.target.closest('[data-action="delete-location"]').dataset.locationId;
                this.deleteLocation(locId);
            }

            // Assign employer to location
            if (e.target.closest('[data-action="assign-location"]')) {
                const empId = e.target.closest('[data-action="assign-location"]').dataset.employerId;
                this.showAssignLocationModal(empId);
            }
        });
    }

    /**
     * Show modal to add new employer
     */
    showAddEmployerModal() {
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'add-employer-modal';

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <h3>Add New Employer/Department</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <form id="add-employer-form" style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Department Name</label>
                            <input type="text" id="emp-name" placeholder="e.g., College of Engineering" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Department Head/Name</label>
                            <input type="text" id="emp-head" placeholder="e.g., Dean Manuel Santos" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Email</label>
                            <input type="email" id="emp-email" placeholder="e.g., engineering@wmsu.edu.ph" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Phone</label>
                            <input type="tel" id="emp-phone" placeholder="e.g., (064) 123-4567" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Building/Office Address</label>
                            <input type="text" id="emp-address" placeholder="e.g., Engineering Complex, Bldg. A" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <a href="#" class="modal-close secondary-btn">Cancel</a>
                            <button type="submit" class="btn-primary" style="flex: 1;">Add Employer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        const form = modal.querySelector('#add-employer-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEmployer({
                name: document.getElementById('emp-name').value,
                head: document.getElementById('emp-head').value,
                email: document.getElementById('emp-email').value,
                phone: document.getElementById('emp-phone').value,
                address: document.getElementById('emp-address').value
            });
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Add new employer
     */
    addEmployer(data) {
        const empId = 'emp-' + Date.now();
        this.employers.set(empId, {
            id: empId,
            ...data,
            status: 'active'
        });

        this.showNotification('success', 'Employer/Department added successfully');
        // Update UI (in production, refresh the employers list)
    }

    /**
     * Show modal to edit employer
     */
    showEditEmployerModal(empId) {
        const employer = this.employers.get(empId);
        if (!employer) return;

        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'edit-employer-modal-' + empId;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <h3>Edit Employer: ${employer.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <form id="edit-employer-form" style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Department Name</label>
                            <input type="text" id="emp-name" value="${employer.name}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Department Head/Name</label>
                            <input type="text" id="emp-head" value="${employer.head}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Email</label>
                            <input type="email" id="emp-email" value="${employer.email}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Phone</label>
                            <input type="tel" id="emp-phone" value="${employer.phone}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Building/Office Address</label>
                            <input type="text" id="emp-address" value="${employer.address}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <a href="#" class="modal-close secondary-btn">Cancel</a>
                            <button type="submit" class="btn-primary" style="flex: 1;">Update Employer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        const form = modal.querySelector('#edit-employer-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            employer.name = document.getElementById('emp-name').value;
            employer.head = document.getElementById('emp-head').value;
            employer.email = document.getElementById('emp-email').value;
            employer.phone = document.getElementById('emp-phone').value;
            employer.address = document.getElementById('emp-address').value;
            this.employers.set(empId, employer);

            this.showNotification('success', 'Employer updated successfully');
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Delete employer
     */
    deleteEmployer(empId) {
        const employer = this.employers.get(empId);
        if (!employer) return;

        const modalManager = window.modalManager || new ModalManager();
        modalManager.showConfirmation(
            'Delete Employer',
            `Are you sure you want to delete ${employer.name}? This action cannot be undone.`,
            () => {
                this.employers.delete(empId);
                this.assignmentMap.delete(empId);
                this.showNotification('success', 'Employer deleted successfully');
                // Refresh UI
            }
        );
    }

    /**
     * Show modal to add location
     */
    showAddLocationModal() {
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'add-location-modal';

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <h3>Add New Campus Location</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <form id="add-location-form" style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Location Name</label>
                            <input type="text" id="loc-name" placeholder="e.g., WMSU Pagadian Campus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Full Address</label>
                            <input type="text" id="loc-address" placeholder="e.g., Pagadian City, Zamboanga del Sur" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Province</label>
                            <input type="text" id="loc-province" placeholder="e.g., Zamboanga del Sur" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Campus Type</label>
                            <select id="loc-campus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Select Campus Type</option>
                                <option value="Main">Main Campus</option>
                                <option value="Extension">Extension Campus</option>
                                <option value="Satellite">Satellite Campus</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <a href="#" class="modal-close secondary-btn">Cancel</a>
                            <button type="submit" class="btn-primary" style="flex: 1;">Add Location</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        const form = modal.querySelector('#add-location-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLocation({
                name: document.getElementById('loc-name').value,
                address: document.getElementById('loc-address').value,
                province: document.getElementById('loc-province').value,
                campus: document.getElementById('loc-campus').value
            });
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Add new location
     */
    addLocation(data) {
        const locId = 'loc-' + Date.now();
        this.locations.set(locId, {
            id: locId,
            ...data
        });

        this.showNotification('success', 'Campus location added successfully');
    }

    /**
     * Show modal to edit location
     */
    showEditLocationModal(locId) {
        const location = this.locations.get(locId);
        if (!location) return;

        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'edit-location-modal-' + locId;

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <h3>Edit Location: ${location.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <form id="edit-location-form" style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Location Name</label>
                            <input type="text" id="loc-name" value="${location.name}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Full Address</label>
                            <input type="text" id="loc-address" value="${location.address}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 14px;">Province</label>
                            <input type="text" id="loc-province" value="${location.province}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <a href="#" class="modal-close secondary-btn">Cancel</a>
                            <button type="submit" class="btn-primary" style="flex: 1;">Update Location</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        const form = modal.querySelector('#edit-location-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            location.name = document.getElementById('loc-name').value;
            location.address = document.getElementById('loc-address').value;
            location.province = document.getElementById('loc-province').value;
            this.locations.set(locId, location);

            this.showNotification('success', 'Location updated successfully');
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.modal-close').addEventListener('click', (e) => {
            e.preventDefault();
            modalManager.hide(modalId);
            setTimeout(() => modal.remove(), 300);
        });
    }

    /**
     * Delete location
     */
    deleteLocation(locId) {
        const location = this.locations.get(locId);
        if (!location) return;

        const modalManager = window.modalManager || new ModalManager();
        modalManager.showConfirmation(
            'Delete Location',
            `Are you sure you want to delete ${location.name}? This action cannot be undone.`,
            () => {
                this.locations.delete(locId);
                this.showNotification('success', 'Location deleted successfully');
            }
        );
    }

    /**
     * Show modal to assign location to employer
     */
    showAssignLocationModal(empId) {
        const employer = this.employers.get(empId);
        if (!employer) return;

        const currentLocId = this.assignmentMap.get(empId);
        const modalManager = window.modalManager || new ModalManager();
        const modalId = 'assign-location-modal-' + empId;

        let optionsHTML = '';
        for (const [locId, location] of this.locations) {
            const selected = locId === currentLocId ? 'selected' : '';
            optionsHTML += `<option value="${locId}" ${selected}>${location.name}</option>`;
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box medium">
                <div class="modal-header">
                    <h3>Assign Location: ${employer.name}</h3>
                    <a href="#" class="modal-close"><i class="fas fa-times"></i></a>
                </div>
                <div class="modal-body">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Select Campus Location</label>
                    <select id="location-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                        <option value="">Select Location...</option>
                        ${optionsHTML}
                    </select>
                    <div style="display: flex; gap: 10px;">
                        <a href="#" class="modal-close secondary-btn">Cancel</a>
                        <button id="assign-btn" class="btn-primary" style="flex: 1;">Assign Location</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modalManager.modals.set(modalId, modal);
        window.location.hash = '#' + modalId;

        const assignBtn = modal.querySelector('#assign-btn');
        const select = modal.querySelector('#location-select');

        assignBtn.addEventListener('click', () => {
            const selectedLocId = select.value;
            if (selectedLocId) {
                this.assignmentMap.set(empId, selectedLocId);
                this.showNotification('success', `${employer.name} assigned to new location`);
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
        window.adminManagers = new AdminManagers();
    });
} else {
    window.adminManagers = new AdminManagers();
}
