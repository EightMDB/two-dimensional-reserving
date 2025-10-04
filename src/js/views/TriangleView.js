/**
 * Triangle View
 * Placeholder for triangle display functionality
 */

export class TriangleView {
    constructor(controllers) {
        this.triangleController = controllers.triangle;
        this.initialized = false;
    }

    async init() {
        console.log('🔺 TriangleView initialized');
        this.initialized = true;
    }

    destroy() {
        this.initialized = false;
    }
}