/**
 * TableSort - Pure Table Sorting Plugin (with built-in CSS)
 * A lightweight, dependency-free table sorting plugin (sort only, no filter)
 * No separate CSS file needed - styles are injected automatically
 */

// Inject CSS styles
// Inject CSS styles
(function injectStyles() {
    if (document.getElementById('table-sort-styles')) return;

    const link = document.createElement('link');
    link.id = 'table-sort-styles';
    link.rel = 'stylesheet';

    // Determine path relative to the script
    const scriptPath = document.currentScript ? document.currentScript.src : null;
    let cssPath = 'table-sort.css';

    if (scriptPath) {
        const lastSlash = scriptPath.lastIndexOf('/');
        if (lastSlash !== -1) {
            cssPath = scriptPath.substring(0, lastSlash + 1) + 'table-sort.css';
        }
    } else {
        // Fallback for when currentScript is not available (e.g. modules)
        // Assuming standard structure plugins/table-sort.js -> plugins/table-sort.css
        cssPath = 'plugins/table-sort.css';
    }

    link.href = cssPath;
    document.head.appendChild(link);
})();

// TableSort Class
class TableSort {
    constructor(tableSelector, options = {}) {
        this.table = typeof tableSelector === 'string'
            ? document.querySelector(tableSelector)
            : tableSelector;

        if (!this.table) {
            console.error('TableSort: Table not found');
            return;
        }

        // Default options
        this.options = {
            sortable: true,
            animation: true,
            animationDuration: 300,
            sortIcons: true,
            defaultSort: null, // { column: 0, direction: 'asc' }
            onSort: null, // callback function
            dateFormat: 'auto', // 'auto', 'ISO', 'US', 'EU'
            ...options
        };

        this.currentSort = {
            column: null,
            direction: null
        };

        this.init();
    }

    init() {
        this.table.classList.add('table-sort');
        this.setupHeaders();

        // Apply default sort if specified
        if (this.options.defaultSort) {
            const { column, direction } = this.options.defaultSort;
            this.sortColumn(column, direction);
        }
    }

    setupHeaders() {
        const thead = this.table.querySelector('thead');
        if (!thead) return;

        const headers = thead.querySelectorAll('th');
        headers.forEach((header, index) => {
            // Skip if header has no-sort class
            if (header.classList.contains('no-sort')) return;

            header.classList.add('sortable');
            header.setAttribute('data-column', index);

            // Add sort icons
            if (this.options.sortIcons) {
                const iconWrapper = document.createElement('span');
                iconWrapper.className = 'sort-icon';
                iconWrapper.innerHTML = `
          <svg class="sort-icon-asc" viewBox="0 0 24 24" width="16" height="16">
            <path d="M7 14l5-5 5 5z"/>
          </svg>
          <svg class="sort-icon-desc" viewBox="0 0 24 24" width="16" height="16">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        `;
                header.appendChild(iconWrapper);
            }

            // Add click event for sorting
            header.addEventListener('click', () => {
                this.handleHeaderClick(index);
            });
        });
    }

    handleHeaderClick(columnIndex) {
        let direction = 'asc';

        // Toggle direction if clicking the same column
        if (this.currentSort.column === columnIndex) {
            direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        }

        this.sortColumn(columnIndex, direction);
    }

    sortColumn(columnIndex, direction) {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const headers = this.table.querySelectorAll('thead th');
        const currentHeader = headers[columnIndex];

        // Determine data type
        const dataType = this.detectDataType(rows, columnIndex);

        // Sort rows
        const sortedRows = this.sortRows(rows, columnIndex, direction, dataType);

        // Update UI
        this.updateHeaders(columnIndex, direction);

        // Animate if enabled
        if (this.options.animation) {
            this.animateSort(tbody, sortedRows);
        } else {
            sortedRows.forEach(row => tbody.appendChild(row));
        }

        // Update current sort state
        this.currentSort = { column: columnIndex, direction };

        // Trigger callback
        if (this.options.onSort) {
            this.options.onSort({
                column: columnIndex,
                direction,
                dataType,
                header: currentHeader
            });
        }
    }

    detectDataType(rows, columnIndex) {
        // Sample first few non-empty cells
        const samples = rows
            .slice(0, 5)
            .map(row => {
                const cell = row.cells[columnIndex];
                return cell ? cell.textContent.trim() : '';
            })
            .filter(text => text !== '');

        if (samples.length === 0) return 'string';

        // Check for numbers
        const isNumber = samples.every(text => !isNaN(parseFloat(text.replace(/[,$%]/g, ''))));
        if (isNumber) return 'number';

        // Check for dates
        const isDate = samples.every(text => !isNaN(Date.parse(text)));
        if (isDate) return 'date';

        return 'string';
    }

    sortRows(rows, columnIndex, direction, dataType) {
        return rows.sort((a, b) => {
            const aCell = a.cells[columnIndex];
            const bCell = b.cells[columnIndex];

            if (!aCell || !bCell) return 0;

            let aValue = aCell.textContent.trim();
            let bValue = bCell.textContent.trim();

            // Handle data-sort attribute for custom sort values
            if (aCell.hasAttribute('data-sort')) aValue = aCell.getAttribute('data-sort');
            if (bCell.hasAttribute('data-sort')) bValue = bCell.getAttribute('data-sort');

            let comparison = 0;

            switch (dataType) {
                case 'number':
                    const aNum = parseFloat(aValue.replace(/[,$%]/g, '')) || 0;
                    const bNum = parseFloat(bValue.replace(/[,$%]/g, '')) || 0;
                    comparison = aNum - bNum;
                    break;

                case 'date':
                    const aDate = new Date(aValue);
                    const bDate = new Date(bValue);
                    comparison = aDate - bDate;
                    break;

                default: // string
                    comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
            }

            return direction === 'asc' ? comparison : -comparison;
        });
    }

    updateHeaders(activeColumn, direction) {
        const headers = this.table.querySelectorAll('thead th');

        headers.forEach((header, index) => {
            header.classList.remove('sort-asc', 'sort-desc', 'sort-active');

            if (index === activeColumn) {
                header.classList.add('sort-active', `sort-${direction}`);
            }
        });
    }

    animateSort(tbody, sortedRows) {
        // Get current positions
        const oldPositions = new Map();
        Array.from(tbody.children).forEach((row, index) => {
            oldPositions.set(row, row.getBoundingClientRect());
        });

        // Update DOM
        sortedRows.forEach(row => tbody.appendChild(row));

        // Calculate deltas and animate
        sortedRows.forEach(row => {
            const oldPos = oldPositions.get(row);
            const newPos = row.getBoundingClientRect();
            const deltaY = oldPos.top - newPos.top;

            if (deltaY !== 0) {
                row.style.transform = `translateY(${deltaY}px)`;
                row.style.transition = 'none';

                requestAnimationFrame(() => {
                    row.style.transition = `transform ${this.options.animationDuration}ms ease-out`;
                    row.style.transform = 'translateY(0)';
                });
            }
        });

        // Clean up after animation
        setTimeout(() => {
            sortedRows.forEach(row => {
                row.style.transform = '';
                row.style.transition = '';
            });
        }, this.options.animationDuration);
    }

    // Public methods
    destroy() {
        const headers = this.table.querySelectorAll('thead th.sortable');
        headers.forEach(header => {
            header.classList.remove('sortable', 'sort-active', 'sort-asc', 'sort-desc');
            const icon = header.querySelector('.sort-icon');
            if (icon) icon.remove();
        });
        this.table.classList.remove('table-sort');
    }

    refresh() {
        this.destroy();
        this.init();
    }

    sort(columnIndex, direction = 'asc') {
        this.sortColumn(columnIndex, direction);
    }
}

// Auto-initialize tables with data-table-sort attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.table-sort').forEach(table => {
        new TableSort(table);
    });
});
