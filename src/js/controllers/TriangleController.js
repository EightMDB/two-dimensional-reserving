/**
 * Triangle Controller
 * Manages triangle generation and configuration
 */

import { appState } from '../state/AppState.js';

export class TriangleController {
    constructor(services) {
        this.calculationService = services.calculation;
        this.initialized = false;
    }

    /**
     * Initialize the triangle controller
     */
    async init() {
        console.log('🔺 TriangleController initialized');
        this.initialized = true;
    }

    /**
     * Generate claims triangle
     * @param {Object} config - Triangle configuration
     * @returns {Promise<Object>} Triangle generation result
     */
    async generateTriangle(config = null) {
        try {
            appState.set('isLoading', true);

            const claimsData = appState.get('filteredClaimsData');
            if (!claimsData || claimsData.length === 0) {
                throw new Error('No claims data available for triangle generation');
            }

            console.log(`🔺 Generating triangle with ${claimsData.length} claims...`);

            // Use provided config or current state
            const triangleConfig = config || appState.get('triangleConfig');

            // Perform complete triangle analysis
            const results = await this.calculationService.performTriangleAnalysis(claimsData, triangleConfig);

            // Update application state
            appState.update({
                claimsTriangle: results.triangle,
                developmentFactors: results.factors,
                reserveProjections: results.projections,
                analysisResults: results.analysis
            });

            console.log('✅ Triangle generated successfully');

            return {
                success: true,
                triangle: results.triangle,
                factors: results.factors,
                projections: results.projections
            };

        } catch (error) {
            console.error('❌ Triangle generation failed:', error);
            throw error;
        } finally {
            appState.set('isLoading', false);
        }
    }

    /**
     * Update triangle configuration
     * @param {Object} newConfig - New configuration values
     */
    updateConfiguration(newConfig) {
        const currentConfig = appState.get('triangleConfig');
        const updatedConfig = { ...currentConfig, ...newConfig };

        // Validate configuration
        const validation = this.calculationService.validateConfiguration ?
            this.calculationService.validateConfiguration(updatedConfig) :
            { valid: true, sanitized: updatedConfig };

        if (validation.valid) {
            appState.set('triangleConfig', validation.sanitized);
            console.log('⚙️ Triangle configuration updated');
        } else {
            console.warn('⚠️ Invalid configuration:', validation.errors);
            throw new Error('Invalid configuration: ' + validation.errors.join(', '));
        }
    }

    /**
     * Get current triangle data
     * @returns {Object|null} Current triangle data
     */
    getCurrentTriangle() {
        return appState.get('claimsTriangle');
    }

    /**
     * Get development factors
     * @returns {Object} Development factors
     */
    getDevelopmentFactors() {
        return appState.get('developmentFactors') || {};
    }

    /**
     * Get reserve projections
     * @returns {Object} Reserve projections
     */
    getReserveProjections() {
        return appState.get('reserveProjections') || {};
    }

    /**
     * Clear triangle data
     */
    clearTriangle() {
        appState.update({
            claimsTriangle: null,
            developmentFactors: {},
            reserveProjections: {},
            analysisResults: {}
        });
        console.log('🧹 Triangle data cleared');
    }
}