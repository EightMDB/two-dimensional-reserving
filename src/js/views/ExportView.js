/**
 * Export View
 * Placeholder for export functionality
 */

export class ExportView {
    constructor(controllers) {
        this.exportController = controllers.export;
        this.initialized = false;
    }

    async init() {
        console.log('📤 ExportView initialized');
        this.initialized = true;
    }

    destroy() {
        this.initialized = false;
    }
}