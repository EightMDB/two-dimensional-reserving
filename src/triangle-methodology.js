// Claims Triangle Methodology - Core Actuarial Calculations
// This module contains all functions specifically related to the chain-ladder methodology
// for claims triangle construction, development factor calculation, and reserve projections

// Global state variables for triangle methodology
// These need to be declared here since this file is loaded first
if (typeof claimsData === 'undefined') {
    var claimsData = [];
}
if (typeof currentDelimiters === 'undefined') {
    var currentDelimiters = new Set();
}
if (typeof claimsTriangle === 'undefined') {
    var claimsTriangle = null;
}
if (typeof incrementalTriangle === 'undefined') {
    var incrementalTriangle = null;
}
if (typeof filteredClaimsData === 'undefined') {
    var filteredClaimsData = [];
}
if (typeof currentTriangleConfig === 'undefined') {
    var currentTriangleConfig = {};
}
if (typeof lastGeneratedConfig === 'undefined') {
    var lastGeneratedConfig = null;
}

// Additional global variables needed by other modules
if (typeof savedConfigurations === 'undefined') {
    var savedConfigurations = {};
}
if (typeof csvData === 'undefined') {
    var csvData = null;
}
if (typeof csvHeaders === 'undefined') {
    var csvHeaders = [];
}
if (typeof columnMapping === 'undefined') {
    var columnMapping = {};
}

// ===== PERIOD CALCULATION FUNCTIONS =====

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

// ===== TRIANGLE CONSTRUCTION FUNCTIONS =====

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
    const selectedDelimiter = document.getElementById('delimiter-filter').value;
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

// ===== ANALYSIS FUNCTIONS =====

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
                const factor = next / current;
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
    html += `<h4>Development Factors - ${getFactorMethodDescription(config)}</h4>`;
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

// ===== METHOD COMPARISON FUNCTIONS =====

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
                const factor = next / current;
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

        // Simple projection using average development factor
        const avgDevelopmentFactor = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.values(factors).length || 1.2;
        const ultimateEstimate = paidToDate * avgDevelopmentFactor;
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

function toggleTriangleView() {
    const viewType = document.querySelector('input[name="triangle-view"]:checked').value;

    if (viewType === 'incremental' && incrementalTriangle) {
        displayTriangle(incrementalTriangle);
    } else if (viewType === 'cumulative' && claimsTriangle) {
        displayTriangle(claimsTriangle);
    }
}

function getFactorMethodDescription(config) {
    if (!config) {
        config = getCurrentConfiguration();
    }

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