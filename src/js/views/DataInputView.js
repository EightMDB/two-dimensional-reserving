/**
 * Data Input View
 * Manages the data input UI and file upload interface
 */

import { appState } from '../state/AppState.js';

export class DataInputView {
    constructor(controllers) {
        this.dataController = controllers.data;
        this.initialized = false;
        this.elements = {};
    }

    /**
     * Initialize the data input view
     */
    async init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupStateSubscriptions();

        console.log('📥 DataInputView initialized');
        this.initialized = true;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            uploadArea: document.getElementById('upload-area'),
            browseBtn: document.getElementById('browse-file-btn'),
            fileInput: document.getElementById('csv-file-input'),
            dataFilters: document.getElementById('data-filters'),
            dataSummary: document.getElementById('data-summary'),
            dataPreview: document.getElementById('data-preview'),
            totalClaims: document.getElementById('total-claims'),
            totalAmount: document.getElementById('total-amount'),
            filteredClaims: document.getElementById('filtered-claims'),
            filteredAmount: document.getElementById('filtered-amount'),
            claimsTable: document.getElementById('claims-table'),
            claimsTableHead: document.getElementById('claims-table-head'),
            claimsTableBody: document.getElementById('claims-table-body'),
            applyFiltersBtn: document.getElementById('apply-filters-btn'),
            clearFiltersBtn: document.getElementById('clear-filters-btn')
        };

        console.log('DataInputView elements cached:', {
            browseBtn: !!this.elements.browseBtn,
            fileInput: !!this.elements.fileInput,
            uploadArea: !!this.elements.uploadArea
        });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // File upload events - robust implementation
        if (this.elements.browseBtn && this.elements.fileInput) {
            this.elements.browseBtn.addEventListener('click', (e) => {
                console.log('Browse button clicked');
                console.log('File input element:', this.elements.fileInput);
                console.log('File input visibility:', {
                    display: window.getComputedStyle(this.elements.fileInput).display,
                    visibility: window.getComputedStyle(this.elements.fileInput).visibility,
                    opacity: window.getComputedStyle(this.elements.fileInput).opacity,
                    offsetParent: this.elements.fileInput.offsetParent
                });

                // Prevent any default button behavior
                e.preventDefault();
                e.stopPropagation();

                // Ensure file input is accessible
                const originalStyle = this.elements.fileInput.style.cssText;

                try {
                    // Temporarily make the file input accessible for click
                    this.elements.fileInput.style.cssText = 'position: absolute; left: -1px; top: -1px; width: 1px; height: 1px; opacity: 0.01;';

                    // Small delay to ensure style is applied
                    setTimeout(() => {
                        try {
                            this.elements.fileInput.click();
                            console.log('File input click triggered successfully');

                            // Restore original style after a short delay
                            setTimeout(() => {
                                this.elements.fileInput.style.cssText = originalStyle;
                            }, 100);
                        } catch (clickError) {
                            console.error('Error clicking file input:', clickError);
                            this.elements.fileInput.style.cssText = originalStyle;

                            // Fallback: try direct trigger
                            try {
                                this.elements.fileInput.dispatchEvent(new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                }));
                                console.log('Fallback click event dispatched');
                            } catch (fallbackError) {
                                console.error('Fallback click also failed:', fallbackError);
                                this.showMessage('Unable to open file dialog. Please try clicking the upload area directly.', 'warning');
                            }
                        }
                    }, 10);

                } catch (styleError) {
                    console.error('Error modifying file input style:', styleError);

                    // Last resort: direct click
                    try {
                        this.elements.fileInput.click();
                    } catch (directClickError) {
                        console.error('Direct click failed:', directClickError);
                        this.showMessage('Unable to open file dialog. Please drag and drop a file instead.', 'error');
                    }
                }
            });
        } else {
            console.error('Browse button or file input not found!', {
                browseBtn: !!this.elements.browseBtn,
                fileInput: !!this.elements.fileInput
            });
        }

        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                console.log('File input change event triggered');
                this.handleFileSelect(e.target.files[0]);
            });
        }

        if (this.elements.uploadArea) {
            // Drag and drop
            this.elements.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.add('drag-over');
            });

            this.elements.uploadArea.addEventListener('dragleave', () => {
                this.elements.uploadArea.classList.remove('drag-over');
            });

            this.elements.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileSelect(file);
                }
            });

            // Click to browse
            this.elements.uploadArea.addEventListener('click', (e) => {
                // Only trigger file dialog if clicking the upload area itself, not child elements
                if (e.target === this.elements.uploadArea || this.elements.uploadArea.contains(e.target)) {
                    console.log('Upload area clicked, triggering file dialog');
                    // Reuse the robust file input click logic
                    this.elements.browseBtn?.click();
                }
            });
        }

        // Filter events
        if (this.elements.applyFiltersBtn) {
            this.elements.applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    /**
     * Set up state subscriptions
     */
    setupStateSubscriptions() {
        // Subscribe to data changes
        appState.subscribe('claimsData', () => {
            this.updateDataDisplay();
        });

        appState.subscribe('filteredClaimsData', () => {
            this.updateFilteredDisplay();
        });
    }

    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    async handleFileSelect(file) {
        if (!file) return;

        try {
            console.log('📁 File selected:', file.name);

            // Upload and process file
            const result = await this.dataController.handleFileUpload(file);

            if (result.success) {
                // Show wizard for column mapping
                this.showUploadWizard(result.data, result.mapping, file.name);
            }

        } catch (error) {
            console.error('File upload error:', error);
            this.showMessage(`Upload failed: ${error.message}`, 'error');
        }
    }

    /**
     * Show upload wizard for column mapping
     * @param {Object} csvData - Parsed CSV data
     * @param {Object} suggestedMapping - Suggested column mapping
     * @param {string} fileName - Original file name
     */
    showUploadWizard(csvData, suggestedMapping, fileName) {
        const wizard = document.getElementById('upload-wizard');
        const wizardContent = document.getElementById('wizard-content');

        if (!wizard || !wizardContent) {
            console.error('Upload wizard elements not found');
            // Fallback: process data directly
            this.processDataDirectly(suggestedMapping, csvData);
            return;
        }

        // Store data for later use
        this.currentCsvData = csvData;
        this.currentMapping = { ...suggestedMapping };
        this.currentWizardStep = 1;

        // Required fields for the application
        const requiredFields = {
            incurredDate: 'Incurred Date',
            paidDate: 'Paid Date',
            paidAmount: 'Paid Amount',
            delimiter: 'Line of Business/Category'
        };

        // Create wizard content with tabbed interface
        wizardContent.innerHTML = `
            <div class="wizard-container">
                <!-- Wizard Tab Navigation -->
                <div class="wizard-tab-navigation">
                    <button class="wizard-tab-button active" data-wizard-tab="1">
                        <span class="wizard-tab-number">1</span>
                        <span class="wizard-tab-label">File Preview</span>
                    </button>
                    <button class="wizard-tab-button" data-wizard-tab="2">
                        <span class="wizard-tab-number">2</span>
                        <span class="wizard-tab-label">Column Mapping</span>
                    </button>
                    <button class="wizard-tab-button" data-wizard-tab="3">
                        <span class="wizard-tab-number">3</span>
                        <span class="wizard-tab-label">Additional Columns</span>
                    </button>
                    <button class="wizard-tab-button" data-wizard-tab="4">
                        <span class="wizard-tab-number">4</span>
                        <span class="wizard-tab-label">Confirm</span>
                    </button>
                </div>

                <!-- Wizard Tab Panels -->
                <div class="wizard-tab-panels">
                    <!-- Step 1: File Preview -->
                    <div class="wizard-tab-panel active" data-wizard-panel="1">
                        <h4>📊 File Preview</h4>
                        <div class="file-info">
                            <div class="info-item">
                                <strong>File:</strong> <span>${fileName}</span>
                            </div>
                            <div class="info-item">
                                <strong>Total Rows:</strong> <span>${csvData.validRows} valid rows</span>
                            </div>
                            <div class="info-item">
                                <strong>Available Columns:</strong> <span>${csvData.headers.join(', ')}</span>
                            </div>
                        </div>

                        <h5>📋 Data Preview (first 5 rows):</h5>
                        <div class="preview-table-container">
                            <table class="data-table wizard-preview-table">
                                <thead>
                                    <tr>${csvData.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                                </thead>
                                <tbody>
                                    ${csvData.rows.slice(0, 5).map(row =>
                                        `<tr>${csvData.headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
                                    ).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Step 2: Column Mapping -->
                    <div class="wizard-tab-panel" data-wizard-panel="2">
                        <h4>🎯 Column Mapping Configuration</h4>
                        <p class="wizard-description">
                            Map your CSV columns to the required fields for analysis.
                        </p>

                        <div class="mapping-config">
                            ${Object.entries(requiredFields).map(([field, label]) => `
                                <div class="mapping-row">
                                    <label for="mapping-${field}" class="mapping-label">
                                        ${label}:<span class="required-indicator">*</span>
                                    </label>
                                    <select id="mapping-${field}" class="mapping-select form-select">
                                        <option value="">-- Select Column --</option>
                                        ${csvData.headers.map(header =>
                                            `<option value="${header}" ${suggestedMapping[field] === header ? 'selected' : ''}>${header}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            `).join('')}
                        </div>

                        <div class="mapping-validation" id="mapping-validation"></div>
                    </div>

                    <!-- Step 3: Additional Columns -->
                    <div class="wizard-tab-panel" data-wizard-panel="3">
                        <h4>📎 Additional Columns</h4>
                        <p class="wizard-description">
                            Select additional columns to include in the upload (beyond the required fields).
                        </p>

                        <div class="column-checkboxes">
                            ${csvData.headers.map(header => {
                                const isRequired = Object.values(suggestedMapping).includes(header);
                                return `
                                    <label class="checkbox-label ${isRequired ? 'disabled' : ''}">
                                        <input type="checkbox"
                                               id="include-${header}"
                                               value="${header}"
                                               ${isRequired ? 'checked disabled' : 'checked'}>
                                        <span class="checkbox-text">${header} ${isRequired ? '(required)' : ''}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Step 4: Confirm -->
                    <div class="wizard-tab-panel" data-wizard-panel="4">
                        <h4>✅ Confirm Import</h4>
                        <p class="wizard-description">
                            Review your configuration and confirm to import the data.
                        </p>

                        <div class="confirmation-summary">
                            <h5>Summary</h5>
                            <div class="summary-item">
                                <strong>File:</strong> <span>${fileName}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Total Rows:</strong> <span>${csvData.validRows}</span>
                            </div>
                            <div class="summary-item" id="summary-columns">
                                <strong>Columns to Import:</strong> <span id="columns-count">0</span>
                            </div>
                            <div class="summary-item">
                                <strong>Column Mapping:</strong>
                                <ul id="mapping-summary" class="mapping-summary-list"></ul>
                            </div>
                        </div>

                        <div class="confirmation-validation" id="confirmation-validation"></div>
                    </div>
                </div>

                <!-- Wizard Navigation Buttons -->
                <div class="wizard-navigation">
                    <button id="wizard-cancel" class="button button-secondary">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <div class="wizard-nav-right">
                        <button id="wizard-prev" class="button button-secondary" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button id="wizard-next" class="button button-primary">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button id="wizard-confirm" class="button button-primary" style="display: none;">
                            <i class="fas fa-check"></i> Import Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Show wizard
        wizard.style.display = 'flex';

        // Set up wizard navigation
        this.setupWizardNavigation(csvData, requiredFields);

        // Add event listeners for mapping changes
        Object.keys(requiredFields).forEach(field => {
            const select = document.getElementById(`mapping-${field}`);
            if (select) {
                select.addEventListener('change', () => {
                    this.currentMapping[field] = select.value;
                    this.validateMapping();
                    this.updateConfirmationSummary(csvData, requiredFields);
                });
            }
        });

        // Add event listeners for additional columns
        csvData.headers.forEach(header => {
            const checkbox = document.getElementById(`include-${header}`);
            if (checkbox && !checkbox.disabled) {
                checkbox.addEventListener('change', () => {
                    this.updateConfirmationSummary(csvData, requiredFields);
                });
            }
        });

        // Close button
        const closeBtn = document.getElementById('wizard-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                wizard.style.display = 'none';
            });
        }

        // Initial validation
        this.validateMapping();
        this.updateConfirmationSummary(csvData, requiredFields);
    }

    /**
     * Set up wizard navigation
     * @param {Object} csvData - CSV data
     * @param {Object} requiredFields - Required field definitions
     */
    setupWizardNavigation(csvData, requiredFields) {
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const cancelBtn = document.getElementById('wizard-cancel');
        const confirmBtn = document.getElementById('wizard-confirm');

        // Tab button navigation
        document.querySelectorAll('.wizard-tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const targetStep = parseInt(button.getAttribute('data-wizard-tab'));
                this.goToWizardStep(targetStep);
            });
        });

        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goToWizardStep(this.currentWizardStep - 1);
            });
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Validate current step before proceeding
                if (this.currentWizardStep === 2) {
                    if (!this.validateMapping()) {
                        return;
                    }
                }
                this.goToWizardStep(this.currentWizardStep + 1);
            });
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('upload-wizard').style.display = 'none';
            });
        }

        // Confirm button
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                if (this.validateMapping()) {
                    document.getElementById('upload-wizard').style.display = 'none';

                    // Get selected additional columns
                    const additionalColumns = [];
                    csvData.headers.forEach(header => {
                        const checkbox = document.getElementById(`include-${header}`);
                        if (checkbox && checkbox.checked && !Object.values(this.currentMapping).includes(header)) {
                            additionalColumns.push(header);
                        }
                    });

                    await this.processDataDirectly(this.currentMapping, csvData, additionalColumns);
                }
            });
        }
    }

    /**
     * Navigate to a specific wizard step
     * @param {number} step - Step number (1-4)
     */
    goToWizardStep(step) {
        if (step < 1 || step > 4) return;

        this.currentWizardStep = step;

        // Update tab buttons
        document.querySelectorAll('.wizard-tab-button').forEach(button => {
            const buttonStep = parseInt(button.getAttribute('data-wizard-tab'));
            button.classList.toggle('active', buttonStep === step);
            button.classList.toggle('completed', buttonStep < step);
        });

        // Update tab panels
        document.querySelectorAll('.wizard-tab-panel').forEach(panel => {
            const panelStep = parseInt(panel.getAttribute('data-wizard-panel'));
            panel.classList.toggle('active', panelStep === step);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const confirmBtn = document.getElementById('wizard-confirm');

        if (prevBtn) {
            prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = step < 4 ? 'inline-flex' : 'none';
        }

        if (confirmBtn) {
            confirmBtn.style.display = step === 4 ? 'inline-flex' : 'none';
        }

        // Scroll to top of wizard
        const wizardContent = document.getElementById('wizard-content');
        if (wizardContent) {
            wizardContent.scrollTop = 0;
        }
    }

    /**
     * Update confirmation summary
     * @param {Object} csvData - CSV data
     * @param {Object} requiredFields - Required field definitions
     */
    updateConfirmationSummary(csvData, requiredFields) {
        // Count selected columns
        const selectedColumns = csvData.headers.filter(header => {
            const isRequired = Object.values(this.currentMapping).includes(header);
            const checkbox = document.getElementById(`include-${header}`);
            return isRequired || (checkbox && checkbox.checked);
        });

        const columnsCount = document.getElementById('columns-count');
        if (columnsCount) {
            columnsCount.textContent = selectedColumns.length;
        }

        // Update mapping summary
        const mappingSummary = document.getElementById('mapping-summary');
        if (mappingSummary) {
            mappingSummary.innerHTML = Object.entries(requiredFields)
                .map(([field, label]) => {
                    const mappedColumn = this.currentMapping[field];
                    return `<li><strong>${label}:</strong> ${mappedColumn || '<span style="color: #e74c3c;">Not mapped</span>'}</li>`;
                })
                .join('');
        }

        // Update validation status in confirmation
        const confirmValidation = document.getElementById('confirmation-validation');
        if (confirmValidation) {
            if (this.validateMapping(true)) {
                confirmValidation.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 0.25rem; border: 1px solid #c3e6cb; margin-top: 1rem;">
                        <strong>✅ Configuration is valid and ready for import</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9em;">
                            Click "Import Data" to proceed with importing ${csvData.validRows} rows.
                        </p>
                    </div>
                `;
            } else {
                confirmValidation.innerHTML = `
                    <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 0.25rem; border: 1px solid #f5c6cb; margin-top: 1rem;">
                        <strong>⚠️ Configuration has errors</strong>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9em;">
                            Please go back to the Column Mapping step to fix the errors.
                        </p>
                    </div>
                `;
            }
        }
    }

    /**
     * Validate current column mapping
     * @param {boolean} silent - If true, don't update UI validation messages
     * @returns {boolean} True if mapping is valid
     */
    validateMapping(silent = false) {
        const validationDiv = document.getElementById('mapping-validation');
        const confirmBtn = document.getElementById('wizard-confirm');
        const nextBtn = document.getElementById('wizard-next');

        const requiredFields = ['incurredDate', 'paidDate', 'paidAmount', 'delimiter'];
        const errors = [];
        const warnings = [];

        // Check for missing required fields
        requiredFields.forEach(field => {
            if (!this.currentMapping[field]) {
                errors.push(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
            }
        });

        // Check for duplicate mappings
        const mappedColumns = Object.values(this.currentMapping).filter(v => v);
        const duplicates = mappedColumns.filter((column, index) => mappedColumns.indexOf(column) !== index);
        if (duplicates.length > 0) {
            errors.push(`Duplicate column mappings: ${duplicates.join(', ')}`);
        }

        const isValid = errors.length === 0;

        // Update UI if not silent
        if (!silent && validationDiv) {
            // Display validation results
            if (errors.length > 0) {
                validationDiv.innerHTML = `
                    <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 0.25rem; border: 1px solid #f5c6cb;">
                        <strong>⚠️ Validation Errors:</strong>
                        <ul style="margin: 0.5rem 0 0 1rem;">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else if (warnings.length > 0) {
                validationDiv.innerHTML = `
                    <div style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: 0.25rem; border: 1px solid #ffeaa7;">
                        <strong>💡 Warnings:</strong>
                        <ul style="margin: 0.5rem 0 0 1rem;">
                            ${warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else {
                validationDiv.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 0.25rem; border: 1px solid #c3e6cb;">
                        <strong>✅ Mapping is valid and ready for import</strong>
                    </div>
                `;
            }
        }

        // Update button states
        if (confirmBtn) {
            confirmBtn.disabled = !isValid;
            confirmBtn.style.opacity = isValid ? '1' : '0.6';
        }

        if (nextBtn && this.currentWizardStep === 2) {
            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.6';
        }

        return isValid;
    }

    /**
     * Process data with confirmed mapping
     * @param {Object} mapping - Column mapping
     * @param {Object} csvData - CSV data
     * @param {Array} additionalColumns - Additional columns to include
     */
    async processDataDirectly(mapping, csvData, additionalColumns = []) {
        try {
            console.log('Processing data with mapping:', mapping);
            console.log('Additional columns:', additionalColumns);
            console.log('CSV data rows:', csvData.rows.length);

            // Create enhanced data structure that includes all columns
            const allIncludedColumns = [...Object.values(mapping), ...additionalColumns];
            console.log('All included columns:', allIncludedColumns);

            // Transform CSV data to include all selected columns
            const enhancedCsvData = {
                ...csvData,
                headers: allIncludedColumns,
                rows: csvData.rows.map(row => {
                    const enhancedRow = {};
                    allIncludedColumns.forEach(column => {
                        enhancedRow[column] = row[column] || '';
                    });
                    return enhancedRow;
                })
            };

            // Store the enhanced data in app state for later use
            appState.update({
                csvData: enhancedCsvData,
                csvHeaders: allIncludedColumns,
                columnMapping: mapping,
                additionalColumns: additionalColumns,
                originalCsvData: csvData // Keep original for reference
            });

            // Process the claims data with the mapping
            await this.dataController.processClaimsData(mapping);

            // Show success message
            this.showMessage(`File uploaded successfully! Imported ${csvData.rows.length} rows with ${allIncludedColumns.length} columns.`, 'success');

            // Show data sections
            this.showDataSections();

            console.log('✅ Data processing completed successfully');

        } catch (error) {
            console.error('❌ Data processing error:', error);
            this.showMessage(`Processing failed: ${error.message}`, 'error');
        }
    }

    /**
     * Update data display
     */
    updateDataDisplay() {
        const summary = this.dataController.getDataSummary();

        // Update summary stats
        if (this.elements.totalClaims) {
            this.elements.totalClaims.textContent = summary.totalClaims.toLocaleString();
        }

        if (this.elements.totalAmount) {
            this.elements.totalAmount.textContent = '$' + summary.totalAmount.toLocaleString();
        }

        // Update data preview
        this.updateDataPreview();
    }

    /**
     * Update filtered data display
     */
    updateFilteredDisplay() {
        const summary = this.dataController.getDataSummary();

        if (this.elements.filteredClaims) {
            this.elements.filteredClaims.textContent = summary.filteredClaims.toLocaleString();
        }

        if (this.elements.filteredAmount) {
            this.elements.filteredAmount.textContent = '$' + summary.filteredAmount.toLocaleString();
        }

        this.updateDataPreview();
    }

    /**
     * Update data preview table
     */
    updateDataPreview() {
        const filteredData = appState.get('filteredClaimsData') || [];

        if (!this.elements.claimsTable || filteredData.length === 0) {
            return;
        }

        // Update table header
        if (this.elements.claimsTableHead && filteredData.length > 0) {
            const headers = Object.keys(filteredData[0]);
            this.elements.claimsTableHead.innerHTML = `
                <tr>
                    ${headers.map(header => `<th>${this.formatHeader(header)}</th>`).join('')}
                </tr>
            `;
        }

        // Update table body (show first 100 rows)
        if (this.elements.claimsTableBody) {
            const displayData = filteredData.slice(0, 100);
            this.elements.claimsTableBody.innerHTML = displayData.map(row => `
                <tr>
                    ${Object.values(row).map(value => `<td>${this.formatCellValue(value)}</td>`).join('')}
                </tr>
            `).join('');
        }
    }

    /**
     * Format header text
     * @param {string} header - Header text
     * @returns {string} Formatted header
     */
    formatHeader(header) {
        return header.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
    }

    /**
     * Format cell value for display
     * @param {*} value - Cell value
     * @returns {string} Formatted value
     */
    formatCellValue(value) {
        if (value === null || value === undefined) {
            return '';
        }

        // Format currency values
        if (typeof value === 'number' && value > 1000) {
            return '$' + value.toLocaleString();
        }

        // Format dates
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return new Date(value).toLocaleDateString();
        }

        return String(value);
    }

    /**
     * Apply data filters
     */
    applyFilters() {
        const filters = {
            dateStart: document.getElementById('date-range-start')?.value,
            dateEnd: document.getElementById('date-range-end')?.value,
            amountMin: parseFloat(document.getElementById('amount-range-min')?.value) || undefined,
            amountMax: parseFloat(document.getElementById('amount-range-max')?.value) || undefined,
            search: document.getElementById('search-filter')?.value
        };

        // Get selected delimiters
        const delimiterSelect = document.getElementById('delimiter-filter');
        if (delimiterSelect) {
            filters.delimiters = Array.from(delimiterSelect.selectedOptions).map(option => option.value);
        }

        this.dataController.applyFilters(filters);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        // Clear filter inputs
        const filterInputs = [
            'date-range-start',
            'date-range-end',
            'amount-range-min',
            'amount-range-max',
            'search-filter'
        ];

        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        const delimiterSelect = document.getElementById('delimiter-filter');
        if (delimiterSelect) {
            delimiterSelect.selectedIndex = -1;
        }

        this.dataController.clearFilters();
    }

    /**
     * Show data sections after successful upload
     */
    showDataSections() {
        const sections = ['data-filters', 'data-summary', 'data-preview'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'block';
            }
        });
    }

    /**
     * Show a message to the user
     * @param {string} message - Message text
     * @param {string} type - Message type ('success', 'error', 'warning', 'info')
     */
    showMessage(message, type = 'info') {
        // Use the global app notification system
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback to console
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Open file dialog programmatically
     */
    openFileDialog() {
        console.log('openFileDialog called');
        if (this.elements.browseBtn) {
            this.elements.browseBtn.click();
        } else {
            console.error('Browse button not found in openFileDialog');
        }
    }

    /**
     * Cleanup view resources
     */
    destroy() {
        // Remove event listeners and clean up
        this.initialized = false;
    }
}