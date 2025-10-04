/**
 * Export Controller
 * Manages data export operations
 */

import { appState } from '../state/AppState.js';

export class ExportController {
    constructor(services) {
        this.fileService = services.file;
        this.initialized = false;
    }

    /**
     * Initialize the export controller
     */
    async init() {
        console.log('📤 ExportController initialized');
        this.initialized = true;
    }

    /**
     * Export triangle data
     * @param {Object} options - Export options
     * @returns {Promise<void>}
     */
    async exportData(options = {}) {
        try {
            const {
                format = 'csv',
                includeTriangles = true,
                includeFactors = true,
                includeProjections = true
            } = options;

            console.log('📤 Starting data export...');

            await this.fileService.createExportPackage({
                format,
                includeTriangles,
                includeFactors,
                includeProjections,
                includeAuditTrail: true
            });

            console.log('✅ Export completed successfully');

        } catch (error) {
            console.error('❌ Export failed:', error);
            throw error;
        }
    }
}