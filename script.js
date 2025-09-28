// Application State
let claimsData = [];
let currentDelimiters = new Set();
let claimsTriangle = null;
let incrementalTriangle = null;
let filteredClaimsData = [];
let savedConfigurations = {};
let currentTriangleConfig = {};
let lastGeneratedConfig = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const claimsTableBody = document.getElementById('claims-tbody');
const totalClaimsSpan = document.getElementById('total-claims');
const totalAmountSpan = document.getElementById('total-amount');
const delimiterFilter = document.getElementById('delimiter-filter');

// Upload wizard elements
const uploadArea = document.getElementById('upload-area');
const browseFileBtn = document.getElementById('browse-file');
const csvFileInput = document.getElementById('csv-file');
const uploadWizard = document.getElementById('upload-wizard');
const wizardSteps = document.querySelectorAll('.step');
const wizardStepContents = document.querySelectorAll('.wizard-step');

// Wizard data
let csvData = null;
let csvHeaders = [];
let columnMapping = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    initializeUploadArea();
    setDefaultConfiguration();
    updateSummary();
    updateDelimiterFilter();
    loadSavedConfigurations();
});

// Tab Management
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.getElementById(targetTab).classList.add('active');
}

// Event Listeners
function initializeEventListeners() {
    document.getElementById('generate-triangle').addEventListener('click', generateClaimsTriangle);

    // Export buttons
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-excel').addEventListener('click', () => exportData('excel'));
    document.getElementById('export-triangle-csv').addEventListener('click', () => exportTriangle('csv'));
    document.getElementById('export-triangle-pdf').addEventListener('click', () => exportTriangle('pdf'));
    document.getElementById('export-report').addEventListener('click', exportFullReport);
    document.getElementById('export-charts').addEventListener('click', exportCharts);

    // Audit export event listeners
    document.getElementById('export-audit-package').addEventListener('click', exportAuditPackage);
    document.getElementById('export-intermediate-triangles').addEventListener('click', exportIntermediateTriangles);
    document.getElementById('export-method-comparison').addEventListener('click', exportMethodComparison);

    // Configuration management event listeners
    document.getElementById('save-config').addEventListener('click', saveConfiguration);
    document.getElementById('load-config').addEventListener('click', () => {
        document.getElementById('config-file').click();
    });
    document.getElementById('config-file').addEventListener('change', loadConfigurationFile);
    document.getElementById('download-config').addEventListener('click', downloadConfiguration);

    // Advanced configuration event listeners
    document.getElementById('apply-preset').addEventListener('click', applyConfigurationPreset);
    document.getElementById('reset-config').addEventListener('click', resetToDefaultConfiguration);
    document.getElementById('factor-method').addEventListener('change', handleFactorMethodChange);
    document.getElementById('recent-periods-count').addEventListener('change', handleRecentPeriodsChange);
    document.getElementById('exclude-periods-count').addEventListener('change', handleExcludePeriodsChange);
    document.getElementById('custom-n-value').addEventListener('input', validateCustomExcludeValues);
    document.getElementById('custom-m-value').addEventListener('input', validateCustomExcludeValues);
    document.getElementById('enable-factor-override').addEventListener('change', handleFactorOverrideToggle);

    // Collapsible analysis sections
    initializeCollapsibleSections();

    // Data filtering event listeners
    document.getElementById('apply-filters').addEventListener('click', applyDataFilters);
    document.getElementById('clear-filters').addEventListener('click', clearDataFilters);

    // Triangle view toggle listeners
    document.querySelectorAll('input[name="triangle-view"]').forEach(radio => {
        radio.addEventListener('change', toggleTriangleView);
    });

    // Wizard event listeners
    initializeWizardListeners();
}

function initializeWizardListeners() {
    document.getElementById('close-wizard').addEventListener('click', closeWizard);
    document.getElementById('cancel-upload').addEventListener('click', closeWizard);
    document.getElementById('next-to-mapping').addEventListener('click', () => showWizardStep(2));
    document.getElementById('back-to-preview').addEventListener('click', () => showWizardStep(1));
    document.getElementById('next-to-confirm').addEventListener('click', () => {
        if (validateColumnMapping()) {
            showWizardStep(3);
            generateImportSummary();
        }
    });
    document.getElementById('back-to-mapping').addEventListener('click', () => showWizardStep(2));
    document.getElementById('confirm-import').addEventListener('click', confirmImport);

    // Delimiter type radio buttons
    document.querySelectorAll('input[name="delimiter-type"]').forEach(radio => {
        radio.addEventListener('change', handleDelimiterTypeChange);
    });
}

// Upload Area Initialization
function initializeUploadArea() {
    // File browse button
    browseFileBtn.addEventListener('click', () => {
        csvFileInput.click();
    });

    // Upload area click
    uploadArea.addEventListener('click', () => {
        csvFileInput.click();
    });

    // File input change
    csvFileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            parseCsvData(csv);
            showWizard();
            showWizardStep(1);
        } catch (error) {
            alert('Error reading CSV file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function parseCsvData(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row.');
    }

    csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    csvData = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === csvHeaders.length) {
            const row = {};
            csvHeaders.forEach((header, index) => {
                row[header] = values[index];
            });
            csvData.push(row);
        }
    }

    if (csvData.length === 0) {
        throw new Error('No valid data rows found in CSV file.');
    }

    populateColumnMapping();
    displayCsvPreview();
}

function deleteClaim(claimId) {
    if (confirm('Are you sure you want to delete this claim?')) {
        claimsData = claimsData.filter(claim => claim.id !== claimId);
        updateClaimsTable();
        updateSummary();
        updateDelimiterFilter();
        showNotification('Claim deleted successfully!', 'success');
    }
}

function updateClaimsTable() {
    claimsTableBody.innerHTML = '';

    claimsData.forEach(claim => {
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
    totalClaimsSpan.textContent = formatNumber(claimsData.length, 0);
    const totalAmount = claimsData.reduce((sum, claim) => sum + claim.paidAmount, 0);
    totalAmountSpan.textContent = formatCurrency(totalAmount);
}

function updateDelimiterFilter() {
    const currentSelection = delimiterFilter.value;
    delimiterFilter.innerHTML = '<option value="all">All Delimiters</option>';

    Array.from(currentDelimiters).sort().forEach(delimiter => {
        const option = document.createElement('option');
        option.value = delimiter;
        option.textContent = delimiter;
        delimiterFilter.appendChild(option);
    });

    if (currentSelection && currentDelimiters.has(currentSelection)) {
        delimiterFilter.value = currentSelection;
    }
}

// Date and Period Calculations
function getIncurredPeriod(incurredDate, granularity = 'quarterly') {
    const date = new Date(incurredDate);
    const year = date.getFullYear();

    switch (granularity) {
        case 'monthly':
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[date.getMonth()];
            return `${monthName}-${year}`;
        case 'quarterly':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${quarter}-${year}`;
        case 'annual':
            return year.toString();
        default:
            const defaultQuarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${defaultQuarter}-${year}`;
    }
}

function getDevelopmentPeriod(incurredDate, paidDate, granularity = 'quarterly', method = 'lag') {
    const incurred = new Date(incurredDate);
    const paid = new Date(paidDate);

    if (method === 'lag') {
        // Time since incurred
        const diffMonths = (paid.getFullYear() - incurred.getFullYear()) * 12 + (paid.getMonth() - incurred.getMonth());

        switch (granularity) {
            case 'monthly':
                return Math.max(1, diffMonths + 1);
            case 'quarterly':
                return Math.max(1, Math.floor(diffMonths / 3) + 1);
            case 'annual':
                return Math.max(1, Math.floor(diffMonths / 12) + 1);
            default:
                return Math.max(1, Math.floor(diffMonths / 3) + 1);
        }
    } else {
        // Calendar period
        const incurredPeriod = getIncurredPeriod(incurredDate, granularity);
        const paidPeriod = getIncurredPeriod(paidDate, granularity);

        // Calculate difference between periods
        if (granularity === 'annual') {
            const incYear = parseInt(incurredPeriod);
            const paidYear = parseInt(paidPeriod);
            return Math.max(1, paidYear - incYear + 1);
        } else if (granularity === 'quarterly') {
            const [incQ, incYear] = incurredPeriod.split('-').map(x => x.replace('Q', '')).map(x => parseInt(x));
            const [paidQ, paidYear] = paidPeriod.split('-').map(x => x.replace('Q', '')).map(x => parseInt(x));
            const incTotal = incYear * 4 + incQ;
            const paidTotal = paidYear * 4 + paidQ;
            return Math.max(1, paidTotal - incTotal + 1);
        } else if (granularity === 'monthly') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const [incMonth, incYear] = incurredPeriod.split('-');
            const [paidMonth, paidYear] = paidPeriod.split('-');
            const incMonthNum = monthNames.indexOf(incMonth) + 1;
            const paidMonthNum = monthNames.indexOf(paidMonth) + 1;
            const incTotal = parseInt(incYear) * 12 + incMonthNum;
            const paidTotal = parseInt(paidYear) * 12 + paidMonthNum;
            return Math.max(1, paidTotal - incTotal + 1);
        }

        return 1;
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Claims Triangle Generation
function generateClaimsTriangle() {
    if (claimsData.length === 0) {
        alert('Please upload claims data first');
        return;
    }

    // Get current configuration
    const currentConfig = getCurrentConfiguration();

    // Check if configuration has changed
    const configChanged = !lastGeneratedConfig ||
                         JSON.stringify(currentConfig) !== JSON.stringify(lastGeneratedConfig);

    if (configChanged && claimsTriangle) {
        const confirmRegenerate = confirm(
            'Configuration settings have changed. This will regenerate the triangle and recalculate all analysis. Continue?'
        );
        if (!confirmRegenerate) {
            return;
        }
    }

    // Apply filtering
    const dataToUse = filteredClaimsData.length > 0 ? filteredClaimsData : claimsData;
    const selectedDelimiter = delimiterFilter.value;
    let filteredData = dataToUse;

    if (selectedDelimiter !== 'all') {
        filteredData = dataToUse.filter(claim => claim.delimiter === selectedDelimiter);
    }

    if (filteredData.length === 0) {
        document.getElementById('triangle-display').innerHTML = '<p class="placeholder">No claims data available for the selected filters.</p>';
        return;
    }

    // Generate both cumulative and incremental triangles
    claimsTriangle = buildTriangleMatrix(filteredData);
    incrementalTriangle = buildIncrementalTriangle(filteredData);

    // Store current configuration
    lastGeneratedConfig = { ...currentConfig };
    currentTriangleConfig = { ...currentConfig };

    // Display triangle (cumulative by default)
    displayTriangle(claimsTriangle);

    // Show triangle display controls
    document.getElementById('triangle-display-controls').style.display = 'block';

    // Update analysis
    updateAnalysis(claimsTriangle, filteredData);

    showNotification('Claims triangle generated successfully with current configuration!', 'success');
}

function buildTriangleMatrix(data) {
    const config = getCurrentConfiguration();
    const { dateGranularity, developmentMethod } = config;

    // First build incremental triangle (sum of payments by period)
    const incremental = {};
    const periods = new Set();
    let maxDevPeriod = 0;

    // Recalculate periods based on current configuration
    data.forEach(claim => {
        const recalculatedIncurredPeriod = getIncurredPeriod(claim.incurredDate, dateGranularity);
        const recalculatedDevelopmentPeriod = getDevelopmentPeriod(claim.incurredDate, claim.paidDate, dateGranularity, developmentMethod);

        periods.add(recalculatedIncurredPeriod);
        maxDevPeriod = Math.max(maxDevPeriod, recalculatedDevelopmentPeriod);

        if (!incremental[recalculatedIncurredPeriod]) {
            incremental[recalculatedIncurredPeriod] = {};
        }
        if (!incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod]) {
            incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod] = 0;
        }
        incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod] += claim.paidAmount;
    });

    // Convert to cumulative
    const cumulative = {};
    const sortedPeriods = Array.from(periods).sort();

    sortedPeriods.forEach(period => {
        cumulative[period] = {};
        let runningTotal = 0;

        for (let dev = 1; dev <= maxDevPeriod; dev++) {
            const incrementalValue = incremental[period] && incremental[period][dev] ? incremental[period][dev] : 0;
            runningTotal += incrementalValue;
            cumulative[period][dev] = runningTotal;
        }
    });

    return {
        matrix: cumulative,
        periods: sortedPeriods,
        maxDevPeriod: maxDevPeriod
    };
}

function displayTriangle(triangle) {
    if (!triangle) return;

    const config = currentTriangleConfig || getCurrentConfiguration();
    const { dateGranularity, developmentMethod } = config;

    let html = '<table class="triangle-table table">';

    // Generate column headers based on configuration
    const columnHeaders = generateTriangleHeaders(dateGranularity, developmentMethod, triangle.maxDevPeriod, triangle);

    // Determine triangle type for display
    const isIncremental = document.querySelector('input[name="triangle-view"]:checked')?.value === 'incremental';
    const triangleType = isIncremental ? 'Incremental' : 'Cumulative';

    // Header row with clear labels
    const showTotal = isIncremental; // Only show total for incremental triangles
    const colSpan = showTotal ? triangle.maxDevPeriod + 2 : triangle.maxDevPeriod + 1;

    html += '<thead>';
    html += '<tr><th colspan="' + colSpan + '" class="triangle-title">' + triangleType + ' Claims Development Triangle</th></tr>';
    html += '<tr>';
    html += '<th class="incurred-header">' + getIncurredPeriodLabel(dateGranularity) + '<br><small>(Incurred Period)</small></th>';
    for (let dev = 1; dev <= triangle.maxDevPeriod; dev++) {
        html += `<th class="paid-header">${columnHeaders[dev - 1]}<br><small>(Paid Period)</small></th>`;
    }
    if (showTotal) {
        html += '<th class="total-header">Total Paid<br><small>(All Periods)</small></th>';
    }
    html += '</tr></thead>';

    html += '<tbody>';

    triangle.periods.forEach(period => {
        const formattedPeriod = formatIncurredPeriod(period, dateGranularity);
        html += `<tr><td class="period-header">${formattedPeriod}</td>`;
        let rowTotal = 0;

        for (let dev = 1; dev <= triangle.maxDevPeriod; dev++) {
            const value = triangle.matrix[period] && triangle.matrix[period][dev] ? triangle.matrix[period][dev] : 0;
            if (isIncremental) {
                rowTotal += value; // Only calculate total for incremental
            }

            if (value > 0) {
                html += `<td class="triangle-cell">${formatCurrency(value)}</td>`;
            } else {
                html += '<td class="triangle-cell">-</td>';
            }
        }

        if (showTotal) {
            html += `<td class="development-factor">${formatCurrency(rowTotal)}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody></table>';

    document.getElementById('triangle-display').innerHTML = html;
}

function generateTriangleHeaders(granularity, method, maxPeriods, triangle) {
    const headers = [];

    // For both lag and calendar methods, show actual calendar periods for columns
    if (triangle && triangle.periods && triangle.periods.length > 0) {
        // Generate actual calendar periods based on first incurred period
        const firstPeriod = triangle.periods[0];

        for (let i = 1; i <= maxPeriods; i++) {
            const periodOffset = i - 1;
            let paidPeriod;

            switch (granularity) {
                case 'monthly':
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const [baseMonth, baseYear] = firstPeriod.split('-');
                    const baseMonthNum = monthNames.indexOf(baseMonth);
                    const totalMonths = baseMonthNum + periodOffset;
                    const yearOffset = Math.floor(totalMonths / 12);
                    const monthNum = totalMonths % 12;
                    const newYear = parseInt(baseYear) + yearOffset;
                    paidPeriod = `${monthNames[monthNum]}-${newYear}`;
                    break;
                case 'quarterly':
                    const [baseQ, baseYearQ] = firstPeriod.split('-');
                    const baseQuarter = parseInt(baseQ.replace('Q', ''));
                    const totalQuarters = (baseQuarter - 1) + periodOffset;
                    const qYearOffset = Math.floor(totalQuarters / 4);
                    const quarterNum = (totalQuarters % 4) + 1;
                    const newYearQ = parseInt(baseYearQ) + qYearOffset;
                    paidPeriod = `Q${quarterNum}-${newYearQ}`;
                    break;
                case 'annual':
                    const baseYearA = parseInt(firstPeriod);
                    paidPeriod = `${baseYearA + periodOffset}`;
                    break;
                default:
                    paidPeriod = `Period ${i}`;
            }
            // Ensure consistent formatting with row names
            const formattedPaidPeriod = formatIncurredPeriod(paidPeriod, granularity);
            headers.push(formattedPaidPeriod);
        }
    } else {
        // Fallback to generic periods
        for (let i = 1; i <= maxPeriods; i++) {
            headers.push(`Period ${i}`);
        }
    }

    return headers;
}

function getIncurredPeriodLabel(granularity) {
    switch (granularity) {
        case 'monthly':
            return 'Accident Month';
        case 'quarterly':
            return 'Accident Quarter';
        case 'annual':
            return 'Accident Year';
        default:
            return 'Accident Period';
    }
}

function formatIncurredPeriod(period, granularity) {
    // If period is already formatted (e.g., "2020-Q1"), return as is
    if (period.includes('-Q') || period.includes('-M')) {
        return period;
    }

    // If it's just a year, format according to granularity
    const year = parseInt(period);
    if (!isNaN(year)) {
        switch (granularity) {
            case 'quarterly':
                return `${year}-Q1`; // Default to Q1 for simplicity
            case 'monthly':
                return `${year}-M01`; // Default to January
            default:
                return year.toString();
        }
    }

    return period;
}

// Analysis Functions
function updateAnalysis(triangle, data) {
    calculateDevelopmentFactors(triangle);
    generateReserveProjections(triangle);
    generateMethodComparison(triangle, data);
    updateSummaryStatistics(data);
    createPatternChart(data);
}

function calculateDevelopmentFactors(triangle) {
    const config = currentTriangleConfig || getCurrentConfiguration();
    const devFactors = {};

    for (let dev = 1; dev < triangle.maxDevPeriod; dev++) {
        let factors = [];
        let weights = [];

        triangle.periods.forEach(period => {
            const current = triangle.matrix[period] && triangle.matrix[period][dev] ? triangle.matrix[period][dev] : 0;
            const next = triangle.matrix[period] && triangle.matrix[period][dev + 1] ? triangle.matrix[period][dev + 1] : 0;

            if (current > 0 && next > 0) {
                const factor = ((current + next) / current) - 1;
                factors.push(factor);
                weights.push(current); // Weight by volume
            }
        });

        if (factors.length > 0) {
            // Apply recent periods filter if specified
            if (config.factorMethod === 'recent-periods' && config.recentPeriodsCount < factors.length) {
                const recentCount = Math.min(config.recentPeriodsCount, factors.length);
                factors = factors.slice(-recentCount);
                weights = weights.slice(-recentCount);
            }

            // Apply exclude high/low method if specified
            if (config.factorMethod === 'exclude-high-low') {
                const filtered = excludeHighLowFactors(factors, weights, config);
                factors = filtered.factors;
                weights = filtered.weights;
            }

            // Remove outliers if specified
            if (config.excludeOutliers && factors.length > 3) {
                const filtered = removeOutliers(factors, weights);
                factors = filtered.factors;
                weights = filtered.weights;
            }

            // Calculate factor based on method
            let developmentFactor;
            switch (config.factorMethod) {
                case 'volume-weighted':
                    developmentFactor = calculateVolumeWeightedAverage(factors, weights);
                    break;
                case 'simple-average':
                case 'exclude-high-low':
                    developmentFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
                    break;
                default:
                    developmentFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
            }

            // Apply smoothing if specified
            if (config.applySmoothing && devFactors[dev - 1]) {
                developmentFactor = (developmentFactor + devFactors[dev - 1]) / 2;
            }

            // Apply override if enabled and beyond override period
            if (config.enableFactorOverride && dev >= config.overridePeriod) {
                devFactors[dev] = config.overrideFactor;
            } else {
                devFactors[dev] = developmentFactor;
            }
        }
    }

    displayDevelopmentFactors(devFactors, config);
}

function removeOutliers(factors, weights) {
    if (factors.length <= 3) return { factors, weights };

    const mean = factors.reduce((sum, f) => sum + f, 0) / factors.length;
    const variance = factors.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / factors.length;
    const stdDev = Math.sqrt(variance);

    const filtered = factors.map((factor, index) => ({
        factor,
        weight: weights[index],
        index
    })).filter(item => Math.abs(item.factor - mean) <= 3 * stdDev);

    return {
        factors: filtered.map(item => item.factor),
        weights: filtered.map(item => item.weight)
    };
}

function calculateVolumeWeightedAverage(factors, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;

    const weightedSum = factors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
    return weightedSum / totalWeight;
}

function excludeHighLowFactors(factors, weights, config) {
    if (factors.length <= 2) return { factors, weights };

    let nValue, mValue;
    const excludeMethod = document.getElementById('exclude-periods-count').value;

    if (excludeMethod === 'custom-exclude') {
        nValue = parseInt(document.getElementById('custom-n-value').value) || 10;
        mValue = parseInt(document.getElementById('custom-m-value').value) || 12;

        // Validate custom values
        if (!validateCustomExcludeValues()) {
            // Fall back to default if validation fails
            nValue = 10;
            mValue = 12;
        }
    } else {
        // Parse predefined options (e.g., "10" means 10 of 12)
        nValue = parseInt(excludeMethod);
        switch (nValue) {
            case 10: mValue = 12; break;
            case 8: mValue = 10; break;
            case 6: mValue = 8; break;
            case 4: mValue = 6; break;
            case 2: mValue = 4; break;
            default: nValue = 10; mValue = 12; break;
        }
    }

    // Use most recent mValue periods
    let workingFactors = factors;
    let workingWeights = weights;

    if (factors.length > mValue) {
        workingFactors = factors.slice(-mValue);
        workingWeights = weights.slice(-mValue);
    }

    if (workingFactors.length < mValue) {
        // Not enough data, use what we have
        mValue = workingFactors.length;
        nValue = Math.max(1, mValue - 2);
    }

    if (workingFactors.length <= 2) {
        return { factors: workingFactors, weights: workingWeights };
    }

    // Create array of factor/weight pairs with indices
    const factorPairs = workingFactors.map((factor, index) => ({
        factor,
        weight: workingWeights[index],
        originalIndex: index
    }));

    // Sort by factor value to identify highest and lowest
    factorPairs.sort((a, b) => a.factor - b.factor);

    // Calculate how many to exclude from each end
    const totalToExclude = mValue - nValue;
    const excludeFromBottom = Math.floor(totalToExclude / 2);
    const excludeFromTop = totalToExclude - excludeFromBottom;

    // Remove the specified number of lowest and highest values
    const startIndex = excludeFromBottom;
    const endIndex = factorPairs.length - excludeFromTop;
    const remainingFactors = factorPairs.slice(startIndex, endIndex);

    return {
        factors: remainingFactors.map(item => item.factor),
        weights: remainingFactors.map(item => item.weight)
    };
}

function displayDevelopmentFactors(devFactors, config) {
    let html = '<div class="dev-factors-info">';
    html += `<h4>Development Factors - ${getFactorMethodDescription()}</h4>`;
    if (config.excludeOutliers) html += '<p><small>Outliers excluded (>3 std dev)</small></p>';
    if (config.applySmoothing) html += '<p><small>Smoothing applied</small></p>';
    html += '</div>';

    html += '<table class="table"><thead><tr><th>Development Period</th><th>Factor</th><th>Method</th></tr></thead><tbody>';
    Object.entries(devFactors).forEach(([period, factor]) => {
        html += `<tr><td>${period} to ${parseInt(period) + 1}</td><td>${factor.toFixed(4)}</td><td>${config.factorMethod}</td></tr>`;
    });
    html += '</tbody></table>';

    document.getElementById('dev-factors').innerHTML = html;
}

function generateReserveProjections(triangle) {
    const projections = {};
    let totalReserve = 0;

    triangle.periods.forEach(period => {
        const paidToDate = Object.values(triangle.matrix[period] || {}).reduce((sum, val) => sum + val, 0);
        const ultimateEstimate = paidToDate * 1.2; // Simple factor for demonstration
        const reserve = Math.max(0, ultimateEstimate - paidToDate);

        projections[period] = {
            paidToDate,
            ultimateEstimate,
            reserve
        };
        totalReserve += reserve;
    });

    let html = '<table class="table"><thead><tr><th>Period</th><th>Paid to Date</th><th>Ultimate Est.</th><th>Reserve</th></tr></thead><tbody>';
    Object.entries(projections).forEach(([period, proj]) => {
        html += `<tr>
            <td>${period}</td>
            <td>${formatCurrency(proj.paidToDate)}</td>
            <td>${formatCurrency(proj.ultimateEstimate)}</td>
            <td>${formatCurrency(proj.reserve)}</td>
        </tr>`;
    });
    html += `<tr class="development-factor"><td><strong>Total</strong></td><td></td><td></td><td><strong>${formatCurrency(totalReserve)}</strong></td></tr>`;
    html += '</tbody></table>';

    document.getElementById('reserve-projections').innerHTML = html;
}

function updateSummaryStatistics(data) {
    const stats = {
        totalClaims: data.length,
        totalPaid: data.reduce((sum, claim) => sum + claim.paidAmount, 0),
        avgClaimSize: data.length > 0 ? data.reduce((sum, claim) => sum + claim.paidAmount, 0) / data.length : 0,
        maxClaimSize: data.length > 0 ? Math.max(...data.map(claim => claim.paidAmount)) : 0,
        minClaimSize: data.length > 0 ? Math.min(...data.map(claim => claim.paidAmount)) : 0
    };

    const html = `
        <div class="stats-grid">
            <div><strong>Total Claims:</strong> ${formatNumber(stats.totalClaims, 0)}</div>
            <div><strong>Total Paid:</strong> ${formatCurrency(stats.totalPaid)}</div>
            <div><strong>Average Claim:</strong> ${formatCurrency(stats.avgClaimSize)}</div>
            <div><strong>Largest Claim:</strong> ${formatCurrency(stats.maxClaimSize)}</div>
            <div><strong>Smallest Claim:</strong> ${formatCurrency(stats.minClaimSize)}</div>
        </div>
    `;

    document.getElementById('summary-stats').innerHTML = html;
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
    csvData = null;
    csvHeaders = [];
    columnMapping = {};
    csvFileInput.value = '';

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
    // Update step indicators
    wizardSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });
    wizardSteps[stepNumber - 1].classList.add('active');

    // Update step content
    wizardStepContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`wizard-step-${stepNumber}`).classList.add('active');
}

function displayCsvPreview() {
    const previewContainer = document.getElementById('csv-preview');

    let html = '<table><thead><tr>';
    csvHeaders.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Show first 5 rows
    const previewRows = csvData.slice(0, 5);
    previewRows.forEach(row => {
        html += '<tr>';
        csvHeaders.forEach(header => {
            html += `<td>${row[header] || ''}</td>`;
        });
        html += '</tr>';
    });

    if (csvData.length > 5) {
        html += `<tr><td colspan="${csvHeaders.length}" style="text-align: center; font-style: italic; color: #6c757d;">... and ${csvData.length - 5} more rows</td></tr>`;
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
        select.innerHTML = selectInfo.id === 'map-delimiter' ?
            '<option value="">None - Use default delimiter</option>' :
            '<option value="">Select column...</option>';

        csvHeaders.forEach(header => {
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
    const delimiterType = document.querySelector('input[name="delimiter-type"]:checked').value;
    const fixedDelimiterInput = document.getElementById('fixed-delimiter');
    const delimiterSelect = document.getElementById('map-delimiter');

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
        if (!select.value) {
            missing.push(select.previousElementSibling.textContent.replace('*', '').trim());
        }
    });

    if (missing.length > 0) {
        alert(`Please map the following required fields: ${missing.join(', ')}`);
        return false;
    }

    return true;
}

function generateImportSummary() {
    const incurredDateCol = document.getElementById('map-incurred-date').value;
    const paidDateCol = document.getElementById('map-paid-date').value;
    const amountCol = document.getElementById('map-amount').value;
    const delimiterType = document.querySelector('input[name="delimiter-type"]:checked').value;
    const delimiterCol = document.getElementById('map-delimiter').value;
    const fixedDelimiter = document.getElementById('fixed-delimiter').value;

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
            <strong>${csvData.length}</strong>
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

    document.getElementById('import-summary').innerHTML = summaryHtml;

    // Generate sample preview
    generateSamplePreview();
}

function generateSamplePreview() {
    const incurredDateCol = document.getElementById('map-incurred-date').value;
    const paidDateCol = document.getElementById('map-paid-date').value;
    const amountCol = document.getElementById('map-amount').value;
    const delimiterType = document.querySelector('input[name="delimiter-type"]:checked').value;
    const delimiterCol = document.getElementById('map-delimiter').value;
    const fixedDelimiter = document.getElementById('fixed-delimiter').value;

    let html = '<table><thead><tr>';
    html += '<th>Incurred Date</th><th>Paid Date</th><th>Amount</th><th>Delimiter</th>';
    html += '</tr></thead><tbody>';

    const sampleRows = csvData.slice(0, 3);
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
    document.getElementById('sample-preview').innerHTML = html;
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

        csvData.forEach((row, index) => {
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
                incurredPeriod: getIncurredPeriod(incurredDate),
                developmentPeriod: getDevelopmentPeriod(incurredDate, paidDate)
            };

            claimsData.push(claim);
            currentDelimiters.add(delimiter);
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
    if (claimsData.length === 0) {
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
        ...claimsData.map(claim => [
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
    const jsonContent = JSON.stringify(claimsData, null, 2);
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
        overrideFactor: 0.00
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

    // Toggle override controls visibility
    const overrideControls = document.querySelector('.factor-override-controls');
    if (overrideControls) {
        overrideControls.style.display = config.enableFactorOverride ? 'block' : 'none';
    }
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
        overrideFactor: parseFloat(document.getElementById('override-factor').value) || 0.00
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

    if (method === 'recent-periods') {
        recentPeriodsConfig.style.display = 'block';
        excludeHighLowConfig.style.display = 'none';
    } else if (method === 'exclude-high-low') {
        recentPeriodsConfig.style.display = 'none';
        excludeHighLowConfig.style.display = 'block';
    } else {
        recentPeriodsConfig.style.display = 'none';
        excludeHighLowConfig.style.display = 'none';
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

function getFactorMethodDescription() {
    const config = currentTriangleConfig || getCurrentConfiguration();
    const method = config.factorMethod;

    switch (method) {
        case 'all-years':
            return 'All Available Data';
        case 'volume-weighted':
            return 'Volume Weighted Average';
        case 'simple-average':
            return 'Simple Average';
        case 'recent-periods':
            return `Recent ${config.recentPeriodsCount} Periods`;
        case 'exclude-high-low':
            return `${config.excludePeriodsCount} of ${config.excludeTotalPeriods} (Exclude High/Low)`;
        default:
            return 'Standard Method';
    }
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

// Method Comparison & Sanity Checks
function generateMethodComparison(triangle, data) {
    if (!triangle || !data || data.length === 0) {
        document.getElementById('method-comparison').innerHTML = '<p class="placeholder">Generate claims triangle to view method comparison.</p>';
        return;
    }

    const allMethods = ['all-years', 'volume-weighted', 'simple-average', 'recent-periods', 'exclude-high-low'];
    const currentMethod = getCurrentConfiguration().factorMethod;
    const comparisons = {};

    // Calculate reserves using all methods
    allMethods.forEach(method => {
        const tempConfig = { ...getCurrentConfiguration(), factorMethod: method };
        const factors = calculateDevelopmentFactorsForMethod(triangle, tempConfig);
        const reserves = calculateReservesFromFactors(triangle, factors);
        comparisons[method] = {
            method: getMethodDescription(method, tempConfig),
            totalReserve: reserves.total,
            factors: factors
        };
    });

    displayMethodComparison(comparisons, currentMethod);
}

function calculateDevelopmentFactorsForMethod(triangle, config) {
    const devFactors = {};

    for (let dev = 1; dev < triangle.maxDevPeriod; dev++) {
        let factors = [];
        let weights = [];

        triangle.periods.forEach(period => {
            const current = triangle.matrix[period] && triangle.matrix[period][dev] ? triangle.matrix[period][dev] : 0;
            const next = triangle.matrix[period] && triangle.matrix[period][dev + 1] ? triangle.matrix[period][dev + 1] : 0;

            if (current > 0 && next > 0) {
                const factor = ((current + next) / current) - 1;
                factors.push(factor);
                weights.push(current);
            }
        });

        if (factors.length > 0) {
            // Apply method-specific filtering
            if (config.factorMethod === 'recent-periods' && config.recentPeriodsCount < factors.length) {
                const recentCount = Math.min(config.recentPeriodsCount, factors.length);
                factors = factors.slice(-recentCount);
                weights = weights.slice(-recentCount);
            }

            if (config.factorMethod === 'exclude-high-low') {
                const filtered = excludeHighLowFactorsForMethod(factors, weights, config);
                factors = filtered.factors;
                weights = filtered.weights;
            }

            // Calculate factor
            let developmentFactor;
            switch (config.factorMethod) {
                case 'volume-weighted':
                    developmentFactor = calculateVolumeWeightedAverage(factors, weights);
                    break;
                default:
                    developmentFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
            }

            // Apply override if enabled and beyond override period
            if (config.enableFactorOverride && dev >= config.overridePeriod) {
                devFactors[dev] = config.overrideFactor;
            } else {
                devFactors[dev] = developmentFactor;
            }
        }
    }

    return devFactors;
}

function excludeHighLowFactorsForMethod(factors, weights, config) {
    // Simplified version for method comparison
    if (factors.length <= 2) return { factors, weights };

    const factorPairs = factors.map((factor, index) => ({
        factor,
        weight: weights[index]
    }));

    factorPairs.sort((a, b) => a.factor - b.factor);
    const excludedFactors = factorPairs.slice(1, -1); // Remove highest and lowest

    return {
        factors: excludedFactors.map(item => item.factor),
        weights: excludedFactors.map(item => item.weight)
    };
}

function calculateReservesFromFactors(triangle, factors) {
    let totalReserve = 0;
    const reserves = {};

    triangle.periods.forEach(period => {
        const paidToDate = Object.values(triangle.matrix[period] || {}).reduce((sum, val) => sum + val, 0);

        // Simple projection using average factor (convert back to cumulative multiplier)
        const avgFactorIncrement = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.values(factors).length || 0.2;
        const ultimateEstimate = paidToDate * (1 + avgFactorIncrement);
        const reserve = Math.max(0, ultimateEstimate - paidToDate);

        reserves[period] = reserve;
        totalReserve += reserve;
    });

    return { total: totalReserve, byPeriod: reserves };
}

function getMethodDescription(method, config) {
    switch (method) {
        case 'all-years':
            return 'All Available Data';
        case 'volume-weighted':
            return 'Volume Weighted Average';
        case 'simple-average':
            return 'Simple Average';
        case 'recent-periods':
            return `Recent ${config.recentPeriodsCount || 12} Periods`;
        case 'exclude-high-low':
            return `${config.excludePeriodsCount || 10} of ${config.excludeTotalPeriods || 12} (Exclude High/Low)`;
        default:
            return method;
    }
}

function displayMethodComparison(comparisons, currentMethod) {
    let html = '<div class="method-comparison-table">';
    html += '<h4>Reserve Calculation Comparison</h4>';
    html += '<table class="table"><thead><tr><th>Method</th><th>Total Reserve</th><th>% Difference</th><th>Status</th></tr></thead><tbody>';

    const currentReserve = comparisons[currentMethod]?.totalReserve || 0;

    Object.entries(comparisons).forEach(([method, data]) => {
        const difference = currentReserve > 0 ? ((data.totalReserve - currentReserve) / currentReserve * 100) : 0;
        const isCurrent = method === currentMethod;
        const status = isCurrent ? 'Current Method' : Math.abs(difference) > 20 ? 'Review Required' : 'Within Range';
        const statusClass = isCurrent ? 'current' : Math.abs(difference) > 20 ? 'warning' : 'normal';

        html += `<tr class="${statusClass}">
            <td>${data.method}</td>
            <td>${formatCurrency(data.totalReserve)}</td>
            <td>${isCurrent ? '-' : formatNumber(difference, 1) + '%'}</td>
            <td><span class="status-${statusClass}">${status}</span></td>
        </tr>`;
    });

    html += '</tbody></table>';

    // Add variance analysis
    const reserves = Object.values(comparisons).map(c => c.totalReserve);
    const avgReserve = reserves.reduce((sum, r) => sum + r, 0) / reserves.length;
    const maxReserve = Math.max(...reserves);
    const minReserve = Math.min(...reserves);
    const variance = ((maxReserve - minReserve) / avgReserve * 100);

    html += '<div class="variance-analysis">';
    html += '<h4>Sanity Check Summary</h4>';
    html += '<div class="variance-grid">';
    html += `<div><strong>Average Reserve:</strong> ${formatCurrency(avgReserve)}</div>`;
    html += `<div><strong>Range:</strong> ${formatCurrency(minReserve)} - ${formatCurrency(maxReserve)}</div>`;
    html += `<div><strong>Variance:</strong> ${formatNumber(variance, 1)}%</div>`;
    html += `<div><strong>Status:</strong> <span class="status-${variance > 30 ? 'warning' : 'normal'}">${variance > 30 ? 'High Variance - Review Required' : 'Acceptable Range'}</span></div>`;
    html += '</div></div>';

    html += '</div>';

    document.getElementById('method-comparison').innerHTML = html;
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
    const methodComparison = generateMethodComparisonData();
    const csvContent = convertMethodComparisonToCSV(methodComparison);

    downloadFile(csvContent, `Method_Comparison_${Date.now()}.csv`, 'text/csv');
    showNotification('Method comparison exported successfully!', 'success');
}

function generateAuditData() {
    const config = getCurrentConfiguration();

    return {
        metadata: {
            exportDate: new Date().toISOString(),
            configuration: config,
            claimsCount: claimsData.length,
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
            methodComparison: generateMethodComparisonData()
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
    const incremental = buildIncrementalTriangle(claimsTriangle);

    return {
        cumulative: cumulative,
        incremental: incremental
    };
}

function buildIncrementalTriangle(data) {
    const config = getCurrentConfiguration();
    const { dateGranularity, developmentMethod } = config;

    const incremental = {};
    const periods = new Set();
    let maxDevPeriod = 0;

    // Build incremental triangle directly from raw data
    data.forEach(claim => {
        const recalculatedIncurredPeriod = getIncurredPeriod(claim.incurredDate, dateGranularity);
        const recalculatedDevelopmentPeriod = getDevelopmentPeriod(claim.incurredDate, claim.paidDate, dateGranularity, developmentMethod);

        periods.add(recalculatedIncurredPeriod);
        maxDevPeriod = Math.max(maxDevPeriod, recalculatedDevelopmentPeriod);

        if (!incremental[recalculatedIncurredPeriod]) {
            incremental[recalculatedIncurredPeriod] = {};
        }
        if (!incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod]) {
            incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod] = 0;
        }
        incremental[recalculatedIncurredPeriod][recalculatedDevelopmentPeriod] += claim.paidAmount;
    });

    const sortedPeriods = Array.from(periods).sort();

    return {
        matrix: incremental,
        periods: sortedPeriods,
        maxDevPeriod: maxDevPeriod
    };
}

function generateMethodComparisonData() {
    const allMethods = ['all-years', 'volume-weighted', 'simple-average', 'recent-periods', 'exclude-high-low'];
    const comparisons = {};

    allMethods.forEach(method => {
        const tempConfig = { ...getCurrentConfiguration(), factorMethod: method };
        const factors = calculateDevelopmentFactorsForMethod(claimsTriangle, tempConfig);
        const reserves = calculateReservesFromFactors(claimsTriangle, factors);
        comparisons[method] = {
            method: getMethodDescription(method, tempConfig),
            totalReserve: reserves.total,
            factors: factors
        };
    });

    return comparisons;
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

function convertMethodComparisonToCSV(comparison) {
    let csv = 'Method,Total Reserve,Calculation Details\n';

    Object.entries(comparison).forEach(([method, data]) => {
        csv += `"${data.method}",${data.totalReserve},"${JSON.stringify(data.factors)}"\n`;
    });

    return csv;
}

function generateDevelopmentFactorsAudit() {
    // Return detailed development factor calculations for audit
    return {
        method: getCurrentConfiguration().factorMethod,
        factors: {}, // Would contain detailed factor calculations
        outliers: [], // Would contain any excluded outliers
        periods: claimsTriangle.periods
    };
}

function generateReserveCalculationsAudit() {
    // Return detailed reserve calculations for audit
    return {
        methodology: 'Chain Ladder',
        assumptions: getCurrentConfiguration(),
        calculations: {}, // Would contain step-by-step calculations
        projections: {} // Would contain ultimate projections
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

// Data Filtering Functions
function applyDataFilters() {
    const startDate = document.getElementById('date-range-start').value;
    const endDate = document.getElementById('date-range-end').value;
    const minAmount = parseFloat(document.getElementById('amount-range-min').value) || 0;
    const maxAmount = parseFloat(document.getElementById('amount-range-max').value) || Infinity;
    const selectedDelimiters = Array.from(document.getElementById('delimiter-filter-input').selectedOptions).map(option => option.value);
    const searchTerm = document.getElementById('search-filter').value.toLowerCase();

    filteredClaimsData = claimsData.filter(claim => {
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

    filteredClaimsData = [];
    updateClaimsTable(claimsData);
    updateFilterResults();
    showNotification('Filters cleared', 'info');
}

function updateFilterResults() {
    const resultElement = document.getElementById('filter-results');
    if (filteredClaimsData.length > 0) {
        resultElement.textContent = `Showing ${filteredClaimsData.length} of ${claimsData.length} claims`;
        resultElement.style.color = '#28a745';
    } else if (filteredClaimsData.length === 0 && claimsData.length > 0) {
        resultElement.textContent = `No claims match current filters`;
        resultElement.style.color = '#dc3545';
    } else {
        resultElement.textContent = '';
    }
}

function initializeFilterDelimiters() {
    const select = document.getElementById('delimiter-filter-input');
    select.innerHTML = '<option value="">All Delimiters</option>';

    Array.from(currentDelimiters).forEach(delimiter => {
        const option = document.createElement('option');
        option.value = delimiter;
        option.textContent = delimiter;
        select.appendChild(option);
    });
}

// Triangle View Toggle Functions
function toggleTriangleView() {
    const viewType = document.querySelector('input[name="triangle-view"]:checked').value;

    if (viewType === 'incremental' && incrementalTriangle) {
        displayTriangle(incrementalTriangle);
    } else if (viewType === 'cumulative' && claimsTriangle) {
        displayTriangle(claimsTriangle);
    }
}

// Enhanced Summary Statistics
function updateSummaryStatistics(data) {
    const stats = calculateEnhancedStatistics(data);
    displayEnhancedStatistics(stats);
}

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

// Enhanced Method Comparison by Development Period
function generateMethodComparison(triangle, data) {
    if (!triangle || !data || data.length === 0) {
        document.getElementById('method-comparison').innerHTML = '<p class="placeholder">Generate claims triangle to view method comparison.</p>';
        return;
    }

    const allMethods = ['all-years', 'volume-weighted', 'simple-average', 'recent-periods', 'exclude-high-low'];
    const currentMethod = getCurrentConfiguration().factorMethod;
    const methodComparisons = {};

    // Calculate development factors for each method and period
    allMethods.forEach(method => {
        const tempConfig = { ...getCurrentConfiguration(), factorMethod: method };
        const factorsByPeriod = calculateDetailedFactorsForMethod(triangle, tempConfig);
        const reservesByPeriod = calculateDetailedReservesFromFactors(triangle, factorsByPeriod);

        methodComparisons[method] = {
            method: getMethodDescription(method, tempConfig),
            factorsByPeriod: factorsByPeriod,
            reservesByPeriod: reservesByPeriod,
            totalReserve: Object.values(reservesByPeriod).reduce((sum, reserve) => sum + reserve.total, 0)
        };
    });

    displayDetailedMethodComparison(methodComparisons, currentMethod, triangle);
}

function calculateDetailedFactorsForMethod(triangle, config) {
    const factorsByPeriod = {};

    for (let dev = 1; dev < triangle.maxDevPeriod; dev++) {
        let factors = [];
        let weights = [];

        triangle.periods.forEach(period => {
            const current = triangle.matrix[period] && triangle.matrix[period][dev] ? triangle.matrix[period][dev] : 0;
            const next = triangle.matrix[period] && triangle.matrix[period][dev + 1] ? triangle.matrix[period][dev + 1] : 0;

            if (current > 0 && next > 0) {
                const factor = ((current + next) / current) - 1;
                factors.push(factor);
                weights.push(current);
            }
        });

        if (factors.length > 0) {
            // Apply method-specific filtering
            if (config.factorMethod === 'recent-periods' && config.recentPeriodsCount < factors.length) {
                const recentCount = Math.min(config.recentPeriodsCount, factors.length);
                factors = factors.slice(-recentCount);
                weights = weights.slice(-recentCount);
            }

            if (config.factorMethod === 'exclude-high-low') {
                const filtered = excludeHighLowFactorsForMethod(factors, weights, config);
                factors = filtered.factors;
                weights = filtered.weights;
            }

            // Calculate factor
            let developmentFactor;
            switch (config.factorMethod) {
                case 'volume-weighted':
                    developmentFactor = calculateVolumeWeightedAverage(factors, weights);
                    break;
                default:
                    developmentFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
            }

            factorsByPeriod[dev] = {
                factor: developmentFactor,
                dataPoints: factors.length,
                rawFactors: factors
            };
        }
    }

    return factorsByPeriod;
}

function calculateDetailedReservesFromFactors(triangle, factorsByPeriod) {
    const reservesByPeriod = {};

    triangle.periods.forEach(period => {
        const paidToDate = Object.values(triangle.matrix[period] || {}).reduce((sum, val) => sum + val, 0);

        // Calculate ultimate estimate for this period
        let ultimateEstimate = paidToDate;
        Object.entries(factorsByPeriod).forEach(([dev, factorData]) => {
            const currentPaid = triangle.matrix[period] && triangle.matrix[period][dev] ? triangle.matrix[period][dev] : 0;
            if (currentPaid > 0) {
                // Convert development factor back to cumulative multiplier (add 1)
                const cumulativeMultiplier = 1 + factorData.factor;
                ultimateEstimate = Math.max(ultimateEstimate, currentPaid * cumulativeMultiplier);
            }
        });

        const reserve = Math.max(0, ultimateEstimate - paidToDate);

        reservesByPeriod[period] = {
            paidToDate: paidToDate,
            ultimateEstimate: ultimateEstimate,
            reserve: reserve,
            total: reserve
        };
    });

    return reservesByPeriod;
}

function displayDetailedMethodComparison(comparisons, currentMethod, triangle) {
    let html = '<div class="detailed-method-comparison">';
    html += '<h4>Development Factor Comparison by Period</h4>';

    // Create table for factor comparison
    html += '<table class="table method-comparison-table"><thead><tr><th>Dev Period</th>';
    Object.keys(comparisons).forEach(method => {
        const isCurrent = method === currentMethod;
        html += `<th class="${isCurrent ? 'current-method' : ''}">${comparisons[method].method}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Add factor rows
    for (let dev = 1; dev < triangle.maxDevPeriod; dev++) {
        html += `<tr><td>Period ${dev} to ${dev + 1}</td>`;
        Object.entries(comparisons).forEach(([method, data]) => {
            const factorData = data.factorsByPeriod[dev];
            const isCurrent = method === currentMethod;
            const factor = factorData ? factorData.factor : 0;
            const dataPoints = factorData ? factorData.dataPoints : 0;

            html += `<td class="${isCurrent ? 'current-method' : ''}">
                ${formatNumber(factor, 4)}<br>
                <small>(${dataPoints} data points)</small>
            </td>`;
        });
        html += '</tr>';
    }
    html += '</tbody></table>';

    // Reserve comparison summary
    html += '<h4>Reserve Comparison Summary</h4>';
    html += '<table class="table"><thead><tr><th>Method</th><th>Total Reserve</th><th>% Difference</th><th>Status</th></tr></thead><tbody>';

    const currentReserve = comparisons[currentMethod]?.totalReserve || 0;

    Object.entries(comparisons).forEach(([method, data]) => {
        const difference = currentReserve > 0 ? ((data.totalReserve - currentReserve) / currentReserve * 100) : 0;
        const isCurrent = method === currentMethod;
        const status = isCurrent ? 'Current Method' : Math.abs(difference) > 20 ? 'Review Required' : 'Within Range';
        const statusClass = isCurrent ? 'current' : Math.abs(difference) > 20 ? 'warning' : 'normal';

        html += `<tr class="${statusClass}">
            <td>${data.method}</td>
            <td>${formatCurrency(data.totalReserve)}</td>
            <td>${isCurrent ? '-' : formatNumber(difference, 1) + '%'}</td>
            <td><span class="status-${statusClass}">${status}</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';

    document.getElementById('method-comparison').innerHTML = html;
}

// Initialize filtering when data is loaded
function initializeDataFiltering() {
    if (claimsData.length > 0) {
        document.getElementById('data-filters').style.display = 'block';
        initializeFilterDelimiters();
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .stats-grid > div {
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);