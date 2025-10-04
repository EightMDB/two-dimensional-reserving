/**
 * Centralized Application State Management
 * Two Dimensional Reserving - Professional Actuarial Claims Triangle Analysis
 */

export class AppState {
    constructor() {
        this.state = {
            // Data Management
            claimsData: [],
            filteredClaimsData: [],
            csvData: null,
            csvHeaders: [],
            columnMapping: {},
            currentDelimiters: new Set(),

            // Triangle Data
            claimsTriangle: null,
            incrementalTriangle: null,

            // Configuration
            triangleConfig: {
                dateGranularity: 'quarterly',
                developmentMethod: 'lag',
                factorMethod: 'volume-weighted',
                excludeOutliers: true,
                applySmoothing: false,
                enableFactorOverride: false,
                overridePeriod: 10,
                overrideFactor: 1.05,
                recentPeriodsCount: 3,
                excludeHighLowCount: 1
            },

            // UI State
            currentTab: 'data-input',
            isLoading: false,
            notifications: [],

            // Analysis Results
            developmentFactors: {},
            reserveProjections: {},
            analysisResults: {},

            // Export Configuration
            exportOptions: {
                includeTriangles: true,
                includeFactors: true,
                includeProjections: true,
                includeAuditTrail: true,
                format: 'csv'
            }
        };

        this.listeners = new Map();
        this.history = [];
        this.maxHistorySize = 50;
    }

    /**
     * Get current state value by path
     * @param {string} path - Dot notation path (e.g., 'triangleConfig.dateGranularity')
     * @returns {*} State value
     */
    get(path) {
        return this.getNestedValue(this.state, path);
    }

    /**
     * Set state value by path
     * @param {string} path - Dot notation path
     * @param {*} value - New value
     * @param {boolean} notify - Whether to notify listeners (default: true)
     */
    set(path, value, notify = true) {
        const oldValue = this.get(path);

        // Save to history
        this.addToHistory(path, oldValue, value);

        // Update state
        this.setNestedValue(this.state, path, value);

        // Notify listeners
        if (notify) {
            this.notifyListeners(path, value, oldValue);
        }
    }

    /**
     * Update multiple state values at once
     * @param {Object} updates - Object with path/value pairs
     * @param {boolean} notify - Whether to notify listeners
     */
    update(updates, notify = true) {
        const changes = [];

        Object.entries(updates).forEach(([path, value]) => {
            const oldValue = this.get(path);
            this.setNestedValue(this.state, path, value);
            changes.push({ path, value, oldValue });
        });

        if (notify) {
            changes.forEach(({ path, value, oldValue }) => {
                this.notifyListeners(path, value, oldValue);
            });
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} path - Path to watch (supports wildcards)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }

        this.listeners.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const pathListeners = this.listeners.get(path);
            if (pathListeners) {
                pathListeners.delete(callback);
                if (pathListeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    /**
     * Reset state to initial values
     * @param {string} section - Optional section to reset (e.g., 'claimsData')
     */
    reset(section = null) {
        if (section) {
            this.set(section, this.getInitialValue(section));
        } else {
            this.state = this.getInitialState();
            this.notifyListeners('*', this.state, null);
        }
    }

    /**
     * Get state snapshot for debugging
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Restore state from snapshot
     */
    restoreSnapshot(snapshot) {
        this.state = snapshot;
        this.notifyListeners('*', this.state, null);
    }

    // Private helper methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    notifyListeners(path, value, oldValue) {
        // Notify exact path listeners
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.forEach(callback => {
                try {
                    callback(value, oldValue, path);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }

        // Notify wildcard listeners
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(callback => {
                try {
                    callback(value, oldValue, path);
                } catch (error) {
                    console.error('Error in wildcard state listener:', error);
                }
            });
        }

        // Notify parent path listeners
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentListeners = this.listeners.get(parentPath + '.*');
            if (parentListeners) {
                parentListeners.forEach(callback => {
                    try {
                        callback(value, oldValue, path);
                    } catch (error) {
                        console.error('Error in parent path listener:', error);
                    }
                });
            }
        }
    }

    addToHistory(path, oldValue, newValue) {
        this.history.push({
            timestamp: Date.now(),
            path,
            oldValue: JSON.parse(JSON.stringify(oldValue)),
            newValue: JSON.parse(JSON.stringify(newValue))
        });

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    getInitialState() {
        return {
            claimsData: [],
            filteredClaimsData: [],
            csvData: null,
            csvHeaders: [],
            columnMapping: {},
            currentDelimiters: new Set(),
            claimsTriangle: null,
            incrementalTriangle: null,
            triangleConfig: {
                dateGranularity: 'quarterly',
                developmentMethod: 'lag',
                factorMethod: 'volume-weighted',
                excludeOutliers: true,
                applySmoothing: false,
                enableFactorOverride: false,
                overridePeriod: 10,
                overrideFactor: 1.05,
                recentPeriodsCount: 3,
                excludeHighLowCount: 1
            },
            currentTab: 'data-input',
            isLoading: false,
            notifications: [],
            developmentFactors: {},
            reserveProjections: {},
            analysisResults: {},
            exportOptions: {
                includeTriangles: true,
                includeFactors: true,
                includeProjections: true,
                includeAuditTrail: true,
                format: 'csv'
            }
        };
    }
}

// Singleton instance
export const appState = new AppState();

// Development helper - expose to window in development
if (typeof window !== 'undefined') {
    // Check if we're in development (local server or file protocol)
    const isDevelopment = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.protocol === 'file:';

    if (isDevelopment) {
        window.appState = appState;
    }
}