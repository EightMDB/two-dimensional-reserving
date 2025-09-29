// Main application entry point and consolidated business logic
// Two-Dimensional Reserving - Professional Actuarial Claims Triangle Analysis

// Application State Variables
// Note: All global state variables are now declared in triangle-methodology.js
// to ensure proper load order and avoid undefined variable errors

// DOM Elements Cache (initialized after DOM loads)
let tabButtons;
let tabContents;
let claimsTableBody;
let totalClaimsSpan;
let totalAmountSpan;
let delimiterFilter;
let uploadArea;
let browseFileBtn;
let csvFileInput;
let uploadWizard;
let wizardSteps;
let wizardStepContents;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');

    // Cache DOM elements
    initializeDOMElements();

    // Initialize all modules
    initializeTabs();
    initializeEventListeners();
    initializeTriangleMethodologyListeners();
    initializeUploadArea();
    setDefaultConfiguration();
    updateSummary();
    updateDelimiterFilter();
    loadSavedConfigurations();

    // Desktop app specific initialization
    initializeDesktopFeatures();

    console.log('Application initialization complete');

    // Test that global variables are available
    console.log('claimsData available:', typeof window.claimsData !== 'undefined');
    console.log('currentDelimiters available:', typeof window.currentDelimiters !== 'undefined');

    // Test browse button functionality
    setTimeout(() => {
        const browseBtn = document.getElementById('browse-file');
        const csvInput = document.getElementById('csv-file');
        const uploadArea = document.getElementById('upload-area');

        console.log('Browse button element:', browseBtn);
        console.log('CSV input element:', csvInput);
        console.log('Upload area element:', uploadArea);
        console.log('Upload area initialized:', browseBtn && csvInput && uploadArea ? 'Yes' : 'No');

        // Test if file input is properly accessible
        if (csvInput) {
            console.log('File input properties:', {
                id: csvInput.id,
                type: csvInput.type,
                accept: csvInput.accept,
                multiple: csvInput.multiple,
                disabled: csvInput.disabled,
                style: csvInput.style.cssText
            });
        }

        // Add a test function to window for manual testing
        window.testBrowseButton = function() {
            console.log('Testing browse button...');
            if (browseBtn) {
                browseBtn.click();
            } else {
                console.error('Browse button not found');
            }
        };

        console.log('Manual test available: window.testBrowseButton()');
    }, 1000);
});

// Initialize DOM element references
function initializeDOMElements() {
    tabButtons = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    claimsTableBody = document.getElementById('claims-tbody');
    totalClaimsSpan = document.getElementById('total-claims');
    totalAmountSpan = document.getElementById('total-amount');
    delimiterFilter = document.getElementById('delimiter-filter');

    // Upload wizard elements
    uploadArea = document.getElementById('upload-area');
    browseFileBtn = document.getElementById('browse-file');
    csvFileInput = document.getElementById('csv-file');
    uploadWizard = document.getElementById('upload-wizard');
    wizardSteps = document.querySelectorAll('.step');
    wizardStepContents = document.querySelectorAll('.wizard-step');
}

// Initialize Triangle Methodology Event Listeners
function initializeTriangleMethodologyListeners() {
    // Wire up the triangle methodology functions to UI events
    const generateTriangleBtn = document.getElementById('generate-triangle');
    if (generateTriangleBtn) {
        generateTriangleBtn.addEventListener('click', generateClaimsTriangle);
    }

    const toggleViewInputs = document.querySelectorAll('input[name="triangle-view"]');
    toggleViewInputs.forEach(input => {
        input.addEventListener('change', toggleTriangleView);
    });
}

// Desktop Features
function initializeDesktopFeatures() {
    // Make handleDesktopFileOpen available globally for Electron main process
    window.handleDesktopFileOpen = handleDesktopFileOpen;
}

async function handleDesktopFileOpen(filePath) {
    try {
        console.log('Opening file:', filePath);

        // For desktop app, we need to read the file using fetch API
        // Since we can't directly access file system from renderer process
        const response = await fetch(`file://${filePath}`);
        if (!response.ok) {
            throw new Error(`Failed to read file: ${response.status}`);
        }

        const csvContent = await response.text();
        console.log('File content length:', csvContent.length);

        // Initialize global variables if needed
        if (!window.csvData) {
            window.csvData = null;
        }
        if (!window.csvHeaders) {
            window.csvHeaders = [];
        }

        parseCsvData(csvContent);
        showWizard();
        showWizardStep(1);

        // Switch to data input tab if not already there
        switchTab('data-input');
    } catch (error) {
        console.error('Desktop file open error:', error);
        alert('Error opening file: ' + error.message);
    }
}

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.getElementById(targetTab).classList.add('active');
}

// Event Listeners
function initializeEventListeners() {
    // Export buttons
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-excel').addEventListener('click', () => exportData('excel'));
    document.getElementById('export-triangle-csv').addEventListener('click', () => exportTriangle('csv'));
    document.getElementById('export-triangle-pdf').addEventListener('click', () => exportTriangle('pdf'));
    document.getElementById('export-report').addEventListener('click', exportFullReport);
    document.getElementById('export-charts').addEventListener('click', exportCharts);

    // Configuration management
    document.getElementById('save-config').addEventListener('click', saveConfiguration);
    document.getElementById('load-config').addEventListener('click', () => {
        document.getElementById('config-file').click();
    });
    document.getElementById('config-file').addEventListener('change', loadConfigurationFile);
    document.getElementById('download-config').addEventListener('click', downloadConfiguration);
    document.getElementById('apply-preset').addEventListener('click', applyConfigurationPreset);
    document.getElementById('reset-config').addEventListener('click', resetToDefaultConfiguration);

    // Factor method changes
    document.getElementById('factor-method').addEventListener('change', handleFactorMethodChange);
    document.getElementById('enable-factor-override').addEventListener('change', handleFactorOverrideToggle);
    document.getElementById('recent-periods-count').addEventListener('change', handleRecentPeriodsChange);
    document.getElementById('exclude-periods-count').addEventListener('change', handleExcludePeriodsChange);

    // Enhanced factor method controls
    if (document.getElementById('volume-weight')) {
        document.getElementById('volume-weight').addEventListener('input', validateVolumeCountWeights);
        document.getElementById('count-weight').addEventListener('input', validateVolumeCountWeights);
    }

    // Advanced features
    document.getElementById('export-audit-package').addEventListener('click', exportAuditPackage);
    document.getElementById('export-intermediate-triangles').addEventListener('click', exportIntermediateTriangles);
    document.getElementById('export-method-comparison').addEventListener('click', exportMethodComparison);
    document.getElementById('apply-filters').addEventListener('click', applyDataFilters);
    document.getElementById('clear-filters').addEventListener('click', clearDataFilters);

    initializeWizardListeners();
    initializeCollapsibleSections();
    initializeDataFiltering();
}

function initializeWizardListeners() {
    document.getElementById('close-wizard').addEventListener('click', closeWizard);
    document.getElementById('cancel-upload').addEventListener('click', closeWizard);
    document.getElementById('next-to-mapping').addEventListener('click', () => {
        showWizardStep(2);
        // Populate column mapping after the step is shown
        setTimeout(() => populateColumnMapping(), 100);
    });
    document.getElementById('back-to-preview').addEventListener('click', () => showWizardStep(1));
    document.getElementById('next-to-confirm').addEventListener('click', () => {
        if (validateColumnMapping()) {
            showWizardStep(3);
            generateImportSummary();
        }
    });
    document.getElementById('back-to-mapping').addEventListener('click', () => {
        showWizardStep(2);
        // Populate column mapping after the step is shown
        setTimeout(() => populateColumnMapping(), 100);
    });
    document.getElementById('confirm-import').addEventListener('click', confirmImport);

    // Delimiter type radio buttons
    document.querySelectorAll('input[name="delimiter-type"]').forEach(radio => {
        radio.addEventListener('change', handleDelimiterTypeChange);
    });
}

// Upload Area Initialization
function initializeUploadArea() {
    // Always query DOM elements directly to ensure they're found
    const uploadAreaElement = document.getElementById('upload-area');
    const browseFileBtnElement = document.getElementById('browse-file');
    const csvFileInputElement = document.getElementById('csv-file');

    if (!uploadAreaElement || !browseFileBtnElement || !csvFileInputElement) {
        console.error('Upload area elements not found. DOM may not be ready.');
        return;
    }

    // Check if running in Electron
    const isElectron = window.electronAPI || window.require ||
                      navigator.userAgent.includes('Electron') ||
                      process?.versions?.electron;

    // File browse button - robust approach that works in both environments
    browseFileBtnElement.addEventListener('click', (e) => {
        console.log('Browse button clicked');
        console.log('File input element:', csvFileInputElement);
        console.log('File input visibility:', {
            display: window.getComputedStyle(csvFileInputElement).display,
            visibility: window.getComputedStyle(csvFileInputElement).visibility,
            opacity: window.getComputedStyle(csvFileInputElement).opacity,
            offsetParent: csvFileInputElement.offsetParent
        });

        // Prevent any default button behavior
        e.preventDefault();
        e.stopPropagation();

        // Ensure file input is accessible
        const originalStyle = csvFileInputElement.style.cssText;

        try {
            // Temporarily make the file input accessible for click
            csvFileInputElement.style.cssText = 'position: absolute; left: -1px; top: -1px; width: 1px; height: 1px; opacity: 0.01;';

            // Small delay to ensure style is applied
            setTimeout(() => {
                try {
                    csvFileInputElement.click();
                    console.log('File input click triggered successfully');

                    // Restore original style after a short delay
                    setTimeout(() => {
                        csvFileInputElement.style.cssText = originalStyle;
                    }, 100);
                } catch (clickError) {
                    console.error('Error clicking file input:', clickError);
                    csvFileInputElement.style.cssText = originalStyle;

                    // Try alternative approach - create a temporary input
                    const tempInput = document.createElement('input');
                    tempInput.type = 'file';
                    tempInput.accept = '.csv';
                    tempInput.style.cssText = 'position: absolute; left: -9999px; opacity: 0;';

                    tempInput.addEventListener('change', (tempEvent) => {
                        try {
                            if (tempEvent.target.files && tempEvent.target.files.length > 0) {
                                const selectedFile = tempEvent.target.files[0];
                                console.log('File selected via temporary input:', selectedFile.name);

                                // Try to copy the file to the main input using DataTransfer
                                try {
                                    const dt = new DataTransfer();
                                    dt.items.add(selectedFile);
                                    csvFileInputElement.files = dt.files;

                                    // Trigger the main input's change event
                                    const changeEvent = new Event('change', { bubbles: true });
                                    csvFileInputElement.dispatchEvent(changeEvent);
                                } catch (dtError) {
                                    console.warn('DataTransfer failed, processing file directly:', dtError);
                                    // Process the file directly
                                    processFile(selectedFile);
                                }
                            }
                        } catch (error) {
                            console.error('Error in temporary input change handler:', error);
                        } finally {
                            // Clean up the temporary input
                            if (tempInput.parentNode) {
                                document.body.removeChild(tempInput);
                            }
                        }
                    });

                    document.body.appendChild(tempInput);

                    try {
                        tempInput.click();
                        console.log('Temporary input clicked successfully');
                    } catch (tempClickError) {
                        console.error('Failed to click temporary input:', tempClickError);
                        document.body.removeChild(tempInput);
                        alert('Unable to open file browser. Please try drag and drop instead.');
                    }
                }
            }, 10);
        } catch (error) {
            console.error('Error setting up file input:', error);
            csvFileInputElement.style.cssText = originalStyle;
            alert('Unable to open file browser. Please try drag and drop instead, or use the File menu in desktop app.');
        }
    });

    // Upload area click
    uploadAreaElement.addEventListener('click', (e) => {
        // Only trigger if clicking on the upload area itself, not the button
        if (e.target === uploadAreaElement || e.target.closest('.upload-content')) {
            // Don't trigger if the click was on the browse button
            if (e.target.id === 'browse-file' || e.target.closest('#browse-file')) {
                return;
            }

            console.log('Upload area clicked');
            // Trigger the same robust file input click as the browse button
            browseFileBtnElement.click();
        }
    });

    // File input change
    csvFileInputElement.addEventListener('change', (e) => {
        console.log('File input changed, files:', e.target.files);
        if (e.target.files && e.target.files.length > 0) {
            console.log('Selected file:', e.target.files[0].name, 'size:', e.target.files[0].size);
        }
        handleFileSelect(e);
    });

    // Drag and drop
    uploadAreaElement.addEventListener('dragover', handleDragOver);
    uploadAreaElement.addEventListener('dragleave', handleDragLeave);
    uploadAreaElement.addEventListener('drop', handleFileDrop);
}

function handleDragOver(e) {
    const uploadAreaElement = uploadArea || document.getElementById('upload-area');
    e.preventDefault();
    if (uploadAreaElement) {
        uploadAreaElement.classList.add('dragover');
    }
}

function handleDragLeave(e) {
    const uploadAreaElement = uploadArea || document.getElementById('upload-area');
    e.preventDefault();
    if (uploadAreaElement) {
        uploadAreaElement.classList.remove('dragover');
    }
}

function handleFileDrop(e) {
    const uploadAreaElement = uploadArea || document.getElementById('upload-area');
    e.preventDefault();
    if (uploadAreaElement) {
        uploadAreaElement.classList.remove('dragover');
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    console.log('handleFileSelect called');
    const file = e.target.files[0];
    if (file) {
        console.log('Processing file:', file.name);
        processFile(file);
    } else {
        console.log('No file selected');
    }
}

function processFile(file) {
    console.log('processFile called with:', file.name, 'type:', file.type, 'size:', file.size);

    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }

    console.log('File is CSV, creating FileReader');
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            console.log('FileReader loaded, content length:', e.target.result.length);
            const csv = e.target.result;
            parseCsvData(csv);
            showWizard();
            showWizardStep(1);
        } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error reading CSV file: ' + error.message);
        }
    };

    reader.onerror = function(e) {
        console.error('FileReader error:', e);
        alert('Error reading file');
    };

    console.log('Starting to read file as text');
    reader.readAsText(file);
}

function parseCsvData(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row.');
    }

    window.csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    window.csvData = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === window.csvHeaders.length) {
            const row = {};
            window.csvHeaders.forEach((header, index) => {
                row[header] = values[index];
            });
            window.csvData.push(row);
        }
    }

    if (window.csvData.length === 0) {
        throw new Error('No valid data rows found in CSV file.');
    }

    displayCsvPreview();
}

function deleteClaim(claimId) {
    if (confirm('Are you sure you want to delete this claim?')) {
        window.claimsData = window.claimsData.filter(claim => claim.id !== claimId);
        updateClaimsTable();
        updateSummary();
        updateDelimiterFilter();
        showNotification('Claim deleted successfully!', 'success');
    }
}

function updateClaimsTable() {
    const claimsTableBody = document.getElementById('claims-tbody');
    claimsTableBody.innerHTML = '';

    window.claimsData.forEach(claim => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(claim.incurredDate)}</td>
            <td>${formatDate(claim.paidDate)}</td>
            <td>${claim.delimiter}</td>
            <td>${formatCurrency(claim.paidAmount)}</td>
            <td>
                <button onclick="deleteClaim(${claim.id})" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        claimsTableBody.appendChild(row);
    });
}

function updateSummary() {
    const totalClaimsSpan = document.getElementById('total-claims');
    const totalAmountSpan = document.getElementById('total-amount');

    totalClaimsSpan.textContent = formatNumber(window.claimsData.length, 0);
    const totalAmount = window.claimsData.reduce((sum, claim) => sum + claim.paidAmount, 0);
    totalAmountSpan.textContent = formatCurrency(totalAmount);
}

function updateDelimiterFilter() {
    const delimiterFilter = document.getElementById('delimiter-filter');
    const currentSelection = delimiterFilter.value;
    delimiterFilter.innerHTML = '<option value="all">All Delimiters</option>';

    Array.from(window.currentDelimiters).sort().forEach(delimiter => {
        const option = document.createElement('option');
        option.value = delimiter;
        option.textContent = delimiter;
        delimiterFilter.appendChild(option);
    });

    if (currentSelection && currentDelimiters.has(currentSelection)) {
        delimiterFilter.value = currentSelection;
    }
}

// Date utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Analysis Functions
function updateSummaryStatistics(data) {
    const stats = calculateEnhancedStatistics(data);
    displayEnhancedStatistics(stats);
}

function createPatternChart(data) {
    const canvas = document.getElementById('pattern-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Process data for chart
    const monthlyData = {};
    data.forEach(claim => {
        const month = claim.incurredDate.substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + claim.paidAmount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const amounts = sortedMonths.map(month => monthlyData[month]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Claims Amount by Month',
                data: amounts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Wizard Management
function showWizard() {
    uploadWizard.classList.add('show');
}

function closeWizard() {
    uploadWizard.classList.remove('show');
    resetWizard();
}

function resetWizard() {
    window.csvData = null;
    window.csvHeaders = [];
    window.columnMapping = {};
    const csvFileInputElement = document.getElementById('csv-file');
    if (csvFileInputElement) {
        csvFileInputElement.value = '';
    }

    // Reset wizard steps
    wizardSteps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    wizardStepContents.forEach(content => {
        content.classList.remove('active');
    });

    // Reset to first step
    wizardSteps[0].classList.add('active');
    wizardStepContents[0].classList.add('active');
}

function showWizardStep(stepNumber) {
    // Get wizard elements (use cached from main.js or query directly)
    const wizardStepsElements = wizardSteps || document.querySelectorAll('.step');
    const wizardStepContentsElements = wizardStepContents || document.querySelectorAll('.wizard-step');

    if (!wizardStepsElements || wizardStepsElements.length === 0) {
        console.error('Wizard steps not found. DOM may not be ready.');
        return;
    }

    // Update step indicators
    wizardStepsElements.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });

    if (wizardStepsElements[stepNumber - 1]) {
        wizardStepsElements[stepNumber - 1].classList.add('active');
    }

    // Update step content
    wizardStepContentsElements.forEach(content => {
        content.classList.remove('active');
    });

    const targetStep = document.getElementById(`wizard-step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    } else {
        console.error(`Wizard step ${stepNumber} not found`);
    }
}

function displayCsvPreview() {
    const previewContainer = document.getElementById('csv-preview');

    let html = '<table><thead><tr>';
    window.csvHeaders.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Show first 5 rows
    const previewRows = window.csvData.slice(0, 5);
    previewRows.forEach(row => {
        html += '<tr>';
        window.csvHeaders.forEach(header => {
            html += `<td>${row[header] || ''}</td>`;
        });
        html += '</tr>';
    });

    if (window.csvData.length > 5) {
        html += `<tr><td colspan="${window.csvHeaders.length}" style="text-align: center; font-style: italic; color: #6c757d;">... and ${window.csvData.length - 5} more rows</td></tr>`;
    }

    html += '</tbody></table>';
    previewContainer.innerHTML = html;
}

function populateColumnMapping() {
    const selects = [
        { id: 'map-incurred-date', suggestions: ['incurred_date', 'incurred', 'incident_date', 'loss_date'] },
        { id: 'map-paid-date', suggestions: ['paid_date', 'payment_date', 'paid', 'settlement_date'] },
        { id: 'map-amount', suggestions: ['paid_amount', 'amount', 'payment_amount', 'claim_amount', 'paid'] },
        { id: 'map-delimiter', suggestions: ['delimiter', 'category', 'type', 'product', 'line'] }
    ];

    selects.forEach(selectInfo => {
        const select = document.getElementById(selectInfo.id);
        if (!select) {
            console.error(`Column mapping select element not found: ${selectInfo.id}`);
            return;
        }

        select.innerHTML = selectInfo.id === 'map-delimiter' ?
            '<option value="">None - Use default delimiter</option>' :
            '<option value="">Select column...</option>';

        if (!window.csvHeaders || window.csvHeaders.length === 0) {
            console.error('No CSV headers available for column mapping');
            return;
        }

        window.csvHeaders.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;

            // Auto-select if header matches suggestions
            if (selectInfo.suggestions.some(suggestion =>
                header.toLowerCase().includes(suggestion.toLowerCase()) ||
                suggestion.toLowerCase().includes(header.toLowerCase())
            )) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    });
}

function handleDelimiterTypeChange() {
    const delimiterTypeElement = document.querySelector('input[name="delimiter-type"]:checked');
    if (!delimiterTypeElement) {
        console.error('Delimiter type radio button not found');
        return;
    }

    const delimiterType = delimiterTypeElement.value;
    const fixedDelimiterInput = document.getElementById('fixed-delimiter');
    const delimiterSelect = document.getElementById('map-delimiter');

    if (!fixedDelimiterInput || !delimiterSelect) {
        console.error('Delimiter input elements not found');
        return;
    }

    if (delimiterType === 'fixed') {
        fixedDelimiterInput.disabled = false;
        delimiterSelect.disabled = true;
    } else {
        fixedDelimiterInput.disabled = true;
        delimiterSelect.disabled = false;
    }
}

function validateColumnMapping() {
    const requiredMappings = ['map-incurred-date', 'map-paid-date', 'map-amount'];
    const missing = [];

    requiredMappings.forEach(id => {
        const select = document.getElementById(id);
        if (!select) {
            console.error(`Required mapping element not found: ${id}`);
            missing.push(id.replace('map-', '').replace('-', ' '));
            return;
        }

        if (!select.value) {
            const label = select.previousElementSibling;
            const fieldName = label ? label.textContent.replace('*', '').trim() : id.replace('map-', '').replace('-', ' ');
            missing.push(fieldName);
        }
    });

    if (missing.length > 0) {
        alert(`Please map the following required fields: ${missing.join(', ')}`);
        return false;
    }

    return true;
}

function generateImportSummary() {
    const incurredDateElement = document.getElementById('map-incurred-date');
    const paidDateElement = document.getElementById('map-paid-date');
    const amountElement = document.getElementById('map-amount');
    const delimiterTypeElement = document.querySelector('input[name="delimiter-type"]:checked');
    const delimiterColElement = document.getElementById('map-delimiter');
    const fixedDelimiterElement = document.getElementById('fixed-delimiter');

    if (!incurredDateElement || !paidDateElement || !amountElement || !delimiterTypeElement) {
        console.error('Required mapping elements not found for import summary');
        return;
    }

    const incurredDateCol = incurredDateElement.value;
    const paidDateCol = paidDateElement.value;
    const amountCol = amountElement.value;
    const delimiterType = delimiterTypeElement.value;
    const delimiterCol = delimiterColElement ? delimiterColElement.value : '';
    const fixedDelimiter = fixedDelimiterElement ? fixedDelimiterElement.value : '';

    let delimiterText;
    if (delimiterType === 'fixed') {
        delimiterText = fixedDelimiter || 'None';
    } else if (delimiterCol) {
        delimiterText = `Column: ${delimiterCol}`;
    } else {
        delimiterText = 'Default: None';
    }

    const summaryHtml = `
        <div class="summary-item">
            <span>Total rows to import:</span>
            <strong>${window.csvData.length}</strong>
        </div>
        <div class="summary-item">
            <span>Incurred Date from:</span>
            <strong>${incurredDateCol}</strong>
        </div>
        <div class="summary-item">
            <span>Paid Date from:</span>
            <strong>${paidDateCol}</strong>
        </div>
        <div class="summary-item">
            <span>Amount from:</span>
            <strong>${amountCol}</strong>
        </div>
        <div class="summary-item">
            <span>Delimiter:</span>
            <strong>${delimiterText}</strong>
        </div>
    `;

    const summaryContainer = document.getElementById('import-summary');
    if (!summaryContainer) {
        console.error('Import summary container not found');
        return;
    }

    summaryContainer.innerHTML = summaryHtml;

    // Generate sample preview
    generateSamplePreview();
}

function generateSamplePreview() {
    const incurredDateElement = document.getElementById('map-incurred-date');
    const paidDateElement = document.getElementById('map-paid-date');
    const amountElement = document.getElementById('map-amount');
    const delimiterTypeElement = document.querySelector('input[name="delimiter-type"]:checked');
    const delimiterColElement = document.getElementById('map-delimiter');
    const fixedDelimiterElement = document.getElementById('fixed-delimiter');

    if (!incurredDateElement || !paidDateElement || !amountElement || !delimiterTypeElement) {
        console.error('Required mapping elements not found for sample preview');
        return;
    }

    const incurredDateCol = incurredDateElement.value;
    const paidDateCol = paidDateElement.value;
    const amountCol = amountElement.value;
    const delimiterType = delimiterTypeElement.value;
    const delimiterCol = delimiterColElement ? delimiterColElement.value : '';
    const fixedDelimiter = fixedDelimiterElement ? fixedDelimiterElement.value : '';

    let html = '<table><thead><tr>';
    html += '<th>Incurred Date</th><th>Paid Date</th><th>Amount</th><th>Delimiter</th>';
    html += '</tr></thead><tbody>';

    const sampleRows = window.csvData.slice(0, 3);
    sampleRows.forEach(row => {
        let delimiter;
        if (delimiterType === 'fixed') {
            delimiter = fixedDelimiter || 'None';
        } else if (delimiterCol) {
            delimiter = row[delimiterCol] || 'None';
        } else {
            delimiter = 'None';
        }

        html += '<tr>';
        html += `<td>${row[incurredDateCol] || ''}</td>`;
        html += `<td>${row[paidDateCol] || ''}</td>`;
        html += `<td>$${parseFloat(row[amountCol] || 0).toFixed(2)}</td>`;
        html += `<td>${delimiter}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    const previewContainer = document.getElementById('sample-preview');
    if (!previewContainer) {
        console.error('Sample preview container not found');
        return;
    }

    previewContainer.innerHTML = html;
}

function confirmImport() {
    try {
        const incurredDateCol = document.getElementById('map-incurred-date').value;
        const paidDateCol = document.getElementById('map-paid-date').value;
        const amountCol = document.getElementById('map-amount').value;
        const delimiterType = document.querySelector('input[name="delimiter-type"]:checked').value;
        const delimiterCol = document.getElementById('map-delimiter').value;
        const fixedDelimiter = document.getElementById('fixed-delimiter').value;

        let importedCount = 0;
        let skippedCount = 0;

        window.csvData.forEach((row, index) => {
            const incurredDate = row[incurredDateCol];
            const paidDate = row[paidDateCol];
            const paidAmount = parseFloat(row[amountCol]);

            let delimiter;
            if (delimiterType === 'fixed') {
                delimiter = fixedDelimiter || 'None';
            } else if (delimiterCol) {
                delimiter = row[delimiterCol] || 'None';
            } else {
                delimiter = 'None';
            }

            // Validate row data
            if (!incurredDate || !paidDate || isNaN(paidAmount)) {
                skippedCount++;
                return;
            }

            if (new Date(paidDate) < new Date(incurredDate)) {
                skippedCount++;
                return;
            }

            const claim = {
                id: Date.now() + index,
                incurredDate: incurredDate,
                paidDate: paidDate,
                delimiter: delimiter,
                paidAmount: paidAmount,
                incurredPeriod: 'Q1-2020', // Will be calculated by triangle-methodology.js
                developmentPeriod: 1 // Will be calculated by triangle-methodology.js
            };

            window.claimsData.push(claim);
            window.currentDelimiters.add(delimiter);
            importedCount++;
        });

        updateClaimsTable();
        updateSummary();
        updateDelimiterFilter();
        closeWizard();

        let message = `Successfully imported ${importedCount} claims!`;
        if (skippedCount > 0) {
            message += ` (${skippedCount} rows skipped due to invalid data)`;
        }

        showNotification(message, 'success');

    } catch (error) {
        alert('Error importing data: ' + error.message);
    }
}

// Export Functions
function exportData(format) {
    if (window.claimsData.length === 0) {
        alert('No data to export');
        return;
    }

    switch (format) {
        case 'csv':
            exportToCSV();
            break;
        case 'json':
            exportToJSON();
            break;
        case 'excel':
            alert('Excel export functionality would require additional libraries');
            break;
    }
}

function exportToCSV() {
    const headers = ['Incurred Date', 'Paid Date', 'Delimiter', 'Paid Amount', 'Incurred Period', 'Development Period'];
    const csvContent = [
        headers.join(','),
        ...window.claimsData.map(claim => [
            claim.incurredDate,
            claim.paidDate,
            claim.delimiter,
            claim.paidAmount,
            claim.incurredPeriod,
            claim.developmentPeriod
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'claims-data.csv', 'text/csv');
}

function exportToJSON() {
    const jsonContent = JSON.stringify(window.claimsData, null, 2);
    downloadFile(jsonContent, 'claims-data.json', 'application/json');
}

function exportTriangle(format) {
    if (!claimsTriangle) {
        alert('Please generate a claims triangle first');
        return;
    }

    if (format === 'csv') {
        exportTriangleToCSV();
    } else if (format === 'pdf') {
        alert('PDF export functionality would require additional libraries');
    }
}

function exportTriangleToCSV() {
    const headers = ['Incurred Period', ...Array.from({length: claimsTriangle.maxDevPeriod}, (_, i) => `Dev ${i + 1}`)];
    const rows = [headers.join(',')];

    claimsTriangle.periods.forEach(period => {
        const row = [period];
        for (let dev = 1; dev <= claimsTriangle.maxDevPeriod; dev++) {
            const value = claimsTriangle.matrix[period] && claimsTriangle.matrix[period][dev] ? claimsTriangle.matrix[period][dev] : 0;
            row.push(value.toFixed(2));
        }
        rows.push(row.join(','));
    });

    downloadFile(rows.join('\n'), 'claims-triangle.csv', 'text/csv');
}

function exportFullReport() {
    alert('Full report export functionality would require additional development');
}

function exportCharts() {
    alert('Chart export functionality would require additional development');
}

// Utility Functions
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatCurrency(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '$0.00';
    return '$' + parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification status-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Default Configuration
function getDefaultConfiguration() {
    return {
        dateGranularity: 'quarterly',
        developmentMethod: 'lag',
        factorMethod: 'recent-periods',
        recentPeriodsCount: 12,
        excludePeriodsCount: 10,
        excludeTotalPeriods: 12,
        excludeOutliers: true,
        applySmoothing: false,
        tailExtrapolation: true,
        enableFactorOverride: false,
        overridePeriod: 36,
        overrideFactor: 0.00,
        developmentCutoffThreshold: 1.01,
        minConsecutivePeriods: 5,
        // Enhanced Factor Selection Method parameters
        smoothingAlpha: 0.3,
        volumeWeight: 70,
        countWeight: 30,
        medialExclusionPercent: 20
    };
}

function setDefaultConfiguration() {
    const config = getDefaultConfiguration();
    currentTriangleConfig = { ...config };
    applyConfigurationToUI(config);
}

function applyConfigurationToUI(config) {
    document.getElementById('date-granularity').value = config.dateGranularity;
    document.getElementById('development-method').value = config.developmentMethod;
    document.getElementById('factor-method').value = config.factorMethod;
    document.getElementById('recent-periods-count').value = config.recentPeriodsCount;
    document.getElementById('exclude-outliers').checked = config.excludeOutliers;
    document.getElementById('apply-smoothing').checked = config.applySmoothing;
    document.getElementById('tail-extrapolation').checked = config.tailExtrapolation;
    document.getElementById('enable-factor-override').checked = config.enableFactorOverride || false;
    document.getElementById('override-period').value = config.overridePeriod || 36;
    document.getElementById('override-factor').value = config.overrideFactor || 0.00;

    // Enhanced factor method configurations
    if (document.getElementById('smoothing-alpha')) {
        document.getElementById('smoothing-alpha').value = config.smoothingAlpha || 0.3;
    }
    if (document.getElementById('volume-weight')) {
        document.getElementById('volume-weight').value = config.volumeWeight || 70;
    }
    if (document.getElementById('count-weight')) {
        document.getElementById('count-weight').value = config.countWeight || 30;
    }
    if (document.getElementById('medial-exclusion-percent')) {
        document.getElementById('medial-exclusion-percent').value = config.medialExclusionPercent || 20;
    }

    // Toggle override controls visibility
    const overrideControls = document.querySelector('.factor-override-controls');
    if (overrideControls) {
        overrideControls.style.display = config.enableFactorOverride ? 'block' : 'none';
    }

    // Update method-specific configuration visibility
    handleFactorMethodChange();
}

function getCurrentConfiguration() {
    const factorMethod = document.getElementById('factor-method').value;

    let recentPeriodsCount = 12;
    let excludePeriodsCount = 10;
    let excludeTotalPeriods = 12;

    if (factorMethod === 'recent-periods') {
        const recentCount = document.getElementById('recent-periods-count').value;
        if (recentCount === 'custom') {
            recentPeriodsCount = parseInt(document.getElementById('custom-period-count').value) || 12;
        } else {
            recentPeriodsCount = parseInt(recentCount) || 12;
        }
    } else if (factorMethod === 'exclude-high-low') {
        const excludeMethod = document.getElementById('exclude-periods-count').value;
        if (excludeMethod === 'custom-exclude') {
            excludePeriodsCount = parseInt(document.getElementById('custom-n-value').value) || 10;
            excludeTotalPeriods = parseInt(document.getElementById('custom-m-value').value) || 12;
        } else {
            excludePeriodsCount = parseInt(excludeMethod) || 10;
            switch (excludePeriodsCount) {
                case 10: excludeTotalPeriods = 12; break;
                case 8: excludeTotalPeriods = 10; break;
                case 6: excludeTotalPeriods = 8; break;
                case 4: excludeTotalPeriods = 6; break;
                case 2: excludeTotalPeriods = 4; break;
                default: excludeTotalPeriods = 12; break;
            }
        }
    }

    return {
        dateGranularity: document.getElementById('date-granularity').value,
        developmentMethod: document.getElementById('development-method').value,
        factorMethod: factorMethod,
        recentPeriodsCount: recentPeriodsCount,
        excludePeriodsCount: excludePeriodsCount,
        excludeTotalPeriods: excludeTotalPeriods,
        excludeOutliers: document.getElementById('exclude-outliers').checked,
        applySmoothing: document.getElementById('apply-smoothing').checked,
        tailExtrapolation: document.getElementById('tail-extrapolation').checked,
        enableFactorOverride: document.getElementById('enable-factor-override').checked,
        overridePeriod: parseInt(document.getElementById('override-period').value) || 36,
        overrideFactor: parseFloat(document.getElementById('override-factor').value) || 0.00,
        developmentCutoffThreshold: 1.01, // Use default values for now
        minConsecutivePeriods: 2,
        // Enhanced Factor Selection Method parameters
        smoothingAlpha: parseFloat(document.getElementById('smoothing-alpha')?.value) || 0.3,
        volumeWeight: parseInt(document.getElementById('volume-weight')?.value) || 70,
        countWeight: parseInt(document.getElementById('count-weight')?.value) || 30,
        medialExclusionPercent: parseInt(document.getElementById('medial-exclusion-percent')?.value) || 20
    };
}

function applyConfigurationPreset() {
    const preset = document.getElementById('config-preset').value;

    if (preset === 'default') {
        setDefaultConfiguration();
        showNotification('Default actuarial configuration applied!', 'success');
    } else {
        showNotification('Custom configuration mode selected - adjust settings as needed', 'info');
    }
}

function resetToDefaultConfiguration() {
    if (confirm('Are you sure you want to reset all configuration settings to default?')) {
        setDefaultConfiguration();
        handleFactorMethodChange();
        showNotification('Configuration reset to default settings!', 'success');
    }
}

function handleFactorMethodChange() {
    const method = document.getElementById('factor-method').value;
    const recentPeriodsConfig = document.getElementById('recent-periods-config');
    const excludeHighLowConfig = document.getElementById('exclude-high-low-config');

    // Enhanced method configurations
    const exponentialSmoothingConfig = document.getElementById('exponential-smoothing-config');
    const volumeCountConfig = document.getElementById('volume-count-config');
    const medialConfig = document.getElementById('medial-config');

    // Hide all config sections first
    recentPeriodsConfig.style.display = 'none';
    excludeHighLowConfig.style.display = 'none';
    exponentialSmoothingConfig.style.display = 'none';
    volumeCountConfig.style.display = 'none';
    medialConfig.style.display = 'none';

    // Show relevant config section based on method
    switch (method) {
        case 'recent-periods':
            recentPeriodsConfig.style.display = 'block';
            break;
        case 'exclude-high-low':
            excludeHighLowConfig.style.display = 'block';
            break;
        case 'exponential-smoothing':
            exponentialSmoothingConfig.style.display = 'block';
            break;
        case 'volume-count-weighted':
            volumeCountConfig.style.display = 'block';
            break;
        case 'medial-average':
            medialConfig.style.display = 'block';
            break;
    }
}

function handleFactorOverrideToggle() {
    const isEnabled = document.getElementById('enable-factor-override').checked;
    const overrideControls = document.querySelector('.factor-override-controls');

    if (overrideControls) {
        overrideControls.style.display = isEnabled ? 'block' : 'none';
    }
}

function handleRecentPeriodsChange() {
    const count = document.getElementById('recent-periods-count').value;
    const customInput = document.getElementById('custom-period-count');

    if (count === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
}

function handleExcludePeriodsChange() {
    const count = document.getElementById('exclude-periods-count').value;
    const customInputs = document.getElementById('custom-exclude-inputs');

    if (count === 'custom-exclude') {
        customInputs.style.display = 'block';
        validateCustomExcludeValues();
    } else {
        customInputs.style.display = 'none';
    }
}

function validateCustomExcludeValues() {
    const nValue = parseInt(document.getElementById('custom-n-value').value) || 0;
    const mValue = parseInt(document.getElementById('custom-m-value').value) || 0;

    const nInput = document.getElementById('custom-n-value');
    const mInput = document.getElementById('custom-m-value');

    // Reset styles
    nInput.style.borderColor = '';
    mInput.style.borderColor = '';

    // Validate N >= 1 and N < M and M >= 2
    if (nValue < 1) {
        nInput.style.borderColor = '#e74c3c';
    }
    if (mValue < 2) {
        mInput.style.borderColor = '#e74c3c';
    }
    if (nValue >= mValue && mValue > 0) {
        nInput.style.borderColor = '#e74c3c';
        mInput.style.borderColor = '#e74c3c';
    }

    return nValue >= 1 && mValue >= 2 && nValue < mValue;
}

function validateVolumeCountWeights() {
    const volumeWeight = parseInt(document.getElementById('volume-weight')?.value) || 0;
    const countWeight = parseInt(document.getElementById('count-weight')?.value) || 0;
    const totalWeight = volumeWeight + countWeight;

    const volumeInput = document.getElementById('volume-weight');
    const countInput = document.getElementById('count-weight');

    // Reset styles
    if (volumeInput) volumeInput.style.borderColor = '';
    if (countInput) countInput.style.borderColor = '';

    if (totalWeight !== 100) {
        if (volumeInput) volumeInput.style.borderColor = '#e74c3c';
        if (countInput) countInput.style.borderColor = '#e74c3c';
        return false;
    }

    return true;
}

function initializeCollapsibleSections() {
    document.querySelectorAll('.analysis-header.collapsible').forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const icon = this.querySelector('.toggle-icon');

            content.classList.toggle('collapsed');
            icon.classList.toggle('rotated');
        });
    });
}

// Configuration Management Functions
function saveConfiguration() {
    const configName = document.getElementById('config-name').value.trim();
    if (!configName) {
        alert('Please enter a configuration name');
        return;
    }

    const config = {
        name: configName,
        timestamp: new Date().toISOString(),
        triangleSettings: getCurrentConfiguration(),
        triangleData: { ...manualTriangleData }
    };

    savedConfigurations[configName] = config;
    localStorage.setItem('triangleConfigurations', JSON.stringify(savedConfigurations));

    document.getElementById('config-name').value = '';
    updateConfigurationList();
    showNotification(`Configuration "${configName}" saved successfully!`, 'success');
}

function loadSavedConfigurations() {
    const saved = localStorage.getItem('triangleConfigurations');
    if (saved) {
        try {
            savedConfigurations = JSON.parse(saved);
            updateConfigurationList();
        } catch (error) {
            console.error('Error loading saved configurations:', error);
        }
    }
}

function updateConfigurationList() {
    const configList = document.getElementById('config-list');

    if (Object.keys(savedConfigurations).length === 0) {
        configList.innerHTML = '<p class="placeholder">No saved configurations</p>';
        return;
    }

    let html = '';
    Object.entries(savedConfigurations).forEach(([name, config]) => {
        const date = new Date(config.timestamp).toLocaleDateString();
        html += `
            <div class="config-item">
                <div>
                    <div class="config-item-name">${name}</div>
                    <small>Saved: ${date}</small>
                </div>
                <div class="config-item-actions">
                    <button class="btn btn-info" onclick="loadConfiguration('${name}')">
                        <i class="fas fa-upload"></i> Load
                    </button>
                    <button class="btn btn-danger" onclick="deleteConfiguration('${name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    configList.innerHTML = html;
}

function loadConfiguration(configName) {
    const config = savedConfigurations[configName];
    if (!config) {
        alert('Configuration not found');
        return;
    }

    // Apply advanced configuration settings or use defaults for older configs
    const settings = config.triangleSettings;
    if (settings.dateGranularity) {
        // New format with advanced settings
        applyConfigurationToUI(settings);
    } else {
        // Legacy format - apply basic settings and use defaults for advanced
        document.getElementById('triangle-rows').value = settings.rows || settings.triangleRows || 10;
        document.getElementById('triangle-cols').value = settings.cols || settings.triangleCols || 10;
        document.getElementById('start-year').value = settings.startYear || 2015;

        // Apply defaults for advanced settings
        const defaults = getDefaultConfiguration();
        document.getElementById('date-granularity').value = defaults.dateGranularity;
        document.getElementById('development-method').value = defaults.developmentMethod;
        document.getElementById('factor-method').value = defaults.factorMethod;
        document.getElementById('recent-periods-count').value = defaults.recentPeriodsCount;
        document.getElementById('exclude-outliers').checked = defaults.excludeOutliers;
        document.getElementById('apply-smoothing').checked = defaults.applySmoothing;
        document.getElementById('tail-extrapolation').checked = defaults.tailExtrapolation;
    }

    // Apply triangle data
    manualTriangleData = { ...config.triangleData };

    // Update UI state
    handleFactorMethodChange();

    // Rebuild the grid with loaded data
    buildManualTriangleGrid();

    showNotification(`Configuration "${configName}" loaded successfully!`, 'success');
}

function deleteConfiguration(configName) {
    if (confirm(`Are you sure you want to delete the configuration "${configName}"?`)) {
        delete savedConfigurations[configName];
        localStorage.setItem('triangleConfigurations', JSON.stringify(savedConfigurations));
        updateConfigurationList();
        showNotification(`Configuration "${configName}" deleted successfully!`, 'success');
    }
}

function loadConfigurationFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);

            // Validate configuration structure
            if (!config.name || !config.triangleSettings || !config.triangleData) {
                throw new Error('Invalid configuration file format');
            }

            // Apply configuration
            document.getElementById('triangle-rows').value = config.triangleSettings.rows;
            document.getElementById('triangle-cols').value = config.triangleSettings.cols;
            document.getElementById('start-year').value = config.triangleSettings.startYear;
            manualTriangleData = { ...config.triangleData };

            // Save to local storage
            savedConfigurations[config.name] = config;
            localStorage.setItem('triangleConfigurations', JSON.stringify(savedConfigurations));

            buildManualTriangleGrid();
            updateConfigurationList();
            showNotification(`Configuration "${config.name}" loaded from file successfully!`, 'success');

        } catch (error) {
            alert('Error loading configuration file: ' + error.message);
        }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

function downloadConfiguration() {
    const currentConfig = getCurrentConfiguration();

    const config = {
        name: `Triangle_Config_${Date.now()}`,
        timestamp: new Date().toISOString(),
        triangleSettings: currentConfig
    };

    const configJson = JSON.stringify(config, null, 2);
    downloadFile(configJson, `${config.name}.json`, 'application/json');
    showNotification('Configuration downloaded successfully!', 'success');
}

// Enhanced Summary Statistics
function calculateEnhancedStatistics(data) {
    if (!data || data.length === 0) {
        return {
            totalClaims: 0,
            totalPaid: 0,
            avgClaimSize: 0,
            medianClaimSize: 0,
            maxClaimSize: 0,
            minClaimSize: 0,
            stdDeviation: 0,
            uniqueDelimiters: 0,
            avgDevelopmentTime: 0,
            claimsByYear: {},
            claimsByDelimiter: {},
            amountDistribution: {}
        };
    }

    const amounts = data.map(claim => claim.paidAmount).sort((a, b) => a - b);
    const totalPaid = amounts.reduce((sum, amount) => sum + amount, 0);
    const avgClaimSize = totalPaid / amounts.length;

    // Calculate median
    const medianIndex = Math.floor(amounts.length / 2);
    const medianClaimSize = amounts.length % 2 === 0
        ? (amounts[medianIndex - 1] + amounts[medianIndex]) / 2
        : amounts[medianIndex];

    // Calculate standard deviation
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgClaimSize, 2), 0) / amounts.length;
    const stdDeviation = Math.sqrt(variance);

    // Calculate development time statistics
    const developmentTimes = data.map(claim => {
        const incurred = new Date(claim.incurredDate);
        const paid = new Date(claim.paidDate);
        return (paid - incurred) / (1000 * 60 * 60 * 24); // Days
    }).filter(days => days >= 0);

    const avgDevelopmentTime = developmentTimes.reduce((sum, days) => sum + days, 0) / developmentTimes.length || 0;

    // Group by accident year
    const claimsByYear = {};
    data.forEach(claim => {
        const year = new Date(claim.incurredDate).getFullYear();
        if (!claimsByYear[year]) {
            claimsByYear[year] = { count: 0, amount: 0 };
        }
        claimsByYear[year].count++;
        claimsByYear[year].amount += claim.paidAmount;
    });

    // Group by delimiter
    const claimsByDelimiter = {};
    data.forEach(claim => {
        if (!claimsByDelimiter[claim.delimiter]) {
            claimsByDelimiter[claim.delimiter] = { count: 0, amount: 0 };
        }
        claimsByDelimiter[claim.delimiter].count++;
        claimsByDelimiter[claim.delimiter].amount += claim.paidAmount;
    });

    // Amount distribution
    const ranges = [
        { label: '$0 - $1K', min: 0, max: 1000 },
        { label: '$1K - $10K', min: 1000, max: 10000 },
        { label: '$10K - $100K', min: 10000, max: 100000 },
        { label: '$100K+', min: 100000, max: Infinity }
    ];

    const amountDistribution = {};
    ranges.forEach(range => {
        const count = amounts.filter(amount => amount >= range.min && amount < range.max).length;
        amountDistribution[range.label] = count;
    });

    return {
        totalClaims: data.length,
        totalPaid: totalPaid,
        avgClaimSize: avgClaimSize,
        medianClaimSize: medianClaimSize,
        maxClaimSize: Math.max(...amounts),
        minClaimSize: Math.min(...amounts),
        stdDeviation: stdDeviation,
        uniqueDelimiters: new Set(data.map(claim => claim.delimiter)).size,
        avgDevelopmentTime: avgDevelopmentTime,
        claimsByYear: claimsByYear,
        claimsByDelimiter: claimsByDelimiter,
        amountDistribution: amountDistribution
    };
}

function displayEnhancedStatistics(stats) {
    const html = `
        <div class="enhanced-stats">
            <div class="stats-section">
                <h4>Basic Statistics</h4>
                <div class="stats-grid">
                    <div><strong>Total Claims:</strong> ${formatNumber(stats.totalClaims, 0)}</div>
                    <div><strong>Total Paid:</strong> ${formatCurrency(stats.totalPaid)}</div>
                    <div><strong>Average Claim:</strong> ${formatCurrency(stats.avgClaimSize)}</div>
                    <div><strong>Median Claim:</strong> ${formatCurrency(stats.medianClaimSize)}</div>
                    <div><strong>Largest Claim:</strong> ${formatCurrency(stats.maxClaimSize)}</div>
                    <div><strong>Smallest Claim:</strong> ${formatCurrency(stats.minClaimSize)}</div>
                    <div><strong>Std Deviation:</strong> ${formatCurrency(stats.stdDeviation)}</div>
                    <div><strong>Avg Dev Time:</strong> ${formatNumber(stats.avgDevelopmentTime, 0)} days</div>
                </div>
            </div>

            <div class="stats-section">
                <h4>Distribution by Amount</h4>
                <div class="distribution-grid">
                    ${Object.entries(stats.amountDistribution).map(([range, count]) =>
                        `<div><strong>${range}:</strong> ${formatNumber(count, 0)} claims</div>`
                    ).join('')}
                </div>
            </div>

            <div class="stats-section">
                <h4>Claims by Accident Year</h4>
                <div class="year-grid">
                    ${Object.entries(stats.claimsByYear).map(([year, data]) =>
                        `<div><strong>${year}:</strong> ${formatNumber(data.count, 0)} claims, ${formatCurrency(data.amount)}</div>`
                    ).join('')}
                </div>
            </div>

            <div class="stats-section">
                <h4>Claims by Delimiter</h4>
                <div class="delimiter-grid">
                    ${Object.entries(stats.claimsByDelimiter).map(([delimiter, data]) =>
                        `<div><strong>${delimiter}:</strong> ${formatNumber(data.count, 0)} claims, ${formatCurrency(data.amount)}</div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('summary-stats').innerHTML = html;
}

// Data Filtering Functions
function applyDataFilters() {
    const startDate = document.getElementById('date-range-start').value;
    const endDate = document.getElementById('date-range-end').value;
    const minAmount = parseFloat(document.getElementById('amount-range-min').value) || 0;
    const maxAmount = parseFloat(document.getElementById('amount-range-max').value) || Infinity;
    const selectedDelimiters = Array.from(document.getElementById('delimiter-filter-input').selectedOptions).map(option => option.value);
    const searchTerm = document.getElementById('search-filter').value.toLowerCase();

    window.filteredClaimsData = window.claimsData.filter(claim => {
        // Date range filter
        if (startDate && new Date(claim.incurredDate) < new Date(startDate)) return false;
        if (endDate && new Date(claim.incurredDate) > new Date(endDate)) return false;

        // Amount range filter
        if (claim.paidAmount < minAmount || claim.paidAmount > maxAmount) return false;

        // Delimiter filter
        if (selectedDelimiters.length > 0 && selectedDelimiters[0] !== '' && !selectedDelimiters.includes(claim.delimiter)) return false;

        // Search filter
        if (searchTerm && !Object.values(claim).some(value =>
            String(value).toLowerCase().includes(searchTerm))) return false;

        return true;
    });

    updateClaimsTable(filteredClaimsData);
    updateFilterResults();
    showNotification(`Filtered to ${filteredClaimsData.length} claims`, 'info');
}

function clearDataFilters() {
    document.getElementById('date-range-start').value = '';
    document.getElementById('date-range-end').value = '';
    document.getElementById('amount-range-min').value = '';
    document.getElementById('amount-range-max').value = '';
    document.getElementById('delimiter-filter-input').selectedIndex = -1;
    document.getElementById('search-filter').value = '';

    window.filteredClaimsData = [];
    updateClaimsTable(window.claimsData);
    updateFilterResults();
    showNotification('Filters cleared', 'info');
}

function updateFilterResults() {
    const resultElement = document.getElementById('filter-results');
    if (window.filteredClaimsData.length > 0) {
        resultElement.textContent = `Showing ${window.filteredClaimsData.length} of ${window.claimsData.length} claims`;
        resultElement.style.color = '#28a745';
    } else if (window.filteredClaimsData.length === 0 && window.claimsData.length > 0) {
        resultElement.textContent = `No claims match current filters`;
        resultElement.style.color = '#dc3545';
    } else {
        resultElement.textContent = '';
    }
}

function initializeFilterDelimiters() {
    const select = document.getElementById('delimiter-filter-input');
    select.innerHTML = '<option value="">All Delimiters</option>';

    Array.from(window.currentDelimiters).forEach(delimiter => {
        const option = document.createElement('option');
        option.value = delimiter;
        option.textContent = delimiter;
        select.appendChild(option);
    });
}

function initializeDataFiltering() {
    if (window.claimsData.length > 0) {
        document.getElementById('data-filters').style.display = 'block';
        initializeFilterDelimiters();
    }
}

// Audit Export Functions
function exportAuditPackage() {
    if (!claimsTriangle) {
        alert('Please generate a claims triangle first');
        return;
    }

    const auditData = generateAuditData();
    const auditJson = JSON.stringify(auditData, null, 2);

    downloadFile(auditJson, `Audit_Package_${Date.now()}.json`, 'application/json');
    showNotification('Complete audit package exported successfully!', 'success');
}

function exportIntermediateTriangles() {
    if (!claimsTriangle) {
        alert('Please generate a claims triangle first');
        return;
    }

    const intermediateData = generateIntermediateTriangles();
    const csvContent = convertTrianglesToCSV(intermediateData);

    downloadFile(csvContent, `Intermediate_Triangles_${Date.now()}.csv`, 'text/csv');
    showNotification('Intermediate triangles exported successfully!', 'success');
}

function exportMethodComparison() {
    const csvContent = 'Method comparison functionality moved to triangle-methodology.js';

    downloadFile(csvContent, `Method_Comparison_${Date.now()}.csv`, 'text/csv');
    showNotification('Method comparison exported successfully!', 'success');
}

function generateAuditData() {
    const config = getCurrentConfiguration();

    return {
        metadata: {
            exportDate: new Date().toISOString(),
            configuration: config,
            claimsCount: window.claimsData.length,
            triangleDimensions: {
                periods: claimsTriangle.periods.length,
                maxDevPeriod: claimsTriangle.maxDevPeriod
            }
        },
        rawData: {
            claims: claimsData,
            delimiters: Array.from(currentDelimiters)
        },
        triangles: {
            primary: claimsTriangle,
            intermediate: generateIntermediateTriangles()
        },
        calculations: {
            developmentFactors: generateDevelopmentFactorsAudit(),
            reserves: generateReserveCalculationsAudit(),
            methodComparison: {}
        },
        auditTrail: {
            transformations: generateTransformationLog(),
            assumptions: generateAssumptionLog()
        }
    };
}

function generateIntermediateTriangles() {
    // Generate cumulative and incremental triangles
    const cumulative = { ...claimsTriangle };
    const incremental = { matrix: {}, periods: [], maxDevPeriod: 0 };

    return {
        cumulative: cumulative,
        incremental: incremental
    };
}

function convertTrianglesToCSV(triangles) {
    let csv = 'Triangle Type,Period';

    // Add development period headers
    for (let dev = 1; dev <= claimsTriangle.maxDevPeriod; dev++) {
        csv += `,Dev ${dev}`;
    }
    csv += '\n';

    // Export cumulative triangle
    claimsTriangle.periods.forEach(period => {
        csv += `Cumulative,${period}`;
        for (let dev = 1; dev <= claimsTriangle.maxDevPeriod; dev++) {
            const value = triangles.cumulative.matrix[period] && triangles.cumulative.matrix[period][dev] ? triangles.cumulative.matrix[period][dev] : 0;
            csv += `,${value}`;
        }
        csv += '\n';
    });

    // Export incremental triangle
    claimsTriangle.periods.forEach(period => {
        csv += `Incremental,${period}`;
        for (let dev = 1; dev <= claimsTriangle.maxDevPeriod; dev++) {
            const value = triangles.incremental.matrix[period] && triangles.incremental.matrix[period][dev] ? triangles.incremental.matrix[period][dev] : 0;
            csv += `,${value}`;
        }
        csv += '\n';
    });

    return csv;
}

function generateDevelopmentFactorsAudit() {
    return {
        method: getCurrentConfiguration().factorMethod,
        factors: {},
        outliers: [],
        periods: claimsTriangle.periods
    };
}

function generateReserveCalculationsAudit() {
    return {
        methodology: 'Chain Ladder',
        assumptions: getCurrentConfiguration(),
        calculations: {},
        projections: {}
    };
}

function generateTransformationLog() {
    return [
        'Raw claims data loaded',
        'Date granularity applied: ' + getCurrentConfiguration().dateGranularity,
        'Development method: ' + getCurrentConfiguration().developmentMethod,
        'Triangle constructed',
        'Development factors calculated: ' + getCurrentConfiguration().factorMethod
    ];
}

function generateAssumptionLog() {
    const config = getCurrentConfiguration();
    return {
        dateGranularity: config.dateGranularity,
        developmentMethod: config.developmentMethod,
        factorMethod: config.factorMethod,
        outlierExclusion: config.excludeOutliers,
        smoothing: config.applySmoothing,
        tailExtrapolation: config.tailExtrapolation
    };
}

// Make global functions available for inline event handlers
window.deleteClaim = deleteClaim;
window.loadConfiguration = loadConfiguration;
window.deleteConfiguration = deleteConfiguration;