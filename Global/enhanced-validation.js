/**
 * WMSU-SAMS Enhanced Form Validation & Interactivity
 * Real-time validation, searchable tables, and interactive filters
 */

class EnhancedFormValidation {
    constructor() {
        this.init();
    }

    init() {
        this.attachFormValidation();
        this.attachLiveSearch();
        this.attachTableFilters();
    }

    /**
     * Attach real-time form validation
     */
    attachFormValidation() {
        document.addEventListener('input', (e) => {
            const input = e.target;

            if (input.type === 'email') {
                this.validateEmail(input);
            } else if (input.name && input.name.includes('password')) {
                this.validatePassword(input);
            } else if (input.name && input.name.includes('phone')) {
                this.validatePhone(input);
            }
        });

        // Form submission validation
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!this.validateForm(form)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Validate email in real-time
     */
    validateEmail(input) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        this.setInputState(input, isValid || input.value === '', 'Invalid email address');
    }

    /**
     * Validate password strength
     */
    validatePassword(input) {
        const isValid = input.value.length >= 8;
        this.setInputState(input, isValid || input.value === '', 'Password must be at least 8 characters');
    }

    /**
     * Validate phone number
     */
    validatePhone(input) {
        const isValid = /^[\d\s\-\(\)]{7,}$/.test(input.value);
        this.setInputState(input, isValid || input.value === '', 'Invalid phone number');
    }

    /**
     * Set input visual state
     */
    setInputState(input, isValid, errorMsg) {
        if (input.value === '') {
            input.classList.remove('input-error', 'input-valid');
            return;
        }

        if (isValid) {
            input.classList.remove('input-error');
            input.classList.add('input-valid');
            input.style.borderColor = '#10b981';
        } else {
            input.classList.remove('input-valid');
            input.classList.add('input-error');
            input.style.borderColor = '#dc2626';

            // Show error message
            this.showFieldError(input, errorMsg);
        }
    }

    /**
     * Show field-level error
     */
    showFieldError(input, message) {
        // Remove existing error if present
        const existingError = input.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        const error = document.createElement('small');
        error.className = 'field-error';
        error.style.cssText = `
            display: block;
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
        `;
        error.textContent = message;

        input.parentElement.appendChild(error);
    }

    /**
     * Validate entire form
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        for (const input of inputs) {
            if (input.required && !input.value.trim()) {
                this.setInputState(input, false, 'This field is required');
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Attach live search to tables
     */
    attachLiveSearch() {
        document.addEventListener('input', (e) => {
            const searchBox = e.target;
            if (!searchBox.classList.contains('search-box') && searchBox.closest('.search-box') === null) {
                return;
            }

            const inputField = searchBox.tagName === 'INPUT' ? searchBox : searchBox.querySelector('input');
            if (!inputField) return;

            const query = inputField.value.toLowerCase();
            const table = searchBox.closest('.section')?.querySelector('table');
            if (!table) return;

            this.filterTable(table, query);
        });
    }

    /**
     * Filter table rows based on search query
     */
    filterTable(table, query) {
        const rows = table.querySelectorAll('tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const match = text.includes(query);
            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        // Show no results message if needed
        this.showNoResultsMessage(table, visibleCount);
    }

    /**
     * Show no results message
     */
    showNoResultsMessage(table, visibleCount) {
        const existingMsg = table.parentElement.querySelector('.no-results');
        if (existingMsg) existingMsg.remove();

        if (visibleCount === 0) {
            const msg = document.createElement('div');
            msg.className = 'no-results';
            msg.style.cssText = `
                padding: 20px;
                text-align: center;
                color: #999;
                font-style: italic;
            `;
            msg.textContent = 'No results found';
            table.parentElement.appendChild(msg);
        }
    }

    /**
     * Attach table filters
     */
    attachTableFilters() {
        // Status filter
        document.addEventListener('change', (e) => {
            const select = e.target;
            if (select.closest('.filter-bar') !== null && select.textContent.includes('Status')) {
                const table = select.closest('.section')?.querySelector('table');
                if (!table) return;

                const filterValue = select.value;
                if (filterValue === 'All Status') {
                    // Show all rows
                    table.querySelectorAll('tbody tr').forEach(row => {
                        row.style.display = '';
                    });
                } else {
                    // Filter by status
                    table.querySelectorAll('tbody tr').forEach(row => {
                        const statusCell = row.querySelector('[data-status-cell]') || 
                                          Array.from(row.cells).find(cell => 
                                              cell.textContent.includes('Pending') ||
                                              cell.textContent.includes('Approved') ||
                                              cell.textContent.includes('Rejected')
                                          );
                        if (statusCell) {
                            const status = statusCell.textContent.toLowerCase();
                            row.style.display = status.includes(filterValue.toLowerCase()) ? '' : 'none';
                        }
                    });
                }
            }
        });
    }
}

/**
 * Table Search & Filter Helper
 */
class TableSearchFilter {
    static initSearch(inputSelector, tableSelector) {
        const searchInput = document.querySelector(inputSelector);
        const table = document.querySelector(tableSelector);

        if (!searchInput || !table) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    static initStatusFilter(selectSelector, tableSelector) {
        const select = document.querySelector(selectSelector);
        const table = document.querySelector(tableSelector);

        if (!select || !table) return;

        select.addEventListener('change', (e) => {
            const filterValue = e.target.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const statusCell = row.querySelector('[data-status-cell]') || 
                                  Array.from(row.cells).find(cell =>
                                      cell.textContent.includes('Pending') ||
                                      cell.textContent.includes('Approved') ||
                                      cell.textContent.includes('Rejected')
                                  );
                if (statusCell) {
                    const status = statusCell.textContent.toLowerCase();
                    row.style.display = status.includes(filterValue) || filterValue === 'all status' ? '' : 'none';
                }
            });
        });
    }
}

/**
 * Schedule Conflict Detection
 */
class ScheduleConflictDetector {
    /**
     * Check if two time ranges overlap
     * time1: "09:00-12:00", time2: "11:00-14:00"
     */
    static checkOverlap(time1, time2) {
        const [start1, end1] = this.parseTime(time1);
        const [start2, end2] = this.parseTime(time2);
        return !(end1 <= start2 || start1 >= end2);
    }

    /**
     * Parse time string to minutes
     */
    static parseTime(timeStr) {
        const [start, end] = timeStr.split('-');
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        return [sH * 60 + sM, eH * 60 + eM];
    }

    /**
     * Get schedule conflicts
     */
    static getConflicts(studentSchedule, deptSchedule) {
        const conflicts = [];
        const studentDays = Object.keys(studentSchedule);
        const deptDays = Object.keys(deptSchedule);

        for (const studentDay of studentDays) {
            for (const deptDay of deptDays) {
                // Check if days match or if everyday is involved
                const dayMatch = studentDay === deptDay || studentDay === 'everyday' || deptDay === 'everyday';
                if (!dayMatch) continue;

                const studentTime = studentSchedule[studentDay];
                const deptTime = deptSchedule[deptDay];

                if (this.checkOverlap(studentTime, deptTime)) {
                    conflicts.push(`${studentDay} ${studentTime} overlaps with ${deptDay} ${deptTime}`);
                }
            }
        }

        return conflicts;
    }
}

// Initialize enhanced validation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedValidation = new EnhancedFormValidation();
    });
} else {
    window.enhancedValidation = new EnhancedFormValidation();
}
