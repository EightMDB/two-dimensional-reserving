/**
 * Upload Handler
 * Handles CSV upload button clicks and initializes the upload wizard
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Upload handler initialized');

        // Get the file input element
        const fileInput = document.getElementById('csv-file-input');

        if (!fileInput) {
            console.warn('CSV file input not found');
            return;
        }

        // Find all "Upload CSV" or "Upload Claims Data" action cards
        const uploadCards = document.querySelectorAll('.action-card');

        uploadCards.forEach(card => {
            const heading = card.querySelector('h3');
            if (heading && (heading.textContent.includes('Upload') || heading.textContent.includes('Import'))) {
                // Make the card clickable
                card.style.cursor = 'pointer';

                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Upload card clicked');

                    // Trigger the file input
                    fileInput.click();
                });
            }
        });

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                handleFileUpload(file);
            }
        });

        // Close wizard when clicking close button or backdrop
        const closeWizardBtn = document.getElementById('wizard-close-btn');
        if (closeWizardBtn) {
            closeWizardBtn.addEventListener('click', function() {
                closeWizard();
            });
        }
    });

    /**
     * Handle file upload
     * @param {File} file - The selected file
     */
    function handleFileUpload(file) {
        // Check if it's a CSV file
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        // Read and parse the CSV file
        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            const parsedData = parseCSV(content);

            if (parsedData) {
                showWizard(parsedData, file.name);
            }
        };

        reader.onerror = function() {
            alert('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    }

    /**
     * Parse CSV content
     * @param {string} content - CSV file content
     * @returns {Object|null} Parsed data or null if error
     */
    function parseCSV(content) {
        try {
            const lines = content.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                alert('CSV file appears to be empty or invalid');
                return null;
            }

            // Parse headers
            const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));

            // Parse rows
            const rows = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                rows.push(row);
            }

            return {
                headers: headers,
                rows: rows,
                validRows: rows.length
            };

        } catch (error) {
            console.error('CSV parsing error:', error);
            alert('Error parsing CSV file. Please check the file format.');
            return null;
        }
    }

    /**
     * Show the upload wizard
     * @param {Object} csvData - Parsed CSV data
     * @param {string} fileName - Original file name
     */
    function showWizard(csvData, fileName) {
        const wizard = document.getElementById('upload-wizard');
        const wizardContent = document.getElementById('wizard-content');

        if (!wizard || !wizardContent) {
            console.error('Wizard elements not found');
            alert('Upload wizard not available on this page');
            return;
        }

        // Auto-suggest column mappings
        const suggestedMapping = suggestColumnMapping(csvData.headers);

        // Store data globally for tab navigation
        window.wizardData = { csvData, fileName, mapping: suggestedMapping, currentTab: 'preview' };

        // Create wizard content with tabs
        wizardContent.innerHTML = `
            <div class="wizard-container">
                <!-- Tab Navigation -->
                <div class="wizard-tabs">
                    <button class="wizard-tab active" data-tab="preview">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="wizard-tab" data-tab="mapping">
                        <i class="fas fa-map-signs"></i> Column Mapping
                    </button>
                    <button class="wizard-tab" data-tab="confirm">
                        <i class="fas fa-check-circle"></i> Confirm
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="wizard-tab-content">
                    <!-- Tab 1: Preview -->
                    <div class="wizard-panel active" data-panel="preview">
                        <!-- File Info Stats -->
                        <section class="dashboard-stats">
                            <div class="stat-card">
                                <div class="stat-card-icon blue">
                                    <i class="fas fa-file-csv"></i>
                                </div>
                                <div class="stat-card-content">
                                    <h3 class="stat-value">${fileName}</h3>
                                    <p class="stat-label">File Name</p>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-card-icon green">
                                    <i class="fas fa-list"></i>
                                </div>
                                <div class="stat-card-content">
                                    <h3 class="stat-value">${csvData.validRows}</h3>
                                    <p class="stat-label">Data Rows</p>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-card-icon purple">
                                    <i class="fas fa-columns"></i>
                                </div>
                                <div class="stat-card-content">
                                    <h3 class="stat-value">${csvData.headers.length}</h3>
                                    <p class="stat-label">Columns</p>
                                </div>
                            </div>

                            <div class="stat-card">
                                <div class="stat-card-icon orange">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-card-content">
                                    <h3 class="stat-value">Ready</h3>
                                    <p class="stat-label">Status</p>
                                </div>
                            </div>
                        </section>

                        <!-- Data Preview Section -->
                        <section class="content-section">
                            <h2 class="section-title"><i class="fas fa-table"></i> Data Preview</h2>
                            <div class="content-card">
                                <div class="preview-table-container">
                                    <table class="wizard-preview-table">
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
                                <p class="stat-label" style="text-align: center; margin-top: 1rem;">
                                    Showing first 5 of ${csvData.validRows} rows
                                </p>
                            </div>
                        </section>
                    </div>

                    <!-- Tab 2: Column Mapping -->
                    <div class="wizard-panel" data-panel="mapping">
                        <section class="content-section">
                            <h2 class="section-title"><i class="fas fa-map-signs"></i> Map Required Columns</h2>
                            <div class="content-card">
                                <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                                    Map your CSV columns to the required fields for analysis. The system has auto-detected likely matches.
                                </p>
                                ${createMappingCards(csvData.headers, suggestedMapping)}
                            </div>
                        </section>
                    </div>

                    <!-- Tab 3: Confirmation -->
                    <div class="wizard-panel" data-panel="confirm">
                        <section class="content-section">
                            <h2 class="section-title"><i class="fas fa-clipboard-check"></i> Confirm Import</h2>

                            <!-- Summary Stats -->
                            <div class="dashboard-stats">
                                <div class="stat-card">
                                    <div class="stat-card-icon blue">
                                        <i class="fas fa-file-csv"></i>
                                    </div>
                                    <div class="stat-card-content">
                                        <h3 class="stat-value">${csvData.validRows}</h3>
                                        <p class="stat-label">Rows to Import</p>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-card-icon green">
                                        <i class="fas fa-columns"></i>
                                    </div>
                                    <div class="stat-card-content">
                                        <h3 class="stat-value">${csvData.headers.length}</h3>
                                        <p class="stat-label">Total Columns</p>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-card-icon purple">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div class="stat-card-content">
                                        <h3 class="stat-value" id="mapped-count">0</h3>
                                        <p class="stat-label">Mapped Fields</p>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-card-icon orange">
                                        <i class="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div class="stat-card-content">
                                        <h3 class="stat-value" id="validation-status">Checking...</h3>
                                        <p class="stat-label">Status</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Mapping Summary -->
                            <div class="content-card">
                                <h3 style="margin-bottom: 1rem;"><i class="fas fa-list"></i> Column Mappings</h3>
                                <div id="mapping-summary-content" class="mapping-summary-grid">
                                    <!-- Will be populated by JavaScript -->
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="wizard-navigation">
                    <button class="button button-secondary" id="wizard-cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="button button-secondary" id="wizard-prev" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button class="button button-primary" id="wizard-next">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="button button-primary" id="wizard-import" style="display: none;">
                            <i class="fas fa-file-import"></i> Import Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Show wizard
        wizard.style.display = 'flex';

        // Setup tab navigation
        setupTabNavigation();

        // Setup event listeners
        setupWizardListeners(csvData, fileName);
    }

    /**
     * Create mapping cards HTML
     */
    function createMappingCards(headers, suggestedMapping) {
        const requiredFields = [
            { id: 'incurredDate', label: 'Incurred Date', icon: 'calendar' },
            { id: 'paidDate', label: 'Paid Date', icon: 'calendar-check' },
            { id: 'paidAmount', label: 'Paid Amount', icon: 'dollar-sign' },
            { id: 'delimiter', label: 'Category/LOB', icon: 'tag' }
        ];

        return `
            <div class="mapping-cards-grid">
                ${requiredFields.map(field => `
                    <div class="mapping-card">
                        <div class="mapping-card-header">
                            <i class="fas fa-${field.icon}"></i>
                            <h4>${field.label}</h4>
                        </div>
                        <select class="mapping-select" data-field="${field.id}">
                            <option value="">-- Select Column --</option>
                            ${headers.map(header => `
                                <option value="${header}" ${suggestedMapping[field.id] === header ? 'selected' : ''}>
                                    ${header}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Setup tab navigation
     */
    function setupTabNavigation() {
        const tabs = document.querySelectorAll('.wizard-tab');
        const panels = document.querySelectorAll('.wizard-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');

                // Update active states
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                this.classList.add('active');
                document.querySelector(`[data-panel="${targetTab}"]`).classList.add('active');

                // Update current tab
                window.wizardData.currentTab = targetTab;

                // Update button visibility
                updateNavigationButtons();

                // Update confirmation if on confirm tab
                if (targetTab === 'confirm') {
                    updateConfirmationTab();
                }
            });
        });
    }

    /**
     * Setup wizard event listeners
     */
    function setupWizardListeners(csvData, fileName) {
        // Cancel button
        document.getElementById('wizard-cancel').addEventListener('click', closeWizard);

        // Previous button
        document.getElementById('wizard-prev').addEventListener('click', function() {
            navigateTab('prev');
        });

        // Next button
        document.getElementById('wizard-next').addEventListener('click', function() {
            navigateTab('next');
        });

        // Import button
        document.getElementById('wizard-import').addEventListener('click', function() {
            importData(csvData, fileName);
        });

        // Mapping select changes
        document.querySelectorAll('.mapping-select').forEach(select => {
            select.addEventListener('change', function() {
                const field = this.getAttribute('data-field');
                window.wizardData.mapping[field] = this.value;
            });
        });
    }

    /**
     * Navigate between tabs
     */
    function navigateTab(direction) {
        const tabs = ['preview', 'mapping', 'confirm'];
        const currentIndex = tabs.indexOf(window.wizardData.currentTab);

        let newIndex;
        if (direction === 'next') {
            newIndex = Math.min(currentIndex + 1, tabs.length - 1);
        } else {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        const newTab = tabs[newIndex];
        document.querySelector(`[data-tab="${newTab}"]`).click();
    }

    /**
     * Update navigation button visibility
     */
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        const importBtn = document.getElementById('wizard-import');

        const currentTab = window.wizardData.currentTab;

        if (currentTab === 'preview') {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'inline-flex';
            importBtn.style.display = 'none';
        } else if (currentTab === 'mapping') {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'inline-flex';
            importBtn.style.display = 'none';
        } else if (currentTab === 'confirm') {
            prevBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'none';
            importBtn.style.display = 'inline-flex';
        }
    }

    /**
     * Update confirmation tab with current mapping
     */
    function updateConfirmationTab() {
        const mapping = window.wizardData.mapping;
        const summaryContent = document.getElementById('mapping-summary-content');
        const mappedCount = document.getElementById('mapped-count');
        const validationStatus = document.getElementById('validation-status');

        // Count mapped fields
        const mappedFields = Object.values(mapping).filter(v => v).length;
        mappedCount.textContent = mappedFields;

        // Validate
        const isValid = mappedFields === 4;
        if (isValid) {
            validationStatus.textContent = 'Valid';
            validationStatus.parentElement.querySelector('.stat-card-icon').className = 'stat-card-icon green';
        } else {
            validationStatus.textContent = 'Incomplete';
            validationStatus.parentElement.querySelector('.stat-card-icon').className = 'stat-card-icon orange';
        }

        // Update summary
        const requiredFields = {
            incurredDate: 'Incurred Date',
            paidDate: 'Paid Date',
            paidAmount: 'Paid Amount',
            delimiter: 'Category/LOB'
        };

        summaryContent.innerHTML = Object.entries(requiredFields).map(([field, label]) => {
            const mappedColumn = mapping[field] || '<span style="color: #e74c3c;">Not mapped</span>';
            return `
                <div class="mapping-summary-item">
                    <strong>${label}:</strong> ${mappedColumn}
                </div>
            `;
        }).join('');

        // Enable/disable import button
        document.getElementById('wizard-import').disabled = !isValid;
    }

    /**
     * Get column type based on header name
     * @param {string} header - Column header
     * @returns {string} Column type description
     */
    function getColumnType(header) {
        const lower = header.toLowerCase();

        if (lower.includes('date')) return 'Date field';
        if (lower.includes('amount') || lower.includes('paid') || lower.includes('premium')) return 'Numeric field';
        if (lower.includes('id') || lower.includes('number')) return 'Identifier';
        if (lower.includes('lob') || lower.includes('line') || lower.includes('category')) return 'Category';
        if (lower.includes('year')) return 'Year field';

        return 'Text field';
    }

    /**
     * Suggest column mapping based on header names
     * @param {Array} headers - CSV headers
     * @returns {Object} Suggested mapping
     */
    function suggestColumnMapping(headers) {
        const mapping = {};
        const lowerHeaders = headers.map(h => h.toLowerCase());

        // Try to match common patterns
        lowerHeaders.forEach((header, index) => {
            const originalHeader = headers[index];

            if (header.includes('incurred') && header.includes('date')) {
                mapping.incurredDate = originalHeader;
            } else if (header.includes('paid') && header.includes('date')) {
                mapping.paidDate = originalHeader;
            } else if ((header.includes('paid') || header.includes('payment')) && header.includes('amount')) {
                mapping.paidAmount = originalHeader;
            } else if (header.includes('lob') || header.includes('line') || header.includes('category')) {
                mapping.delimiter = originalHeader;
            }
        });

        return mapping;
    }

    /**
     * Import data (placeholder - would integrate with actual app logic)
     * @param {Object} csvData - CSV data
     * @param {string} fileName - File name
     */
    function importData(csvData, fileName) {
        console.log('Importing data:', csvData);
        console.log('With mapping:', window.wizardData.mapping);

        // Show success message
        const message = `Successfully imported ${csvData.validRows} rows from ${fileName}`;
        alert(message);

        // Close wizard
        closeWizard();

        // Reset file input
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Close the wizard
     */
    function closeWizard() {
        const wizard = document.getElementById('upload-wizard');
        if (wizard) {
            wizard.style.display = 'none';
        }
        window.wizardData = null;
    }

    // Export functions for external use
    window.uploadHandler = {
        handleFileUpload: handleFileUpload,
        closeWizard: closeWizard
    };

})();
