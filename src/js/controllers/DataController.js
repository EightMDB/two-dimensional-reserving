/**
 * Data Controller
 * Manages data operations, file uploads, and validation
 */

import { appState } from '../state/AppState.js';

export class DataController {
    constructor(services) {
        this.fileService = services.file;
        this.validationService = services.validation;
        this.initialized = false;
    }

    /**
     * Initialize the data controller
     */
    async init() {
        console.log('📊 DataController initialized');
        this.initialized = true;
    }

    /**
     * Handle file upload
     * @param {File} file - Uploaded file
     * @returns {Promise<Object>} Upload result
     */
    async handleFileUpload(file) {
        try {
            appState.set('isLoading', true);

            console.log('📤 Processing file upload:', file.name);

            // Parse CSV file
            const csvData = await this.fileService.readCSVFile(file);

            // Validate headers
            const headerValidation = this.validationService.validateHeaders(csvData.headers);

            if (!headerValidation.valid) {
                throw new Error(headerValidation.error);
            }

            // Store CSV data and mapping
            appState.update({
                csvData: csvData,
                csvHeaders: csvData.headers,
                columnMapping: headerValidation.mapping
            });

            console.log('✅ File uploaded successfully');
            return {
                success: true,
                data: csvData,
                mapping: headerValidation.mapping
            };

        } catch (error) {
            console.error('❌ File upload failed:', error);
            throw error;
        } finally {
            appState.set('isLoading', false);
        }
    }

    /**
     * Process and validate claims data
     * @param {Object} mapping - Column mapping
     * @returns {Promise<Object>} Processing result
     */
    async processClaimsData(mapping) {
        try {
            appState.set('isLoading', true);

            const csvData = appState.get('csvData');
            if (!csvData || !csvData.rows) {
                throw new Error('No CSV data available');
            }

            console.log('🔄 Processing claims data...');

            // Map CSV rows to claims format
            const mappedData = csvData.rows.map(row => {
                const claim = {};
                Object.entries(mapping).forEach(([field, csvColumn]) => {
                    claim[field] = row[csvColumn] || '';
                });
                return claim;
            });

            // Validate claims data
            const validation = await this.validationService.validateClaimsData(mappedData);

            if (!validation.valid) {
                console.warn('⚠️ Data validation issues found:', validation.allErrors);
            }

            // Store processed data
            appState.update({
                claimsData: validation.validRecords,
                filteredClaimsData: validation.validRecords
            });

            console.log(`✅ Processed ${validation.validCount} valid claims`);

            return {
                success: true,
                validCount: validation.validCount,
                invalidCount: validation.invalidCount,
                warnings: validation.allWarnings,
                errors: validation.allErrors
            };

        } catch (error) {
            console.error('❌ Claims data processing failed:', error);
            throw error;
        } finally {
            appState.set('isLoading', false);
        }
    }

    /**
     * Apply filters to claims data
     * @param {Object} filters - Filter criteria
     */
    applyFilters(filters) {
        const claimsData = appState.get('claimsData');
        if (!claimsData || claimsData.length === 0) {
            return;
        }

        let filteredData = [...claimsData];

        // Apply date range filter
        if (filters.dateStart || filters.dateEnd) {
            filteredData = filteredData.filter(claim => {
                const incurredDate = new Date(claim.incurredDate);
                const startOk = !filters.dateStart || incurredDate >= new Date(filters.dateStart);
                const endOk = !filters.dateEnd || incurredDate <= new Date(filters.dateEnd);
                return startOk && endOk;
            });
        }

        // Apply amount range filter
        if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
            filteredData = filteredData.filter(claim => {
                const amount = parseFloat(claim.paidAmount);
                const minOk = filters.amountMin === undefined || amount >= filters.amountMin;
                const maxOk = filters.amountMax === undefined || amount <= filters.amountMax;
                return minOk && maxOk;
            });
        }

        // Apply delimiter filter
        if (filters.delimiters && filters.delimiters.length > 0) {
            filteredData = filteredData.filter(claim => {
                return filters.delimiters.includes(claim.delimiter || '');
            });
        }

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredData = filteredData.filter(claim => {
                return Object.values(claim).some(value =>
                    value && value.toString().toLowerCase().includes(searchTerm)
                );
            });
        }

        appState.set('filteredClaimsData', filteredData);
        console.log(`🔍 Applied filters: ${filteredData.length} of ${claimsData.length} claims match`);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        const claimsData = appState.get('claimsData');
        appState.set('filteredClaimsData', claimsData || []);
        console.log('🧹 Filters cleared');
    }

    /**
     * Get data summary statistics
     * @returns {Object} Summary statistics
     */
    getDataSummary() {
        const claimsData = appState.get('claimsData');
        const filteredData = appState.get('filteredClaimsData');

        if (!claimsData || claimsData.length === 0) {
            return {
                totalClaims: 0,
                totalAmount: 0,
                filteredClaims: 0,
                filteredAmount: 0,
                delimiters: []
            };
        }

        const totalAmount = claimsData.reduce((sum, claim) =>
            sum + parseFloat(claim.paidAmount || 0), 0);

        const filteredAmount = filteredData.reduce((sum, claim) =>
            sum + parseFloat(claim.paidAmount || 0), 0);

        const delimiters = [...new Set(claimsData.map(claim => claim.delimiter).filter(Boolean))];

        return {
            totalClaims: claimsData.length,
            totalAmount,
            filteredClaims: filteredData.length,
            filteredAmount,
            delimiters
        };
    }
}