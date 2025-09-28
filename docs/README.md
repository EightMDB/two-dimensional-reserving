# Two Dimensional Reserving

A professional actuarial claims triangle analysis application designed as an open source alternative to proprietary solutions like Moody's Axis. Available as both a web application and a native desktop application.

## Description

This project provides a comprehensive solution for actuarial reserving with an intuitive web interface that processes claims data through development triangles. The application offers advanced configuration options, multiple development factor calculation methods, and comprehensive export capabilities for regulatory compliance and auditing.

## Current Status

**Phase: Production Ready** ✅

The application has evolved from initial research into a fully functional solution available in multiple deployment options:

## 🖥️ Deployment Options

### Desktop Application (Recommended)
- **Native Windows executable** with professional menu system
- **File menu integration** for opening CSV files
- **Keyboard shortcuts** (Ctrl+O, Ctrl+N, etc.)
- **Portable installation** - no dependencies required
- **Professional window management** with resizing and full-screen support

### Web Application
- **Browser-based** interface for cross-platform compatibility
- **Direct file upload** via drag & drop or file browser
- **Modern responsive design** optimized for desktop browsers

### 🚀 Implemented Features

#### Data Management
- **CSV Upload Wizard**: Step-by-step guided import with column mapping
- **Drag & Drop Interface**: Modern file upload with visual feedback
- **Data Validation**: Automatic validation of required fields and data formats
- **Real-time Filtering**: Filter claims by date range, amount, delimiter, and search terms
- **Data Export**: Multiple formats (CSV, JSON, Excel) with audit trails

#### Claims Triangle Generation
- **Multiple Granularities**: Monthly, quarterly, and annual aggregation
- **Development Methods**: Lag-based and calendar period development tracking
- **Advanced Configuration**:
  - Multiple development factor calculation methods
  - Statistical outlier exclusion
  - Factor smoothing options
  - Tail extrapolation
  - Custom factor overrides
- **Visual Display**: Interactive triangle views (cumulative and incremental)

#### Statistical Analysis
- **Development Factors**: Multiple calculation methodologies with detailed breakdowns
- **Reserve Projections**: Automated reserve calculations using chain ladder methods
- **Method Comparison**: Side-by-side comparison of different actuarial methods
- **Enhanced Statistics**: Comprehensive statistical summaries and pattern analysis
- **Pattern Visualization**: Interactive charts showing development patterns

#### Export & Audit Capabilities
- **Comprehensive Audit Package**: Complete documentation for regulatory review
- **Intermediate Triangles**: Export of all calculation stages
- **Method Comparison Reports**: Detailed comparison analysis
- **Configuration Management**: Save, load, and share triangle configurations

#### Professional Interface
- **Tabbed Navigation**: Organized workflow across Data Input, Triangle, Analysis, and Export
- **Responsive Design**: Professional styling with Font Awesome icons
- **Real-time Updates**: Dynamic updates as data and configurations change
- **Collapsible Sections**: Organized analysis display with expandable sections

### 📊 Core Data Requirements

The application processes claims data with these fields:

1. **Incurred Date** (date): Date when the claim was incurred
2. **Paid Date** (date): Date when the claim was paid
3. **Paid Amount** (currency): Amount paid for the claim (decimal precision to cents)
4. **Delimiter** (string, optional): Category identifier for grouping claims into reserving buckets

### 🔧 Technical Implementation

#### Core Technology
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Visualization**: Chart.js for interactive pattern charts
- **Styling**: Modern CSS with Font Awesome icons
- **Data Processing**: Client-side CSV parsing and triangle calculations
- **Export**: Multiple format support with audit trail generation

#### Desktop Application
- **Framework**: Electron for cross-platform desktop deployment
- **Packaging**: electron-packager for creating portable executables
- **Security**: Sandboxed renderer process with secure file access
- **Distribution**: Standalone executable with no installation required

## 🚀 Quick Start

### Desktop Application (Recommended)

#### Option 1: Use Pre-built Executable
1. Navigate to `dist/Two Dimensional Reserving-win32-x64/`
2. Double-click `Two Dimensional Reserving.exe` to launch
3. Use **File > Open CSV** or **Ctrl+O** to load your claims data

#### Option 2: Use Launcher Script
1. Double-click `launch-app.bat` in the root directory
2. The application will start automatically

#### Option 3: Build from Source
```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build standalone executable
npm run pack
```

### Web Application
1. Open `index.html` in a modern web browser
2. Navigate to the "Data Input" tab
3. Upload your claims CSV file using the guided wizard
4. Configure triangle settings in the "Claims Triangle" tab
5. Generate and analyze development triangles
6. Review statistical analysis in the "Analysis" tab
7. Export results and audit packages from the "Export" tab

## File Structure

```
├── index.html              # Main application interface
├── script.js               # Core application logic and triangle calculations
├── styles.css              # Professional styling and responsive design
├── main.js                 # Electron main process (desktop app)
├── package.json            # Node.js dependencies and build configuration
├── launch-app.bat          # Windows launcher script
├── dist/                   # Built desktop application
│   └── Two Dimensional Reserving-win32-x64/
│       └── Two Dimensional Reserving.exe  # Windows executable
└── README.md              # This documentation
```

## System Requirements

### Desktop Application
- **Windows**: Windows 10 or later (64-bit)
- **Memory**: 512 MB RAM minimum, 1 GB recommended
- **Storage**: 200 MB available space
- **Dependencies**: None (completely portable)

### Web Application
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Must be enabled
- **File Access**: Local file access permissions required

## Development Commands

```bash
# Install dependencies
npm install

# Run development version
npm start

# Build portable executable
npm run pack

# Build installer (advanced)
npm run dist
```

## 📦 Distribution

The desktop application is distributed as a portable executable requiring no installation. Simply copy the `dist/Two Dimensional Reserving-win32-x64/` folder to any Windows computer and run the executable.

## 🔄 Future Development

The application continues to evolve with planned enhancements for:
- **Multi-platform support**: macOS and Linux desktop applications
- **Advanced statistical testing**: Additional actuarial methodologies
- **Enhanced visualization**: Interactive charts and graphs
- **Performance optimization**: Large dataset handling improvements
- **Cloud integration**: Optional cloud storage and collaboration features