/**
 * Templates view - manage email templates
 */
class TemplatesView {
    constructor(params = {}) {
        this.params = params;
        this.templates = [];
        this.currentTemplate = null;
        this.isEditing = false;
    }
    
    async render() {
        const html = `
            <div class="templates-view">
                <div class="view-header">
                    <h2 data-i18n="templates.title">Email Templates</h2>
                    <button class="btn btn-primary create-template-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                        </svg>
                        <span data-i18n="templates.create">New Template</span>
                    </button>
                </div>
                
                <div class="templates-content">
                    <!-- Templates List -->
                    <div class="templates-list">
                        <div class="list-header">
                            <h3 data-i18n="templates.list">Templates</h3>
                            <div class="list-actions">
                                <input type="search" 
                                       class="form-control search-templates" 
                                       placeholder="Search templates..."
                                       data-i18n-placeholder="templates.search">
                                <select class="form-control filter-type">
                                    <option value="" data-i18n="templates.allTypes">All Types</option>
                                    <option value="survey" data-i18n="templates.survey">Survey</option>
                                    <option value="reminder" data-i18n="templates.reminder">Reminder</option>
                                    <option value="thank_you" data-i18n="templates.thankYou">Thank You</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="templates-grid">
                            <!-- Templates will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Template Editor -->
                    <div class="template-editor hidden">
                        <div class="editor-header">
                            <h3 class="editor-title">New Template</h3>
                            <div class="editor-actions">
                                <button class="btn btn-secondary preview-btn">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                    <span data-i18n="templates.preview">Preview</span>
                                </button>
                                <button class="btn btn-secondary cancel-btn">
                                    <span data-i18n="common.cancel">Cancel</span>
                                </button>
                                <button class="btn btn-primary save-btn">
                                    <span data-i18n="common.save">Save</span>
                                </button>
                            </div>
                        </div>
                        
                        <form class="template-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="template-name" data-i18n="templates.name">Template Name</label>
                                    <input type="text" 
                                           id="template-name" 
                                           name="name"
                                           class="form-control" 
                                           required
                                           placeholder="Enter template name...">
                                </div>
                                
                                <div class="form-group">
                                    <label for="template-type" data-i18n="templates.type">Type</label>
                                    <select id="template-type" name="type" class="form-control" required>
                                        <option value="" data-i18n="common.selectOption">Select type...</option>
                                        <option value="survey" data-i18n="templates.survey">Survey</option>
                                        <option value="reminder" data-i18n="templates.reminder">Reminder</option>
                                        <option value="thank_you" data-i18n="templates.thankYou">Thank You</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="template-subject" data-i18n="templates.subject">Subject Line</label>
                                <input type="text" 
                                       id="template-subject" 
                                       name="subject"
                                       class="form-control" 
                                       required
                                       placeholder="Enter email subject...">
                            </div>
                            
                            <div class="form-group">
                                <label for="template-content" data-i18n="templates.content">Email Content</label>
                                <div class="editor-toolbar">
                                    <button type="button" class="btn btn-sm btn-secondary format-btn" data-format="bold">
                                        <strong>B</strong>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-secondary format-btn" data-format="italic">
                                        <em>I</em>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-secondary format-btn" data-format="underline">
                                        <u>U</u>
                                    </button>
                                    <div class="toolbar-separator"></div>
                                    <button type="button" class="btn btn-sm btn-secondary variable-btn" data-variable="{{customer_name}}">
                                        Name
                                    </button>
                                    <button type="button" class="btn btn-sm btn-secondary variable-btn" data-variable="{{survey_link}}">
                                        Survey Link
                                    </button>
                                    <button type="button" class="btn btn-sm btn-secondary variable-btn" data-variable="{{company_name}}">
                                        Company
                                    </button>
                                </div>
                                <textarea id="template-content" 
                                          name="content"
                                          class="form-control content-editor" 
                                          rows="15"
                                          required
                                          placeholder="Enter email content..."></textarea>
                                <div class="editor-help">
                                    <p data-i18n="templates.variablesHelp">
                                        Use variables like {{customer_name}} to personalize emails
                                    </p>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="template-description" data-i18n="templates.description">Description (Optional)</label>
                                <textarea id="template-description" 
                                          name="description"
                                          class="form-control" 
                                          rows="3"
                                          placeholder="Describe when to use this template..."></textarea>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = html;
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }
        
        // Load templates and initialize
        await this.loadTemplates();
        this.attachEventListeners();
    }
    
    async loadTemplates() {
        try {
            const result = await window.api.getTemplates();
            if (result.success) {
                this.templates = result.data;
                this.renderTemplatesGrid();
            } else {
                window.Toast?.error('Failed to load templates');
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            window.Toast?.error('Error loading templates');
        }
    }
    
    renderTemplatesGrid() {
        const grid = document.querySelector('.templates-grid');
        
        if (!this.templates || this.templates.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <h3 data-i18n="templates.noTemplates">No templates found</h3>
                    <p data-i18n="templates.createFirst">Create your first email template to get started</p>
                    <button class="btn btn-primary create-template-btn">
                        <span data-i18n="templates.create">New Template</span>
                    </button>
                </div>
            `;
            
            if (window.i18n) {
                window.i18n.applyTranslations();
            }
            return;
        }
        
        const html = this.templates.map(template => this.renderTemplateCard(template)).join('');
        grid.innerHTML = html;
    }
    
    renderTemplateCard(template) {
        const typeClass = template.type?.toLowerCase() || 'default';
        const createdDate = window.formatDate ? window.formatDate(template.created_at) : template.created_at;
        
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <div class="template-type type-${typeClass}">
                        ${this.getTypeIcon(template.type)}
                        <span data-i18n="templates.${template.type}">${template.type}</span>
                    </div>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-secondary edit-template-btn" 
                                data-template-id="${template.id}"
                                title="Edit template">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-secondary duplicate-template-btn" 
                                data-template-id="${template.id}"
                                title="Duplicate template">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-danger delete-template-btn" 
                                data-template-id="${template.id}"
                                title="Delete template">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 101.414 1.414L10 13.414l1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="template-card-body">
                    <h4 class="template-name">${this.escapeHtml(template.name)}</h4>
                    <p class="template-subject">${this.escapeHtml(template.subject)}</p>
                    <p class="template-description">${this.escapeHtml(template.description || 'No description')}</p>
                </div>
                
                <div class="template-card-footer">
                    <span class="template-date">Created ${createdDate}</span>
                    <button class="btn btn-sm btn-primary use-template-btn" 
                            data-template-id="${template.id}">
                        Use Template
                    </button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Create template button - Use proper event delegation
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.addEventListener('click', (e) => {
                if (e.target.closest('.create-template-btn')) {
                    e.preventDefault();
                    this.showTemplateEditor();
                }
            });
        }
        
        // Template actions - Use mainContent delegation
        if (mainContent) {
            mainContent.addEventListener('click', (e) => {
                const templateId = e.target.closest('[data-template-id]')?.dataset.templateId;
                
                if (!templateId) return;
                
                if (e.target.closest('.edit-template-btn')) {
                    e.preventDefault();
                    this.editTemplate(templateId);
                } else if (e.target.closest('.duplicate-template-btn')) {
                    e.preventDefault();
                    this.duplicateTemplate(templateId);
                } else if (e.target.closest('.delete-template-btn')) {
                    e.preventDefault();
                    this.deleteTemplate(templateId);
                } else if (e.target.closest('.use-template-btn')) {
                    e.preventDefault();
                    this.useTemplate(templateId);
                }
            });
        }
        
        // Editor actions - Use mainContent delegation for editor buttons
        if (mainContent) {
            mainContent.addEventListener('click', (e) => {
                if (e.target.closest('.save-btn')) {
                    e.preventDefault();
                    this.saveTemplate();
                } else if (e.target.closest('.cancel-btn')) {
                    e.preventDefault();
                    this.hideTemplateEditor();
                } else if (e.target.closest('.preview-btn')) {
                    e.preventDefault();
                    this.previewTemplate();
                }
            });
        }
        
        // Format buttons - Use mainContent delegation for format buttons
        if (mainContent) {
            mainContent.addEventListener('click', (e) => {
                if (e.target.closest('.format-btn')) {
                    e.preventDefault();
                    const format = e.target.closest('.format-btn').dataset.format;
                    this.applyFormat(format);
                } else if (e.target.closest('.variable-btn')) {
                    e.preventDefault();
                    const variable = e.target.closest('.variable-btn').dataset.variable;
                    this.insertVariable(variable);
                }
            });
        }
        
        // Search and filter
        const searchInput = document.querySelector('.search-templates');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        
        const typeFilter = document.querySelector('.filter-type');
        if (typeFilter) {
            typeFilter.addEventListener('change', this.handleFilter.bind(this));
        }
    }
    
    showTemplateEditor(template = null) {
        this.currentTemplate = template;
        this.isEditing = !!template;
        
        const editor = document.querySelector('.template-editor');
        const title = document.querySelector('.editor-title');
        
        if (template) {
            title.textContent = 'Edit Template';
            this.populateForm(template);
        } else {
            title.textContent = 'New Template';
            this.clearForm();
        }
        
        editor.classList.remove('hidden');
    }
    
    hideTemplateEditor() {
        const editor = document.querySelector('.template-editor');
        editor.classList.add('hidden');
        this.currentTemplate = null;
        this.isEditing = false;
    }
    
    populateForm(template) {
        const form = document.querySelector('.template-form');
        form.name.value = template.name || '';
        form.type.value = template.type || '';
        form.subject.value = template.subject || '';
        form.content.value = template.content || '';
        form.description.value = template.description || '';
    }
    
    clearForm() {
        const form = document.querySelector('.template-form');
        form.reset();
    }
    
    async saveTemplate() {
        const form = document.querySelector('.template-form');
        const formData = new FormData(form);
        
        const templateData = {
            name: formData.get('name'),
            type: formData.get('type'),
            subject: formData.get('subject'),
            content: formData.get('content'),
            description: formData.get('description')
        };
        
        // Validation
        if (!templateData.name || !templateData.type || !templateData.subject || !templateData.content) {
            window.Toast?.error('Please fill in all required fields');
            return;
        }
        
        try {
            let result;
            
            if (this.isEditing && this.currentTemplate) {
                result = await window.api.updateTemplate(this.currentTemplate.id, templateData);
            } else {
                result = await window.api.createTemplate(templateData);
            }
            
            if (result.success) {
                window.Toast?.success(`Template ${this.isEditing ? 'updated' : 'created'} successfully`);
                this.hideTemplateEditor();
                await this.loadTemplates();
            } else {
                window.Toast?.error(result.error || 'Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            window.Toast?.error('Error saving template');
        }
    }
    
    async editTemplate(templateId) {
        const template = this.templates.find(t => t.id.toString() === templateId);
        if (template) {
            this.showTemplateEditor(template);
        }
    }
    
    async duplicateTemplate(templateId) {
        const template = this.templates.find(t => t.id.toString() === templateId);
        if (!template) return;
        
        const duplicateData = {
            ...template,
            name: `${template.name} (Copy)`,
            id: undefined,
            created_at: undefined,
            updated_at: undefined
        };
        
        this.showTemplateEditor(duplicateData);
    }
    
    async deleteTemplate(templateId) {
        const template = this.templates.find(t => t.id.toString() === templateId);
        if (!template) return;
        
        const confirmed = await window.Modal?.confirm(
            `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`,
            'Delete Template'
        );
        
        if (!confirmed) return;
        
        try {
            const result = await window.api.deleteEmailTemplate(templateId);
            if (result.success) {
                window.Toast?.success('Template deleted successfully');
                await this.loadTemplates();
            } else {
                window.Toast?.error(result.error || 'Failed to delete template');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            window.Toast?.error('Error deleting template');
        }
    }
    
    useTemplate(templateId) {
        // Navigate to campaigns page with template pre-selected
        window.router?.navigate(`/campaigns?template=${templateId}`);
    }
    
    previewTemplate() {
        const form = document.querySelector('.template-form');
        const subject = form.subject.value;
        const content = form.content.value;
        
        if (!subject || !content) {
            window.Toast?.warning('Please enter subject and content to preview');
            return;
        }
        
        // Replace variables with sample data
        const sampleData = {
            '{{customer_name}}': 'John Doe',
            '{{survey_link}}': 'https://survey.example.com/abc123',
            '{{company_name}}': 'Your Company'
        };
        
        let previewSubject = subject;
        let previewContent = content;
        
        Object.entries(sampleData).forEach(([variable, value]) => {
            previewSubject = previewSubject.replace(new RegExp(variable, 'g'), value);
            previewContent = previewContent.replace(new RegExp(variable, 'g'), value);
        });
        
        // Show preview in modal
        const previewHtml = `
            <div class="email-preview">
                <div class="email-header">
                    <strong>Subject:</strong> ${this.escapeHtml(previewSubject)}
                </div>
                <div class="email-body">
                    ${this.formatEmailContent(previewContent)}
                </div>
                <div class="email-footer">
                    <small><em>Preview with sample data</em></small>
                </div>
            </div>
        `;
        
        window.Modal?.create({
            title: 'Email Preview',
            content: previewHtml,
            size: 'large',
            showCancel: false,
            confirmText: 'Close'
        });
        window.Modal?.show('modal-1');
    }
    
    applyFormat(format) {
        const textarea = document.querySelector('.content-editor');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (!selectedText) return;
        
        let formattedText;
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
            default:
                return;
        }
        
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
    }
    
    insertVariable(variable) {
        const textarea = document.querySelector('.content-editor');
        const start = textarea.selectionStart;
        
        textarea.value = textarea.value.substring(0, start) + variable + textarea.value.substring(start);
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
    }
    
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterTemplates(query, this.getCurrentTypeFilter());
    }
    
    handleFilter(e) {
        const type = e.target.value;
        const query = this.getCurrentSearchQuery();
        this.filterTemplates(query, type);
    }
    
    filterTemplates(query = '', type = '') {
        const cards = document.querySelectorAll('.template-card');
        
        cards.forEach(card => {
            const templateId = card.dataset.templateId;
            const template = this.templates.find(t => t.id.toString() === templateId);
            
            if (!template) return;
            
            const matchesQuery = !query || 
                template.name.toLowerCase().includes(query) ||
                template.subject.toLowerCase().includes(query) ||
                (template.description && template.description.toLowerCase().includes(query));
            
            const matchesType = !type || template.type === type;
            
            if (matchesQuery && matchesType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    getCurrentSearchQuery() {
        const searchInput = document.querySelector('.search-templates');
        return searchInput ? searchInput.value.toLowerCase() : '';
    }
    
    getCurrentTypeFilter() {
        const typeFilter = document.querySelector('.filter-type');
        return typeFilter ? typeFilter.value : '';
    }
    
    getTypeIcon(type) {
        const icons = {
            survey: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>',
            reminder: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>',
            thank_you: '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>'
        };
        return icons[type] || icons.survey;
    }
    
    formatEmailContent(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add templates-specific styles
const templatesStyles = `
.templates-view {
    max-width: 1400px;
    margin: 0 auto;
}

.templates-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

.templates-list {
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.list-header h3 {
    margin: 0;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
}

.list-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.list-actions .form-control {
    width: auto;
    min-width: 200px;
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
}

.template-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.2s ease;
}

.template-card:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    border-color: #d1d5db;
}

.template-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.template-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.template-type.type-survey {
    background: #eff6ff;
    color: #1d4ed8;
}

.template-type.type-reminder {
    background: #fef3c7;
    color: #d97706;
}

.template-type.type-thank_you {
    background: #f0fdf4;
    color: #16a34a;
}

.template-actions {
    display: flex;
    gap: 0.25rem;
}

.template-card-body {
    padding: 1rem;
}

.template-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
}

.template-subject {
    margin: 0 0 0.75rem 0;
    color: #6b7280;
    font-size: 0.875rem;
    font-style: italic;
}

.template-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.template-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.template-date {
    font-size: 0.75rem;
    color: #9ca3af;
}

.template-editor {
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    margin-top: 2rem;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.editor-title {
    margin: 0;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
}

.editor-actions {
    display: flex;
    gap: 0.75rem;
}

.template-form {
    padding: 1.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.editor-toolbar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-bottom: none;
    background: #f9fafb;
    border-radius: 0.375rem 0.375rem 0 0;
}

.toolbar-separator {
    width: 1px;
    height: 1.5rem;
    background: #d1d5db;
    margin: 0 0.5rem;
}

.content-editor {
    border-radius: 0 0 0.375rem 0.375rem;
    border-top: none;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
}

.editor-help {
    margin-top: 0.5rem;
}

.editor-help p {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
}

.email-preview {
    max-width: 600px;
}

.email-header {
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-bottom: none;
    border-radius: 0.375rem 0.375rem 0 0;
}

.email-body {
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-bottom: none;
    background: white;
    line-height: 1.6;
}

.email-footer {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0 0 0.375rem 0.375rem;
    text-align: center;
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
    .templates-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
    
    .list-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .list-actions {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .list-actions .form-control {
        width: 100%;
        min-width: auto;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .editor-actions {
        flex-wrap: wrap;
    }
    
    .template-card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .template-actions {
        justify-content: center;
    }
}

/* Dark theme support */
[data-theme="dark"] .templates-list,
[data-theme="dark"] .template-editor {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .list-header,
[data-theme="dark"] .editor-header {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .template-card {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .template-card-header,
[data-theme="dark"] .template-card-footer {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .editor-toolbar {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .email-header,
[data-theme="dark"] .email-footer {
    background: #111827;
    border-color: #374151;
}
`;

// Inject styles
if (!document.getElementById('templates-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'templates-styles';
    styleSheet.textContent = templatesStyles;
    document.head.appendChild(styleSheet);
}

// Make TemplatesView available globally
window.TemplatesView = TemplatesView;

console.log('Templates view initialized');