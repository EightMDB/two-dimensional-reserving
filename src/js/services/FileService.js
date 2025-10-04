/**
 * File Service
 * Handles file operations, CSV parsing, and data import/export
 */

import { appState } from '../state/AppState.js';

export class FileService {
    constructor() {
        this.supportedTypes = ['.csv'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.csvDelimiters = [',', ';', '\t', '|'];
    }

    /**
     * Initialize the file service
     */
    async init() {
        console.log('📁 FileService initialized');
    }

    /**
     * Read and parse a CSV file
     * @param {File} file - The file to read
     * @returns {Promise<Object>} Parsed CSV data with headers and rows
     */
    async readCSVFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                reject(new Error(validation.error));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;
                    const parsed = this.parseCSV(csvText);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse CSV: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Validate a file before processing
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.supportedTypes.includes(fileExtension)) {
            return {
                valid: false,
                error: `Unsupported file type. Supported types: ${this.supportedTypes.join(', ')}`
            };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            const maxSizeMB = Math.round(this.maxFileSize / (1024 * 1024));
            return {
                valid: false,
                error: `File too large. Maximum size: ${maxSizeMB}MB`
            };
        }

        // Check if file is empty
        if (file.size === 0) {
            return { valid: false, error: 'File is empty' };
        }

        return { valid: true };
    }

    /**
     * Parse CSV text into structured data
     * @param {string} csvText - Raw CSV text
     * @returns {Object} Parsed data with headers and rows
     */
    parseCSV(csvText) {
        if (!csvText || typeof csvText !== 'string') {
            throw new Error('Invalid CSV text provided');
        }

        // Detect delimiter
        const delimiter = this.detectDelimiter(csvText);

        // Split into lines and handle different line endings
        const lines = csvText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .filter(line => line.trim().length > 0);

        if (lines.length < 2) {
            throw new Error('CSV must contain at least a header row and one data row');
        }

        // Parse header row
        const headers = this.parseCSVRow(lines[0], delimiter);
        if (!headers || headers.length === 0) {
            throw new Error('Invalid or empty header row');
        }

        // Parse data rows
        const rows = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const row = this.parseCSVRow(lines[i], delimiter);
                if (row && row.length > 0) {
                    // Convert to object using headers
                    const rowObject = {};
                    headers.forEach((header, index) => {
                        rowObject[header] = row[index] || '';
                    });
                    rows.push(rowObject);
                }
            } catch (error) {
                errors.push({
                    row: i + 1,
                    line: lines[i],
                    error: error.message
                });
            }
        }

        // Validate we have some data
        if (rows.length === 0) {
            throw new Error('No valid data rows found');
        }

        // Log parsing results
        console.log(`📊 CSV parsed successfully:`, {
            headers: headers.length,
            rows: rows.length,
            errors: errors.length,
            delimiter
        });

        if (errors.length > 0) {
            console.warn('⚠️ CSV parsing errors:', errors);
        }

        return {
            headers,
            rows,
            delimiter,
            totalRows: lines.length - 1,
            validRows: rows.length,
            errors,
            metadata: {
                fileName: null, // Will be set by caller
                fileSize: csvText.length,
                parsedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Parse a single CSV row, handling quoted fields and escaped quotes
     * @param {string} row - Single CSV row
     * @param {string} delimiter - Field delimiter
     * @returns {Array} Array of field values
     */
    parseCSVRow(row, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < row.length) {
            const char = row[i];
            const nextChar = row[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote within quoted field
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // Field delimiter outside quotes
                result.push(current.trim());
                current = '';
                i++;
            } else {
                // Regular character
                current += char;
                i++;
            }
        }

        // Add the last field
        result.push(current.trim());

        return result;
    }

    /**
     * Detect the most likely delimiter in CSV text
     * @param {string} csvText - CSV text to analyze
     * @returns {string} Detected delimiter
     */
    detectDelimiter(csvText) {
        const sample = csvText.substring(0, 1024); // Check first 1KB
        const lines = sample.split('\n').slice(0, 5); // Check first 5 lines

        let bestDelimiter = ',';
        let maxConsistency = 0;

        for (const delimiter of this.csvDelimiters) {
            const counts = lines.map(line => {
                // Count delimiter occurrences outside quotes
                let count = 0;
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    if (line[i] === '"') {
                        inQuotes = !inQuotes;
                    } else if (line[i] === delimiter && !inQuotes) {
                        count++;
                    }
                }
                return count;
            }).filter(count => count > 0);

            // Calculate consistency (how similar the counts are)
            if (counts.length > 1) {
                const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
                const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;
                const consistency = avg > 0 ? avg / (1 + variance) : 0;

                if (consistency > maxConsistency) {
                    maxConsistency = consistency;
                    bestDelimiter = delimiter;
                }
            }
        }

        return bestDelimiter;
    }

    /**
     * Export data to CSV format
     * @param {Array} data - Array of objects to export
     * @param {Array} headers - Column headers (optional)
     * @returns {string} CSV text
     */
    exportToCSV(data, headers = null) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No data to export');
        }

        // Use provided headers or extract from first object
        const csvHeaders = headers || Object.keys(data[0]);

        // Escape CSV field if needed
        const escapeCSVField = (field) => {
            if (field === null || field === undefined) {
                return '';
            }

            const stringField = String(field);

            // If field contains comma, quote, or newline, wrap in quotes
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }

            return stringField;
        };

        // Create CSV content
        const csvLines = [];

        // Add header row
        csvLines.push(csvHeaders.map(escapeCSVField).join(','));

        // Add data rows
        data.forEach(row => {
            const csvRow = csvHeaders.map(header => escapeCSVField(row[header]));
            csvLines.push(csvRow.join(','));
        });

        return csvLines.join('\n');
    }

    /**
     * Export data to JSON format
     * @param {*} data - Data to export
     * @returns {string} JSON string
     */
    exportToJSON(data) {
        try {
            return JSON.stringify(data, null, 2);
        } catch (error) {
            throw new Error(`Failed to export to JSON: ${error.message}`);
        }
    }

    /**
     * Download data as file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up object URL
            setTimeout(() => URL.revokeObjectURL(url), 100);

            console.log(`📥 Downloaded file: ${filename}`);
        } catch (error) {
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

    /**
     * Create a comprehensive export package
     * @param {Object} options - Export options
     * @returns {Promise<void>}
     */
    async createExportPackage(options = {}) {
        try {
            const {
                includeTriangles = true,
                includeFactors = true,
                includeProjections = true,
                includeAuditTrail = true,
                format = 'csv'
            } = options;

            const exportData = {};
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            // Get current state data
            const claimsData = appState.get('claimsData');
            const claimsTriangle = appState.get('claimsTriangle');
            const developmentFactors = appState.get('developmentFactors');
            const reserveProjections = appState.get('reserveProjections');
            const config = appState.get('triangleConfig');

            // Add requested components
            if (claimsData.length > 0) {
                exportData.claims_data = claimsData;
            }

            if (includeTriangles && claimsTriangle) {
                exportData.claims_triangle = claimsTriangle;
            }

            if (includeFactors && Object.keys(developmentFactors).length > 0) {
                exportData.development_factors = developmentFactors;
            }

            if (includeProjections && Object.keys(reserveProjections).length > 0) {
                exportData.reserve_projections = reserveProjections;
            }

            if (includeAuditTrail) {
                exportData.configuration = config;
                exportData.export_metadata = {
                    exported_at: new Date().toISOString(),
                    application: 'Two Dimensional Reserving',
                    version: '2.0.0',
                    format
                };
            }

            // Export based on format
            if (format === 'json') {
                const content = this.exportToJSON(exportData);
                this.downloadFile(content, `triangle-analysis-${timestamp}.json`, 'application/json');
            } else {
                // Export each component as separate CSV files in a ZIP-like structure
                // For now, export the main data as CSV
                if (exportData.claims_data) {
                    const content = this.exportToCSV(exportData.claims_data);
                    this.downloadFile(content, `claims-data-${timestamp}.csv`, 'text/csv');
                }
            }

            console.log('📦 Export package created successfully');

        } catch (error) {
            throw new Error(`Failed to create export package: ${error.message}`);
        }
    }

    /**
     * Get file statistics
     * @param {File} file - File to analyze
     * @returns {Object} File statistics
     */
    getFileStats(file) {
        return {
            name: file.name,
            size: file.size,
            sizeFormatted: this.formatFileSize(file.size),
            type: file.type,
            lastModified: new Date(file.lastModified),
            extension: '.' + file.name.split('.').pop().toLowerCase()
        };
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}