/**
 * Calculation Service
 * Core actuarial calculations for chain-ladder methodology
 * Based on the original triangle-methodology.js but modularized
 */

import { appState } from '../state/AppState.js';

export class CalculationService {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the calculation service
     */
    async init() {
        console.log('🧮 CalculationService initialized');
        this.initialized = true;
    }

    /**
     * Get incurred period from date based on granularity
     * @param {string} incurredDate - ISO date string
     * @param {string} granularity - 'monthly', 'quarterly', or 'annual'
     * @returns {string} Period identifier
     */
    getIncurredPeriod(incurredDate, granularity = 'quarterly') {
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

    /**
     * Get development period from incurred and paid dates
     * @param {string} incurredDate - ISO date string
     * @param {string} paidDate - ISO date string
     * @param {string} granularity - 'monthly', 'quarterly', or 'annual'
     * @param {string} method - 'lag' or 'calendar'
     * @returns {number} Development period number
     */
    getDevelopmentPeriod(incurredDate, paidDate, granularity = 'quarterly', method = 'lag') {
        const incurred = new Date(incurredDate);
        const paid = new Date(paidDate);

        if (method === 'lag') {
            // Time since incurred
            const diffMonths = (paid.getFullYear() - incurred.getFullYear()) * 12 +
                             (paid.getMonth() - incurred.getMonth());

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
            // Calendar period method
            const incurredPeriod = this.getIncurredPeriod(incurredDate, granularity);
            const paidPeriod = this.getIncurredPeriod(paidDate, granularity);

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
        }

        return 1;
    }

    /**
     * Build development triangle from claims data
     * @param {Array} data - Array of validated claim records
     * @param {Object} config - Triangle configuration
     * @returns {Object} Triangle data structure
     */
    buildTriangleMatrix(data, config = null) {
        const currentConfig = config || appState.get('triangleConfig');
        const { dateGranularity, developmentMethod } = currentConfig;

        console.log(`🔺 Building triangle with ${data.length} claims...`);

        // Build incremental triangle first
        const incremental = {};
        const periods = new Set();
        let maxDevPeriod = 0;

        // Process each claim
        data.forEach((claim, index) => {
            try {
                const incurredPeriod = this.getIncurredPeriod(claim.incurredDate, dateGranularity);
                const developmentPeriod = this.getDevelopmentPeriod(
                    claim.incurredDate,
                    claim.paidDate,
                    dateGranularity,
                    developmentMethod
                );

                periods.add(incurredPeriod);
                maxDevPeriod = Math.max(maxDevPeriod, developmentPeriod);

                // Initialize period if needed
                if (!incremental[incurredPeriod]) {
                    incremental[incurredPeriod] = {};
                }

                // Initialize development period if needed
                if (!incremental[incurredPeriod][developmentPeriod]) {
                    incremental[incurredPeriod][developmentPeriod] = 0;
                }

                // Add paid amount
                incremental[incurredPeriod][developmentPeriod] += parseFloat(claim.paidAmount);

            } catch (error) {
                console.warn(`Failed to process claim ${index}:`, error);
            }
        });

        // Convert periods set to sorted array
        const sortedPeriods = Array.from(periods).sort((a, b) => {
            // Custom sorting logic based on granularity
            return this.comparePeriods(a, b, dateGranularity);
        });

        // Build cumulative triangle
        const cumulative = {};
        sortedPeriods.forEach(period => {
            cumulative[period] = {};
            let runningTotal = 0;

            for (let dev = 1; dev <= maxDevPeriod; dev++) {
                const incrementalValue = incremental[period][dev] || 0;
                runningTotal += incrementalValue;
                cumulative[period][dev] = runningTotal;
            }
        });

        const result = {
            matrix: cumulative,
            incremental: incremental,
            periods: sortedPeriods,
            maxDevPeriod,
            config: currentConfig,
            metadata: {
                totalClaims: data.length,
                totalAmount: Object.values(cumulative).reduce((sum, periodData) => {
                    const maxDev = Math.max(...Object.keys(periodData).map(Number));
                    return sum + (periodData[maxDev] || 0);
                }, 0),
                generatedAt: new Date().toISOString()
            }
        };

        console.log(`✓ Triangle built: ${sortedPeriods.length} periods, ${maxDevPeriod} dev periods`);
        return result;
    }

    /**
     * Compare two period identifiers for sorting
     * @param {string} a - First period
     * @param {string} b - Second period
     * @param {string} granularity - Period granularity
     * @returns {number} Comparison result
     */
    comparePeriods(a, b, granularity) {
        if (granularity === 'annual') {
            return parseInt(a) - parseInt(b);
        } else if (granularity === 'quarterly') {
            const [qA, yearA] = a.split('-');
            const [qB, yearB] = b.split('-');
            const numA = parseInt(yearA) * 4 + parseInt(qA.replace('Q', ''));
            const numB = parseInt(yearB) * 4 + parseInt(qB.replace('Q', ''));
            return numA - numB;
        } else if (granularity === 'monthly') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const [monthA, yearA] = a.split('-');
            const [monthB, yearB] = b.split('-');
            const numA = parseInt(yearA) * 12 + monthNames.indexOf(monthA);
            const numB = parseInt(yearB) * 12 + monthNames.indexOf(monthB);
            return numA - numB;
        }
        return a.localeCompare(b);
    }

    /**
     * Calculate development factors from triangle
     * @param {Object} triangle - Triangle data structure
     * @param {Object} config - Calculation configuration
     * @returns {Object} Development factors by period
     */
    calculateDevelopmentFactors(triangle, config = null) {
        const currentConfig = config || appState.get('triangleConfig');
        const { factorMethod, excludeOutliers, applySmoothing } = currentConfig;

        console.log('📊 Calculating development factors...');

        const factorsByPeriod = {};
        const { matrix, periods, maxDevPeriod } = triangle;

        // Calculate factors for each development period
        for (let dev = 1; dev < maxDevPeriod; dev++) {
            const factors = [];
            const weights = [];
            const observations = [];

            // Collect all available factor observations for this development period
            periods.forEach(period => {
                const current = matrix[period][dev];
                const next = matrix[period][dev + 1];

                if (current && current > 0 && next && next > 0) {
                    const factor = next / current;
                    factors.push(factor);
                    weights.push(current);
                    observations.push({
                        period,
                        current,
                        next,
                        factor
                    });
                }
            });

            if (factors.length === 0) {
                console.warn(`No factors available for development period ${dev} to ${dev + 1}`);
                continue;
            }

            // Apply outlier exclusion if enabled
            let processedFactors = factors;
            let processedWeights = weights;

            if (excludeOutliers && factors.length > 3) {
                const outlierResult = this.removeOutliers(factors, weights);
                processedFactors = outlierResult.factors;
                processedWeights = outlierResult.weights;
            }

            // Calculate factor based on method
            let developmentFactor;
            switch (factorMethod) {
                case 'simple-average':
                    developmentFactor = processedFactors.reduce((sum, f) => sum + f, 0) / processedFactors.length;
                    break;

                case 'volume-weighted':
                    const totalWeight = processedWeights.reduce((sum, w) => sum + w, 0);
                    const weightedSum = processedFactors.reduce((sum, factor, index) =>
                        sum + factor * processedWeights[index], 0);
                    developmentFactor = weightedSum / totalWeight;
                    break;

                case 'recent-periods':
                    const recentCount = Math.min(currentConfig.recentPeriodsCount || 3, processedFactors.length);
                    const recentFactors = processedFactors.slice(-recentCount);
                    developmentFactor = recentFactors.reduce((sum, f) => sum + f, 0) / recentFactors.length;
                    break;

                case 'exclude-high-low':
                    if (processedFactors.length > 2) {
                        const excludeCount = currentConfig.excludeHighLowCount || 1;
                        const sortedFactors = [...processedFactors].sort((a, b) => a - b);
                        const trimmedFactors = sortedFactors.slice(excludeCount, -excludeCount);
                        developmentFactor = trimmedFactors.reduce((sum, f) => sum + f, 0) / trimmedFactors.length;
                    } else {
                        developmentFactor = processedFactors.reduce((sum, f) => sum + f, 0) / processedFactors.length;
                    }
                    break;

                default:
                    developmentFactor = processedFactors.reduce((sum, f) => sum + f, 0) / processedFactors.length;
            }

            // Apply smoothing if enabled
            if (applySmoothing && factorsByPeriod[dev - 1]) {
                const previousFactor = factorsByPeriod[dev - 1].factor;
                developmentFactor = (developmentFactor + previousFactor) / 2;
            }

            // Apply factor override if configured
            if (currentConfig.enableFactorOverride && dev >= currentConfig.overridePeriod) {
                developmentFactor = currentConfig.overrideFactor;
            }

            // Store factor with metadata
            factorsByPeriod[dev] = {
                fromPeriod: dev,
                toPeriod: dev + 1,
                factor: developmentFactor,
                observations: observations.length,
                method: factorMethod,
                rawFactors: factors,
                processedFactors,
                weights: processedWeights,
                statistics: this.calculateFactorStatistics(processedFactors)
            };
        }

        // Calculate tail factor (ultimate factor)
        if (maxDevPeriod > 1) {
            const tailFactor = this.calculateTailFactor(factorsByPeriod, currentConfig);
            factorsByPeriod[maxDevPeriod] = tailFactor;
        }

        console.log(`✓ Calculated ${Object.keys(factorsByPeriod).length} development factors`);
        return factorsByPeriod;
    }

    /**
     * Remove statistical outliers from factors
     * @param {Array} factors - Factor values
     * @param {Array} weights - Weight values
     * @returns {Object} Filtered factors and weights
     */
    removeOutliers(factors, weights) {
        if (factors.length <= 3) {
            return { factors, weights };
        }

        const mean = factors.reduce((sum, f) => sum + f, 0) / factors.length;
        const variance = factors.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / factors.length;
        const stdDev = Math.sqrt(variance);

        const filtered = [];
        const filteredWeights = [];

        factors.forEach((factor, index) => {
            const zScore = Math.abs(factor - mean) / stdDev;
            if (zScore <= 3) { // Keep values within 3 standard deviations
                filtered.push(factor);
                filteredWeights.push(weights[index]);
            }
        });

        return {
            factors: filtered.length > 0 ? filtered : factors,
            weights: filteredWeights.length > 0 ? filteredWeights : weights
        };
    }

    /**
     * Calculate statistical measures for factors
     * @param {Array} factors - Factor values
     * @returns {Object} Statistical measures
     */
    calculateFactorStatistics(factors) {
        if (!factors || factors.length === 0) {
            return {};
        }

        const sorted = [...factors].sort((a, b) => a - b);
        const mean = factors.reduce((sum, f) => sum + f, 0) / factors.length;
        const variance = factors.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / factors.length;

        return {
            count: factors.length,
            mean,
            median: sorted[Math.floor(sorted.length / 2)],
            min: sorted[0],
            max: sorted[sorted.length - 1],
            standardDeviation: Math.sqrt(variance),
            coefficientOfVariation: mean !== 0 ? Math.sqrt(variance) / mean : 0
        };
    }

    /**
     * Calculate tail factor for ultimate development
     * @param {Object} factorsByPeriod - Calculated development factors
     * @param {Object} config - Configuration
     * @returns {Object} Tail factor specification
     */
    calculateTailFactor(factorsByPeriod, config) {
        // Simple approach: use the last few factors to estimate tail
        const factors = Object.values(factorsByPeriod)
            .filter(f => f.factor > 0)
            .map(f => f.factor)
            .slice(-3); // Use last 3 factors

        let tailFactor = 1.0;

        if (factors.length > 0) {
            // Simple approach: average of factors approaching 1.0
            const avgFactor = factors.reduce((sum, f) => sum + f, 0) / factors.length;

            // Tail factor should approach 1.0
            if (avgFactor > 1.05) {
                tailFactor = Math.max(1.01, avgFactor * 0.5);
            } else {
                tailFactor = Math.max(1.0, avgFactor);
            }
        }

        return {
            fromPeriod: Object.keys(factorsByPeriod).length,
            toPeriod: 'Ultimate',
            factor: tailFactor,
            method: 'tail_estimate',
            observations: factors.length,
            note: 'Estimated tail factor for ultimate development'
        };
    }

    /**
     * Generate reserve projections using development factors
     * @param {Object} triangle - Triangle data
     * @param {Object} factors - Development factors
     * @param {Object} config - Configuration
     * @returns {Object} Reserve projections
     */
    generateReserveProjections(triangle, factors, config = null) {
        console.log('💰 Generating reserve projections...');

        const projections = {};
        const { matrix, periods } = triangle;
        let totalUltimate = 0;
        let totalPaidToDate = 0;
        let totalReserve = 0;

        periods.forEach(period => {
            const periodData = matrix[period];
            if (!periodData) return;

            // Find the latest non-zero development period for this period
            let latestDev = 0;
            let paidToDate = 0;

            Object.keys(periodData).forEach(dev => {
                const devNum = parseInt(dev);
                if (periodData[dev] > 0 && devNum > latestDev) {
                    latestDev = devNum;
                    paidToDate = periodData[dev];
                }
            });

            if (latestDev === 0 || paidToDate === 0) {
                return; // Skip periods with no data
            }

            // Calculate ultimate estimate by applying remaining factors
            let ultimateEstimate = paidToDate;

            // Apply all remaining development factors
            for (let dev = latestDev; dev < Object.keys(factors).length; dev++) {
                const factor = factors[dev + 1];
                if (factor && factor.factor > 0) {
                    ultimateEstimate *= factor.factor;
                }
            }

            // Calculate reserve (ultimate - paid to date)
            const reserve = Math.max(0, ultimateEstimate - paidToDate);

            projections[period] = {
                period,
                paidToDate,
                ultimateEstimate,
                reserve,
                latestDevPeriod: latestDev,
                developmentToDate: latestDev / Object.keys(factors).length,
                percentDeveloped: (paidToDate / ultimateEstimate) * 100
            };

            totalPaidToDate += paidToDate;
            totalUltimate += ultimateEstimate;
            totalReserve += reserve;
        });

        const summary = {
            totalPaidToDate,
            totalUltimate,
            totalReserve,
            averagePercentDeveloped: totalPaidToDate / totalUltimate * 100,
            projectionsByPeriod: projections,
            metadata: {
                calculatedAt: new Date().toISOString(),
                factorsUsed: Object.keys(factors).length,
                periodsProjected: Object.keys(projections).length
            }
        };

        console.log(`✓ Generated projections for ${Object.keys(projections).length} periods`);
        console.log(`  Total Reserve: ${totalReserve.toLocaleString()}`);

        return summary;
    }

    /**
     * Perform comprehensive triangle analysis
     * @param {Array} claimsData - Validated claims data
     * @param {Object} config - Analysis configuration
     * @returns {Promise<Object>} Complete analysis results
     */
    async performTriangleAnalysis(claimsData, config = null) {
        try {
            console.log('🔍 Starting comprehensive triangle analysis...');

            // Build triangle
            const triangle = this.buildTriangleMatrix(claimsData, config);

            // Calculate development factors
            const factors = this.calculateDevelopmentFactors(triangle, config);

            // Generate projections
            const projections = this.generateReserveProjections(triangle, factors, config);

            // Prepare comprehensive results
            const results = {
                triangle,
                factors,
                projections,
                analysis: {
                    totalClaims: claimsData.length,
                    analysisDate: new Date().toISOString(),
                    configuration: config || appState.get('triangleConfig'),
                    methodology: 'Chain Ladder',
                    dataQuality: this.assessDataQuality(claimsData, triangle)
                }
            };

            console.log('✅ Triangle analysis completed successfully');
            return results;

        } catch (error) {
            console.error('❌ Triangle analysis failed:', error);
            throw new Error(`Triangle analysis failed: ${error.message}`);
        }
    }

    /**
     * Assess data quality for the analysis
     * @param {Array} claimsData - Original claims data
     * @param {Object} triangle - Built triangle
     * @returns {Object} Data quality assessment
     */
    assessDataQuality(claimsData, triangle) {
        const assessment = {
            dataCompleteness: 'Good',
            triangleShape: 'Regular',
            observations: [],
            score: 0
        };

        // Check data volume
        if (claimsData.length < 100) {
            assessment.observations.push('Limited data volume may affect reliability');
            assessment.score -= 10;
        } else if (claimsData.length > 10000) {
            assessment.observations.push('Large dataset provides good statistical basis');
            assessment.score += 10;
        }

        // Check triangle completeness
        const { matrix, periods, maxDevPeriod } = triangle;
        let totalCells = 0;
        let populatedCells = 0;

        periods.forEach(period => {
            for (let dev = 1; dev <= maxDevPeriod; dev++) {
                totalCells++;
                if (matrix[period] && matrix[period][dev] > 0) {
                    populatedCells++;
                }
            }
        });

        const completeness = populatedCells / totalCells;
        if (completeness > 0.7) {
            assessment.dataCompleteness = 'Excellent';
            assessment.score += 15;
        } else if (completeness > 0.5) {
            assessment.dataCompleteness = 'Good';
            assessment.score += 5;
        } else {
            assessment.dataCompleteness = 'Limited';
            assessment.observations.push('Sparse triangle may reduce projection accuracy');
            assessment.score -= 15;
        }

        // Normalize score to 0-100
        assessment.score = Math.max(0, Math.min(100, 70 + assessment.score));

        return assessment;
    }
}