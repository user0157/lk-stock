/**
 * TableFilter - Pure Table Filtering Plugin (with built-in CSS)
 * A lightweight, dependency-free table filtering plugin (filter only, no sort)
 * No separate CSS file needed - styles are injected automatically
 */

// Inject CSS styles
// Inject CSS styles
(function injectStyles() {
    if (document.getElementById('table-filter-styles')) return;

    const link = document.createElement('link');
    link.id = 'table-filter-styles';
    link.rel = 'stylesheet';

    // Determine path relative to the script
    const scriptPath = document.currentScript ? document.currentScript.src : null;
    let cssPath = 'table-filter.css';

    if (scriptPath) {
        const lastSlash = scriptPath.lastIndexOf('/');
        if (lastSlash !== -1) {
            cssPath = scriptPath.substring(0, lastSlash + 1) + 'table-filter.css';
        }
    } else {
        // Fallback
        cssPath = 'plugins/table-filter.css';
    }

    link.href = cssPath;
    document.head.appendChild(link);
})();

// TableFilter Class
class TableFilter {
    constructor(tableSelector, options = {}) {
        this.table = typeof tableSelector === 'string'
            ? document.querySelector(tableSelector)
            : tableSelector;

        if (!this.table) {
            console.error('TableFilter: Table not found');
            return;
        }

        // Default options
        this.options = {
            triggerEvent: 'contextmenu', // 'contextmenu' (right-click) or 'click'
            showSearch: true,
            onFilter: null, // callback function
            ...options
        };

        // Filter state
        this.activeFilters = {}; // { columnIndex: Set of selected values }
        this.filterMenu = null;

        this.init();
    }

    init() {
        this.table.classList.add('table-filter');
        this.setupHeaders();
    }

    setupHeaders() {
        const thead = this.table.querySelector('thead');
        if (!thead) return;

        const headers = thead.querySelectorAll('th');
        headers.forEach((header, index) => {
            // Skip if header has no-filter class
            if (header.classList.contains('no-filter')) return;

            header.classList.add('filterable');
            header.setAttribute('data-column', index);

            // Add filter event (right-click by default)
            header.addEventListener(this.options.triggerEvent, (e) => {
                e.preventDefault();
                this.showFilterMenu(index, header, e);
            });
        });
    }

    showFilterMenu(columnIndex, header, event) {
        // Close existing menu
        this.closeFilterMenu();

        // Get all unique values from this column
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        const allRows = Array.from(tbody.querySelectorAll('tr'));
        const uniqueValues = new Set();

        allRows.forEach(row => {
            const cell = row.cells[columnIndex];
            if (cell) {
                uniqueValues.add(cell.textContent.trim());
            }
        });

        // Create filter menu
        this.filterMenu = this.createFilterMenu(columnIndex, Array.from(uniqueValues).sort(), event);
        document.body.appendChild(this.filterMenu);

        // Position menu near cursor
        const menuRect = this.filterMenu.getBoundingClientRect();
        let left = event.pageX;
        let top = event.pageY;

        // Adjust if menu goes off screen
        if (left + menuRect.width > window.innerWidth) {
            left = window.innerWidth - menuRect.width - 10;
        }
        if (top + menuRect.height > window.innerHeight + window.scrollY) {
            top = window.innerHeight + window.scrollY - menuRect.height - 10;
        }

        this.filterMenu.style.left = `${left}px`;
        this.filterMenu.style.top = `${top}px`;

        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', this.handleClickOutside.bind(this));
        }, 0);
    }

    createFilterMenu(columnIndex, values, event) {
        const menu = document.createElement('div');
        menu.className = 'filter-menu';
        menu.setAttribute('data-column', columnIndex);

        // Get current filter state
        const currentFilter = this.activeFilters[columnIndex];
        const allSelected = !currentFilter || currentFilter.size === values.length;

        // Header
        const header = document.createElement('div');
        header.className = 'filter-menu-header';
        const headerText = this.table.querySelectorAll('thead th')[columnIndex].textContent.replace(/\s+/g, ' ').trim();
        header.innerHTML = `
      <span class="filter-menu-title">筛选: ${headerText}</span>
      <button class="filter-menu-close" title="关闭">&times;</button>
    `;
        menu.appendChild(header);

        // Search box (if enabled)
        if (this.options.showSearch) {
            const searchBox = document.createElement('div');
            searchBox.className = 'filter-menu-search';
            searchBox.innerHTML = `
        <input type="text" placeholder="搜索..." class="filter-search-input">
      `;
            menu.appendChild(searchBox);
        }

        // Actions (Select All / Clear All)
        const actions = document.createElement('div');
        actions.className = 'filter-menu-actions';
        actions.innerHTML = `
      <button class="filter-action-btn" data-action="all">全选</button>
      <button class="filter-action-btn" data-action="none">清空</button>
    `;
        menu.appendChild(actions);

        // Options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'filter-menu-options';

        values.forEach(value => {
            const option = document.createElement('label');
            option.className = 'filter-menu-option';
            const isChecked = !currentFilter || currentFilter.has(value);
            option.innerHTML = `
        <input type="checkbox" value="${this.escapeHtml(value)}" ${isChecked ? 'checked' : ''}>
        <span>${this.escapeHtml(value)}</span>
      `;
            optionsContainer.appendChild(option);
        });

        menu.appendChild(optionsContainer);

        // Footer (Apply / Cancel)
        const footer = document.createElement('div');
        footer.className = 'filter-menu-footer';
        footer.innerHTML = `
      <button class="filter-btn filter-btn-cancel">取消</button>
      <button class="filter-btn filter-btn-apply">应用</button>
    `;
        menu.appendChild(footer);

        // Event listeners
        this.attachFilterMenuEvents(menu, columnIndex, values);

        return menu;
    }

    attachFilterMenuEvents(menu, columnIndex, allValues) {
        // Close button
        menu.querySelector('.filter-menu-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFilterMenu();
        });

        // Search input (if exists)
        const searchInput = menu.querySelector('.filter-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const options = menu.querySelectorAll('.filter-menu-option');
                options.forEach(option => {
                    const text = option.textContent.toLowerCase();
                    option.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        // Select All / Clear All
        menu.querySelectorAll('.filter-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const checkboxes = menu.querySelectorAll('.filter-menu-option input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    if (cb.parentElement.style.display !== 'none') {
                        cb.checked = action === 'all';
                    }
                });
            });
        });

        // Cancel button
        menu.querySelector('.filter-btn-cancel').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFilterMenu();
        });

        // Apply button
        menu.querySelector('.filter-btn-apply').addEventListener('click', (e) => {
            e.stopPropagation();
            this.applyFilter(menu, columnIndex, allValues);
        });

        // Prevent menu from closing when clicking inside
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    applyFilter(menu, columnIndex, allValues) {
        const checkboxes = menu.querySelectorAll('.filter-menu-option input[type="checkbox"]');
        const selectedValues = new Set();

        checkboxes.forEach(cb => {
            if (cb.checked) {
                selectedValues.add(cb.value);
            }
        });

        // Update filter state
        if (selectedValues.size === allValues.length) {
            // All selected = no filter
            delete this.activeFilters[columnIndex];
        } else {
            this.activeFilters[columnIndex] = selectedValues;
        }

        // Apply filters to table
        this.applyAllFilters();

        // Update header indicator
        this.updateFilterIndicators();

        // Trigger callback
        if (this.options.onFilter) {
            this.options.onFilter({
                column: columnIndex,
                activeFilters: this.activeFilters
            });
        }

        // Close menu
        this.closeFilterMenu();
    }

    applyAllFilters() {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        const allRows = Array.from(tbody.querySelectorAll('tr'));

        allRows.forEach(row => {
            let shouldShow = true;

            // Check each active filter
            for (const [columnIndex, allowedValues] of Object.entries(this.activeFilters)) {
                const cell = row.cells[columnIndex];
                if (cell) {
                    const cellValue = cell.textContent.trim();
                    if (!allowedValues.has(cellValue)) {
                        shouldShow = false;
                        break;
                    }
                }
            }

            // Show or hide row
            if (shouldShow) {
                row.classList.remove('filtered-hidden');
            } else {
                row.classList.add('filtered-hidden');
            }
        });
    }

    updateFilterIndicators() {
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            // Remove existing indicator
            const existingIndicator = header.querySelector('.filter-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            // Add indicator if filter is active (prepend to header)
            if (this.activeFilters[index]) {
                const indicator = document.createElement('span');
                indicator.className = 'filter-indicator';
                indicator.innerHTML = '●';
                indicator.title = '已筛选';
                // Insert at the beginning of the header
                header.insertBefore(indicator, header.firstChild);
            }
        });
    }

    closeFilterMenu() {
        if (this.filterMenu) {
            this.filterMenu.remove();
            this.filterMenu = null;
            document.removeEventListener('click', this.handleClickOutside.bind(this));
        }
    }

    handleClickOutside(event) {
        if (this.filterMenu && !this.filterMenu.contains(event.target)) {
            this.closeFilterMenu();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods
    clearFilters() {
        this.activeFilters = {};
        this.applyAllFilters();
        this.updateFilterIndicators();
    }

    destroy() {
        // Close filter menu
        this.closeFilterMenu();

        // Remove filter indicators
        const indicators = this.table.querySelectorAll('.filter-indicator');
        indicators.forEach(ind => ind.remove());

        // Clear filters
        this.activeFilters = {};
        const allRows = this.table.querySelectorAll('tbody tr');
        allRows.forEach(row => row.classList.remove('filtered-hidden'));

        const headers = this.table.querySelectorAll('thead th.filterable');
        headers.forEach(header => {
            header.classList.remove('filterable');
        });
        this.table.classList.remove('table-filter');
    }

    refresh() {
        this.destroy();
        this.init();
    }
}

// Auto-initialize tables with data-table-filter attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.table-filter').forEach(table => {
        new TableFilter(table);
    });
});
