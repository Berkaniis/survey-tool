/**
 * FileUpload component for handling file uploads with drag and drop
 */
class FileUpload {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            multiple: false,
            accept: '*/*',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
            dragAndDrop: true,
            preview: true,
            uploadUrl: null,
            autoUpload: false,
            removable: true,
            progress: true,
            className: '',
            placeholder: 'Click to select files or drag and drop',
            supportedFormats: null, // ['jpg', 'png', 'pdf'] etc.
            onFileAdd: null,
            onFileRemove: null,
            onUploadStart: null,
            onUploadProgress: null,
            onUploadComplete: null,
            onUploadError: null,
            ...options
        };
        
        this.files = [];
        this.uploading = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('FileUpload: Container not found');
            return;
        }
        
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        const {
            multiple,
            accept,
            placeholder,
            className,
            supportedFormats
        } = this.options;
        
        let html = `
            <div class="file-upload ${className}">
                <div class="file-upload-area">
                    <input type="file" 
                           class="file-input" 
                           ${multiple ? 'multiple' : ''}
                           accept="${accept}"
                           style="display: none;">
                    
                    <div class="file-upload-content">
                        <svg class="upload-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
                        </svg>
                        <p class="upload-text">${placeholder}</p>
                        ${supportedFormats ? `
                            <p class="upload-formats">
                                Supported formats: ${supportedFormats.join(', ')}
                            </p>
                        ` : ''}
                        <p class="upload-size">
                            Max file size: ${this.formatFileSize(this.options.maxFileSize)}
                        </p>
                    </div>
                    
                    <div class="file-upload-overlay">
                        <div class="overlay-content">
                            <svg class="overlay-icon" width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
                            </svg>
                            <p>Drop files here</p>
                        </div>
                    </div>
                </div>
                
                <div class="file-list"></div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.renderFileList();
    }
    
    renderFileList() {
        const fileList = this.container.querySelector('.file-list');
        
        if (this.files.length === 0) {
            fileList.innerHTML = '';
            return;
        }
        
        let html = '<div class="file-items">';
        
        this.files.forEach((file, index) => {
            html += this.renderFileItem(file, index);
        });
        
        html += '</div>';
        
        if (this.options.uploadUrl && !this.options.autoUpload) {
            html += `
                <div class="file-upload-actions">
                    <button class="btn btn-primary upload-all-btn" ${this.uploading ? 'disabled' : ''}>
                        Upload All
                    </button>
                    <button class="btn btn-secondary clear-all-btn">
                        Clear All
                    </button>
                </div>
            `;
        }
        
        fileList.innerHTML = html;
    }
    
    renderFileItem(file, index) {
        const { preview, removable, progress } = this.options;
        const fileUrl = file.url || (file.file ? URL.createObjectURL(file.file) : null);
        const isImage = file.type?.startsWith('image/');
        
        return `
            <div class="file-item ${file.status || 'pending'}" data-index="${index}">
                ${preview && fileUrl && isImage ? `
                    <div class="file-preview">
                        <img src="${fileUrl}" alt="${file.name}" loading="lazy">
                    </div>
                ` : `
                    <div class="file-icon">
                        ${this.getFileIcon(file.type)}
                    </div>
                `}
                
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                        ${file.status ? `<span class="file-status status-${file.status}">${this.getStatusText(file.status)}</span>` : ''}
                    </div>
                    
                    ${progress && (file.status === 'uploading' || file.progress > 0) ? `
                        <div class="file-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${file.progress || 0}%"></div>
                            </div>
                            <span class="progress-text">${file.progress || 0}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="file-actions">
                    ${this.options.uploadUrl && !this.options.autoUpload && file.status !== 'uploaded' ? `
                        <button class="btn btn-sm btn-primary upload-btn" 
                                data-index="${index}"
                                ${file.status === 'uploading' ? 'disabled' : ''}>
                            Upload
                        </button>
                    ` : ''}
                    
                    ${removable ? `
                        <button class="btn btn-sm btn-secondary remove-btn" 
                                data-index="${index}"
                                ${file.status === 'uploading' ? 'disabled' : ''}>
                            Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const uploadArea = this.container.querySelector('.file-upload-area');
        const fileInput = this.container.querySelector('.file-input');
        
        // Click to select files
        uploadArea.addEventListener('click', (e) => {
            if (e.target.closest('.file-item')) return;
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });
        
        // Drag and drop
        if (this.options.dragAndDrop) {
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        }
        
        // File list events
        this.container.addEventListener('click', this.handleFileListClick.bind(this));
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.container.querySelector('.file-upload-area').classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.container.querySelector('.file-upload-area').classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const uploadArea = this.container.querySelector('.file-upload-area');
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
    }
    
    handleFiles(files) {
        if (!files.length) return;
        
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (!this.options.multiple && validFiles.length > 1) {
            validFiles.splice(1);
        }
        
        if (!this.options.multiple) {
            this.files = [];
        }
        
        // Check max files limit
        const totalFiles = this.files.length + validFiles.length;
        if (totalFiles > this.options.maxFiles) {
            const allowed = this.options.maxFiles - this.files.length;
            validFiles.splice(allowed);
            window.Toast?.warning(`Only ${allowed} files can be added. Maximum ${this.options.maxFiles} files allowed.`);
        }
        
        validFiles.forEach(file => {
            const fileObj = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
                progress: 0
            };
            
            this.files.push(fileObj);
            
            if (this.options.onFileAdd) {
                this.options.onFileAdd(fileObj);
            }
            
            if (this.options.autoUpload && this.options.uploadUrl) {
                this.uploadFile(this.files.length - 1);
            }
        });
        
        this.renderFileList();
        
        // Clear file input
        const fileInput = this.container.querySelector('.file-input');
        fileInput.value = '';
    }
    
    handleFileListClick(e) {
        const index = e.target.dataset.index;
        
        if (e.target.classList.contains('remove-btn')) {
            this.removeFile(parseInt(index));
        } else if (e.target.classList.contains('upload-btn')) {
            this.uploadFile(parseInt(index));
        } else if (e.target.classList.contains('upload-all-btn')) {
            this.uploadAll();
        } else if (e.target.classList.contains('clear-all-btn')) {
            this.clearAll();
        }
    }
    
    validateFile(file) {
        // Check file size
        if (file.size > this.options.maxFileSize) {
            window.Toast?.error(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(this.options.maxFileSize)}`);
            return false;
        }
        
        // Check file type
        if (this.options.supportedFormats) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!this.options.supportedFormats.includes(extension)) {
                window.Toast?.error(`File "${file.name}" is not a supported format. Allowed: ${this.options.supportedFormats.join(', ')}`);
                return false;
            }
        }
        
        return true;
    }
    
    removeFile(index) {
        const file = this.files[index];
        if (!file) return;
        
        if (this.options.onFileRemove) {
            this.options.onFileRemove(file);
        }
        
        this.files.splice(index, 1);
        this.renderFileList();
    }
    
    clearAll() {
        this.files = [];
        this.renderFileList();
    }
    
    async uploadFile(index) {
        const file = this.files[index];
        if (!file || !this.options.uploadUrl) return;
        
        file.status = 'uploading';
        file.progress = 0;
        this.renderFileList();
        
        if (this.options.onUploadStart) {
            this.options.onUploadStart(file);
        }
        
        try {
            const formData = new FormData();
            formData.append('file', file.file);
            
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    file.progress = Math.round((e.loaded / e.total) * 100);
                    this.renderFileList();
                    
                    if (this.options.onUploadProgress) {
                        this.options.onUploadProgress(file, e);
                    }
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    file.status = 'uploaded';
                    file.progress = 100;
                    
                    try {
                        file.response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        file.response = xhr.responseText;
                    }
                    
                    if (this.options.onUploadComplete) {
                        this.options.onUploadComplete(file);
                    }
                } else {
                    file.status = 'error';
                    file.error = `Upload failed: ${xhr.status} ${xhr.statusText}`;
                    
                    if (this.options.onUploadError) {
                        this.options.onUploadError(file, new Error(file.error));
                    }
                }
                
                this.renderFileList();
            });
            
            xhr.addEventListener('error', () => {
                file.status = 'error';
                file.error = 'Upload failed: Network error';
                
                if (this.options.onUploadError) {
                    this.options.onUploadError(file, new Error('Network error'));
                }
                
                this.renderFileList();
            });
            
            xhr.open('POST', this.options.uploadUrl);
            xhr.send(formData);
            
        } catch (error) {
            file.status = 'error';
            file.error = error.message;
            
            if (this.options.onUploadError) {
                this.options.onUploadError(file, error);
            }
            
            this.renderFileList();
        }
    }
    
    async uploadAll() {
        this.uploading = true;
        
        const pendingFiles = this.files
            .map((file, index) => ({ file, index }))
            .filter(({ file }) => file.status === 'pending');
        
        for (const { index } of pendingFiles) {
            await this.uploadFile(index);
        }
        
        this.uploading = false;
    }
    
    // Public API
    getFiles() {
        return this.files;
    }
    
    addFiles(files) {
        this.handleFiles(files);
    }
    
    reset() {
        this.files = [];
        this.uploading = false;
        this.renderFileList();
    }
    
    // Helper methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getFileIcon(mimeType) {
        if (mimeType?.startsWith('image/')) {
            return '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>';
        } else if (mimeType?.includes('pdf')) {
            return '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>';
        } else if (mimeType?.includes('text') || mimeType?.includes('json')) {
            return '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"/></svg>';
        } else {
            return '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>';
        }
    }
    
    getStatusText(status) {
        const statusTexts = {
            pending: 'Pending',
            uploading: 'Uploading...',
            uploaded: 'Uploaded',
            error: 'Failed'
        };
        return statusTexts[status] || status;
    }
}

// Add FileUpload styles
const fileUploadStyles = `
.file-upload {
    width: 100%;
}

.file-upload-area {
    position: relative;
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fafafa;
}

.file-upload-area:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
}

.file-upload-area.drag-over {
    border-color: #3b82f6;
    background: #eff6ff;
}

.file-upload-content {
    pointer-events: none;
}

.upload-icon {
    color: #9ca3af;
    margin-bottom: 1rem;
}

.upload-text {
    font-size: 1.125rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.upload-formats,
.upload-size {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0;
}

.file-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 0.5rem;
    display: none;
    align-items: center;
    justify-content: center;
}

.file-upload-area.drag-over .file-upload-overlay {
    display: flex;
}

.overlay-content {
    text-align: center;
    color: #3b82f6;
}

.overlay-icon {
    margin-bottom: 0.5rem;
}

.file-list {
    margin-top: 1rem;
}

.file-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.file-item.uploading {
    background: #eff6ff;
    border-color: #3b82f6;
}

.file-item.uploaded {
    background: #f0fdf4;
    border-color: #10b981;
}

.file-item.error {
    background: #fef2f2;
    border-color: #ef4444;
}

.file-preview {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    border-radius: 0.25rem;
    overflow: hidden;
}

.file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-icon {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 0.25rem;
    color: #6b7280;
}

.file-info {
    flex: 1;
    min-width: 0;
}

.file-name {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.file-status.status-uploading {
    color: #3b82f6;
}

.file-status.status-uploaded {
    color: #10b981;
}

.file-status.status-error {
    color: #ef4444;
}

.file-progress {
    margin-top: 0.5rem;
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
    min-width: 3rem;
}

.file-actions {
    display: flex;
    gap: 0.5rem;
}

.file-upload-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

@media (max-width: 640px) {
    .file-upload-area {
        padding: 1.5rem 1rem;
    }
    
    .file-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .file-actions {
        width: 100%;
        justify-content: flex-end;
    }
    
    .file-upload-actions {
        flex-direction: column;
    }
}

/* Dark theme support */
[data-theme="dark"] .file-upload-area {
    background: #111827;
    border-color: #374151;
}

[data-theme="dark"] .file-upload-area:hover {
    background: #1f2937;
}

[data-theme="dark"] .file-item {
    background: #1f2937;
    border-color: #374151;
}

[data-theme="dark"] .file-item.uploading {
    background: #1e3a8a;
}

[data-theme="dark"] .file-item.uploaded {
    background: #064e3b;
}

[data-theme="dark"] .file-item.error {
    background: #7f1d1d;
}

[data-theme="dark"] .file-icon {
    background: #374151;
    color: #9ca3af;
}

[data-theme="dark"] .file-name {
    color: #f9fafb;
}

[data-theme="dark"] .upload-text {
    color: #f9fafb;
}
`;

// Inject styles
if (!document.getElementById('fileupload-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'fileupload-styles';
    styleSheet.textContent = fileUploadStyles;
    document.head.appendChild(styleSheet);
}

// Make FileUpload available globally
window.FileUpload = FileUpload;

console.log('FileUpload component initialized');