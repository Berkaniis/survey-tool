/**
 * Dashboard view - main landing page with statistics and recent campaigns
 */
class DashboardView {
    constructor(params = {}) {
        this.params = params;
        this.campaigns = [];
        this.stats = null;
    }
    
    async render() {
        const html = `
            <div class="dashboard-view">
                <div class="view-header">
                    <h2 data-i18n="dashboard.title">Campaign Dashboard</h2>
                    <button class="btn btn-primary create-campaign-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                        </svg>
                        <span data-i18n="dashboard.createCampaign">New Campaign</span>
                    </button>
                </div>
                
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon campaigns">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-value total-campaigns">0</h3>
                            <p class="stat-label" data-i18n="dashboard.totalCampaigns">Total Campaigns</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon contacts">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-value total-contacts">0</h3>
                            <p class="stat-label" data-i18n="dashboard.totalContacts">Total Contacts</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon sent">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-value emails-sent">0</h3>
                            <p class="stat-label" data-i18n="dashboard.emailsSent">Emails Sent</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon response">
                            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-value response-rate">0%</h3>
                            <p class="stat-label" data-i18n="dashboard.responseRate">Response Rate</p>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Campaigns Section -->
                <div class="campaigns-section">
                    <div class="section-header">
                        <h3 data-i18n="dashboard.recentCampaigns">Recent Campaigns</h3>
                        <div class="section-actions">
                            <input type="search" 
                                   class="form-control search-campaigns" 
                                   placeholder="Search campaigns..."
                                   data-i18n-placeholder="dashboard.searchPlaceholder">
                            <select class="form-control filter-status">
                                <option value="" data-i18n="dashboard.allStatuses">All Statuses</option>
                                <option value="DRAFT" data-i18n="status.draft">Draft</option>
                                <option value="ACTIVE" data-i18n="status.active">Active</option>
                                <option value="COMPLETED" data-i18n="status.completed">Completed</option>
                            </select>
                            <button class="btn btn-secondary refresh-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                                </svg>
                                <span data-i18n="common.refresh">Refresh</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="campaigns-table-container">
                        <!-- Campaign table will be inserted here -->
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = html;
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
        
        // Load data and initialize components
        await this.loadData();
        this.initializeComponents();
        this.attachEventListeners();
    }
    
    async loadData() {
        try {
            // Load dashboard statistics
            const statsResult = await window.api.getDashboardStats();
            if (statsResult.success) {
                this.stats = statsResult.data;
                this.updateStatistics();
            }
            
            // Load recent campaigns
            const campaignsResult = await window.api.getCampaigns({
                limit: 10,
                offset: 0
            });
            
            if (campaignsResult.success) {
                this.campaigns = campaignsResult.data;
                this.renderCampaignsTable();
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            window.Toast.error('Failed to load dashboard data');
        }
    }
    
    updateStatistics() {
        if (!this.stats) return;
        
        // Update stat values
        const totalCampaigns = document.querySelector('.total-campaigns');
        const totalContacts = document.querySelector('.total-contacts');
        const emailsSent = document.querySelector('.emails-sent');
        const responseRate = document.querySelector('.response-rate');
        
        if (totalCampaigns) {
            totalCampaigns.textContent = window.formatNumber(this.stats.total_campaigns || 0);
        }
        
        if (totalContacts) {
            totalContacts.textContent = window.formatNumber(this.stats.total_contacts || 0);
        }
        
        if (emailsSent) {
            emailsSent.textContent = window.formatNumber(this.stats.emails_sent || 0);
        }
        
        if (responseRate) {
            responseRate.textContent = window.formatPercent(this.stats.response_rate || 0);
        }
    }
    
    renderCampaignsTable() {
        const container = document.querySelector('.campaigns-table-container');
        
        if (!this.campaigns || this.campaigns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-content">
                        <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" class="empty-state-icon">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
                        </svg>
                        <h3 data-i18n="dashboard.noCampaigns">No campaigns found</h3>
                        <p data-i18n="dashboard.createFirst">Create your first campaign to get started</p>
                        <button class="btn btn-primary create-campaign-btn">
                            <span data-i18n="dashboard.createCampaign">New Campaign</span>
                        </button>
                    </div>
                </div>
            `;
            
            // Apply translations
            if (window.i18n) {
                window.i18n.applyTranslations();
            }
            
            return;
        }
        
        const tableHtml = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th data-i18n="campaigns.name">Campaign Name</th>
                            <th data-i18n="campaigns.status">Status</th>
                            <th data-i18n="campaigns.contacts">Contacts</th>
                            <th data-i18n="campaigns.created">Created</th>
                            <th data-i18n="campaigns.actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.campaigns.map(campaign => this.renderCampaignRow(campaign)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHtml;
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
    }
    
    renderCampaignRow(campaign) {
        const statusClass = campaign.status.toLowerCase();
        const createdDate = window.formatDate(campaign.created_at);
        
        return `
            <tr class="campaign-row" data-campaign-id="${campaign.id}">
                <td>
                    <div class="campaign-name">
                        <strong>${this.escapeHtml(campaign.title)}</strong>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${statusClass}" data-i18n="status.${statusClass}">
                        ${campaign.status}
                    </span>
                </td>
                <td>
                    <span class="contact-count">${window.formatNumber(campaign.contact_count || 0)}</span>
                </td>
                <td>
                    <span class="created-date" title="${campaign.created_at}">
                        ${createdDate}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-secondary view-btn" 
                                data-campaign-id="${campaign.id}"
                                title="View campaign">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </button>
                        ${campaign.status === 'ACTIVE' ? `
                            <button class="btn btn-sm btn-primary send-btn" 
                                    data-campaign-id="${campaign.id}"
                                    title="Send emails">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary export-btn" 
                                data-campaign-id="${campaign.id}"
                                title="Export results">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    initializeComponents() {
        // Any additional component initialization can go here
    }
    
    attachEventListeners() {
        // Create campaign button
        const createBtns = document.querySelectorAll('.create-campaign-btn');
        createBtns.forEach(btn => {
            btn.addEventListener('click', this.handleCreateCampaign.bind(this));
        });
        
        // Campaign table actions
        document.addEventListener('click', (e) => {
            const campaignId = e.target.closest('[data-campaign-id]')?.dataset.campaignId;
            
            if (!campaignId) return;
            
            if (e.target.closest('.view-btn')) {
                this.handleViewCampaign(campaignId);
            } else if (e.target.closest('.send-btn')) {
                this.handleSendEmails(campaignId);
            } else if (e.target.closest('.export-btn')) {
                this.handleExportCampaign(campaignId);
            } else if (e.target.closest('.campaign-row')) {
                this.handleViewCampaign(campaignId);
            }
        });
        
        // Search and filter
        const searchInput = document.querySelector('.search-campaigns');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        
        const statusFilter = document.querySelector('.filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', this.handleFilter.bind(this));
        }
        
        // Refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        }
    }
    
    async handleCreateCampaign() {
        // For now, navigate to campaigns page where creation dialog will be handled
        window.router.navigate('/campaigns?action=create');
    }
    
    handleViewCampaign(campaignId) {
        window.router.navigate(`/campaigns/${campaignId}`);
    }
    
    handleSendEmails(campaignId) {
        window.router.navigate(`/campaigns/${campaignId}?tab=send`);
    }
    
    async handleExportCampaign(campaignId) {
        try {
            const result = await window.api.exportCampaign(campaignId, 'xlsx');
            if (result.success) {
                window.Toast.success('Campaign results exported successfully');
            } else {
                window.Toast.error(result.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            window.Toast.error('Failed to export campaign results');
        }
    }
    
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterCampaigns(query, this.getCurrentStatusFilter());
    }
    
    handleFilter(e) {
        const status = e.target.value;
        const query = this.getCurrentSearchQuery();
        this.filterCampaigns(query, status);
    }
    
    filterCampaigns(query = '', status = '') {
        const rows = document.querySelectorAll('.campaign-row');
        
        rows.forEach(row => {
            const campaignId = row.dataset.campaignId;
            const campaign = this.campaigns.find(c => c.id.toString() === campaignId);
            
            if (!campaign) return;
            
            const matchesQuery = !query || 
                campaign.title.toLowerCase().includes(query);
            
            const matchesStatus = !status || campaign.status === status;
            
            if (matchesQuery && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    getCurrentSearchQuery() {
        const searchInput = document.querySelector('.search-campaigns');
        return searchInput ? searchInput.value.toLowerCase() : '';
    }
    
    getCurrentStatusFilter() {
        const statusFilter = document.querySelector('.filter-status');
        return statusFilter ? statusFilter.value : '';
    }
    
    async handleRefresh() {
        await this.loadData();
        window.Toast.success('Dashboard refreshed');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add dashboard-specific styles
const dashboardStyles = `
.dashboard-view {
    max-width: 1200px;
    margin: 0 auto;
}

.view-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 2rem;
}

.view-header h2 {
    margin: 0;
    color: #374151;
    font-size: 1.875rem;
    font-weight: 600;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h3 {
    margin: 0;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
}

.section-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.section-actions .form-control {
    width: auto;
    min-width: 200px;
}

.campaigns-section {
    margin-top: 2rem;
}

.campaign-name strong {
    color: #374151;
}

.table-actions {
    display: flex;
    gap: 0.5rem;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
}

.empty-state-content {
    text-align: center;
    max-width: 400px;
    padding: 2rem;
}

.empty-state-icon {
    color: #9ca3af;
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
}

.empty-state p {
    color: #6b7280;
    margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
    .view-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .section-actions {
        width: 100%;
        flex-direction: column;
    }
    
    .section-actions .form-control {
        width: 100%;
        min-width: auto;
    }
    
    .table-actions {
        flex-direction: column;
    }
}
`;

// Inject styles
if (!document.getElementById('dashboard-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dashboard-styles';
    styleSheet.textContent = dashboardStyles;
    document.head.appendChild(styleSheet);
}

// Make DashboardView available globally
window.DashboardView = DashboardView;

console.log('Dashboard view initialized');