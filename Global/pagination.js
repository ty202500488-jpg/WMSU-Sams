/**
 * WMSU-SAMS Table Pagination
 * Adds pagination controls to data tables (10 items per page)
 */

class TablePaginator {
    constructor(table, itemsPerPage = 10) {
        this.table = table;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalRows = 0;
        this.rows = [];
        
        this.init();
    }

    /**
     * Initialize the paginator
     */
    init() {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;
        
        this.rows = Array.from(tbody.querySelectorAll('tr'));
        this.totalRows = this.rows.length;
        
        if (this.totalRows === 0) return;
        
        // Calculate total pages
        this.totalPages = Math.ceil(this.totalRows / this.itemsPerPage);
        
        // Create pagination controls
        this.createPaginationControls();
        
        // Display first page
        this.showPage(1);
    }

    /**
     * Create pagination UI below the table
     */
    createPaginationControls() {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 18px;
            flex-wrap: wrap;
            gap: 10px;
            padding: 13px;
        `;

        // Left side: Info text
        const infoDiv = document.createElement('span');
        infoDiv.className = 'pagination-info';
        infoDiv.style.cssText = `
            font-size: 13px;
            color: #666;
        `;
        infoDiv.innerHTML = `Showing <strong>1–${Math.min(this.itemsPerPage, this.totalRows)}</strong> of <strong>${this.totalRows}</strong> entries`;

        // Right side: Controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'pagination-controls';
        controlsDiv.style.cssText = `
            display: flex;
            gap: 6px;
            align-items: center;
        `;

        // Previous button
        const prevBtn = this.createButton('←', 'prev', 1);
        controlsDiv.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            const pageBtn = this.createButton(i.toString(), 'page', i);
            controlsDiv.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = this.createButton('→', 'next', this.totalPages);
        controlsDiv.appendChild(nextBtn);

        paginationContainer.appendChild(infoDiv);
        paginationContainer.appendChild(controlsDiv);

        // Store reference for updates
        this.paginationContainer = paginationContainer;
        this.infoDiv = infoDiv;

        // Insert after table
        this.table.parentNode.insertBefore(paginationContainer, this.table.nextSibling);
    }

    /**
     * Create a pagination button
     */
    createButton(label, type, pageNum) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = `btn btn-${type === 'page' ? 'outline' : 'outline'} btn-sm pagination-btn`;
        
        if (type === 'page' && pageNum === 1) {
            btn.className = 'btn btn-primary btn-sm pagination-btn';
        }

        btn.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #ccc;
            background: white;
            color: #333;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 32px;
        `;

        // Active state for page numbers
        if (type === 'page' && pageNum === 1) {
            btn.style.cssText += `
                background: #720b0b;
                color: white;
                border-color: #720b0b;
            `;
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (type === 'prev' && this.currentPage > 1) {
                this.showPage(this.currentPage - 1);
            } else if (type === 'next' && this.currentPage < this.totalPages) {
                this.showPage(this.currentPage + 1);
            } else if (type === 'page') {
                this.showPage(pageNum);
            }
        });

        btn.addEventListener('hover', () => {
            if (type !== 'page' || pageNum !== this.currentPage) {
                btn.style.background = '#f0f0f0';
            }
        });

        return btn;
    }

    /**
     * Show specific page
     */
    showPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;

        this.currentPage = pageNum;
        const startIdx = (pageNum - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;

        // Hide all rows
        this.rows.forEach(row => {
            row.style.display = 'none';
        });

        // Show rows for current page
        this.rows.slice(startIdx, endIdx).forEach(row => {
            row.style.display = '';
        });

        // Update info text
        const displayStart = startIdx + 1;
        const displayEnd = Math.min(endIdx, this.totalRows);
        this.infoDiv.innerHTML = `Showing <strong>${displayStart}–${displayEnd}</strong> of <strong>${this.totalRows}</strong> entries`;

        // Update active button
        this.updatePaginationButtons();

        // Scroll to table
        this.table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Update button styles for active page
     */
    updatePaginationButtons() {
        const buttons = this.paginationContainer.querySelectorAll('.pagination-btn');
        buttons.forEach((btn, idx) => {
            // Skip prev/next buttons (first and last)
            if (idx === 0 || idx === buttons.length - 1) return;

            const pageNum = parseInt(btn.textContent);
            if (pageNum === this.currentPage) {
                btn.style.background = '#720b0b';
                btn.style.color = 'white';
                btn.style.borderColor = '#720b0b';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = 'white';
                btn.style.color = '#333';
                btn.style.borderColor = '#ccc';
                btn.style.fontWeight = '500';
            }
        });

        // Update prev/next buttons
        const prevBtn = buttons[0];
        const nextBtn = buttons[buttons.length - 1];

        if (this.currentPage === 1) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }

        if (this.currentPage === this.totalPages) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }
}

/**
 * Initialize pagination on all tables in the page
 */
function initializePagination(itemsPerPage = 10) {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Skip if already paginated
        if (table.hasAttribute('data-paginated')) return;
        
        // Check if table has tbody with rows
        const tbody = table.querySelector('tbody');
        if (!tbody || tbody.querySelectorAll('tr').length === 0) return;
        
        // Initialize paginator
        new TablePaginator(table, itemsPerPage);
        
        // Mark as paginated
        table.setAttribute('data-paginated', 'true');
    });
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePagination(10);
});

// Export for manual use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TablePaginator, initializePagination };
}
