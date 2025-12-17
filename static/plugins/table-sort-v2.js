/**
 * TableSort - High Performance Table Sorting Plugin
 * Optimized for large tables (1000+ rows)
 * Pure JS, no dependencies
 */

/* =========================
   Inject CSS
========================= */
(function injectStyles() {
    if (document.getElementById('table-sort-styles')) return;

    const link = document.createElement('link');
    link.id = 'table-sort-styles';
    link.rel = 'stylesheet';

    const scriptPath = document.currentScript?.src;
    let cssPath = 'table-sort.css';

    if (scriptPath) {
        cssPath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1) + 'table-sort.css';
    }

    link.href = cssPath;
    document.head.appendChild(link);
})();

/* =========================
   TableSort Class
========================= */
class TableSort {
    constructor(tableSelector, options = {}) {
        this.table = typeof tableSelector === 'string'
            ? document.querySelector(tableSelector)
            : tableSelector;

        if (!this.table) {
            console.error('TableSort: Table not found');
            return;
        }

        this.options = {
            animation: true,
            animationDuration: 300,
            animationThreshold: 300, // max rows for animation
            sortIcons: true,
            defaultSort: null,
            onSort: null,
            ...options
        };

        this.currentSort = { column: null, direction: null };
        this.init();
    }

    init() {
        this.table.classList.add('table-sort');
        this.setupHeaders();

        if (this.options.defaultSort) {
            const { column, direction } = this.options.defaultSort;
            this.sort(column, direction);
        }
    }

    setupHeaders() {
        const thead = this.table.querySelector('thead');
        if (!thead) return;

        thead.querySelectorAll('th').forEach((th, index) => {
            if (th.classList.contains('no-sort')) return;

            th.classList.add('sortable');
            th.dataset.column = index;

            if (this.options.sortIcons) {
                th.insertAdjacentHTML('beforeend', `
                    <span class="sort-icon">
                        <svg class="sort-icon-asc" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
                        <svg class="sort-icon-desc" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                    </span>
                `);
            }

            th.addEventListener('click', () => this.handleClick(index));
        });
    }

    handleClick(column) {
        const direction =
            this.currentSort.column === column && this.currentSort.direction === 'asc'
                ? 'desc'
                : 'asc';

        this.sort(column, direction);
    }

    sort(columnIndex, direction = 'asc') {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.rows);
        if (!rows.length) return;

        const animate =
            this.options.animation &&
            rows.length <= this.options.animationThreshold;

        const type = this.detectType(rows, columnIndex);

        const sortedRows = this.getSortedRows(rows, columnIndex, direction, type);

        this.updateHeaders(columnIndex, direction);

        if (animate) {
            this.animate(tbody, sortedRows);
        } else {
            this.renderFast(tbody, sortedRows);
        }

        this.currentSort = { column: columnIndex, direction };

        this.options.onSort?.({
            column: columnIndex,
            direction,
            type
        });
    }

    detectType(rows, column) {
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            const text = rows[i].cells[column]?.textContent.trim();
            if (!text) continue;

            if (!isNaN(text.replace(/[,$%]/g, ''))) return 'number';
            if (!isNaN(Date.parse(text))) return 'date';
            return 'string';
        }
        return 'string';
    }

    getSortedRows(rows, column, direction, type) {
        const data = rows.map(row => {
            const cell = row.cells[column];
            const raw = cell?.getAttribute('data-sort') ?? cell?.textContent.trim() ?? '';

            let value = raw;
            if (type === 'number') value = parseFloat(raw.replace(/[,$%]/g, '')) || 0;
            if (type === 'date') value = new Date(raw).getTime() || 0;

            return { row, value };
        });

        data.sort((a, b) => {
            let res =
                type === 'string'
                    ? String(a.value).localeCompare(String(b.value), undefined, { numeric: true })
                    : a.value - b.value;

            return direction === 'asc' ? res : -res;
        });

        return data.map(d => d.row);
    }

    renderFast(tbody, rows) {
        const frag = document.createDocumentFragment();
        rows.forEach(r => frag.appendChild(r));
        tbody.appendChild(frag);
    }

    animate(tbody, rows) {
        const positions = new Map();

        Array.from(tbody.children).forEach(row => {
            positions.set(row, row.getBoundingClientRect());
        });

        this.renderFast(tbody, rows);

        rows.forEach(row => {
            const oldPos = positions.get(row);
            const newPos = row.getBoundingClientRect();
            const dy = oldPos.top - newPos.top;

            if (dy) {
                row.style.transform = `translateY(${dy}px)`;
                row.style.transition = 'none';

                requestAnimationFrame(() => {
                    row.style.transition = `transform ${this.options.animationDuration}ms ease`;
                    row.style.transform = 'translateY(0)';
                });
            }
        });

        setTimeout(() => {
            rows.forEach(row => {
                row.style.transform = '';
                row.style.transition = '';
            });
        }, this.options.animationDuration);
    }

    updateHeaders(column, direction) {
        this.table.querySelectorAll('th').forEach((th, i) => {
            th.classList.toggle('sort-active', i === column);
            th.classList.toggle('sort-asc', i === column && direction === 'asc');
            th.classList.toggle('sort-desc', i === column && direction === 'desc');
        });
    }

    destroy() {
        this.table.classList.remove('table-sort');
        this.table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sortable', 'sort-active', 'sort-asc', 'sort-desc');
            th.querySelector('.sort-icon')?.remove();
        });
    }

    refresh() {
        this.destroy();
        this.init();
    }
}

/* =========================
   Auto Init
========================= */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.table-sort').forEach(table => {
        new TableSort(table);
    });
});
