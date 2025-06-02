/**
 * Campaigns view - manage survey campaigns
 */
class CampaignsView {
    constructor(params = {}) {
        this.params = params;
        this.campaigns = [];
        this.currentCampaign = null;
        this.isEditing = false;
        this.currentTab = 'overview';
    }
    
    async render() {
        // Check if viewing specific campaign
        const campaignId = this.params.id;
        if (campaignId) {
            await this.renderCampaignDetail(campaignId);
        } else {
            await this.renderCampaignsList();
        }
    }
    
    async renderCampaignsList() {
        const html = `
            <div class="campaigns-view">
                <div class="view-header">
                    <h2 data-i18n="campaigns.title">Campaigns</h2>
                    <button class="btn btn-primary create-campaign-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                        </svg>
                        <span data-i18n="campaigns.create">New Campaign</span>
                    </button>
                </div>
                
                <div class="campaigns-content">
                    <div class="campaigns-filters">
                        <div class="filters-row">
                            <input type="search" 
                                   class="form-control search-campaigns" 
                                   placeholder="Search campaigns..."
                                   data-i18n-placeholder="campaigns.search">
                            <select class="form-control filter-status">
                                <option value="" data-i18n="campaigns.allStatuses">All Statuses</option>
                                <option value="DRAFT" data-i18n="status.draft">Draft</option>
                                <option value="ACTIVE" data-i18n="status.active">Active</option>
                                <option value="COMPLETED" data-i18n="status.completed">Completed</option>
                            </select>
                            <select class="form-control filter-type">
                                <option value="" data-i18n="campaigns.allTypes">All Types</option>
                                <option value="survey" data-i18n="campaigns.survey">Survey</option>
                                <option value="feedback" data-i18n="campaigns.feedback">Feedback</option>
                                <option value="nps" data-i18n="campaigns.nps">NPS</option>
                            </select>
                            <button class="btn btn-secondary refresh-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                                </svg>
                                <span data-i18n="common.refresh">Refresh</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="campaigns-grid">
                        <!-- Campaigns will be loaded here -->
                    </div>
                </div>
                
                <!-- Campaign Creation Modal -->
                <div id="campaign-modal" class="modal hidden">
                    <div class="modal-backdrop"></div>
                    <div class="modal-dialog modal-large">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 class="modal-title">New Campaign</h3>
                                <button class="modal-close">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form class="campaign-form">
                                    <div class="form-group">
                                        <label for="campaign-title" data-i18n="campaigns.title">Campaign Title</label>
                                        <input type="text" 
                                               id="campaign-title" 
                                               name="title"
                                               class="form-control" 
                                               required
                                               placeholder="Enter campaign title...">
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="campaign-type" data-i18n="campaigns.type">Type</label>
                                            <select id="campaign-type" name="type" class="form-control" required>
                                                <option value="" data-i18n="common.selectOption">Select type...</option>
                                                <option value="survey" data-i18n="campaigns.survey">Survey</option>
                                                <option value="feedback" data-i18n="campaigns.feedback">Feedback</option>
                                                <option value="nps" data-i18n="campaigns.nps">NPS</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="campaign-template" data-i18n="campaigns.template">Email Template</label>
                                            <select id="campaign-template" name="template_id" class="form-control">
                                                <option value="" data-i18n="campaigns.noTemplate">No template</option>
                                                <!-- Templates will be loaded here -->
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="campaign-description" data-i18n="campaigns.description">Description</label>
                                        <textarea id="campaign-description" 
                                                  name="description"
                                                  class="form-control" 
                                                  rows="3"
                                                  placeholder="Describe the purpose of this campaign..."></textarea>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="campaign-contacts" data-i18n="campaigns.contacts">Contact List</label>
                                        <div class="file-upload-area" id="contacts-upload">
                                            <!-- FileUpload component will be initialized here -->
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary cancel-campaign-btn" data-i18n="common.cancel">Cancel</button>
                                <button class="btn btn-primary save-campaign-btn" data-i18n="common.save">Save Campaign</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = html;
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
        
        // Load campaigns and initialize
        await this.loadCampaigns();
        await this.loadTemplates();
        this.attachEventListeners();
        this.initializeFileUpload();
        
        // Check for pre-selected template
        const templateId = new URLSearchParams(window.location.search).get('template');
        if (templateId) {
            this.showCreateCampaignModal(templateId);
        }
        
        // Check for create action
        const action = new URLSearchParams(window.location.search).get('action');
        if (action === 'create') {
            this.showCreateCampaignModal();
        }
    }
    
    async renderCampaignDetail(campaignId) {
        // Load campaign details
        await this.loadCampaign(campaignId);
        
        if (!this.currentCampaign) {
            window.Toast?.error('Campaign not found');
            window.router?.navigate('/campaigns');
            return;
        }
        
        const html = `
            <div class="campaign-detail-view">
                <div class="view-header">
                    <div class="header-left">
                        <button class="btn btn-secondary back-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
                            </svg>
                            <span data-i18n="common.back">Back</span>
                        </button>
                        <div class="header-info">
                            <h2>${this.escapeHtml(this.currentCampaign.title)}</h2>
                            <span class="campaign-status status-${this.currentCampaign.status.toLowerCase()}">
                                ${this.currentCampaign.status}
                            </span>
                        </div>
                    </div>
                    <div class="header-actions">
                        ${this.currentCampaign.status === 'DRAFT' ? `
                            <button class="btn btn-secondary edit-campaign-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                                <span data-i18n="common.edit">Edit</span>
                            </button>
                        ` : ''}
                        ${this.currentCampaign.status === 'ACTIVE' ? `
                            <button class="btn btn-primary send-emails-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                <span data-i18n="campaigns.sendEmails">Send Emails</span>
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary export-results-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                            </svg>
                            <span data-i18n="campaigns.export">Export</span>
                        </button>
                    </div>
                </div>
                
                <div class="campaign-tabs">
                    <nav class="tab-nav">
                        <button class="tab-btn active" data-tab="overview">
                            <span data-i18n="campaigns.overview">Overview</span>
                        </button>
                        <button class="tab-btn" data-tab="contacts">
                            <span data-i18n="campaigns.contacts">Contacts</span>
                        </button>
                        <button class="tab-btn" data-tab="emails">
                            <span data-i18n="campaigns.emails">Emails</span>
                        </button>
                        <button class="tab-btn" data-tab="responses">
                            <span data-i18n="campaigns.responses">Responses</span>
                        </button>
                    </nav>
                </div>
                
                <div class="campaign-content">
                    <!-- Tab content will be rendered here -->
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = html;
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
        
        // Initialize tab content
        const tab = this.params.tab || 'overview';
        this.switchTab(tab);
        this.attachCampaignDetailEventListeners();
    }
    
    async loadCampaigns() {
        try {
            const result = await window.api.getCampaigns();
            if (result.success) {
                this.campaigns = result.data;
                this.renderCampaignsGrid();
            } else {
                window.Toast?.error('Failed to load campaigns');
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            window.Toast?.error('Error loading campaigns');
        }
    }
    
    async loadCampaign(campaignId) {
        try {
            const result = await window.api.getCampaign(campaignId);
            if (result.success) {
                this.currentCampaign = result.data;
            } else {
                window.Toast?.error('Failed to load campaign');
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
            window.Toast?.error('Error loading campaign');
        }
    }
    
    async loadTemplates() {
        try {
            const result = await window.api.getTemplates();
            if (result.success) {
                const templateSelect = document.getElementById('campaign-template');
                if (templateSelect) {
                    // Clear existing options except first
                    while (templateSelect.children.length > 1) {
                        templateSelect.removeChild(templateSelect.lastChild);
                    }
                    
                    // Add template options
                    result.data.forEach(template => {
                        const option = document.createElement('option');
                        option.value = template.id;
                        option.textContent = template.name;
                        templateSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }
    
    renderCampaignsGrid() {
        const grid = document.querySelector('.campaigns-grid');
        
        if (!this.campaigns || this.campaigns.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
                    </svg>
                    <h3 data-i18n="campaigns.noCampaigns">No campaigns found</h3>
                    <p data-i18n="campaigns.createFirst">Create your first campaign to get started</p>
                    <button class="btn btn-primary create-campaign-btn">
                        <span data-i18n="campaigns.create">New Campaign</span>
                    </button>
                </div>
            `;
            
            if (window.i18n) {
                window.i18n.applyTranslations();
            }
            return;
        }
        
        const html = this.campaigns.map(campaign => this.renderCampaignCard(campaign)).join('');
        grid.innerHTML = html;
    }
    
    renderCampaignCard(campaign) {
        const statusClass = campaign.status.toLowerCase();
        const typeClass = campaign.type?.toLowerCase() || 'default';
        const createdDate = window.formatDate ? window.formatDate(campaign.created_at) : campaign.created_at;
        const progress = this.calculateProgress(campaign);
        
        return `
            <div class="campaign-card" data-campaign-id="${campaign.id}">
                <div class="campaign-card-header">
                    <div class="campaign-type type-${typeClass}">
                        ${this.getTypeIcon(campaign.type)}
                        <span data-i18n="campaigns.${campaign.type}">${campaign.type}</span>
                    </div>
                    <span class="campaign-status status-${statusClass}" data-i18n="status.${statusClass}">
                        ${campaign.status}
                    </span>
                </div>
                
                <div class="campaign-card-body">
                    <h4 class="campaign-title">${this.escapeHtml(campaign.title)}</h4>
                    <p class="campaign-description">${this.escapeHtml(campaign.description || 'No description')}</p>
                    
                    <div class="campaign-stats">
                        <div class="stat">
                            <span class="stat-value">${window.formatNumber ? window.formatNumber(campaign.contact_count || 0) : (campaign.contact_count || 0)}</span>
                            <span class="stat-label" data-i18n="campaigns.contacts">Contacts</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${window.formatNumber ? window.formatNumber(campaign.sent_count || 0) : (campaign.sent_count || 0)}</span>
                            <span class="stat-label" data-i18n="campaigns.sent">Sent</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${window.formatNumber ? window.formatNumber(campaign.response_count || 0) : (campaign.response_count || 0)}</span>
                            <span class="stat-label" data-i18n="campaigns.responses">Responses</span>
                        </div>
                    </div>
                    
                    <div class="campaign-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}% complete</span>
                    </div>
                </div>
                
                <div class="campaign-card-footer">
                    <span class="campaign-date">Created ${createdDate}</span>
                    <div class="campaign-actions">
                        <button class="btn btn-sm btn-secondary view-campaign-btn" 
                                data-campaign-id="${campaign.id}">
                            <span data-i18n="common.view">View</span>
                        </button>
                        ${campaign.status === 'ACTIVE' ? `
                            <button class="btn btn-sm btn-primary send-campaign-btn" 
                                    data-campaign-id="${campaign.id}">
                                <span data-i18n="campaigns.send">Send</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Remove any existing listeners first
        const existingHandler = document.querySelector('.campaigns-view')?.clickHandler;
        if (existingHandler) {
            document.removeEventListener('click', existingHandler);
        }
        
        // Create campaign button - Use document delegation
        const clickHandler = (e) => {
            if (e.target.closest('.create-campaign-btn')) {
                e.preventDefault();
                this.showCreateCampaignModal();
            }
        };
        
        // Store reference for cleanup
        const campaignsView = document.querySelector('.campaigns-view');
        if (campaignsView) {
            campaignsView.clickHandler = clickHandler;
        }
        
        document.addEventListener('click', clickHandler);
        
        // Campaign actions - Use document delegation
        document.addEventListener('click', (e) => {
            const campaignId = e.target.closest('[data-campaign-id]')?.dataset.campaignId;
            
            if (!campaignId) return;
            
            if (e.target.closest('.view-campaign-btn')) {
                e.preventDefault();
                this.viewCampaign(campaignId);
            } else if (e.target.closest('.send-campaign-btn')) {
                e.preventDefault();
                this.sendCampaign(campaignId);
            } else if (e.target.closest('.campaign-card')) {
                this.viewCampaign(campaignId);
            }
        });
        
        // Modal actions - Use document delegation for modals
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cancel-campaign-btn') || e.target.closest('.modal-close')) {
                e.preventDefault();
                this.hideCreateCampaignModal();
            } else if (e.target.closest('.save-campaign-btn')) {
                e.preventDefault();
                this.saveCampaign();
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
        
        const typeFilter = document.querySelector('.filter-type');
        if (typeFilter) {
            typeFilter.addEventListener('change', this.handleFilter.bind(this));
        }
        
        // Refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        }
    }
    
    attachCampaignDetailEventListeners() {
        // Back button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.back-btn')) {
                window.router?.navigate('/campaigns');
            }
        });
        
        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab-btn')) {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tab);
            }
        });
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-campaign-btn')) {
                this.editCampaign();
            } else if (e.target.closest('.send-emails-btn')) {
                this.sendEmails();
            } else if (e.target.closest('.export-results-btn')) {
                this.exportResults();
            }
        });
    }
    
    initializeFileUpload() {
        const uploadContainer = document.getElementById('contacts-upload');
        if (uploadContainer && window.FileUpload) {
            this.fileUpload = new window.FileUpload(uploadContainer, {
                accept: '.csv,.xlsx,.xls',
                supportedFormats: ['csv', 'xlsx', 'xls'],
                maxFileSize: 5 * 1024 * 1024, // 5MB
                maxFiles: 1,
                placeholder: 'Upload contact list (CSV or Excel)',
                onFileAdd: (file) => {
                    console.log('Contact file added:', file);
                }
            });
        }
    }
    
    showCreateCampaignModal(templateId = null) {
        const modal = document.getElementById('campaign-modal');
        modal.classList.remove('hidden');
        
        // Pre-select template if provided
        if (templateId) {
            const templateSelect = document.getElementById('campaign-template');
            if (templateSelect) {
                templateSelect.value = templateId;
            }
        }
    }
    
    hideCreateCampaignModal() {
        const modal = document.getElementById('campaign-modal');
        modal.classList.add('hidden');
        
        // Reset form
        const form = document.querySelector('.campaign-form');
        form.reset();
        
        // Reset file upload
        if (this.fileUpload) {
            this.fileUpload.reset();
        }
    }
    
    async saveCampaign() {
        const form = document.querySelector('.campaign-form');
        const formData = new FormData(form);
        
        const campaignData = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            template_id: formData.get('template_id') || null
        };
        
        // Validation
        if (!campaignData.title || !campaignData.type) {
            window.Toast?.error('Please fill in all required fields');
            return;
        }
        
        // Get uploaded contacts
        const contactFiles = this.fileUpload ? this.fileUpload.getFiles() : [];
        if (contactFiles.length > 0) {
            campaignData.contact_file = contactFiles[0].file;
        }
        
        try {
            const result = await window.api.createCampaign(campaignData);
            if (result.success) {
                window.Toast?.success('Campaign created successfully');
                this.hideCreateCampaignModal();
                await this.loadCampaigns();
            } else {
                window.Toast?.error(result.error || 'Failed to create campaign');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            window.Toast?.error('Error creating campaign');
        }
    }
    
    viewCampaign(campaignId) {
        window.router?.navigate(`/campaigns/${campaignId}`);
    }
    
    async sendCampaign(campaignId) {
        const confirmed = await window.Modal?.confirm(
            'Are you sure you want to send emails for this campaign?',
            'Send Campaign'
        );
        
        if (confirmed) {
            try {
                const result = await window.api.sendCampaignEmails(campaignId);
                if (result.success) {
                    window.Toast?.success('Campaign emails are being sent');
                    await this.loadCampaigns();
                } else {
                    window.Toast?.error(result.error || 'Failed to send campaign');
                }
            } catch (error) {
                console.error('Error sending campaign:', error);
                window.Toast?.error('Error sending campaign');
            }
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Render tab content
        this.renderTabContent(tabName);
        this.currentTab = tabName;
    }
    
    renderTabContent(tabName) {
        const content = document.querySelector('.campaign-content');
        
        switch (tabName) {
            case 'overview':
                content.innerHTML = this.renderOverviewTab();
                break;
            case 'contacts':
                content.innerHTML = this.renderContactsTab();
                break;
            case 'emails':
                content.innerHTML = this.renderEmailsTab();
                break;
            case 'responses':
                content.innerHTML = this.renderResponsesTab();
                break;
        }
    }
    
    renderOverviewTab() {
        const campaign = this.currentCampaign;
        const progress = this.calculateProgress(campaign);
        
        return `
            <div class="overview-content">
                <div class="overview-stats">
                    <div class="stat-card">
                        <h3>${campaign.contact_count || 0}</h3>
                        <p data-i18n="campaigns.totalContacts">Total Contacts</p>
                    </div>
                    <div class="stat-card">
                        <h3>${campaign.sent_count || 0}</h3>
                        <p data-i18n="campaigns.emailsSent">Emails Sent</p>
                    </div>
                    <div class="stat-card">
                        <h3>${campaign.response_count || 0}</h3>
                        <p data-i18n="campaigns.responses">Responses</p>
                    </div>
                    <div class="stat-card">
                        <h3>${campaign.response_rate ? window.formatPercent(campaign.response_rate) : '0%'}</h3>
                        <p data-i18n="campaigns.responseRate">Response Rate</p>
                    </div>
                </div>
                
                <div class="overview-info">
                    <div class="info-section">
                        <h4 data-i18n="campaigns.description">Description</h4>
                        <p>${this.escapeHtml(campaign.description || 'No description provided')}</p>
                    </div>
                    
                    <div class="info-section">
                        <h4 data-i18n="campaigns.details">Campaign Details</h4>
                        <dl class="details-list">
                            <dt data-i18n="campaigns.type">Type:</dt>
                            <dd>${campaign.type}</dd>
                            <dt data-i18n="campaigns.status">Status:</dt>
                            <dd><span class="status-badge status-${campaign.status.toLowerCase()}">${campaign.status}</span></dd>
                            <dt data-i18n="campaigns.created">Created:</dt>
                            <dd>${window.formatDate ? window.formatDate(campaign.created_at) : campaign.created_at}</dd>
                            ${campaign.template_name ? `
                                <dt data-i18n="campaigns.template">Template:</dt>
                                <dd>${this.escapeHtml(campaign.template_name)}</dd>
                            ` : ''}
                        </dl>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderContactsTab() {
        return `
            <div class="contacts-content">
                <div class="content-header">
                    <h3 data-i18n="campaigns.contactList">Contact List</h3>
                    <button class="btn btn-secondary download-contacts-btn">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                        </svg>
                        <span data-i18n="campaigns.downloadContacts">Download Contacts</span>
                    </button>
                </div>
                
                <div class="contacts-table-container">
                    <!-- Contacts table will be rendered here -->
                    <p>Loading contacts...</p>
                </div>
            </div>
        `;
    }
    
    renderEmailsTab() {
        return `
            <div class="emails-content">
                <div class="content-header">
                    <h3 data-i18n="campaigns.emailHistory">Email History</h3>
                    <div class="header-actions">
                        <button class="btn btn-secondary resend-failed-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                            </svg>
                            <span data-i18n="campaigns.resendFailed">Resend Failed</span>
                        </button>
                    </div>
                </div>
                
                <div class="emails-table-container">
                    <!-- Emails table will be rendered here -->
                    <p>Loading email history...</p>
                </div>
            </div>
        `;
    }
    
    renderResponsesTab() {
        return `
            <div class="responses-content">
                <div class="content-header">
                    <h3 data-i18n="campaigns.surveyResponses">Survey Responses</h3>
                    <button class="btn btn-secondary export-responses-btn">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                        </svg>
                        <span data-i18n="campaigns.exportResponses">Export Responses</span>
                    </button>
                </div>
                
                <div class="responses-table-container">
                    <!-- Responses table will be rendered here -->
                    <p>Loading responses...</p>
                </div>
            </div>
        `;
    }
    
    // Helper methods
    calculateProgress(campaign) {
        if (!campaign.contact_count || campaign.contact_count === 0) return 0;
        return Math.round((campaign.sent_count || 0) / campaign.contact_count * 100);
    }
    
    getTypeIcon(type) {
        const icons = {
            survey: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>',
            feedback: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/></svg>',
            nps: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>'
        };
        return icons[type] || icons.survey;
    }
    
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterCampaigns(query, this.getCurrentStatusFilter(), this.getCurrentTypeFilter());
    }
    
    handleFilter() {
        const query = this.getCurrentSearchQuery();
        const status = this.getCurrentStatusFilter();
        const type = this.getCurrentTypeFilter();
        this.filterCampaigns(query, status, type);
    }
    
    filterCampaigns(query = '', status = '', type = '') {
        const cards = document.querySelectorAll('.campaign-card');
        
        cards.forEach(card => {
            const campaignId = card.dataset.campaignId;
            const campaign = this.campaigns.find(c => c.id.toString() === campaignId);
            
            if (!campaign) return;
            
            const matchesQuery = !query || 
                campaign.title.toLowerCase().includes(query) ||
                (campaign.description && campaign.description.toLowerCase().includes(query));
            
            const matchesStatus = !status || campaign.status === status;
            const matchesType = !type || campaign.type === type;
            
            if (matchesQuery && matchesStatus && matchesType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
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
    
    getCurrentTypeFilter() {
        const typeFilter = document.querySelector('.filter-type');
        return typeFilter ? typeFilter.value : '';
    }
    
    async handleRefresh() {
        await this.loadCampaigns();
        window.Toast?.success('Campaigns refreshed');
    }
    
    editCampaign() {
        // Implementation for editing campaign
        window.Toast?.info('Edit campaign functionality coming soon');
    }
    
    sendEmails() {
        // Implementation for sending emails
        window.Toast?.info('Send emails functionality coming soon');
    }
    
    exportResults() {
        // Implementation for exporting results
        window.Toast?.info('Export results functionality coming soon');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add campaigns-specific styles
const campaignsStyles = `
.campaigns-view {
    max-width: 1400px;
    margin: 0 auto;
}

.campaigns-filters {
    margin-bottom: 2rem;
}

.filters-row {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.filters-row .form-control {
    width: auto;
    min-width: 200px;
}

.campaigns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.campaign-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
}

.campaign-card:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    border-color: #d1d5db;
}

.campaign-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.campaign-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.campaign-type.type-survey {
    background: #eff6ff;
    color: #1d4ed8;
}

.campaign-type.type-feedback {
    background: #fef3c7;
    color: #d97706;
}

.campaign-type.type-nps {
    background: #f0fdf4;
    color: #16a34a;
}

.campaign-status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    text-transform: uppercase;
}

.campaign-status.status-draft {
    background: #f3f4f6;
    color: #374151;
}

.campaign-status.status-active {
    background: #dbeafe;
    color: #1d4ed8;
}

.campaign-status.status-completed {
    background: #d1fae5;
    color: #065f46;
}

.campaign-card-body {
    padding: 1rem;
}

.campaign-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
}

.campaign-description {
    margin: 0 0 1rem 0;
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.campaign-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.stat {
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
}

.stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.campaign-progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.progress-bar {
    flex: 1;
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 4rem;
}

.campaign-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.campaign-date {
    font-size: 0.75rem;
    color: #9ca3af;
}

.campaign-actions {
    display: flex;
    gap: 0.5rem;
}

.campaign-detail-view .view-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-info h2 {
    margin: 0 0 0.5rem 0;
    color: #374151;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.campaign-tabs {
    margin-bottom: 2rem;
}

.tab-nav {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    color: #6b7280;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
}

.tab-btn:hover {
    color: #374151;
}

.tab-btn.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
}

.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    text-align: center;
}

.stat-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
    color: #374151;
}

.stat-card p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
}

.overview-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.info-section {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
}

.info-section h4 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-weight: 600;
}

.details-list {
    margin: 0;
}

.details-list dt {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;
}

.details-list dd {
    margin: 0 0 0.75rem 0;
    color: #6b7280;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.content-header h3 {
    margin: 0;
    color: #374151;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: #6b7280;
}

.empty-icon {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h3 {
    margin-bottom: 0.5rem;
    color: #374151;
}

.empty-state p {
    margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
    .campaigns-grid {
        grid-template-columns: 1fr;
    }
    
    .filters-row {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filters-row .form-control {
        width: 100%;
        min-width: auto;
    }
    
    .campaign-stats {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
    }
    
    .overview-stats {
        grid-template-columns: 1fr;
    }
    
    .overview-info {
        grid-template-columns: 1fr;
    }
    
    .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .header-actions {
        flex-direction: column;
    }
    
    .tab-nav {
        overflow-x: auto;
    }
    
    .tab-btn {
        flex-shrink: 0;
    }
}

/* Dark theme support */
[data-theme="dark"] .campaign-card,
[data-theme="dark"] .stat-card,
[data-theme="dark"] .info-section {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .campaign-card-header,
[data-theme="dark"] .campaign-card-footer {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .campaign-title,
[data-theme="dark"] .stat-card h3,
[data-theme="dark"] .info-section h4 {
    color: #f9fafb;
}

[data-theme="dark"] .tab-nav {
    border-color: #374151;
}
`;

// Inject styles
if (!document.getElementById('campaigns-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'campaigns-styles';
    styleSheet.textContent = campaignsStyles;
    document.head.appendChild(styleSheet);
}

// Make CampaignsView available globally
window.CampaignsView = CampaignsView;

console.log('Campaigns view initialized');