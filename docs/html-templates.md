# HTML Templates and Component Structure

## Overview

This document provides templates and patterns for extending the Two Dimensional Reserving application with new features, tabs, and components. The application uses a modular structure with separate CSS files and JavaScript modules for maintainability and scalability.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Adding a New Tab](#adding-a-new-tab)
3. [Component Templates](#component-templates)
4. [CSS Organization](#css-organization)
5. [JavaScript Integration](#javascript-integration)
6. [Best Practices](#best-practices)

---

## Project Structure

```
src/
├── index.html                  # Main application interface
├── debug.html                  # Debugging utilities
├── favicon.ico                 # Application icon
├── css/
│   ├── main.css               # Global styles and layout
│   ├── components/
│   │   ├── buttons.css        # Button styles
│   │   ├── forms.css          # Form input styles
│   │   ├── tables.css         # Table styles
│   │   └── tabs.css           # Tab navigation styles
│   └── views/
│       ├── data-input.css     # Data input view styles
│       ├── triangle.css       # Triangle view styles
│       ├── analysis.css       # Analysis view styles
│       └── export.css         # Export view styles
├── js/
│   ├── main.js                # Application initialization
│   ├── state/
│   │   ├── AppState.js        # Application state management
│   │   └── StateManager.js    # State manager utility
│   ├── services/
│   │   ├── FileService.js     # File handling
│   │   ├── ValidationService.js # Data validation
│   │   └── CalculationService.js # Calculation engine
│   ├── controllers/
│   │   ├── DataController.js  # Data input logic
│   │   ├── TriangleController.js # Triangle logic
│   │   └── ExportController.js # Export logic
│   ├── views/
│   │   ├── DataInputView.js   # Data input UI
│   │   ├── TriangleView.js    # Triangle UI
│   │   ├── AnalysisView.js    # Analysis UI
│   │   └── ExportView.js      # Export UI
│   └── utils/
│       └── DOMUtils.js        # DOM manipulation utilities
└── electron-main.js           # Desktop app main process
```

---

## Adding a New Tab

### Step 1: Add Tab Button to Navigation

**Location**: `index.html` - Inside `<nav class="tab-navigation">`

```html
<button
    class="tab-button"
    data-tab="your-feature-name"
    role="tab"
    aria-selected="false"
    aria-controls="your-feature-panel"
>
    <i class="fas fa-icon-name" aria-hidden="true"></i>
    Your Feature Name
</button>
```

**Required Attributes**:
- `class="tab-button"` - Required for tab functionality
- `data-tab="your-feature-name"` - Unique identifier for this tab
- `role="tab"` - Accessibility attribute
- `aria-selected="false"` - Set to "true" only for the default active tab
- `aria-controls="your-feature-panel"` - Must match the panel ID

**Icon Selection**:
Choose from [Font Awesome](https://fontawesome.com/icons) icons:
- Data/Upload: `fa-upload`, `fa-cloud-upload-alt`
- Tables: `fa-table`, `fa-th`
- Charts: `fa-chart-bar`, `fa-chart-line`, `fa-chart-pie`
- Analysis: `fa-calculator`, `fa-microscope`
- Export: `fa-download`, `fa-file-export`
- Settings: `fa-cog`, `fa-sliders-h`

### Step 2: Add Tab Panel Content

**Location**: `index.html` - Inside `<main class="main-content">`

```html
<section id="your-feature-panel" class="tab-panel" role="tabpanel">
    <div class="panel-header">
        <h2>Your Feature Title</h2>
        <p>Brief description of what this feature does and how to use it.</p>
    </div>

    <!-- Your feature content sections go here -->
    <div class="feature-section">
        <h3>Section Title</h3>
        <div class="section-content">
            <!-- Add your content here -->
        </div>
    </div>
</section>
```

**Key Classes**:
- `tab-panel` - Required for tab switching functionality
- `panel-header` - Standard header styling
- `feature-section` - Consistent section spacing and styling

### Step 3: Create CSS File for Your Feature

**Location**: `src/css/views/your-feature-name.css`

```css
/* Your Feature Name Styles */

/* Panel-specific overrides */
#your-feature-panel {
    /* Add panel-specific styles */
}

/* Section styles */
.your-feature-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
}

.your-feature-section h3 {
    margin-bottom: 1rem;
    color: var(--color-primary);
    font-size: 1.25rem;
    font-weight: 600;
}

/* Component-specific styles */
.your-feature-component {
    /* Add your custom component styles */
}
```

### Step 4: Add CSS Import to index.html

**Location**: `index.html` - Inside `<head>` section

```html
<link rel="stylesheet" href="css/views/your-feature-name.css">
```

### Step 5: Create JavaScript Module

**Controller**: `src/js/controllers/YourFeatureController.js`

```javascript
/**
 * YourFeatureController.js
 * Handles business logic for your feature
 */

export class YourFeatureController {
    constructor() {
        this.initialize();
    }

    initialize() {
        console.log('YourFeatureController initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for your feature
        const actionBtn = document.getElementById('your-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => this.handleAction());
        }
    }

    handleAction() {
        // Implement your feature logic
        console.log('Action triggered');
    }

    // Add more methods as needed
}
```

**View**: `src/js/views/YourFeatureView.js`

```javascript
/**
 * YourFeatureView.js
 * Handles UI updates for your feature
 */

export class YourFeatureView {
    constructor() {
        this.panel = document.getElementById('your-feature-panel');
        this.initialize();
    }

    initialize() {
        console.log('YourFeatureView initialized');
    }

    render(data) {
        // Update the UI with new data
        const container = document.getElementById('your-feature-content');
        if (!container) return;

        container.innerHTML = this.generateHTML(data);
    }

    generateHTML(data) {
        // Generate HTML for your feature
        return `
            <div class="your-feature-component">
                <!-- Your dynamic content here -->
            </div>
        `;
    }

    showLoading() {
        // Show loading state
    }

    hideLoading() {
        // Hide loading state
    }
}
```

### Step 6: Integrate with Main Application

**Location**: `src/js/main.js`

```javascript
import { YourFeatureController } from './controllers/YourFeatureController.js';
import { YourFeatureView } from './views/YourFeatureView.js';

// Inside the initialization function
const yourFeatureController = new YourFeatureController();
const yourFeatureView = new YourFeatureView();
```

---

## Component Templates

### Form Input Section

```html
<div class="form-section">
    <h3>Input Section Title</h3>
    <div class="form-grid">
        <div class="form-group">
            <label for="input-id">Input Label:</label>
            <input
                type="text"
                id="input-id"
                class="form-input"
                placeholder="Enter value..."
            >
        </div>
        <div class="form-group">
            <label for="select-id">Select Label:</label>
            <select id="select-id" class="form-select">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
            </select>
        </div>
    </div>
</div>
```

### Button Group

```html
<div class="button-group">
    <button class="button button-primary">
        <i class="fas fa-check" aria-hidden="true"></i>
        Primary Action
    </button>
    <button class="button button-secondary">
        <i class="fas fa-times" aria-hidden="true"></i>
        Secondary Action
    </button>
</div>
```

### Data Table

```html
<div class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
            </tr>
        </thead>
        <tbody id="table-body">
            <!-- Dynamic rows inserted here -->
        </tbody>
    </table>
</div>
```

### Collapsible Section

```html
<div class="collapsible-section">
    <button class="collapsible-header" data-target="section-id">
        <span class="collapsible-title">Section Title</span>
        <i class="fas fa-chevron-down collapsible-icon"></i>
    </button>
    <div id="section-id" class="collapsible-content">
        <!-- Content goes here -->
    </div>
</div>
```

### Statistics Display

```html
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-chart-line" aria-hidden="true"></i>
        </div>
        <div class="stat-content">
            <div class="stat-label">Label</div>
            <div class="stat-value" id="stat-value-1">0</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-dollar-sign" aria-hidden="true"></i>
        </div>
        <div class="stat-content">
            <div class="stat-label">Label</div>
            <div class="stat-value" id="stat-value-2">$0</div>
        </div>
    </div>
</div>
```

**CSS for Stats Grid**:

```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
}

.stat-icon {
    font-size: 2rem;
    color: var(--color-primary);
    margin-right: 1rem;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
}
```

### Modal Dialog

```html
<div id="your-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Modal Title</h3>
            <button class="modal-close" id="modal-close-btn">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
        <div class="modal-body">
            <!-- Modal content here -->
        </div>
        <div class="modal-footer">
            <button class="button button-secondary" id="modal-cancel">Cancel</button>
            <button class="button button-primary" id="modal-confirm">Confirm</button>
        </div>
    </div>
</div>
```

**JavaScript to Control Modal**:

```javascript
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
```

### Notification Toast

```html
<!-- Container for notifications (already in index.html) -->
<div id="notifications" class="notifications-container"></div>
```

**JavaScript to Show Notifications**:

```javascript
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type];

    notification.innerHTML = `
        <i class="fas ${icon}" aria-hidden="true"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}
```

---

## CSS Organization

### CSS Variable System

The application uses CSS custom properties for consistent theming. Define variables in `src/css/main.css`:

```css
:root {
    /* Colors */
    --color-primary: #2563eb;
    --color-secondary: #64748b;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;

    /* Text Colors */
    --color-text-primary: #1e293b;
    --color-text-secondary: #64748b;

    /* Background Colors */
    --color-background: #f8fafc;
    --color-surface: #ffffff;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
}
```

### Component-Specific CSS Files

Each component category has its own CSS file:

**Buttons** (`css/components/buttons.css`):
- `.button` - Base button styles
- `.button-primary` - Primary action buttons
- `.button-secondary` - Secondary action buttons
- `.button-danger` - Destructive actions

**Forms** (`css/components/forms.css`):
- `.form-input` - Text inputs
- `.form-select` - Dropdown selects
- `.form-group` - Form field grouping
- `.form-grid` - Grid layout for forms

**Tables** (`css/components/tables.css`):
- `.data-table` - Data table styling
- `.table-container` - Scrollable table wrapper

**Tabs** (`css/components/tabs.css`):
- `.tab-navigation` - Tab button container
- `.tab-button` - Individual tab buttons
- `.tab-panel` - Content panel styling

---

## JavaScript Integration

### MVC Pattern

The application follows an MVC-like pattern:

- **Models** (State): `src/js/state/AppState.js`
- **Views**: `src/js/views/*.js`
- **Controllers**: `src/js/controllers/*.js`

### State Management

```javascript
// AppState.js - Example state structure
class AppState {
    constructor() {
        this.claimsData = [];
        this.triangleConfig = {
            dateGranularity: 'quarterly',
            developmentMethod: 'lag',
            factorMethod: 'volume-weighted'
        };
        this.currentTriangle = null;
        this.observers = [];
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    notify() {
        this.observers.forEach(callback => callback(this));
    }

    setClaimsData(data) {
        this.claimsData = data;
        this.notify();
    }
}
```

### Event Handling Pattern

```javascript
// Controller pattern
class YourController {
    constructor(state, view) {
        this.state = state;
        this.view = view;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.state.subscribe(() => this.onStateChange());
    }

    setupEventListeners() {
        document.getElementById('action-btn')
            ?.addEventListener('click', () => this.handleAction());
    }

    handleAction() {
        // Update state
        this.state.updateSomething();
    }

    onStateChange() {
        // Update view when state changes
        this.view.render(this.state.getData());
    }
}
```

---

## Best Practices

### HTML

1. **Use Semantic HTML**: Use appropriate tags (`<section>`, `<nav>`, `<article>`)
2. **Accessibility**: Always include ARIA attributes for screen readers
3. **ID Naming**: Use kebab-case for IDs (`data-input-panel`, not `dataInputPanel`)
4. **Class Naming**: Use BEM-like naming for complex components

### CSS

1. **Use CSS Variables**: Reference theme colors via `var(--color-primary)`
2. **Mobile-First**: Design for mobile, then add desktop media queries
3. **Avoid Inline Styles**: Use classes instead of inline `style` attributes
4. **Component Isolation**: Keep component styles in separate files

### JavaScript

1. **ES6+ Modules**: Use import/export for code organization
2. **Error Handling**: Always wrap risky operations in try-catch blocks
3. **Null Checks**: Use optional chaining (`?.`) and nullish coalescing (`??`)
4. **Avoid Global Variables**: Keep code modular and encapsulated

### File Organization

1. **One Component Per File**: Don't mix unrelated code
2. **Logical Grouping**: Group related files in folders (controllers, views, services)
3. **Clear Naming**: Use descriptive names that indicate purpose

### Performance

1. **Lazy Loading**: Load large datasets incrementally
2. **Event Delegation**: Use event delegation for dynamic content
3. **Debouncing**: Debounce expensive operations (search, calculations)
4. **Virtual DOM**: Consider virtual scrolling for large tables

---

## Example: Complete Feature Implementation

Here's a complete example of adding a "Settings" tab:

### 1. HTML (in index.html)

```html
<!-- Add to tab navigation -->
<button
    class="tab-button"
    data-tab="settings"
    role="tab"
    aria-selected="false"
    aria-controls="settings-panel"
>
    <i class="fas fa-cog" aria-hidden="true"></i>
    Settings
</button>

<!-- Add to main content -->
<section id="settings-panel" class="tab-panel" role="tabpanel">
    <div class="panel-header">
        <h2>Application Settings</h2>
        <p>Configure application preferences and defaults.</p>
    </div>

    <div class="settings-section">
        <h3>Default Configuration</h3>
        <div class="form-grid">
            <div class="form-group">
                <label for="default-granularity">Default Granularity:</label>
                <select id="default-granularity" class="form-select">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly" selected>Quarterly</option>
                    <option value="annual">Annual</option>
                </select>
            </div>
        </div>
        <div class="button-group">
            <button id="save-settings-btn" class="button button-primary">
                <i class="fas fa-save" aria-hidden="true"></i>
                Save Settings
            </button>
            <button id="reset-settings-btn" class="button button-secondary">
                <i class="fas fa-undo" aria-hidden="true"></i>
                Reset to Defaults
            </button>
        </div>
    </div>
</section>
```

### 2. CSS (src/css/views/settings.css)

```css
/* Settings Panel Styles */

.settings-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.settings-section h3 {
    margin-bottom: 1rem;
    color: var(--color-primary);
    font-size: 1.25rem;
    font-weight: 600;
}

.settings-section .form-grid {
    margin-bottom: 1.5rem;
}
```

### 3. JavaScript Controller (src/js/controllers/SettingsController.js)

```javascript
export class SettingsController {
    constructor(state) {
        this.state = state;
        this.initialize();
    }

    initialize() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('save-settings-btn')
            ?.addEventListener('click', () => this.saveSettings());

        document.getElementById('reset-settings-btn')
            ?.addEventListener('click', () => this.resetSettings());
    }

    loadSettings() {
        const settings = localStorage.getItem('appSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.applySettings(parsed);
        }
    }

    saveSettings() {
        const settings = {
            defaultGranularity: document.getElementById('default-granularity')?.value
        };

        localStorage.setItem('appSettings', JSON.stringify(settings));
        showNotification('Settings saved successfully', 'success');
    }

    resetSettings() {
        localStorage.removeItem('appSettings');
        this.applySettings({ defaultGranularity: 'quarterly' });
        showNotification('Settings reset to defaults', 'info');
    }

    applySettings(settings) {
        const granularitySelect = document.getElementById('default-granularity');
        if (granularitySelect && settings.defaultGranularity) {
            granularitySelect.value = settings.defaultGranularity;
        }
    }
}
```

### 4. Integration (src/js/main.js)

```javascript
import { SettingsController } from './controllers/SettingsController.js';

// In initialization
const settingsController = new SettingsController(appState);
```

---

## Additional Resources

- **Font Awesome Icons**: https://fontawesome.com/icons
- **CSS Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **JavaScript Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Accessibility Guide**: https://www.w3.org/WAI/WCAG21/quickref/

---

*This template documentation should be updated as new patterns and components are added to the application.*