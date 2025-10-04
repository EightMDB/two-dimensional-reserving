/**
 * State Management Utilities and Reactive Updates
 * Two Dimensional Reserving - Professional Actuarial Claims Triangle Analysis
 */

import { appState } from './AppState.js';

export class StateManager {
    constructor() {
        this.subscriptions = [];
        this.debounceTimers = new Map();
        this.setupStateListeners();
    }

    /**
     * Initialize core state change listeners
     */
    setupStateListeners() {
        // Data changes
        this.subscribe('claimsData', this.handleClaimsDataChange.bind(this));
        this.subscribe('filteredClaimsData', this.handleFilteredDataChange.bind(this));

        // Configuration changes
        this.subscribe('triangleConfig.*', this.handleConfigChange.bind(this));

        // UI state changes
        this.subscribe('currentTab', this.handleTabChange.bind(this));
        this.subscribe('isLoading', this.handleLoadingChange.bind(this));

        // Triangle changes
        this.subscribe('claimsTriangle', this.handleTriangleChange.bind(this));
        this.subscribe('developmentFactors', this.handleFactorsChange.bind(this));
    }

    /**
     * Subscribe to state changes with automatic cleanup
     */
    subscribe(path, callback, options = {}) {
        const { debounce = 0, immediate = false } = options;

        let actualCallback = callback;

        // Add debouncing if requested
        if (debounce > 0) {
            actualCallback = this.debounce(callback, debounce, path);
        }

        const unsubscribe = appState.subscribe(path, actualCallback);
        this.subscriptions.push(unsubscribe);

        // Call immediately with current value if requested
        if (immediate) {
            const currentValue = appState.get(path);
            callback(currentValue, undefined, path);
        }

        return unsubscribe;
    }

    /**
     * Debounce function calls
     */
    debounce(func, delay, key) {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Handle claims data changes
     */
    handleClaimsDataChange(newData, oldData) {
        console.log(`Claims data updated: ${newData.length} records`);

        // Update summary statistics
        this.updateDataSummary(newData);

        // Update delimiter options
        this.updateDelimiterOptions(newData);

        // Clear triangle if data changed significantly
        if (this.shouldClearTriangle(newData, oldData)) {
            appState.set('claimsTriangle', null, false);
            appState.set('developmentFactors', {}, false);
            appState.set('reserveProjections', {}, false);
        }
    }

    /**
     * Handle filtered data changes
     */
    handleFilteredDataChange(filteredData, oldData) {
        console.log(`Filtered data updated: ${filteredData.length} records`);

        // Update filtered summary
        this.updateFilteredSummary(filteredData);

        // Emit event for views that need to update
        this.emitEvent('filteredDataChanged', { data: filteredData });
    }

    /**
     * Handle configuration changes
     */
    handleConfigChange(newValue, oldValue, path) {
        console.log(`Configuration changed: ${path} = ${JSON.stringify(newValue)}`);

        // Mark triangle as stale if configuration affects calculation
        if (this.isTriangleAffectingConfig(path)) {
            this.markTriangleStale();
        }

        // Save configuration
        this.saveConfigurationDebounced();
    }

    /**
     * Handle tab changes
     */
    handleTabChange(newTab, oldTab) {
        console.log(`Tab changed: ${oldTab} -> ${newTab}`);

        // Update UI
        this.updateTabUI(newTab);

        // Trigger tab-specific initialization
        this.initializeTabContent(newTab);
    }

    /**
     * Handle loading state changes
     */
    handleLoadingChange(isLoading) {
        console.log(`Loading state: ${isLoading}`);
        this.updateLoadingUI(isLoading);
    }

    /**
     * Handle triangle changes
     */
    handleTriangleChange(newTriangle, oldTriangle) {
        if (newTriangle) {
            console.log('Triangle generated successfully');
            this.emitEvent('triangleGenerated', { triangle: newTriangle });
        } else {
            console.log('Triangle cleared');
            this.emitEvent('triangleCleared');
        }
    }

    /**
     * Handle development factors changes
     */
    handleFactorsChange(newFactors, oldFactors) {
        if (Object.keys(newFactors).length > 0) {
            console.log('Development factors calculated');
            this.emitEvent('factorsCalculated', { factors: newFactors });
        }
    }

    // Helper methods
    updateDataSummary(data) {
        const totalClaims = data.length;
        const totalAmount = data.reduce((sum, claim) => sum + parseFloat(claim.paidAmount || 0), 0);

        // Update UI elements if they exist
        const totalClaimsEl = document.getElementById('total-claims');
        const totalAmountEl = document.getElementById('total-amount');

        if (totalClaimsEl) totalClaimsEl.textContent = totalClaims.toLocaleString();
        if (totalAmountEl) totalAmountEl.textContent = '$' + totalAmount.toLocaleString();
    }

    updateDelimiterOptions(data) {
        const delimiters = new Set();
        data.forEach(claim => {
            if (claim.delimiter) {
                delimiters.add(claim.delimiter);
            }
        });

        appState.set('currentDelimiters', delimiters, false);
        this.emitEvent('delimitersUpdated', { delimiters });
    }

    updateFilteredSummary(filteredData) {
        const filteredClaimsEl = document.getElementById('filtered-claims');
        const filteredAmountEl = document.getElementById('filtered-amount');

        if (filteredClaimsEl) {
            filteredClaimsEl.textContent = filteredData.length.toLocaleString();
        }

        if (filteredAmountEl) {
            const totalAmount = filteredData.reduce((sum, claim) => sum + parseFloat(claim.paidAmount || 0), 0);
            filteredAmountEl.textContent = '$' + totalAmount.toLocaleString();
        }
    }

    shouldClearTriangle(newData, oldData) {
        if (!oldData || !newData) return true;
        if (newData.length !== oldData.length) return true;

        // Quick check - compare first and last records
        if (newData.length > 0 && oldData.length > 0) {
            const firstNew = JSON.stringify(newData[0]);
            const firstOld = JSON.stringify(oldData[0]);
            const lastNew = JSON.stringify(newData[newData.length - 1]);
            const lastOld = JSON.stringify(oldData[oldData.length - 1]);

            return firstNew !== firstOld || lastNew !== lastOld;
        }

        return false;
    }

    isTriangleAffectingConfig(path) {
        const affectingPaths = [
            'triangleConfig.dateGranularity',
            'triangleConfig.developmentMethod',
            'triangleConfig.factorMethod',
            'triangleConfig.excludeOutliers',
            'triangleConfig.applySmoothing'
        ];

        return affectingPaths.includes(path);
    }

    markTriangleStale() {
        // Add visual indication that triangle needs regeneration
        this.emitEvent('triangleStale');
    }

    saveConfigurationDebounced() {
        this.debounce(() => {
            const config = appState.get('triangleConfig');
            localStorage.setItem('triangleConfig', JSON.stringify(config));
        }, 1000, 'saveConfig')();
    }

    updateTabUI(activeTab) {
        // Update tab buttons - correct selector
        document.querySelectorAll('.tab-button').forEach(btn => {
            const tabId = btn.getAttribute('data-tab');
            const isActive = tabId === activeTab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Update tab panels - handle both direct ID and -panel suffix
        document.querySelectorAll('.tab-panel').forEach(panel => {
            const panelId = panel.id;
            const isActive = panelId === `${activeTab}-panel` || panelId === activeTab;
            panel.classList.toggle('active', isActive);
        });
    }

    initializeTabContent(tab) {
        // Tab-specific initialization logic
        switch (tab) {
            case 'claims-triangle':
                this.emitEvent('triangleTabActivated');
                break;
            case 'analysis':
                this.emitEvent('analysisTabActivated');
                break;
            case 'export':
                this.emitEvent('exportTabActivated');
                break;
        }
    }

    updateLoadingUI(isLoading) {
        // Add/remove loading class from body
        document.body.classList.toggle('loading', isLoading);

        // Update loading indicators
        document.querySelectorAll('.loading-indicator').forEach(indicator => {
            indicator.style.display = isLoading ? 'block' : 'none';
        });
    }

    emitEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Cleanup all subscriptions
     */
    destroy() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];

        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }
}

// Singleton instance
export const stateManager = new StateManager();