/**
 * Validation Service
 * Handles data validation for claims data and configuration
 */

import { appState } from '../state/AppState.js';

export class ValidationService {
    constructor() {
        this.requiredFields = ['incurredDate', 'paidDate', 'paidAmount'];
        this.optionalFields = ['delimiter'];
        this.dateFormats = [
            /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY
            /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
            /^\d{1,2}\/\d{1,2}\/\d{4}$/      // M/D/YYYY
        ];
    }

    /**
     * Initialize the validation service
     */
    async init() {
        console.log('✅ ValidationService initialized');
    }

    /**
     * Validate CSV headers for required fields
     * @param {Array} headers - CSV headers
     * @returns {Object} Validation result with suggestions
     */
    validateHeaders(headers) {
        if (!Array.isArray(headers) || headers.length === 0) {
            return {
                valid: false,
                error: 'No headers found in CSV file',
                suggestions: []
            };
        }

        const result = {
            valid: true,
            error: null,
            suggestions: {},
            mapping: {},
            missingRequired: [],
            extraFields: []
        };

        // Convert headers to lowercase for matching
        const lowerHeaders = headers.map(h => h.toLowerCase().trim());

        // Check for required fields
        for (const required of this.requiredFields) {
            const suggestions = this.findFieldSuggestions(required, headers);

            if (suggestions.length === 0) {
                result.missingRequired.push(required);
                result.valid = false;
            } else {
                // Use best match
                result.mapping[required] = suggestions[0].header;
                result.suggestions[required] = suggestions;
            }
        }

        // Check for optional fields
        for (const optional of this.optionalFields) {
            const suggestions = this.findFieldSuggestions(optional, headers);
            if (suggestions.length > 0) {
                result.mapping[optional] = suggestions[0].header;
                result.suggestions[optional] = suggestions;
            }
        }

        // Identify extra fields that don't match any known field
        const mappedHeaders = Object.values(result.mapping);
        result.extraFields = headers.filter(header => !mappedHeaders.includes(header));

        if (result.missingRequired.length > 0) {
            result.error = `Missing required fields: ${result.missingRequired.join(', ')}`;
        }

        return result;
    }

    /**
     * Find potential field matches in headers
     * @param {string} fieldName - Target field name
     * @param {Array} headers - Available headers
     * @returns {Array} Sorted suggestions by confidence
     */
    findFieldSuggestions(fieldName, headers) {
        const suggestions = [];
        const fieldPatterns = this.getFieldPatterns(fieldName);

        for (const header of headers) {
            const headerLower = header.toLowerCase().trim();
            let confidence = 0;

            // Check exact match
            if (headerLower === fieldName.toLowerCase()) {
                confidence = 1.0;
            } else {
                // Check pattern matches
                for (const pattern of fieldPatterns) {
                    if (pattern.test(headerLower)) {
                        confidence = Math.max(confidence, 0.8);
                        break;
                    }
                }

                // Check partial matches
                if (confidence === 0) {
                    const similarity = this.calculateStringSimilarity(fieldName.toLowerCase(), headerLower);
                    if (similarity > 0.5) {
                        confidence = similarity * 0.6;
                    }
                }
            }

            if (confidence > 0) {
                suggestions.push({
                    header,
                    confidence,
                    reason: confidence >= 0.8 ? 'pattern match' : 'similarity match'
                });
            }
        }

        // Sort by confidence descending
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Get regex patterns for field matching
     * @param {string} fieldName - Field name
     * @returns {Array} Array of regex patterns
     */
    getFieldPatterns(fieldName) {
        const patterns = {
            incurredDate: [
                /^incurred.*date$/i,
                /^date.*incurred$/i,
                /^loss.*date$/i,
                /^incident.*date$/i,
                /^occurrence.*date$/i,
                /^claim.*date$/i,
                /^incur$/i,
                /^inc_date$/i,
                /^loss_dt$/i
            ],
            paidDate: [
                /^paid.*date$/i,
                /^payment.*date$/i,
                /^pay.*date$/i,
                /^settlement.*date$/i,
                /^close.*date$/i,
                /^pay$/i,
                /^paid$/i,
                /^pay_date$/i,
                /^payment_dt$/i,
                /^settle_dt$/i
            ],
            paidAmount: [
                /^paid.*amount$/i,
                /^payment.*amount$/i,
                /^amount.*paid$/i,
                /^pay.*amount$/i,
                /^settlement.*amount$/i,
                /^claim.*amount$/i,
                /^amount$/i,
                /^paid$/i,
                /^payment$/i,
                /^amt_paid$/i,
                /^pay_amt$/i,
                /^loss_amount$/i
            ],
            delimiter: [
                /^delimiter$/i,
                /^category$/i,
                /^bucket$/i,
                /^group$/i,
                /^class$/i,
                /^type$/i,
                /^line.*business$/i,
                /^lob$/i,
                /^coverage$/i,
                /^product$/i
            ]
        };

        return patterns[fieldName] || [];
    }

    /**
     * Calculate string similarity using Levenshtein distance
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Similarity score (0-1)
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Edit distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Validate individual claim record
     * @param {Object} claim - Claim data object
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Validation result
     */
    validateClaimRecord(claim, rowNumber = 0) {
        const result = {
            valid: true,
            warnings: [],
            errors: [],
            sanitized: { ...claim }
        };

        // Validate required fields
        for (const field of this.requiredFields) {
            if (!claim[field] || claim[field].toString().trim() === '') {
                result.errors.push(`Row ${rowNumber}: Missing required field '${field}'`);
                result.valid = false;
            }
        }

        if (!result.valid) {
            return result; // Skip further validation if required fields are missing
        }

        // Validate and sanitize dates
        const incurredDateValidation = this.validateDate(claim.incurredDate, 'incurredDate', rowNumber);
        const paidDateValidation = this.validateDate(claim.paidDate, 'paidDate', rowNumber);

        result.errors.push(...incurredDateValidation.errors);
        result.warnings.push(...incurredDateValidation.warnings);
        result.errors.push(...paidDateValidation.errors);
        result.warnings.push(...paidDateValidation.warnings);

        if (incurredDateValidation.valid) {
            result.sanitized.incurredDate = incurredDateValidation.sanitized;
        }

        if (paidDateValidation.valid) {
            result.sanitized.paidDate = paidDateValidation.sanitized;
        }

        // Validate amounts
        const amountValidation = this.validateAmount(claim.paidAmount, 'paidAmount', rowNumber);
        result.errors.push(...amountValidation.errors);
        result.warnings.push(...amountValidation.warnings);

        if (amountValidation.valid) {
            result.sanitized.paidAmount = amountValidation.sanitized;
        }

        // Business logic validations
        if (incurredDateValidation.valid && paidDateValidation.valid) {
            const incurredDate = new Date(incurredDateValidation.sanitized);
            const paidDate = new Date(paidDateValidation.sanitized);

            if (paidDate < incurredDate) {
                result.errors.push(`Row ${rowNumber}: Paid date cannot be before incurred date`);
                result.valid = false;
            }

            // Warn about very old or future dates
            const now = new Date();
            const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
            const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

            if (incurredDate < hundredYearsAgo) {
                result.warnings.push(`Row ${rowNumber}: Incurred date is very old (${incurredDate.getFullYear()})`);
            }

            if (paidDate > oneYearFromNow) {
                result.warnings.push(`Row ${rowNumber}: Paid date is in the future`);
            }
        }

        // Validate amount is positive
        if (amountValidation.valid && amountValidation.sanitized <= 0) {
            result.warnings.push(`Row ${rowNumber}: Paid amount should be positive`);
        }

        // Validate delimiter if present
        if (claim.delimiter !== undefined && claim.delimiter !== null) {
            const delimiterStr = claim.delimiter.toString().trim();
            result.sanitized.delimiter = delimiterStr;

            if (delimiterStr.length > 50) {
                result.warnings.push(`Row ${rowNumber}: Delimiter value is very long`);
            }
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * Validate date field
     * @param {string} dateValue - Date value to validate
     * @param {string} fieldName - Field name for error reporting
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Validation result
     */
    validateDate(dateValue, fieldName, rowNumber) {
        const result = {
            valid: false,
            sanitized: null,
            errors: [],
            warnings: []
        };

        if (!dateValue || dateValue.toString().trim() === '') {
            result.errors.push(`Row ${rowNumber}: ${fieldName} is required`);
            return result;
        }

        const dateStr = dateValue.toString().trim();

        // Try to parse with different formats
        let parsedDate = null;

        // Try standard Date parsing first
        parsedDate = new Date(dateStr);

        if (!isNaN(parsedDate.getTime())) {
            // Valid date, format as ISO string
            result.valid = true;
            result.sanitized = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            return result;
        }

        // Try manual parsing for common formats
        for (const format of this.dateFormats) {
            if (format.test(dateStr)) {
                const parsed = this.parseCustomDate(dateStr);
                if (parsed && !isNaN(parsed.getTime())) {
                    result.valid = true;
                    result.sanitized = parsed.toISOString().split('T')[0];
                    return result;
                }
            }
        }

        result.errors.push(`Row ${rowNumber}: Invalid ${fieldName} format: "${dateStr}"`);
        return result;
    }

    /**
     * Parse custom date formats
     * @param {string} dateStr - Date string to parse
     * @returns {Date|null} Parsed date or null
     */
    parseCustomDate(dateStr) {
        // MM/DD/YYYY or M/D/YYYY
        const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyy) {
            return new Date(parseInt(mmddyyyy[3]), parseInt(mmddyyyy[1]) - 1, parseInt(mmddyyyy[2]));
        }

        // MM-DD-YYYY
        const mmddyyyy2 = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (mmddyyyy2) {
            return new Date(parseInt(mmddyyyy2[3]), parseInt(mmddyyyy2[1]) - 1, parseInt(mmddyyyy2[2]));
        }

        // YYYY/MM/DD
        const yyyymmdd = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (yyyymmdd) {
            return new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
        }

        return null;
    }

    /**
     * Validate amount field
     * @param {*} amountValue - Amount value to validate
     * @param {string} fieldName - Field name for error reporting
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Validation result
     */
    validateAmount(amountValue, fieldName, rowNumber) {
        const result = {
            valid: false,
            sanitized: null,
            errors: [],
            warnings: []
        };

        if (amountValue === null || amountValue === undefined || amountValue.toString().trim() === '') {
            result.errors.push(`Row ${rowNumber}: ${fieldName} is required`);
            return result;
        }

        let amountStr = amountValue.toString().trim();

        // Remove common currency symbols and formatting
        amountStr = amountStr.replace(/[$,\s]/g, '');

        // Handle parentheses for negative numbers
        if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
            amountStr = '-' + amountStr.slice(1, -1);
        }

        const numericValue = parseFloat(amountStr);

        if (isNaN(numericValue)) {
            result.errors.push(`Row ${rowNumber}: Invalid ${fieldName} format: "${amountValue}"`);
            return result;
        }

        if (!isFinite(numericValue)) {
            result.errors.push(`Row ${rowNumber}: ${fieldName} must be a finite number`);
            return result;
        }

        result.valid = true;
        result.sanitized = numericValue;

        // Add warnings for unusual values
        if (numericValue < 0) {
            result.warnings.push(`Row ${rowNumber}: ${fieldName} is negative`);
        }

        if (numericValue > 1000000000) { // 1 billion
            result.warnings.push(`Row ${rowNumber}: ${fieldName} is very large`);
        }

        return result;
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result
     */
    validateConfiguration(config) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            sanitized: { ...config }
        };

        const validGranularities = ['monthly', 'quarterly', 'annual'];
        const validMethods = ['lag', 'calendar'];
        const validFactorMethods = ['simple-average', 'volume-weighted', 'recent-periods', 'exclude-high-low'];

        // Validate date granularity
        if (!validGranularities.includes(config.dateGranularity)) {
            result.errors.push(`Invalid dateGranularity: ${config.dateGranularity}`);
            result.sanitized.dateGranularity = 'quarterly'; // default
        }

        // Validate development method
        if (!validMethods.includes(config.developmentMethod)) {
            result.errors.push(`Invalid developmentMethod: ${config.developmentMethod}`);
            result.sanitized.developmentMethod = 'lag'; // default
        }

        // Validate factor method
        if (!validFactorMethods.includes(config.factorMethod)) {
            result.errors.push(`Invalid factorMethod: ${config.factorMethod}`);
            result.sanitized.factorMethod = 'volume-weighted'; // default
        }

        // Validate numeric values
        if (typeof config.overridePeriod !== 'number' || config.overridePeriod < 1) {
            result.warnings.push('overridePeriod should be a positive number');
            result.sanitized.overridePeriod = 10;
        }

        if (typeof config.overrideFactor !== 'number' || config.overrideFactor <= 0) {
            result.warnings.push('overrideFactor should be a positive number');
            result.sanitized.overrideFactor = 1.05;
        }

        if (typeof config.recentPeriodsCount !== 'number' || config.recentPeriodsCount < 1) {
            result.warnings.push('recentPeriodsCount should be a positive number');
            result.sanitized.recentPeriodsCount = 3;
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * Validate array of claims data
     * @param {Array} data - Array of claim records
     * @param {Function} progressCallback - Optional progress callback
     * @returns {Object} Validation result summary
     */
    async validateClaimsData(data, progressCallback = null) {
        if (!Array.isArray(data)) {
            return {
                valid: false,
                error: 'Data must be an array',
                processed: 0,
                valid: 0,
                invalid: 0,
                warnings: 0
            };
        }

        const result = {
            valid: true,
            processed: 0,
            validCount: 0,
            invalidCount: 0,
            warningCount: 0,
            validRecords: [],
            invalidRecords: [],
            allErrors: [],
            allWarnings: []
        };

        const batchSize = 100; // Process in batches to avoid blocking UI

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, Math.min(i + batchSize, data.length));

            for (let j = 0; j < batch.length; j++) {
                const rowIndex = i + j + 1; // 1-based row number
                const validation = this.validateClaimRecord(batch[j], rowIndex);

                result.processed++;

                if (validation.valid) {
                    result.validCount++;
                    result.validRecords.push(validation.sanitized);
                } else {
                    result.invalidCount++;
                    result.invalidRecords.push({
                        row: rowIndex,
                        data: batch[j],
                        errors: validation.errors
                    });
                    result.valid = false;
                }

                if (validation.warnings.length > 0) {
                    result.warningCount += validation.warnings.length;
                }

                result.allErrors.push(...validation.errors);
                result.allWarnings.push(...validation.warnings);
            }

            // Report progress and yield control
            if (progressCallback) {
                progressCallback({
                    processed: result.processed,
                    total: data.length,
                    validCount: result.validCount,
                    invalidCount: result.invalidCount
                });
            }

            // Yield control to prevent UI blocking
            if (i + batchSize < data.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return result;
    }
}