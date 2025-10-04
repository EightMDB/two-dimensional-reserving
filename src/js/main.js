/**
 * Main Application Entry Point
 * Two Dimensional Reserving - Professional Actuarial Claims Triangle Analysis
 *
 * This module initializes the application, sets up state management,
 * and coordinates all other modules.
 */

// Import core modules
import { appState } from './state/AppState.js';
import { stateManager } from './state/StateManager.js';

// Import services
import { FileService } from './services/FileService.js';
import { ValidationService } from './services/ValidationService.js';
import { CalculationService } from './services/CalculationService.js';

// Import controllers
import { DataController } from './controllers/DataController.js';
import { TriangleController } from './controllers/TriangleController.js';
import { ExportController } from './controllers/ExportController.js';

// Import views
import { DataInputView } from './views/DataInputView.js';
import { TriangleView } from './views/TriangleView.js';
import { AnalysisView } from './views/AnalysisView.js';
import { ExportView } from './views/ExportView.js';

// Import utilities
import { DOMUtils } from './utils/DOMUtils.js';

/**
 * Main Application Class
 * Coordinates all modules and manages application lifecycle
 */
class Application {
    constructor() {
        this.initialized = false;
        this.services = {};
        this.controllers = {};
        this.views = {};
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.log('🚀 Starting Two Dimensional Reserving Application...');

            // Initialize services first
            await this.initializeServices();

            // Initialize controllers
            await this.initializeControllers();

            // Initialize views
            await this.initializeViews();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize UI state
            this.initializeUI();

            // Load saved configuration
            this.loadConfiguration();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

            // Expose to window for debugging (development only)
            if (this.isDevelopment()) {
                window.app = this;
                window.appState = appState;
                console.log('🔧 Development mode: app and appState available on window');
            }

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize all services
     */
    async initializeServices() {
        console.log('📦 Initializing services...');

        this.services = {
            file: new FileService(),
            validation: new ValidationService(),
            calculation: new CalculationService()
        };

        // Initialize each service
        for (const [name, service] of Object.entries(this.services)) {
            if (service.init && typeof service.init === 'function') {
                await service.init();
                console.log(`  ✓ ${name} service initialized`);
            }
        }
    }

    /**
     * Initialize all controllers
     */
    async initializeControllers() {
        console.log('🎮 Initializing controllers...');

        this.controllers = {
            data: new DataController(this.services),
            triangle: new TriangleController(this.services),
            export: new ExportController(this.services)
        };

        // Initialize each controller
        for (const [name, controller] of Object.entries(this.controllers)) {
            if (controller.init && typeof controller.init === 'function') {
                await controller.init();
                console.log(`  ✓ ${name} controller initialized`);
            }
        }
    }

    /**
     * Initialize all views
     */
    async initializeViews() {
        console.log('👁️ Initializing views...');

        this.views = {
            dataInput: new DataInputView(this.controllers),
            triangle: new TriangleView(this.controllers),
            analysis: new AnalysisView(this.controllers),
            export: new ExportView(this.controllers)
        };

        // Initialize each view
        for (const [name, view] of Object.entries(this.views)) {
            if (view.init && typeof view.init === 'function') {
                await view.init();
                console.log(`  ✓ ${name} view initialized`);
            }
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');

        // Tab navigation
        this.setupTabNavigation();

        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Global error handling
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

        console.log('  ✓ Global event listeners set up');
    }

    /**
     * Set up tab navigation
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Handle keyboard navigation for tabs
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['data-input', 'claims-triangle', 'analysis', 'export'];
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
        });
    }

    /**
     * Switch to a specific tab
     */
    switchTab(tabId) {
        // Validate tab exists
        const tabPanel = document.getElementById(`${tabId}-panel`) || document.getElementById(tabId);
        if (!tabPanel) {
            console.warn(`Tab panel not found: ${tabId}`);
            return;
        }

        // Update state
        appState.set('currentTab', tabId);

        // Update UI will be handled by StateManager
        console.log(`Switched to tab: ${tabId}`);
    }

    /**
     * Initialize UI state
     */
    initializeUI() {
        console.log('🎨 Initializing UI...');

        // Set initial tab
        const initialTab = appState.get('currentTab') || 'data-input';
        this.switchTab(initialTab);

        // Set up loading overlay
        this.setupLoadingOverlay();

        // Set up notifications
        this.setupNotifications();

        console.log('  ✓ UI initialized');
    }

    /**
     * Set up loading overlay
     */
    setupLoadingOverlay() {
        // Subscribe to loading state changes
        appState.subscribe('isLoading', (isLoading) => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.display = isLoading ? 'flex' : 'none';
            }
            document.body.classList.toggle('loading', isLoading);
        });
    }

    /**
     * Set up notifications system
     */
    setupNotifications() {
        // Subscribe to notifications
        appState.subscribe('notifications', (notifications) => {
            this.displayNotifications(notifications);
        });
    }

    /**
     * Display notifications
     */
    displayNotifications(notifications) {
        const container = document.getElementById('notifications');
        if (!container) return;

        container.innerHTML = '';

        notifications.forEach((notification, index) => {
            const element = this.createNotificationElement(notification, index);
            container.appendChild(element);

            // Auto-remove after delay
            if (notification.autoRemove !== false) {
                setTimeout(() => {
                    this.removeNotification(index);
                }, notification.duration || 5000);
            }
        });
    }

    /**
     * Create notification element
     */
    createNotificationElement(notification, index) {
        const div = document.createElement('div');
        div.className = `notification ${notification.type || 'info'}`;
        div.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
                ${notification.action ? `<button class="notification-action">${notification.action}</button>` : ''}
            </div>
            <button class="notification-close" onclick="app.removeNotification(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        return div;
    }

    /**
     * Remove a notification
     */
    removeNotification(index) {
        const notifications = appState.get('notifications').filter((_, i) => i !== index);
        appState.set('notifications', notifications);
    }

    /**
     * Show a notification
     */
    showNotification(message, type = 'info', options = {}) {
        const notifications = appState.get('notifications') || [];
        notifications.push({
            message,
            type,
            timestamp: Date.now(),
            ...options
        });
        appState.set('notifications', notifications);
    }

    /**
     * Show an error message
     */
    showError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error', { duration: 10000 });
    }

    /**
     * Load saved configuration
     */
    loadConfiguration() {
        try {
            const savedConfig = localStorage.getItem('triangleConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                appState.update({ triangleConfig: { ...appState.get('triangleConfig'), ...config } });
                console.log('✓ Loaded saved configuration');
            }
        } catch (error) {
            console.warn('Failed to load saved configuration:', error);
        }
    }

    /**
     * Event Handlers
     */
    handleBeforeUnload(e) {
        // Save current state
        try {
            const config = appState.get('triangleConfig');
            localStorage.setItem('triangleConfig', JSON.stringify(config));
        } catch (error) {
            console.warn('Failed to save configuration:', error);
        }

        // Warn if there's unsaved work
        const hasData = appState.get('claimsData').length > 0;
        const hasTriangle = appState.get('claimsTriangle') !== null;

        if (hasData || hasTriangle) {
            e.preventDefault();
            e.returnValue = 'You have unsaved work. Are you sure you want to leave?';
        }
    }

    handleResize() {
        // Handle responsive updates
        this.views.triangle?.handleResize?.();
        this.views.analysis?.handleResize?.();
    }

    handleKeyDown(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveConfiguration();
                    break;
                case 'o':
                    e.preventDefault();
                    this.views.dataInput?.openFileDialog?.();
                    break;
                case 'e':
                    e.preventDefault();
                    this.switchTab('export');
                    break;
            }
        }

        // Escape key handling
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }

    handleError(e) {
        console.error('Global error:', e.error);
        this.showError('An unexpected error occurred. Please refresh the page if issues persist.');
    }

    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        this.showError('An unexpected error occurred during processing.');
    }

    /**
     * Utility methods
     */
    saveConfiguration() {
        try {
            const config = appState.get('triangleConfig');
            localStorage.setItem('triangleConfig', JSON.stringify(config));
            this.showNotification('Configuration saved successfully', 'success');
        } catch (error) {
            this.showError('Failed to save configuration', error);
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.initialized) {
            stateManager.destroy();

            // Clean up views
            Object.values(this.views).forEach(view => {
                if (view.destroy) view.destroy();
            });

            // Clean up controllers
            Object.values(this.controllers).forEach(controller => {
                if (controller.destroy) controller.destroy();
            });

            this.initialized = false;
            console.log('Application destroyed');
        }
    }
}

// Initialize application when DOM is ready
let app = null;

async function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }

    try {
        app = new Application();
        await app.init();

        // Make app globally available
        window.app = app;

    } catch (error) {
        console.error('Failed to initialize application:', error);

        // Show fallback error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #e74c3c;">
                <h2>Application Failed to Initialize</h2>
                <p>Please refresh the page. If the problem persists, check the browser console for details.</p>
                <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
                    Refresh Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Start initialization
initializeApp();

// Export for ES6 modules
export { Application };
export default app;