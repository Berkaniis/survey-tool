/**
 * DataTable component for displaying tabular data with sorting, filtering, and pagination
 */
class DataTable {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            data: [],
            columns: [],
            sortable: true,
            filterable: true,
            searchable: true,
            paginated: true,
            pageSize: 10,
            pageSizes: [5, 10, 25, 50, 100],
            selectable: false,
            multiSelect: false,
            responsive: true,
            loading: false,
            emptyMessage: 'No data available',
            className: '',
            ...options
        };
        
        this.state = {
            data: [...this.options.data],
            filteredData: [...this.options.data],
            sortColumn: null,
            sortDirection: 'asc',
            currentPage: 1,
            searchQuery: '',
            filters: {},
            selectedRows: new Set(),
            loading: this.options.loading
        };
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('DataTable: Container not found');
            return;
        }
        
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        const {
            sortable,
            filterable,
            searchable,
            paginated,
            pageSize,
            pageSizes,
            selectable,
            multiSelect,
            className,
            emptyMessage
        } = this.options;
        
        const {
            filteredData,
            currentPage,
            searchQuery,
            loading,
            selectedRows
        } = this.state;
        
        // Calculate pagination
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const pageData = filteredData.slice(startIndex, endIndex);
        
        let html = `<div class="data-table ${className}">`;
        
        // Header with search and controls
        if (searchable || filterable) {
            html += `
                <div class="data-table-header">
                    ${searchable ? `
                        <div class="data-table-search">
                            <input type="search" 
                                   class="form-control search-input" 
                                   placeholder="Search..." 
                                   value="${searchQuery}">
                            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                            </svg>
                        </div>
                    ` : ''}
                    <div class="data-table-controls">
                        ${filterable ? '<button class="btn btn-secondary filter-btn">Filters</button>' : ''}
                        <div class="selected-count" style="display: ${selectedRows.size > 0 ? 'block' : 'none'}">
                            ${selectedRows.size} selected
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Loading state
        if (loading) {
            html += `
                <div class="data-table-loading">
                    <div class="loading-spinner"></div>
                    <span>Loading...</span>
                </div>
            `;
        } else if (pageData.length === 0) {
            // Empty state
            html += `
                <div class="data-table-empty">
                    <svg class="empty-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                    </svg>
                    <p>${emptyMessage}</p>
                </div>
            `;
        } else {
            // Table
            html += `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                ${selectable ? `
                                    <th class="select-column">
                                        ${multiSelect ? `
                                            <input type="checkbox" 
                                                   class="select-all-checkbox"
                                                   ${selectedRows.size === pageData.length && pageData.length > 0 ? 'checked' : ''}>
                                        ` : ''}
                                    </th>
                                ` : ''}
                                ${this.options.columns.map(col => this.renderHeaderCell(col)).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${pageData.map(row => this.renderRow(row)).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Pagination
            if (paginated && totalPages > 1) {
                html += this.renderPagination(currentPage, totalPages, totalItems, startIndex, endIndex);
            }
        }
        
        html += '</div>';
        
        this.container.innerHTML = html;
    }
    
    renderHeaderCell(column) {
        const { sortable } = this.options;
        const { sortColumn, sortDirection } = this.state;
        
        const isSorted = sortColumn === column.key;
        const canSort = sortable && column.sortable !== false;
        
        let className = 'table-header';
        if (canSort) className += ' sortable';
        if (isSorted) className += ` sorted sorted-${sortDirection}`;
        
        return `
            <th class="${className}" data-column="${column.key}">
                <div class="header-content">
                    <span>${column.title}</span>
                    ${canSort ? `
                        <svg class="sort-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z"/>
                        </svg>
                    ` : ''}
                </div>
            </th>
        `;
    }
    
    renderRow(row, index) {
        const { selectable, multiSelect } = this.options;
        const { selectedRows } = this.state;
        const rowId = this.getRowId(row);
        const isSelected = selectedRows.has(rowId);
        
        let html = `<tr class="table-row ${isSelected ? 'selected' : ''}" data-row-id="${rowId}">`;
        
        if (selectable) {
            html += `
                <td class="select-column">
                    <input type="${multiSelect ? 'checkbox' : 'radio'}" 
                           class="row-select"
                           ${isSelected ? 'checked' : ''}
                           data-row-id="${rowId}">
                </td>
            `;
        }
        
        this.options.columns.forEach(column => {
            html += `<td class="table-cell" data-column="${column.key}">`;
            
            if (column.render) {
                html += column.render(row[column.key], row, index);
            } else {
                const value = this.getCellValue(row, column.key);
                html += this.formatCellValue(value, column);
            }
            
            html += '</td>';
        });
        
        html += '</tr>';
        return html;
    }
    
    renderPagination(currentPage, totalPages, totalItems, startIndex, endIndex) {
        const { pageSize, pageSizes } = this.options;
        
        return `
            <div class="data-table-pagination">
                <div class="pagination-info">
                    Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries
                    <select class="form-control page-size-select">
                        ${pageSizes.map(size => `
                            <option value="${size}" ${size === pageSize ? 'selected' : ''}>
                                ${size} per page
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-secondary pagination-btn" 
                            data-page="1" 
                            ${currentPage === 1 ? 'disabled' : ''}>
                        First
                    </button>
                    <button class="btn btn-secondary pagination-btn" 
                            data-page="${currentPage - 1}" 
                            ${currentPage === 1 ? 'disabled' : ''}>
                        Previous
                    </button>
                    
                    ${this.renderPageNumbers(currentPage, totalPages)}
                    
                    <button class="btn btn-secondary pagination-btn" 
                            data-page="${currentPage + 1}" 
                            ${currentPage === totalPages ? 'disabled' : ''}>
                        Next
                    </button>
                    <button class="btn btn-secondary pagination-btn" 
                            data-page="${totalPages}" 
                            ${currentPage === totalPages ? 'disabled' : ''}>
                        Last
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPageNumbers(currentPage, totalPages) {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        let html = '';
        
        for (let i = start; i <= end; i++) {
            html += `
                <button class="btn pagination-btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        return html;
    }
    
    attachEventListeners() {
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('change', this.handleChange.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }
    
    handleClick(e) {
        // Sort handling
        if (e.target.closest('.sortable')) {
            const column = e.target.closest('[data-column]').dataset.column;
            this.sort(column);
        }
        
        // Pagination handling
        if (e.target.closest('.pagination-btn:not([disabled])')) {
            const page = parseInt(e.target.dataset.page);
            if (page) {
                this.goToPage(page);
            }
        }
        
        // Row selection
        if (e.target.classList.contains('row-select')) {
            const rowId = e.target.dataset.rowId;
            this.toggleRowSelection(rowId);
        }
        
        // Select all
        if (e.target.classList.contains('select-all-checkbox')) {
            this.toggleSelectAll();
        }
    }
    
    handleChange(e) {
        // Page size change
        if (e.target.classList.contains('page-size-select')) {
            this.setPageSize(parseInt(e.target.value));
        }
    }
    
    handleInput(e) {
        // Search input
        if (e.target.classList.contains('search-input')) {
            this.search(e.target.value);
        }
    }
    
    // Public API methods
    setData(data) {
        this.state.data = [...data];
        this.applyFiltersAndSearch();
        this.render();
    }
    
    getData() {
        return [...this.state.data];
    }
    
    getSelectedRows() {
        return this.state.data.filter(row => 
            this.state.selectedRows.has(this.getRowId(row))
        );
    }
    
    clearSelection() {
        this.state.selectedRows.clear();
        this.render();
    }
    
    sort(columnKey, direction = null) {
        const column = this.options.columns.find(col => col.key === columnKey);
        if (!column || column.sortable === false) return;
        
        // Toggle direction if same column
        if (this.state.sortColumn === columnKey) {
            this.state.sortDirection = direction || (this.state.sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            this.state.sortColumn = columnKey;
            this.state.sortDirection = direction || 'asc';
        }
        
        this.applySorting();
        this.render();
    }
    
    search(query) {
        this.state.searchQuery = query;
        this.state.currentPage = 1;
        this.applyFiltersAndSearch();
        this.render();
    }
    
    filter(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.state.currentPage = 1;
        this.applyFiltersAndSearch();
        this.render();
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.state.filteredData.length / this.options.pageSize);
        this.state.currentPage = Math.max(1, Math.min(page, totalPages));
        this.render();
    }
    
    setPageSize(size) {
        this.options.pageSize = size;
        this.state.currentPage = 1;
        this.render();
    }
    
    toggleRowSelection(rowId) {
        if (this.options.multiSelect) {
            if (this.state.selectedRows.has(rowId)) {
                this.state.selectedRows.delete(rowId);
            } else {
                this.state.selectedRows.add(rowId);
            }
        } else {
            this.state.selectedRows.clear();
            this.state.selectedRows.add(rowId);
        }
        this.render();
    }
    
    toggleSelectAll() {
        const pageData = this.getCurrentPageData();
        const allSelected = pageData.every(row => 
            this.state.selectedRows.has(this.getRowId(row))
        );
        
        if (allSelected) {
            pageData.forEach(row => {
                this.state.selectedRows.delete(this.getRowId(row));
            });
        } else {
            pageData.forEach(row => {
                this.state.selectedRows.add(this.getRowId(row));
            });
        }
        
        this.render();
    }
    
    setLoading(loading) {
        this.state.loading = loading;
        this.render();
    }
    
    // Helper methods
    applyFiltersAndSearch() {
        let data = [...this.state.data];
        
        // Apply search
        if (this.state.searchQuery) {
            data = data.filter(row => 
                this.options.columns.some(column => {
                    const value = this.getCellValue(row, column.key);
                    return String(value).toLowerCase().includes(this.state.searchQuery.toLowerCase());
                })
            );
        }
        
        // Apply filters
        Object.entries(this.state.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                data = data.filter(row => {
                    const cellValue = this.getCellValue(row, key);
                    return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
                });
            }
        });
        
        this.state.filteredData = data;
        this.applySorting();
    }
    
    applySorting() {
        if (!this.state.sortColumn) return;
        
        const column = this.options.columns.find(col => col.key === this.state.sortColumn);
        if (!column) return;
        
        this.state.filteredData.sort((a, b) => {
            const aValue = this.getCellValue(a, this.state.sortColumn);
            const bValue = this.getCellValue(b, this.state.sortColumn);
            
            let result = 0;
            
            if (column.sortType === 'number') {
                result = (parseFloat(aValue) || 0) - (parseFloat(bValue) || 0);
            } else if (column.sortType === 'date') {
                result = new Date(aValue) - new Date(bValue);
            } else {
                result = String(aValue).localeCompare(String(bValue));
            }
            
            return this.state.sortDirection === 'desc' ? -result : result;
        });
    }
    
    getCellValue(row, key) {
        return key.split('.').reduce((obj, prop) => obj?.[prop], row);
    }
    
    formatCellValue(value, column) {
        if (value === null || value === undefined) return '';
        
        if (column.type === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(value);
        }
        
        if (column.type === 'date') {
            return new Date(value).toLocaleDateString();
        }
        
        if (column.type === 'number') {
            return new Intl.NumberFormat().format(value);
        }
        
        return String(value);
    }
    
    getRowId(row) {
        return row.id || row._id || JSON.stringify(row);
    }
    
    getCurrentPageData() {
        const { pageSize } = this.options;
        const { currentPage, filteredData } = this.state;
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }
}

// Add DataTable styles
const dataTableStyles = `
.data-table {
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.data-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.data-table-search {
    position: relative;
    flex: 1;
    max-width: 300px;
}

.data-table-search .search-input {
    padding-left: 2.5rem;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
}

.data-table-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.selected-count {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
}

.data-table-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: #6b7280;
}

.loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.data-table-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
}

.empty-icon {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.table-container {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    position: sticky;
    top: 0;
    z-index: 10;
}

.table-header.sortable {
    cursor: pointer;
    user-select: none;
}

.table-header.sortable:hover {
    background: #f3f4f6;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.sort-icon {
    opacity: 0.3;
    transition: opacity 0.2s;
}

.table-header.sortable:hover .sort-icon,
.table-header.sorted .sort-icon {
    opacity: 1;
}

.table-header.sorted-desc .sort-icon {
    transform: rotate(180deg);
}

.select-column {
    width: 3rem;
    text-align: center;
}

.table-row:hover {
    background: #f9fafb;
}

.table-row.selected {
    background: #eff6ff;
}

.table-row.selected:hover {
    background: #dbeafe;
}

.data-table-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.pagination-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.page-size-select {
    width: auto;
    min-width: 120px;
}

.pagination-controls {
    display: flex;
    gap: 0.25rem;
}

.pagination-btn {
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.75rem;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .data-table-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .data-table-search {
        max-width: none;
    }
    
    .data-table-pagination {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .pagination-controls {
        justify-content: center;
    }
    
    .pagination-info {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }
}

/* Dark theme support */
[data-theme="dark"] .data-table {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .data-table-header,
[data-theme="dark"] .data-table-pagination {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .table th {
    background: #111827;
    color: #f9fafb;
}

[data-theme="dark"] .table td {
    color: #e5e7eb;
    border-color: #374151;
}

[data-theme="dark"] .table-row:hover {
    background: #374151;
}

[data-theme="dark"] .table-row.selected {
    background: #1e40af;
}

[data-theme="dark"] .table-row.selected:hover {
    background: #1d4ed8;
}
`;

// Inject styles
if (!document.getElementById('datatable-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'datatable-styles';
    styleSheet.textContent = dataTableStyles;
    document.head.appendChild(styleSheet);
}

// Make DataTable available globally
window.DataTable = DataTable;

console.log('DataTable component initialized');