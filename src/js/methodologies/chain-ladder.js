/**
 * Chain Ladder Methodology
 * Handles chain ladder analysis functionality
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Chain Ladder module initialized');

        // Initialize event listeners for action cards
        setupActionCardListeners();
    });

    /**
     * Setup event listeners for action cards
     */
    function setupActionCardListeners() {
        const actionCards = document.querySelectorAll('.action-card');

        actionCards.forEach(card => {
            const heading = card.querySelector('h3');
            if (!heading) return;

            const cardText = heading.textContent.trim();

            // Make cards clickable
            card.style.cursor = 'pointer';

            card.addEventListener('click', function() {
                handleActionCardClick(cardText);
            });
        });
    }

    /**
     * Handle action card clicks
     * @param {string} cardTitle - Title of the clicked card
     */
    function handleActionCardClick(cardTitle) {
        console.log('Action card clicked:', cardTitle);

        switch(cardTitle) {
            case 'Start Analysis':
                startAnalysis();
                break;
            case 'Configure Factors':
                configureFacts();
                break;
            case 'Import Triangle':
                importTriangle();
                break;
            case 'View Patterns':
                viewPatterns();
                break;
            case 'Upload Claims Data':
                uploadClaimsData();
                break;
            default:
                console.log('No handler for card:', cardTitle);
        }
    }

    /**
     * Start chain ladder analysis
     */
    function startAnalysis() {
        console.log('Starting chain ladder analysis...');

        // Check if data is available
        if (!window.importedData || !window.importedData.csvData) {
            alert('Please upload claims data first before starting analysis.');
            return;
        }

        const { csvData, mapping } = window.importedData;

        // Validate that we have the required data
        if (!mapping.incurredDate || !mapping.paidDate || !mapping.paidAmount) {
            alert('Missing required column mappings. Please re-upload your data.');
            return;
        }

        // Show analysis configuration wizard
        showAnalysisWizard(csvData, mapping);
    }

    /**
     * Show analysis configuration wizard
     */
    function showAnalysisWizard(csvData, mapping) {
        const wizard = document.getElementById('analysis-wizard');
        const wizardContent = document.getElementById('analysis-wizard-content');

        if (!wizard || !wizardContent) {
            console.error('Analysis wizard elements not found');
            return;
        }

        // Initialize default configuration
        window.analysisConfig = {
            periodLength: 'quarterly',
            factorMethod: 'volume-weighted',
            additionalInfo: {
                showTriangle: true,
                showFactors: true,
                showDiagnostics: false,
                tailFactor: 1.0,
                confidenceInterval: false
            }
        };

        wizardContent.innerHTML = `
            <div class="wizard-container">
                <div class="content-section">
                    <h3 class="section-title"><i class="fas fa-calendar-alt"></i> Period Configuration</h3>
                    <div class="content-card">
                        <div class="form-group">
                            <label for="period-length">Aggregation Period</label>
                            <select id="period-length" class="form-control">
                                <option value="monthly">Monthly (MMM-YYYY)</option>
                                <option value="quarterly" selected>Quarterly (QQ-YYYY)</option>
                                <option value="yearly">Yearly (YYYY)</option>
                            </select>
                            <small>Time period granularity for triangle generation</small>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <h3 class="section-title"><i class="fas fa-calculator"></i> Development Factor Method</h3>
                    <div class="content-card">
                        <div class="form-group">
                            <label for="factor-method">Calculation Method</label>
                            <select id="factor-method" class="form-control">
                                <option value="volume-weighted" selected>Volume Weighted Average</option>
                                <option value="simple-average">Simple Average</option>
                                <option value="medial-average">Medial Average (Exclude High/Low)</option>
                                <option value="geometric-average">Geometric Average</option>
                                <option value="recent-periods">Recent N Periods</option>
                            </select>
                            <small>Method for calculating age-to-age development factors</small>
                        </div>

                        <div class="form-group" id="recent-periods-group" style="display: none;">
                            <label for="recent-n">Number of Recent Periods</label>
                            <input type="number" id="recent-n" class="form-control" value="3" min="1" max="10">
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <h3 class="section-title"><i class="fas fa-info-circle"></i> Additional Information</h3>
                    <div class="content-card">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="show-triangle" checked>
                                <span><i class="fas fa-table"></i> Show Development Triangle</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="show-factors" checked>
                                <span><i class="fas fa-chart-line"></i> Show Development Factors</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="show-diagnostics">
                                <span><i class="fas fa-stethoscope"></i> Show Diagnostic Statistics</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="confidence-interval">
                                <span><i class="fas fa-chart-area"></i> Include Confidence Intervals</span>
                            </label>
                        </div>

                        <div class="form-group" style="margin-top: 1rem;">
                            <label for="tail-factor">Tail Factor</label>
                            <input type="number" id="tail-factor" class="form-control" value="1.000" step="0.001" min="1.000" max="2.000">
                            <small>Ultimate development factor (1.000 = no tail)</small>
                        </div>
                    </div>
                </div>

                <div class="wizard-navigation">
                    <button class="button button-secondary" id="analysis-cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="button button-primary" id="run-analysis">
                        <i class="fas fa-play"></i> Run Analysis
                    </button>
                </div>
            </div>
        `;

        // Show wizard
        wizard.style.display = 'flex';

        // Setup event listeners
        setupAnalysisWizardListeners(csvData, mapping);
    }

    /**
     * Setup analysis wizard event listeners
     */
    function setupAnalysisWizardListeners(csvData, mapping) {
        // Close button
        document.getElementById('analysis-wizard-close-btn').addEventListener('click', closeAnalysisWizard);
        document.getElementById('analysis-cancel').addEventListener('click', closeAnalysisWizard);

        // Factor method change
        document.getElementById('factor-method').addEventListener('change', function() {
            const recentGroup = document.getElementById('recent-periods-group');
            if (this.value === 'recent-periods') {
                recentGroup.style.display = 'block';
            } else {
                recentGroup.style.display = 'none';
            }
        });

        // Run analysis button
        document.getElementById('run-analysis').addEventListener('click', function() {
            // Gather configuration
            window.analysisConfig = {
                periodLength: document.getElementById('period-length').value,
                factorMethod: document.getElementById('factor-method').value,
                recentN: parseInt(document.getElementById('recent-n').value) || 3,
                additionalInfo: {
                    showTriangle: document.getElementById('show-triangle').checked,
                    showFactors: document.getElementById('show-factors').checked,
                    showDiagnostics: document.getElementById('show-diagnostics').checked,
                    tailFactor: parseFloat(document.getElementById('tail-factor').value) || 1.0,
                    confidenceInterval: document.getElementById('confidence-interval').checked
                }
            };

            console.log('Analysis configuration:', window.analysisConfig);

            // Close wizard
            closeAnalysisWizard();

            // Run analysis with configuration
            runAnalysisWithConfig(csvData, mapping, window.analysisConfig);
        });
    }

    /**
     * Close analysis wizard
     */
    function closeAnalysisWizard() {
        const wizard = document.getElementById('analysis-wizard');
        if (wizard) {
            wizard.style.display = 'none';
        }
    }

    /**
     * Run analysis with configuration
     */
    function runAnalysisWithConfig(csvData, mapping, config) {
        // Step 1: Create triangles
        const triangle = createTriangle(csvData.rows, mapping, config);

        // Step 2: Calculate development factors
        const developmentFactors = calculateDevelopmentFactors(triangle, config);

        // Step 3: Calculate ultimate values
        const ultimates = calculateUltimates(triangle, developmentFactors, config);

        // Step 4: Calculate reserves and credibility
        const results = calculateReservesAndCredibility(triangle, ultimates, developmentFactors);

        // Step 5: Display results table
        displayResultsTable(results, triangle, developmentFactors, config);
    }

    /**
     * Create development triangle from claims data
     */
    function createTriangle(rows, mapping, config = {periodLength: 'quarterly'}) {
        const triangle = {};

        rows.forEach(row => {
            const incurredDate = new Date(row[mapping.incurredDate]);
            const paidDate = new Date(row[mapping.paidDate]);
            const paidAmount = parseFloat(row[mapping.paidAmount]) || 0;

            if (isNaN(incurredDate.getTime()) || isNaN(paidDate.getTime())) {
                return; // Skip invalid dates
            }

            const incurredYear = incurredDate.getFullYear();
            const incurredQuarter = Math.floor(incurredDate.getMonth() / 3) + 1;
            const incurredPeriod = `${incurredYear}-Q${incurredQuarter}`;

            // Calculate development period (in quarters)
            const monthsDiff = (paidDate.getFullYear() - incurredDate.getFullYear()) * 12
                             + (paidDate.getMonth() - incurredDate.getMonth());
            const devPeriod = Math.floor(monthsDiff / 3);

            if (!triangle[incurredPeriod]) {
                triangle[incurredPeriod] = {};
            }

            if (!triangle[incurredPeriod][devPeriod]) {
                triangle[incurredPeriod][devPeriod] = 0;
            }

            triangle[incurredPeriod][devPeriod] += paidAmount;
        });

        // Convert to cumulative
        Object.keys(triangle).forEach(period => {
            let cumulative = 0;
            const maxDev = Math.max(...Object.keys(triangle[period]).map(Number));
            for (let i = 0; i <= maxDev; i++) {
                cumulative += triangle[period][i] || 0;
                triangle[period][i] = cumulative;
            }
        });

        console.log('Triangle created:', triangle);
        return triangle;
    }

    /**
     * Calculate age-to-age development factors
     */
    function calculateDevelopmentFactors(triangle, config = {factorMethod: 'volume-weighted'}) {
        const factors = {};
        const periods = Object.keys(triangle).sort();

        // Find max development period
        let maxDevPeriod = 0;
        periods.forEach(period => {
            const devPeriods = Object.keys(triangle[period]).map(Number);
            maxDevPeriod = Math.max(maxDevPeriod, ...devPeriods);
        });

        // Calculate factors for each development period
        for (let dev = 0; dev < maxDevPeriod; dev++) {
            let sumFrom = 0;
            let sumTo = 0;

            periods.forEach(period => {
                const fromValue = triangle[period][dev];
                const toValue = triangle[period][dev + 1];

                if (fromValue && toValue && fromValue > 0) {
                    sumFrom += fromValue;
                    sumTo += toValue;
                }
            });

            factors[dev] = sumFrom > 0 ? sumTo / sumFrom : 1.0;
        }

        console.log('Development factors:', factors);
        return factors;
    }

    /**
     * Calculate ultimate values using chain ladder
     */
    function calculateUltimates(triangle, factors, config = {additionalInfo: {tailFactor: 1.0}}) {
        const ultimates = {};

        Object.keys(triangle).forEach(period => {
            const devPeriods = Object.keys(triangle[period]).map(Number);
            const latestDev = Math.max(...devPeriods);
            let ultimate = triangle[period][latestDev];

            // Apply remaining development factors
            for (let dev = latestDev; dev < 100; dev++) {
                if (factors[dev] && factors[dev] > 1.001) {
                    ultimate *= factors[dev];
                } else {
                    // Check if factor is <= 1.001 for 3+ consecutive periods
                    let consecutiveSmall = 0;
                    for (let i = dev; i < dev + 10; i++) {
                        if (factors[i] && factors[i] <= 1.001) {
                            consecutiveSmall++;
                        } else {
                            break;
                        }
                    }
                    if (consecutiveSmall >= 3) {
                        break; // Stop development
                    }
                }
            }

            ultimates[period] = ultimate;
        });

        console.log('Ultimates:', ultimates);
        return ultimates;
    }

    /**
     * Calculate reserves and credibility
     */
    function calculateReservesAndCredibility(triangle, ultimates, factors) {
        const results = [];
        const sortedPeriods = Object.keys(triangle).sort();

        // Get the most recent period to calculate lag
        const mostRecentPeriod = sortedPeriods[sortedPeriods.length - 1];

        sortedPeriods.forEach(period => {
            const devPeriods = Object.keys(triangle[period]).map(Number);
            const latestDev = Math.max(...devPeriods);
            const paid = triangle[period][latestDev];
            const ultimate = ultimates[period];
            const reserve = ultimate - paid;

            // Calculate credibility as percent developed
            const credibility = ultimate > 0 ? (paid / ultimate) : 1.0;

            // Calculate lag (quarters from period to most recent period)
            const lag = calculateLagQuarters(period, mostRecentPeriod);

            // Only include if reserve > 0
            if (reserve > 0) {
                results.push({
                    period: period,
                    lag: lag,
                    paid: paid,
                    ultimate: ultimate,
                    reserve: reserve,
                    credibility: credibility
                });
            }
        });

        console.log('Results:', results);
        return results;
    }

    /**
     * Calculate lag in quarters between two periods
     */
    function calculateLagQuarters(fromPeriod, toPeriod) {
        const [fromYear, fromQ] = fromPeriod.split('-Q').map(Number);
        const [toYear, toQ] = toPeriod.split('-Q').map(Number);

        return (toYear - fromYear) * 4 + (toQ - fromQ);
    }

    /**
     * Display results in a table
     */
    function displayResultsTable(results, triangle = null, factors = null, config = null) {
        const previewContainer = document.getElementById('data-preview-container');
        if (!previewContainer) {
            console.error('Preview container not found');
            return;
        }

        if (results.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <h3>No Reserves Required</h3>
                    <p>All periods have fully developed (reserve = 0)</p>
                </div>
            `;
            return;
        }

        const totalPaid = results.reduce((sum, r) => sum + r.paid, 0);
        const totalUltimate = results.reduce((sum, r) => sum + r.ultimate, 0);
        const totalReserve = results.reduce((sum, r) => sum + r.reserve, 0);

        const tableHTML = `
            <div class="data-preview-header">
                <div>
                    <h3><i class="fas fa-chart-line" style="color: var(--primary);"></i> Chain Ladder Analysis Results</h3>
                    <p>${results.length} periods with reserves</p>
                </div>
            </div>
            <div class="preview-table-container">
                <table class="wizard-preview-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Lag</th>
                            <th>Paid</th>
                            <th>Ultimate</th>
                            <th>Reserve</th>
                            <th>Credibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr>
                                <td><strong>${r.period}</strong></td>
                                <td>${r.lag}</td>
                                <td>$${r.paid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td>$${r.ultimate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td>$${r.reserve.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td>${(r.credibility * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                        <tr style="font-weight: bold; background-color: var(--bg-secondary);">
                            <td>TOTAL</td>
                            <td>-</td>
                            <td>$${totalPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>$${totalUltimate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>$${totalReserve.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>${totalUltimate > 0 ? ((totalPaid / totalUltimate) * 100).toFixed(1) : 0}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        previewContainer.innerHTML = tableHTML;
    }

    /**
     * Configure development factors
     */
    function configureFacts() {
        console.log('Configuring development factors...');

        // Scroll to configuration section
        const configSection = document.getElementById('configuration');
        if (configSection) {
            configSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Import triangle data
     */
    function importTriangle() {
        console.log('Importing triangle...');

        // Trigger the upload wizard
        uploadClaimsData();
    }

    /**
     * View development patterns
     */
    function viewPatterns() {
        console.log('Viewing development patterns...');

        // Check if triangle has been generated
        if (!window.chainLadderState || !window.chainLadderState.triangle) {
            alert('Please generate a triangle first before viewing patterns.');
            return;
        }

        // Scroll to triangle section
        const triangleSection = document.getElementById('triangle');
        if (triangleSection) {
            triangleSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Upload claims data - triggers the upload wizard
     */
    function uploadClaimsData() {
        console.log('Uploading claims data...');

        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) {
            fileInput.click();
        } else {
            console.error('File input not found');
        }
    }

    // Export functions for external use
    window.chainLadder = {
        startAnalysis: startAnalysis,
        configureFacts: configureFacts,
        importTriangle: importTriangle,
        viewPatterns: viewPatterns,
        uploadClaimsData: uploadClaimsData
    };

})();
