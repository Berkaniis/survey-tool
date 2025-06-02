/**
 * Settings view - application settings and configuration
 */
class SettingsView {
    constructor(params = {}) {
        this.params = params;
        this.settings = {};
        this.isDirty = false;
    }
    
    async render() {
        const html = `
            <div class="settings-view">
                <div class="view-header">
                    <h2 data-i18n="settings.title">Settings</h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary reset-btn" ${!this.isDirty ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                            </svg>
                            <span data-i18n="settings.reset">Reset</span>
                        </button>
                        <button class="btn btn-primary save-btn" ${!this.isDirty ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V5a1 1 0 10-2 0v7.586l-1.293-1.293z"/>
                            </svg>
                            <span data-i18n="settings.save">Save Changes</span>
                        </button>
                    </div>
                </div>
                
                <div class="settings-content">
                    <div class="settings-nav">
                        <nav class="nav-tabs">
                            <button class="nav-tab active" data-tab="general">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                                </svg>
                                <span data-i18n="settings.general">General</span>
                            </button>
                            <button class="nav-tab" data-tab="email">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                <span data-i18n="settings.email">Email</span>
                            </button>
                            <button class="nav-tab" data-tab="notifications">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                                </svg>
                                <span data-i18n="settings.notifications">Notifications</span>
                            </button>
                            <button class="nav-tab" data-tab="security">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                                </svg>
                                <span data-i18n="settings.security">Security</span>
                            </button>
                            <button class="nav-tab" data-tab="advanced">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"/>
                                </svg>
                                <span data-i18n="settings.advanced">Advanced</span>
                            </button>
                        </nav>
                    </div>
                    
                    <div class="settings-panels">
                        <!-- General Settings -->
                        <div class="settings-panel active" data-panel="general">
                            <div class="panel-header">
                                <h3 data-i18n="settings.general">General Settings</h3>
                                <p data-i18n="settings.generalDesc">Configure basic application settings</p>
                            </div>
                            
                            <div class="settings-form">
                                <div class="form-group">
                                    <label for="company-name" data-i18n="settings.companyName">Company Name</label>
                                    <input type="text" 
                                           id="company-name" 
                                           name="company_name"
                                           class="form-control" 
                                           placeholder="Enter your company name">
                                    <small class="form-help" data-i18n="settings.companyNameHelp">
                                        This will appear in email templates and surveys
                                    </small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="default-language" data-i18n="settings.defaultLanguage">Default Language</label>
                                    <select id="default-language" name="default_language" class="form-control">
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="timezone" data-i18n="settings.timezone">Timezone</label>
                                    <select id="timezone" name="timezone" class="form-control">
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                        <option value="Europe/London">London</option>
                                        <option value="Europe/Paris">Paris</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="date-format" data-i18n="settings.dateFormat">Date Format</label>
                                    <select id="date-format" name="date_format" class="form-control">
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="auto-save" 
                                               name="auto_save"
                                               class="form-check-input">
                                        <label for="auto-save" class="form-check-label" data-i18n="settings.autoSave">
                                            Enable auto-save
                                        </label>
                                    </div>
                                    <small class="form-help" data-i18n="settings.autoSaveHelp">
                                        Automatically save changes as you work
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Email Settings -->
                        <div class="settings-panel" data-panel="email">
                            <div class="panel-header">
                                <h3 data-i18n="settings.emailSettings">Email Settings</h3>
                                <p data-i18n="settings.emailDesc">Configure email delivery and templates</p>
                            </div>
                            
                            <div class="settings-form">
                                <div class="form-group">
                                    <label for="from-name" data-i18n="settings.fromName">From Name</label>
                                    <input type="text" 
                                           id="from-name" 
                                           name="email_from_name"
                                           class="form-control" 
                                           placeholder="Your Company">
                                </div>
                                
                                <div class="form-group">
                                    <label for="from-email" data-i18n="settings.fromEmail">From Email</label>
                                    <input type="email" 
                                           id="from-email" 
                                           name="email_from_address"
                                           class="form-control" 
                                           placeholder="noreply@yourcompany.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="reply-to" data-i18n="settings.replyTo">Reply-To Email</label>
                                    <input type="email" 
                                           id="reply-to" 
                                           name="email_reply_to"
                                           class="form-control" 
                                           placeholder="support@yourcompany.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="email-provider" data-i18n="settings.emailProvider">Email Provider</label>
                                    <select id="email-provider" name="email_provider" class="form-control">
                                        <option value="outlook">Microsoft Outlook</option>
                                        <option value="smtp">Custom SMTP</option>
                                    </select>
                                </div>
                                
                                <div id="outlook-settings" class="provider-settings">
                                    <div class="form-group">
                                        <label for="outlook-tenant" data-i18n="settings.tenantId">Tenant ID</label>
                                        <input type="text" 
                                               id="outlook-tenant" 
                                               name="outlook_tenant_id"
                                               class="form-control" 
                                               placeholder="Your Azure AD tenant ID">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="outlook-client" data-i18n="settings.clientId">Client ID</label>
                                        <input type="text" 
                                               id="outlook-client" 
                                               name="outlook_client_id"
                                               class="form-control" 
                                               placeholder="Your application client ID">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="outlook-secret" data-i18n="settings.clientSecret">Client Secret</label>
                                        <input type="password" 
                                               id="outlook-secret" 
                                               name="outlook_client_secret"
                                               class="form-control" 
                                               placeholder="Your application client secret">
                                    </div>
                                </div>
                                
                                <div id="smtp-settings" class="provider-settings hidden">
                                    <div class="form-group">
                                        <label for="smtp-host" data-i18n="settings.smtpHost">SMTP Host</label>
                                        <input type="text" 
                                               id="smtp-host" 
                                               name="smtp_host"
                                               class="form-control" 
                                               placeholder="smtp.gmail.com">
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="smtp-port" data-i18n="settings.smtpPort">SMTP Port</label>
                                            <input type="number" 
                                                   id="smtp-port" 
                                                   name="smtp_port"
                                                   class="form-control" 
                                                   placeholder="587">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="smtp-security" data-i18n="settings.security">Security</label>
                                            <select id="smtp-security" name="smtp_security" class="form-control">
                                                <option value="tls">TLS</option>
                                                <option value="ssl">SSL</option>
                                                <option value="none">None</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="smtp-username" data-i18n="settings.username">Username</label>
                                        <input type="text" 
                                               id="smtp-username" 
                                               name="smtp_username"
                                               class="form-control" 
                                               placeholder="Your email address">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="smtp-password" data-i18n="settings.password">Password</label>
                                        <input type="password" 
                                               id="smtp-password" 
                                               name="smtp_password"
                                               class="form-control" 
                                               placeholder="Your email password">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <button type="button" class="btn btn-secondary test-email-btn">
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                        </svg>
                                        <span data-i18n="settings.testEmail">Send Test Email</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notifications Settings -->
                        <div class="settings-panel" data-panel="notifications">
                            <div class="panel-header">
                                <h3 data-i18n="settings.notificationSettings">Notification Settings</h3>
                                <p data-i18n="settings.notificationDesc">Configure when and how you receive notifications</p>
                            </div>
                            
                            <div class="settings-form">
                                <div class="form-section">
                                    <h4 data-i18n="settings.emailNotifications">Email Notifications</h4>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="notify-campaign-complete" 
                                               name="notify_campaign_complete"
                                               class="form-check-input">
                                        <label for="notify-campaign-complete" class="form-check-label" data-i18n="settings.campaignComplete">
                                            Campaign completion
                                        </label>
                                    </div>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="notify-response-received" 
                                               name="notify_response_received"
                                               class="form-check-input">
                                        <label for="notify-response-received" class="form-check-label" data-i18n="settings.responseReceived">
                                            New survey responses
                                        </label>
                                    </div>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="notify-email-bounced" 
                                               name="notify_email_bounced"
                                               class="form-check-input">
                                        <label for="notify-email-bounced" class="form-check-label" data-i18n="settings.emailBounced">
                                            Email delivery failures
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 data-i18n="settings.dailyDigest">Daily Digest</h4>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="daily-digest-enabled" 
                                               name="daily_digest_enabled"
                                               class="form-check-input">
                                        <label for="daily-digest-enabled" class="form-check-label" data-i18n="settings.enableDailyDigest">
                                            Enable daily summary email
                                        </label>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="digest-time" data-i18n="settings.digestTime">Send time</label>
                                        <input type="time" 
                                               id="digest-time" 
                                               name="daily_digest_time"
                                               class="form-control" 
                                               value="09:00">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Security Settings -->
                        <div class="settings-panel" data-panel="security">
                            <div class="panel-header">
                                <h3 data-i18n="settings.securitySettings">Security Settings</h3>
                                <p data-i18n="settings.securityDesc">Manage security and access controls</p>
                            </div>
                            
                            <div class="settings-form">
                                <div class="form-section">
                                    <h4 data-i18n="settings.passwordSecurity">Password Security</h4>
                                    
                                    <div class="form-group">
                                        <button type="button" class="btn btn-secondary change-password-btn">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                                            </svg>
                                            <span data-i18n="settings.changePassword">Change Password</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 data-i18n="settings.sessionSecurity">Session Security</h4>
                                    
                                    <div class="form-group">
                                        <label for="session-timeout" data-i18n="settings.sessionTimeout">Session timeout (minutes)</label>
                                        <select id="session-timeout" name="session_timeout" class="form-control">
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                            <option value="240">4 hours</option>
                                            <option value="480">8 hours</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="logout-on-close" 
                                               name="logout_on_close"
                                               class="form-check-input">
                                        <label for="logout-on-close" class="form-check-label" data-i18n="settings.logoutOnClose">
                                            Log out when browser closes
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 data-i18n="settings.dataRetention">Data Retention</h4>
                                    
                                    <div class="form-group">
                                        <label for="log-retention" data-i18n="settings.logRetention">Keep logs for (days)</label>
                                        <select id="log-retention" name="log_retention_days" class="form-control">
                                            <option value="7">7 days</option>
                                            <option value="30">30 days</option>
                                            <option value="90">90 days</option>
                                            <option value="365">1 year</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="survey-retention" data-i18n="settings.surveyRetention">Keep survey responses for (days)</label>
                                        <select id="survey-retention" name="survey_retention_days" class="form-control">
                                            <option value="365">1 year</option>
                                            <option value="1095">3 years</option>
                                            <option value="1825">5 years</option>
                                            <option value="-1">Forever</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Advanced Settings -->
                        <div class="settings-panel" data-panel="advanced">
                            <div class="panel-header">
                                <h3 data-i18n="settings.advancedSettings">Advanced Settings</h3>
                                <p data-i18n="settings.advancedDesc">Advanced configuration options</p>
                            </div>
                            
                            <div class="settings-form">
                                <div class="form-section">
                                    <h4 data-i18n="settings.performance">Performance</h4>
                                    
                                    <div class="form-group">
                                        <label for="batch-size" data-i18n="settings.batchSize">Email batch size</label>
                                        <select id="batch-size" name="email_batch_size" class="form-control">
                                            <option value="10">10 emails</option>
                                            <option value="25">25 emails</option>
                                            <option value="50">50 emails</option>
                                            <option value="100">100 emails</option>
                                        </select>
                                        <small class="form-help" data-i18n="settings.batchSizeHelp">
                                            Number of emails to send at once
                                        </small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="rate-limit" data-i18n="settings.rateLimit">Rate limit (emails per minute)</label>
                                        <select id="rate-limit" name="email_rate_limit" class="form-control">
                                            <option value="10">10</option>
                                            <option value="30">30</option>
                                            <option value="60">60</option>
                                            <option value="120">120</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 data-i18n="settings.debugging">Debugging</h4>
                                    
                                    <div class="form-check">
                                        <input type="checkbox" 
                                               id="debug-mode" 
                                               name="debug_mode"
                                               class="form-check-input">
                                        <label for="debug-mode" class="form-check-label" data-i18n="settings.debugMode">
                                            Enable debug mode
                                        </label>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="log-level" data-i18n="settings.logLevel">Log level</label>
                                        <select id="log-level" name="log_level" class="form-control">
                                            <option value="ERROR">Error</option>
                                            <option value="WARNING">Warning</option>
                                            <option value="INFO">Info</option>
                                            <option value="DEBUG">Debug</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-section danger-zone">
                                    <h4 data-i18n="settings.dangerZone">Danger Zone</h4>
                                    
                                    <div class="form-group">
                                        <button type="button" class="btn btn-danger export-data-btn">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                                            </svg>
                                            <span data-i18n="settings.exportData">Export All Data</span>
                                        </button>
                                        <small class="form-help" data-i18n="settings.exportDataHelp">
                                            Download all your data as a backup
                                        </small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <button type="button" class="btn btn-danger reset-all-btn">
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                                            </svg>
                                            <span data-i18n="settings.resetAll">Reset All Settings</span>
                                        </button>
                                        <small class="form-help" data-i18n="settings.resetAllHelp">
                                            Reset all settings to default values
                                        </small>
                                    </div>
                                </div>
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
        
        // Load settings and initialize
        await this.loadSettings();
        this.attachEventListeners();
    }
    
    async loadSettings() {
        try {
            const result = await window.api.getSettings();
            if (result.success) {
                this.settings = result.data;
                this.populateSettings();
            } else {
                window.Toast?.error('Failed to load settings');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            window.Toast?.error('Error loading settings');
        }
    }
    
    populateSettings() {
        // Populate form fields with current settings
        Object.entries(this.settings).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = !!value;
                } else {
                    input.value = value || '';
                }
            }
        });
        
        // Update email provider visibility
        this.updateEmailProviderSettings();
    }
    
    attachEventListeners() {
        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab')) {
                const tab = e.target.closest('.nav-tab').dataset.tab;
                this.switchTab(tab);
            }
        });
        
        // Form changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('.settings-form')) {
                this.markDirty();
            }
        });
        
        document.addEventListener('change', (e) => {
            if (e.target.closest('.settings-form')) {
                this.markDirty();
                
                // Special handling for email provider change
                if (e.target.name === 'email_provider') {
                    this.updateEmailProviderSettings();
                }
            }
        });
        
        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.save-btn')) {
                this.saveSettings();
            } else if (e.target.closest('.reset-btn')) {
                this.resetSettings();
            } else if (e.target.closest('.test-email-btn')) {
                this.testEmail();
            } else if (e.target.closest('.change-password-btn')) {
                this.changePassword();
            } else if (e.target.closest('.export-data-btn')) {
                this.exportData();
            } else if (e.target.closest('.reset-all-btn')) {
                this.resetAllSettings();
            }
        });
    }
    
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update panels
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
    }
    
    updateEmailProviderSettings() {
        const provider = document.querySelector('[name="email_provider"]').value;
        const outlookSettings = document.getElementById('outlook-settings');
        const smtpSettings = document.getElementById('smtp-settings');
        
        if (provider === 'outlook') {
            outlookSettings.classList.remove('hidden');
            smtpSettings.classList.add('hidden');
        } else {
            outlookSettings.classList.add('hidden');
            smtpSettings.classList.remove('hidden');
        }
    }
    
    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            document.querySelector('.save-btn').disabled = false;
            document.querySelector('.reset-btn').disabled = false;
        }
    }
    
    markClean() {
        this.isDirty = false;
        document.querySelector('.save-btn').disabled = true;
        document.querySelector('.reset-btn').disabled = true;
    }
    
    async saveSettings() {
        const formData = new FormData();
        
        // Collect all form inputs
        document.querySelectorAll('.settings-form input, .settings-form select').forEach(input => {
            if (input.type === 'checkbox') {
                formData.append(input.name, input.checked);
            } else {
                formData.append(input.name, input.value);
            }
        });
        
        // Convert FormData to object
        const settingsData = {};
        for (const [key, value] of formData.entries()) {
            settingsData[key] = value;
        }
        
        try {
            const result = await window.api.updateSettings(settingsData);
            if (result.success) {
                this.settings = { ...this.settings, ...settingsData };
                this.markClean();
                window.Toast?.success('Settings saved successfully');
            } else {
                window.Toast?.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            window.Toast?.error('Error saving settings');
        }
    }
    
    async resetSettings() {
        const confirmed = await window.Modal?.confirm(
            'Are you sure you want to reset your changes? Any unsaved changes will be lost.',
            'Reset Changes'
        );
        
        if (confirmed) {
            this.populateSettings();
            this.markClean();
            window.Toast?.success('Changes reset');
        }
    }
    
    async testEmail() {
        try {
            const result = await window.api.testEmailConfiguration();
            if (result.success) {
                window.Toast?.success('Test email sent successfully');
            } else {
                window.Toast?.error(result.error || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error testing email:', error);
            window.Toast?.error('Error testing email configuration');
        }
    }
    
    async changePassword() {
        const newPassword = await window.Modal?.prompt(
            'Enter your new password:',
            '',
            'Change Password'
        );
        
        if (newPassword) {
            try {
                const result = await window.api.changePassword(newPassword);
                if (result.success) {
                    window.Toast?.success('Password changed successfully');
                } else {
                    window.Toast?.error(result.error || 'Failed to change password');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                window.Toast?.error('Error changing password');
            }
        }
    }
    
    async exportData() {
        const confirmed = await window.Modal?.confirm(
            'This will download all your data including campaigns, contacts, and responses. Continue?',
            'Export All Data'
        );
        
        if (confirmed) {
            try {
                const result = await window.api.exportAllData();
                if (result.success) {
                    window.Toast?.success('Data export started. Download will begin shortly.');
                } else {
                    window.Toast?.error(result.error || 'Failed to export data');
                }
            } catch (error) {
                console.error('Error exporting data:', error);
                window.Toast?.error('Error exporting data');
            }
        }
    }
    
    async resetAllSettings() {
        const confirmed = await window.Modal?.confirm(
            'This will reset ALL settings to their default values. This action cannot be undone. Are you sure?',
            'Reset All Settings'
        );
        
        if (confirmed) {
            try {
                const result = await window.api.resetAllSettings();
                if (result.success) {
                    await this.loadSettings();
                    window.Toast?.success('All settings reset to defaults');
                } else {
                    window.Toast?.error(result.error || 'Failed to reset settings');
                }
            } catch (error) {
                console.error('Error resetting settings:', error);
                window.Toast?.error('Error resetting settings');
            }
        }
    }
}

// Add settings-specific styles
const settingsStyles = `
.settings-view {
    max-width: 1200px;
    margin: 0 auto;
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.settings-content {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.settings-nav {
    background: #f9fafb;
    border-right: 1px solid #e5e7eb;
}

.nav-tabs {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
}

.nav-tab {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    text-align: left;
    color: #6b7280;
    transition: all 0.2s ease;
    cursor: pointer;
}

.nav-tab:hover {
    background: #e5e7eb;
    color: #374151;
}

.nav-tab.active {
    background: #3b82f6;
    color: white;
    position: relative;
}

.nav-tab.active::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #1d4ed8;
}

.settings-panels {
    flex: 1;
    min-height: 600px;
}

.settings-panel {
    display: none;
    padding: 2rem;
}

.settings-panel.active {
    display: block;
}

.panel-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
}

.panel-header p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
}

.settings-form {
    max-width: 600px;
}

.form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
    border-bottom: none;
}

.form-section h4 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1rem;
    font-weight: 600;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-check {
    margin-bottom: 0.75rem;
}

.form-check-label {
    margin-left: 0.5rem;
    font-weight: 500;
}

.form-help {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
}

.provider-settings {
    margin-top: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
}

.provider-settings.hidden {
    display: none;
}

.danger-zone {
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    background: #fef2f2;
    padding: 1.5rem;
}

.danger-zone h4 {
    color: #dc2626;
}

.danger-zone .btn {
    margin-right: 0.75rem;
    margin-bottom: 0.75rem;
}

@media (max-width: 768px) {
    .settings-content {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .settings-nav {
        border-right: none;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .nav-tabs {
        flex-direction: row;
        overflow-x: auto;
        padding: 0.5rem;
    }
    
    .nav-tab {
        flex-shrink: 0;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
    
    .nav-tab.active::after {
        display: none;
    }
    
    .settings-panel {
        padding: 1rem;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .header-actions {
        flex-direction: column;
    }
}

/* Dark theme support */
[data-theme="dark"] .settings-content {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .settings-nav {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .nav-tab {
    color: #9ca3af;
}

[data-theme="dark"] .nav-tab:hover {
    background: #374151;
    color: #f9fafb;
}

[data-theme="dark"] .panel-header {
    border-color: #374151;
}

[data-theme="dark"] .panel-header h3 {
    color: #f9fafb;
}

[data-theme="dark"] .form-section h4 {
    color: #f9fafb;
}

[data-theme="dark"] .provider-settings {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .danger-zone {
    background: #7f1d1d;
    border-color: #dc2626;
}
`;

// Inject styles
if (!document.getElementById('settings-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'settings-styles';
    styleSheet.textContent = settingsStyles;
    document.head.appendChild(styleSheet);
}

// Make SettingsView available globally
window.SettingsView = SettingsView;

console.log('Settings view initialized');