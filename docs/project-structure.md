# Project Structure Documentation

## Overview

This document provides a comprehensive overview of the Two Dimensional Reserving project structure, explaining the purpose of each directory and file, and how they work together to create the application.

## Root Directory Structure

```
two-dimensional-reserving/
├── src/                    # Source code and assets
├── dist/                   # Built desktop application
├── docs/                   # Documentation files
├── node_modules/           # Node.js dependencies
├── .claude/               # Claude Code configuration
├── package.json           # Node.js project configuration
├── package-lock.json      # Dependency lock file
├── electron-main.js       # Electron main process entry point
├── launch-app.bat         # Windows launcher script
├── test-claims.csv        # Sample test data
└── README.md             # Main project documentation
```

---

## Source Directory (`src/`)

### Main HTML Files

```
src/
├── index.html            # Main application homepage
├── debug.html           # Debugging utilities and testing
└── favicon.ico          # Application icon
```

#### index.html
- **Purpose**: Main homepage and application entry point
- **Contains**: Dashboard with welcome section, stats cards, quick actions, and methodology cards
- **Features**:
  - Sidebar navigation to all application sections
  - Dashboard statistics display
  - Recent projects overview
  - Quick action buttons
  - Methodology selection cards
- **Loads**: Main CSS (main.css, sidebar.css) and sidebar.js

#### debug.html
- **Purpose**: Debugging and testing file operations
- **Contains**: Simple test interface for file browsing functionality
- **Use Case**: Development and troubleshooting

### Page Directories

```
src/
├── methodologies/         # Actuarial methodology pages
│   ├── chain-ladder.html
│   ├── bornhuetter-ferguson.html
│   ├── benktander.html
│   └── cape-cod.html
├── projects/             # Project management pages
│   ├── projects.html
│   ├── project-detail.html
│   └── project-comparison.html
├── data/                 # Data library pages
│   ├── data-library.html
│   └── data-viewer.html
├── analysis/             # Analysis pages
│   ├── analysis-dashboard.html
│   ├── results-viewer.html
│   └── report-builder.html
├── tools/                # Utility tools
│   ├── calculator.html
│   └── data-diagnostics.html
├── settings/             # Settings pages
│   ├── settings.html
│   └── profile.html
└── help/                 # Help and documentation
    ├── help.html
    ├── methodology-guide.html
    └── glossary.html
```

---

### CSS Directory (`src/css/`)

```
src/css/
├── main.css              # Global styles and layout
├── sidebar.css           # Sidebar navigation styles
├── components/
│   ├── buttons.css       # Button component styles
│   ├── forms.css         # Form input styles
│   ├── tables.css        # Table component styles
│   ├── tabs.css          # Tab navigation styles
│   └── toolbar.css       # Toolbar component styles
└── views/
    ├── data-input.css    # Data input view styles
    ├── triangle.css      # Triangle view styles
    ├── analysis.css      # Analysis view styles
    └── export.css        # Export view styles
```

#### CSS Organization

**main.css**
- Global CSS variables (colors, spacing, shadows)
- Base HTML element styles
- Application layout (app-wrapper, main-content, content-container)
- Loading overlay and notification styles
- Modal dialog styles
- Dashboard components (stat cards, action cards, methodology cards)

**sidebar.css**
- Sidebar navigation layout and styling
- Navigation items and submenu styles
- Sidebar header and footer
- Mobile responsive behavior
- Active state and hover effects

**components/** (Reusable UI Components)
- `buttons.css`: Primary, secondary, and danger button styles
- `forms.css`: Input fields, selects, checkboxes, and form layouts
- `tables.css`: Data table styling with responsive behavior
- `tabs.css`: Tab navigation and panel switching
- `toolbar.css`: Toolbar and action button groups

**views/** (Page-Specific Styles)
- `data-input.css`: Upload area, data preview, filter controls
- `triangle.css`: Triangle configuration and display
- `analysis.css`: Factor analysis and projection displays
- `export.css`: Export options and configuration

---

### JavaScript Directory (`src/js/`)

```
src/js/
├── main.js                   # Application initialization (homepage)
├── sidebar.js                # Sidebar navigation logic
├── upload-handler.js         # File upload handling
├── state/
│   ├── AppState.js          # Central application state
│   └── StateManager.js      # State management utilities
├── services/
│   ├── FileService.js       # File reading and parsing
│   ├── ValidationService.js # Data validation
│   └── CalculationService.js # Triangle calculations
├── controllers/
│   ├── DataController.js    # Data input logic
│   ├── TriangleController.js # Triangle generation logic
│   └── ExportController.js  # Export functionality
├── views/
│   ├── DataInputView.js     # Data input UI updates
│   ├── TriangleView.js      # Triangle rendering
│   ├── AnalysisView.js      # Analysis display
│   └── ExportView.js        # Export UI
├── utils/
│   ├── DOMUtils.js          # DOM manipulation helpers
│   ├── ProjectManager.js    # Project save/load utilities
│   └── ThemeManager.js      # Theme switching logic
├── methodologies/
│   └── triangle-methodology.js # Triangle calculation implementations
├── pages/                    # Page-specific JavaScript
│   ├── projects/
│   │   ├── projects-manager.js
│   │   ├── project-detail.js
│   │   └── project-comparison.js
│   ├── data/
│   │   ├── data-library.js
│   │   └── data-viewer.js
│   ├── analysis/
│   │   ├── analysis-dashboard.js
│   │   ├── results-viewer.js
│   │   └── report-builder.js
│   ├── tools/
│   │   ├── calculator.js
│   │   └── data-diagnostics.js
│   ├── settings/
│   │   ├── settings.js
│   │   └── profile.js
│   └── help/
│       ├── help.js
│       ├── methodology-guide.js
│       └── glossary.js
└── models/                   # Data models (future use)
```

#### Module Responsibilities

**main.js**
- Homepage initialization
- Dashboard UI setup
- Quick action handlers
- Project statistics display

**sidebar.js**
- Sidebar navigation logic
- Submenu toggle functionality
- Active state management
- Settings modal handling
- Mobile responsive behavior

**state/** (Application State Management)
- `AppState.js`: Central state object holding claims data, configuration, triangles
- `StateManager.js`: Observer pattern for state updates and notifications

**services/** (Business Logic)
- `FileService.js`:
  - CSV file reading
  - File parsing and data extraction
  - File validation
- `ValidationService.js`:
  - Date format validation
  - Numeric value validation
  - Required field checking
  - Data quality assessment
- `CalculationService.js`:
  - Triangle matrix construction
  - Development factor calculation
  - Reserve projection algorithms
  - Statistical analysis

**controllers/** (Application Logic)
- `DataController.js`:
  - Handles file upload events
  - Manages data filtering
  - Updates data preview table
  - Coordinates with FileService and ValidationService
- `TriangleController.js`:
  - Processes configuration changes
  - Triggers triangle generation
  - Manages triangle display
  - Coordinates with CalculationService
- `ExportController.js`:
  - Handles export button clicks
  - Formats data for export
  - Triggers file downloads
  - Generates audit packages

**views/** (UI Rendering)
- `DataInputView.js`:
  - Renders data preview tables
  - Updates summary statistics
  - Shows/hides filter sections
- `TriangleView.js`:
  - Renders triangle matrices
  - Formats numbers for display
  - Handles triangle visualization
- `AnalysisView.js`:
  - Displays development factors
  - Shows reserve projections
  - Renders statistical analysis
- `ExportView.js`:
  - Updates export UI elements
  - Shows export progress
  - Displays export success messages

**utils/** (Helper Functions)
- `DOMUtils.js`:
  - DOM element creation
  - Class manipulation
  - Event listener helpers
  - Element selection utilities
- `ProjectManager.js`:
  - Project save/load functionality
  - LocalStorage management
  - Project data serialization
- `ThemeManager.js`:
  - Theme switching (light/dark/sepia)
  - Theme persistence
  - Dynamic style updates

**methodologies/** (Calculation Engines)
- `triangle-methodology.js`:
  - Chain ladder calculations
  - Development factor computation
  - Reserve projections
  - Triangle matrix operations

**pages/** (Page-Specific Logic)
- Each page has its own JavaScript file for specific functionality
- Organized by feature area (projects, data, analysis, tools, settings, help)
- Handles page-specific UI interactions and data display

---

## Distribution Directory (`dist/`)

```
dist/
└── Two Dimensional Reserving-win32-x64/
    ├── Two Dimensional Reserving.exe    # Main executable
    ├── resources/                        # Application resources
    │   └── app.asar                     # Packaged application code
    ├── locales/                          # Electron localization files
    ├── *.dll                            # Required system libraries
    └── LICENSE*                         # License files
```

### Purpose
- Contains the built desktop application
- Generated by `npm run pack` command
- Portable, standalone executable
- Includes all dependencies and resources

---

## Documentation Directory (`docs/`)

```
docs/
├── README.md                      # Documentation index
├── ROADMAP.md                     # Development roadmap
├── chain-ladder-methodology.md    # Actuarial methodology docs
├── html-templates.md              # HTML/CSS/JS templates
└── project-structure.md           # This file
```

### Document Purposes

**README.md**
- Project overview and description
- Feature list and capabilities
- Quick start instructions
- System requirements
- Deployment options

**ROADMAP.md**
- Long-term development vision
- Planned features and enhancements
- Phase-by-phase implementation plan
- Regulatory compliance requirements
- Integration roadmap

**chain-ladder-methodology.md**
- Mathematical foundation
- Implementation details
- Algorithm documentation
- Configuration options
- Technical reference

**html-templates.md**
- Component templates
- Code examples for extensions
- Best practices
- CSS patterns
- JavaScript integration patterns

**project-structure.md**
- Directory organization
- File purposes and responsibilities
- Module relationships
- Architecture overview

---

## Configuration Files

### package.json
```json
{
  "name": "two-dimensional-reserving",
  "version": "1.0.0",
  "description": "Professional actuarial claims triangle analysis",
  "main": "electron-main.js",
  "scripts": {
    "start": "electron .",
    "pack": "electron-packager . --platform=win32 --arch=x64 --out=dist",
    "dist": "electron-builder"
  },
  "dependencies": {
    "electron": "^27.0.0"
  }
}
```

**Key Fields**:
- `main`: Entry point for Electron desktop app
- `scripts`: Build and run commands
- `dependencies`: External packages required

### electron-main.js
```javascript
// Electron main process
// - Creates application window
// - Manages menu bar
// - Handles file dialogs
// - Coordinates desktop app features
```

**Responsibilities**:
- Window creation and management
- Menu system (File, Edit, View, Help)
- File open/save dialogs
- Desktop integration
- Application lifecycle

---

## Architecture Overview

### Application Flow

```
User Interaction
    ↓
View Layer (views/*.js)
    ↓
Controller Layer (controllers/*.js)
    ↓
Service Layer (services/*.js)
    ↓
State Management (state/AppState.js)
    ↓
View Updates (Observer Pattern)
```

### Data Flow

```
CSV File → FileService → ValidationService → AppState
    ↓
Configuration → TriangleController → CalculationService
    ↓
Triangle Data → TriangleView → Display
    ↓
Analysis → AnalysisView → Display
    ↓
Export → ExportController → FileService → Download
```

### Module Dependencies

```
main.js
├── controllers/
│   ├── DataController
│   │   ├── FileService
│   │   ├── ValidationService
│   │   └── DataInputView
│   ├── TriangleController
│   │   ├── CalculationService
│   │   └── TriangleView
│   └── ExportController
│       ├── FileService
│       └── ExportView
├── state/
│   └── AppState → StateManager
└── utils/
    └── DOMUtils (used by all views)
```

---

## File Naming Conventions

### JavaScript Files
- **PascalCase** for class-based modules: `DataController.js`, `AppState.js`
- **camelCase** for utility modules: `main.js`
- **Descriptive names** indicating purpose

### CSS Files
- **kebab-case** for all CSS files: `data-input.css`, `main.css`
- **Component-based naming**: `buttons.css`, `forms.css`
- **View-based naming**: `triangle.css`, `analysis.css`

### HTML Files
- **kebab-case** for descriptive names: `index.html`, `debug.html`
- **lowercase** for standard names

### Directories
- **lowercase** for all directories: `src`, `docs`, `dist`
- **Descriptive names**: `controllers`, `services`, `views`

---

## Build Artifacts

### Development Files (Not in Version Control)
```
node_modules/          # npm dependencies
.claude/              # Editor configuration
*.backup              # Backup files
```

### Build Output
```
dist/                 # Built desktop application
```

### Temporary Files
```
test-claims.csv       # Test data (version controlled)
*.log                 # Log files (not version controlled)
```

---

## Adding New Features

### Step 1: Plan Structure
1. Determine which layer(s) need changes (View, Controller, Service)
2. Identify new files needed
3. Plan state changes required

### Step 2: Create Files
```
src/js/controllers/NewFeatureController.js
src/js/views/NewFeatureView.js
src/js/services/NewFeatureService.js (if needed)
src/css/views/new-feature.css
```

### Step 3: Update HTML
```html
<!-- Add tab button -->
<button class="tab-button" data-tab="new-feature">...</button>

<!-- Add tab panel -->
<section id="new-feature-panel" class="tab-panel">...</section>
```

### Step 4: Register Module
```javascript
// In main.js
import { NewFeatureController } from './controllers/NewFeatureController.js';
const newFeatureController = new NewFeatureController(appState);
```

### Step 5: Document
- Update [html-templates.md](html-templates.md) with new patterns
- Update this file if structure changes
- Update [README.md](README.md) with new features

---

## Best Practices

### File Organization
- Keep related files together in logical directories
- One class/component per file
- Use index files for re-exports if needed

### Module Design
- Single Responsibility Principle
- Clear dependencies
- Minimal coupling
- Easy to test in isolation

### Naming
- Descriptive, not abbreviated
- Consistent conventions
- Indicates purpose and type

### Documentation
- Comment complex logic
- Document public APIs
- Keep docs updated with code changes

---

## Development Workflow

### Local Development
```bash
# Start development server (web app)
# Open src/index.html in browser

# Or run Electron app
npm start
```

### Building Desktop App
```bash
# Install dependencies
npm install

# Build executable
npm run pack

# Output: dist/Two Dimensional Reserving-win32-x64/
```

### Testing
```bash
# Use debug.html for testing file operations
# Open src/debug.html in browser

# Use test-claims.csv for data testing
```

---

## Version Control

### Git Structure
```
main                  # Main development branch
├── docs/            # Documentation updates
├── src/             # Source code
└── package.json     # Dependencies
```

### Ignored Files (.gitignore)
```
node_modules/
dist/
*.log
.DS_Store
```

---

## Related Documentation

- [HTML Templates and Components](html-templates.md) - Component templates and examples
- [Chain-Ladder Methodology](chain-ladder-methodology.md) - Algorithm documentation
- [Development Roadmap](ROADMAP.md) - Future plans
- [Main README](README.md) - Project overview

---

*This structure documentation should be updated whenever significant architectural changes are made to the project.*