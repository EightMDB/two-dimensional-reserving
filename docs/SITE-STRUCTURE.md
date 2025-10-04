# Two Dimensional Reserving Application - Site Structure

**Created:** October 1, 2025
**Status:** Complete Implementation

This document details the complete site structure for the Two Dimensional Reserving application, including all implemented pages, their relationships, and navigation paths.

---

## Directory Structure

```
src/
├── index.html                          # Homepage (Dashboard)
│
├── projects/                           # Project Management
│   ├── projects.html                   # Projects list & management
│   ├── project-detail.html             # Individual project details
│   └── project-comparison.html         # Side-by-side project comparison
│
├── data/                               # Data Management
│   ├── data-library.html               # Dataset library & management
│   └── data-viewer.html                # Interactive data viewer/editor
│
├── analysis/                           # Analysis & Reporting
│   ├── analysis-dashboard.html         # Analysis tracking dashboard
│   ├── results-viewer.html             # Results visualization
│   └── report-builder.html             # Custom report creation
│
├── tools/                              # Tools & Utilities
│   ├── calculator.html                 # Reserve calculators
│   └── data-diagnostics.html           # Data quality diagnostics
│
├── settings/                           # Settings & Administration
│   ├── settings.html                   # Application settings
│   └── profile.html                    # User profile & statistics
│
├── help/                               # Help & Documentation
│   ├── help.html                       # Help center & FAQs
│   ├── methodology-guide.html          # Methodology documentation
│   └── glossary.html                   # Actuarial terms glossary
│
├── methodologies/                      # Methodology Pages
│   ├── chain-ladder.html               # Chain Ladder method
│   ├── bornhuetter-ferguson.html       # Bornhuetter-Ferguson method
│   ├── benktander.html                 # Benktander method
│   └── cape-cod.html                   # Cape Cod method
│
├── css/                                # Stylesheets
│   ├── main.css
│   └── sidebar.css
│
└── js/                                 # JavaScript
    ├── sidebar.js
    ├── upload-handler.js
    ├── projects/
    │   ├── projects-manager.js
    │   ├── project-detail.js
    │   └── project-comparison.js
    ├── data/
    │   ├── data-library.js
    │   └── data-viewer.js
    ├── analysis/
    │   ├── analysis-dashboard.js
    │   ├── results-viewer.js
    │   └── report-builder.js
    ├── tools/
    │   ├── calculator.js
    │   └── data-diagnostics.js
    ├── settings/
    │   ├── settings.js
    │   └── profile.js
    └── help/
        ├── help.js
        ├── methodology-guide.js
        └── glossary.js
```

---

## Complete Site Map

### Homepage (index.html)
**Root Page:** Dashboard and navigation hub

**Sections:**
- Dashboard Statistics (4 cards)
- Recent Projects (4 cards: 1 create + 3 empty state)
- Quick Actions (4 cards)
- Available Methodologies (4 methodology cards)

**Navigation Links:**
- → Projects
- → Data Library
- → Analysis Dashboard
- → Chain Ladder
- → Bornhuetter-Ferguson
- → Benktander
- → Cape Cod
- → Tools (Calculator, Diagnostics)
- → Help Center
- → Settings

---

## 1. PROJECT MANAGEMENT

### projects/projects.html
**Purpose:** Manage and organize all analysis projects

**Features:**
- Projects grid with cards
- Search and filter functionality
- Create new project modal
- Project status indicators

**Navigation:**
- **From:** Homepage → Projects
- **To:**
  - project-detail.html (view individual project)
  - project-comparison.html (compare projects)
  - Create new project (modal)

**Breadcrumb:** Home → Projects

---

### projects/project-detail.html
**Purpose:** Detailed view of individual project

**Tabs:**
1. **Overview:** Project information and data summary
2. **Data View:** Data preview table
3. **Results:** Analysis results (when available)
4. **History:** Version history and timeline

**Features:**
- Dashboard statistics (Methodology, Status, Records, Date)
- Edit project information
- Run analysis
- Export project data

**Navigation:**
- **From:** projects.html (clicking project card)
- **To:**
  - Back to projects.html
  - Run analysis → methodology pages

**Breadcrumb:** Home → Projects → [Project Name]

---

### projects/project-comparison.html
**Purpose:** Side-by-side comparison of 2-4 projects

**Features:**
- Project selection dropdowns (2-4 projects)
- Metrics comparison table
- Visual comparison charts
- Key differences analysis
- Export comparison report

**Navigation:**
- **From:** projects.html
- **To:** Back to projects.html

**Breadcrumb:** Home → Projects → Compare Projects

---

## 2. DATA MANAGEMENT

### data/data-library.html
**Purpose:** Manage uploaded datasets

**Features:**
- Dataset cards grid
- Upload new dataset functionality
- Search and filter datasets
- Dataset statistics (total datasets, records, storage)
- Dataset actions (View, Edit, Delete, Use in Analysis)

**Navigation:**
- **From:** Homepage → Data Library (sidebar)
- **To:**
  - data-viewer.html (view/edit dataset)
  - Upload wizard modal

**Breadcrumb:** Home → Data Library

---

### data/data-viewer.html
**Purpose:** Interactive data table viewer and editor

**Features:**
- Dataset selection dropdown
- Interactive data table with:
  - Sorting
  - Filtering
  - Search
  - Row selection
  - Pagination
- Column statistics panel
- Data quality checks display
- Export options

**Navigation:**
- **From:** data-library.html
- **To:** Back to data-library.html

**Breadcrumb:** Home → Data Library → Data Viewer

---

## 3. ANALYSIS & REPORTING

### analysis/analysis-dashboard.html
**Purpose:** Track all reserving analyses

**Features:**
- Analysis statistics (Total, Completed, Running, Failed)
- Status tabs (All, Running, Completed, Failed)
- Analysis list with progress indicators
- Recent results cards
- New analysis creation

**Navigation:**
- **From:** Homepage → Analysis (sidebar)
- **To:**
  - results-viewer.html (view results)
  - report-builder.html (create report)
  - Methodology pages (new analysis)

**Breadcrumb:** Home → Analysis Dashboard

---

### analysis/results-viewer.html
**Purpose:** Interactive visualization of analysis results

**Features:**
- Chart visualizations
- Statistical summary tables
- Export results (PDF, Excel, CSV)

**Navigation:**
- **From:** analysis-dashboard.html
- **To:** Back to analysis-dashboard.html

**Breadcrumb:** Home → Analysis → Results Viewer

---

### analysis/report-builder.html
**Purpose:** Create custom reports with templates

**Features:**
- Template selection (Blank, Executive Summary, Detailed Analysis, Regulatory)
- Drag-and-drop section builder
- Report preview
- Export options (PDF, Word, PowerPoint)

**Navigation:**
- **From:** analysis-dashboard.html
- **To:** Back to analysis-dashboard.html

**Breadcrumb:** Home → Analysis → Report Builder

---

## 4. TOOLS & UTILITIES

### tools/calculator.html
**Purpose:** Quick reserve calculations

**Tabs:**
1. **Loss Development:** Calculate LDF from cumulative values
2. **IBNR Estimate:** Calculate IBNR from ultimate and paid
3. **What-If Scenarios:** Test different assumptions

**Features:**
- Interactive calculators
- Real-time results
- Scenario comparison

**Navigation:**
- **From:** Homepage → Tools → Calculator (sidebar)
- **To:** Back to homepage

**Breadcrumb:** Home → Reserve Calculator

---

### tools/data-diagnostics.html
**Purpose:** Data quality analysis and recommendations

**Features:**
- Data quality score dashboard
- Issues list (outliers, missing values, format issues)
- Recommendations
- Diagnostic reports

**Navigation:**
- **From:** Homepage → Tools → Diagnostics (sidebar)
- **To:** Back to homepage

**Breadcrumb:** Home → Data Diagnostics

---

## 5. METHODOLOGY PAGES (Root Level)

### chain-ladder.html
**Purpose:** Chain Ladder methodology implementation

**Sections:**
- Dashboard Stats (4 cards)
- Quick Actions (4 cards)

**Tabs:**
1. **Data Input:**
   - Data Upload section
   - Required Fields section
   - Development Factor Configuration section
2. **Configuration:**
   - Export Actions

**Features:**
- CSV upload wizard (3-tab system)
- Development factor smoothing options
- Triangle generation
- Results export

**Navigation:**
- **From:** Homepage → Chain Ladder
- **To:** Upload wizard, Results

**Breadcrumb:** Home → Chain Ladder

---

### bornhuetter-ferguson.html
**Purpose:** Bornhuetter-Ferguson methodology

**Sections:**
- Dashboard Stats
- Quick Actions

**Tabs:**
1. **Data Input:**
   - Data Upload
   - Required Fields
   - BF Method Parameters
2. **Configuration**
3. **Methodology Overview**
4. **Key Concepts**
5. **Examples**

**Features:**
- A priori loss ratio input
- BF calculation engine
- Educational content

**Navigation:**
- **From:** Homepage → Bornhuetter-Ferguson
- **To:** Upload wizard, Results

**Breadcrumb:** Home → Bornhuetter-Ferguson

---

### benktander.html
**Purpose:** Benktander methodology (iterative BF/CL hybrid)

**Sections:**
- Dashboard Stats
- Quick Actions

**Tabs:**
1. **Data Input:**
   - Data Upload
   - Required Fields
   - Benktander Parameters (iteration count)
2. **Configuration**
3. **Methodology Overview**
4. **Key Concepts**
5. **Examples**

**Features:**
- Iteration count selection (default: 2)
- Convergence analysis
- Combined CL/BF results

**Navigation:**
- **From:** Homepage → Benktander
- **To:** Upload wizard, Results

**Breadcrumb:** Home → Benktander

---

### cape-cod.html
**Purpose:** Cape Cod methodology (implied loss ratio)

**Sections:**
- Dashboard Stats
- Quick Actions

**Tabs:**
1. **Data Input:**
   - Data Upload
   - Required Fields
   - Cape Cod Output
2. **Configuration**
3. **Methodology Overview**
4. **Key Concepts**
5. **Examples**

**Features:**
- Exposure base input
- Implied loss ratio calculation
- Credibility weighting

**Navigation:**
- **From:** Homepage → Cape Cod
- **To:** Upload wizard, Results

**Breadcrumb:** Home → Cape Cod

---

## 6. SETTINGS & ADMINISTRATION

### settings/settings.html
**Purpose:** Configure application preferences

**Tabs:**
1. **User Preferences:**
   - Theme selection (Light, Dark, Sepia)
   - Default methodology
   - Display options
2. **Analysis Defaults:**
   - Development periods
   - Tail factor
   - Confidence level
3. **Export Settings:**
   - Default export format
   - Include options
4. **Data Storage:**
   - Storage usage stats
   - Clear cache option

**Navigation:**
- **From:** Sidebar → Settings button
- **To:** profile.html

**Breadcrumb:** Home → Settings

---

### settings/profile.html
**Purpose:** User profile and activity

**Sections:**
- User Information card
- Usage Statistics (4 stat cards)
- Recent Activity timeline

**Features:**
- Profile editing
- Usage analytics
- Activity history

**Navigation:**
- **From:** settings.html or top bar user menu
- **To:** settings.html

**Breadcrumb:** Home → Profile

---

## 7. HELP & DOCUMENTATION

### help/help.html
**Purpose:** Help center with guides and support

**Sections:**
- Help search
- Getting Started articles
- Video Tutorials (4 video cards)
- Frequently Asked Questions (expandable)
- Contact Support options

**Features:**
- Article search
- FAQ accordion
- Support contact forms

**Navigation:**
- **From:** Sidebar → Help Center
- **To:**
  - methodology-guide.html
  - glossary.html

**Breadcrumb:** Home → Help Center

---

### help/methodology-guide.html
**Purpose:** Comprehensive methodology documentation

**Sections:**
- When to Use Each Method (4 methodology cards)
- Comparison Matrix table
- Best Practices list

**Features:**
- Method comparison
- Use case guidance
- Links to methodology pages

**Navigation:**
- **From:** help.html or sidebar
- **To:** Methodology pages (chain-ladder.html, etc.)

**Breadcrumb:** Home → Methodology Guide

---

### help/glossary.html
**Purpose:** Actuarial terms and formulas reference

**Sections:**
- Glossary search
- Common Terms (alphabetical list)
- Key Formulas (formula cards)

**Features:**
- Term search/filter
- Formula displays with LaTeX-style formatting
- Cross-references

**Navigation:**
- **From:** help.html or sidebar
- **To:** Back to help.html

**Breadcrumb:** Home → Glossary

---

## Shared Components (Available on All Pages)

### Collapsible Sidebar
**Default State:** Collapsed (70px width)
**Expanded State:** 260px width

**Sections:**
1. **Main:**
   - Home
   - Projects (with submenu)
   - Data Library (with submenu)
   - Analysis (with submenu)

2. **Methodologies:**
   - Chain Ladder
   - Bornhuetter-Ferguson
   - Benktander
   - Cape Cod

3. **Tools:**
   - Calculator
   - Diagnostics

4. **Help:**
   - Help Center
   - Methodology Guide
   - Glossary

5. **Footer:**
   - Settings button

**State Persistence:** LocalStorage

---

### Top Bar
**Components:**
- Breadcrumb navigation (dynamic based on page)
- Notifications button (with badge count)
- User menu button

---

### Upload Wizard Modal
**Available on:** All methodology pages

**3-Tab System:**
1. **Preview Tab:**
   - File statistics (4 dashboard cards)
   - Data preview table (first 10 rows)

2. **Column Mapping Tab:**
   - 4 mapping cards with dropdowns:
     - Incurred Date
     - Paid Date
     - Paid Amount
     - Category/LOB
   - Auto-suggestion based on headers

3. **Confirmation Tab:**
   - Summary statistics (4 cards)
   - Validation status
   - Mapping review
   - Import button (disabled until all fields mapped)

**Navigation:**
- Previous/Next buttons
- Import button (final step)
- Close button

---

## Navigation Flow Diagram

```
Homepage (index.html)
│
├─ PROJECTS
│  ├─ projects.html
│  │  ├─ project-detail.html
│  │  └─ project-comparison.html
│
├─ DATA
│  ├─ data-library.html
│  └─ data-viewer.html
│
├─ ANALYSIS
│  ├─ analysis-dashboard.html
│  ├─ results-viewer.html
│  └─ report-builder.html
│
├─ METHODOLOGIES
│  ├─ chain-ladder.html
│  ├─ bornhuetter-ferguson.html
│  ├─ benktander.html
│  └─ cape-cod.html
│
├─ TOOLS
│  ├─ calculator.html
│  └─ data-diagnostics.html
│
├─ SETTINGS
│  ├─ settings.html
│  └─ profile.html
│
└─ HELP
   ├─ help.html
   ├─ methodology-guide.html
   └─ glossary.html
```

---

## Page Count Summary

| Category | Pages | Status |
|----------|-------|--------|
| Homepage | 1 | ✅ Existing |
| Project Management | 3 | ✅ Created |
| Data Management | 2 | ✅ Created |
| Analysis & Reporting | 3 | ✅ Created |
| Tools & Utilities | 2 | ✅ Created |
| Settings & Admin | 2 | ✅ Created |
| Help & Documentation | 3 | ✅ Created |
| Methodologies | 4 | ✅ Existing |
| **TOTAL** | **20** | **Complete** |

---

## JavaScript Files Summary

| Module | Files | Status |
|--------|-------|--------|
| Projects | 3 | ✅ Created |
| Data | 2 | ✅ Created |
| Analysis | 3 | ✅ Created |
| Tools | 2 | ✅ Created |
| Settings | 2 | ✅ Created |
| Help | 3 | ✅ Created |
| Core | 2 | ✅ Existing |
| **TOTAL** | **17** | **Complete** |

---

## Implementation Notes

### Design System
- **Card-based UI:** stat-card, action-card, content-card, method-card
- **Color Scheme:** CSS custom properties (--accent-color, --text-primary, etc.)
- **Icons:** Font Awesome 6.5.1
- **Responsive:** Grid layouts with auto-fit/auto-fill
- **Theme Support:** Light, Dark, Sepia modes

### Data Flow
1. **Upload:** CSV files via upload wizard
2. **Storage:** LocalStorage for client-side persistence
3. **Processing:** JavaScript classes for methodology calculations
4. **Export:** PDF, Excel, CSV formats

### Future Enhancements
- Backend API integration
- Real-time collaboration features
- Advanced charting libraries (Chart.js, D3.js)
- User authentication system
- Cloud storage integration
- Version control for projects

---

## Conclusion

The Two Dimensional Reserving application now has a complete site structure with 20 pages organized into 7 logical sections. All pages are consistently styled, include proper navigation, and are supported by modular JavaScript functionality. The application provides a comprehensive platform for actuarial reserving analysis using multiple methodologies.

**Documentation Date:** October 1, 2025
**Version:** 1.0
**Status:** ✅ Complete Implementation
