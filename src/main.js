// Main application entry point and state management
// Import functions from functions.js (this assumes functions.js is loaded before main.js)

// Application State Variables
// Note: All global state variables are now declared in triangle-methodology.js
// to ensure proper load order and avoid undefined variable errors

// DOM Elements Cache (initialized after DOM loads)
let tabButtons;
let tabContents;
let claimsTableBody;
let totalClaimsSpan;
let totalAmountSpan;
let delimiterFilter;
let uploadArea;
let browseFileBtn;
let csvFileInput;
let uploadWizard;
let wizardSteps;
let wizardStepContents;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    initializeDOMElements();

    // Initialize all modules
    initializeTabs();
    initializeEventListeners();
    initializeTriangleMethodologyListeners();
    initializeUploadArea();
    setDefaultConfiguration();
    updateSummary();
    updateDelimiterFilter();
    loadSavedConfigurations();

    // Desktop app specific initialization
    initializeDesktopFeatures();
});

// Initialize DOM element references
function initializeDOMElements() {
    tabButtons = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    claimsTableBody = document.getElementById('claims-tbody');
    totalClaimsSpan = document.getElementById('total-claims');
    totalAmountSpan = document.getElementById('total-amount');
    delimiterFilter = document.getElementById('delimiter-filter');

    // Upload wizard elements
    uploadArea = document.getElementById('upload-area');
    browseFileBtn = document.getElementById('browse-file');
    csvFileInput = document.getElementById('csv-file');
    uploadWizard = document.getElementById('upload-wizard');
    wizardSteps = document.querySelectorAll('.step');
    wizardStepContents = document.querySelectorAll('.wizard-step');
}

// Initialize Triangle Methodology Event Listeners
function initializeTriangleMethodologyListeners() {
    // Wire up the triangle methodology functions to UI events
    const generateTriangleBtn = document.getElementById('generate-triangle');
    if (generateTriangleBtn) {
        generateTriangleBtn.addEventListener('click', generateClaimsTriangle);
    }

    const toggleViewInputs = document.querySelectorAll('input[name="triangle-view"]');
    toggleViewInputs.forEach(input => {
        input.addEventListener('change', toggleTriangleView);
    });
}

// Make global functions available for inline event handlers
window.deleteClaim = deleteClaim;