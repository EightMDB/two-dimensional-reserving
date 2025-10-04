# Two Dimensional Reserving

A professional actuarial claims triangle analysis application designed as an open source alternative to proprietary solutions like Moody's Axis. Available as both a web application and a native desktop application.

## 🚀 Quick Start

### Web Application
Open `src/index.html` in your web browser

## 📁 Project Structure

```
two-dimensional-reserving/
├── src/                        # Application source code
│   ├── index.html             # Main application homepage
│   ├── debug.html             # Debug/testing interface
│   ├── css/                   # Stylesheets
│   │   ├── main.css          # Global styles and variables
│   │   ├── sidebar.css       # Sidebar navigation styles
│   │   ├── components/       # Reusable component styles
│   │   └── views/            # Page-specific styles
│   ├── js/                    # JavaScript modules
│   │   ├── main.js           # Application entry point
│   │   ├── sidebar.js        # Sidebar navigation logic
│   │   ├── controllers/      # Business logic controllers
│   │   ├── services/         # Data services (File, Validation, Calculation)
│   │   ├── views/            # UI rendering modules
│   │   ├── state/            # Application state management
│   │   ├── utils/            # Utility functions
│   │   ├── methodologies/    # Actuarial methodology implementations
│   │   └── pages/            # Page-specific scripts
│   ├── methodologies/         # Methodology pages
│   │   ├── chain-ladder.html
│   │   ├── bornhuetter-ferguson.html
│   │   ├── benktander.html
│   │   └── cape-cod.html
│   ├── projects/              # Project management pages
│   ├── data/                  # Data library pages
│   ├── analysis/              # Analysis dashboard pages
│   ├── tools/                 # Utility tools pages
│   ├── settings/              # Settings pages
│   └── help/                  # Help and documentation pages
├── docs/                      # Documentation
│   ├── README.md             # Comprehensive documentation
│   ├── project-structure.md  # Architecture documentation
│   ├── ROADMAP.md            # Development roadmap
│   └── *.md                  # Additional documentation
├── dist/                      # Built desktop application
├── electron-main.js           # Electron main process
├── package.json               # Project configuration
├── launch-app-dev.vbs         # Application launcher
└── README.md                  # This file
```

## 🖥️ Deployment Options

### Web Application
- **Browser-based** interface for cross-platform compatibility
- **Direct file upload** via drag & drop or file browser
- **Modern responsive design** optimized for desktop browsers

```

## 📊 Features

### Navigation & Interface
- **Sidebar Navigation**: Organized access to all features and methodologies
- **Responsive Design**: Modern, professional interface that works across devices
- **Theme Support**: Light, dark, and sepia themes with customizable settings
- **Project Management**: Create, save, and manage multiple analysis projects

### Actuarial Methodologies
- **Chain Ladder**: Classic development triangle methodology
- **Bornhuetter-Ferguson**: Expected loss ratio method with development patterns (To-Do)
- **Benktander**: Iterative credibility-weighted approach (To-Do)
- **Cape Cod**: Exposure-weighted expected loss methodology (To-Do)

### Data Management
- **Data Library**: Centralized data storage and management
- **CSV Upload**: Import claims data with guided wizard
- **Data Viewer**: Interactive table view with filtering and sorting
- **Data Validation**: Automatic validation of required fields and formats
- **Data Export**: Multiple formats (CSV, JSON, Excel) with audit trails

### Analysis Tools
- **Analysis Dashboard**: Comprehensive view of all calculations and results
- **Results Viewer**: Detailed examination of reserve projections
- **Report Builder**: Generate professional actuarial reports
- **Reserve Calculator**: Quick calculations and projections
- **Data Diagnostics**: Data quality assessment and validation tools

### Claims Triangle Generation
- **Multiple Granularities**: Monthly, quarterly, and annual aggregation
- **Development Methods**: Lag-based and calendar period development tracking
- **Advanced Configuration**:
  - Multiple development factor calculation methods
  - Statistical outlier exclusion
  - Factor smoothing options
  - Tail extrapolation
  - Custom factor overrides
- **Visual Display**: Interactive triangle views (cumulative and incremental)

### Project Features
- **Project Comparison**: Side-by-side comparison of different projects and methods
- **Configuration Management**: Save, load, and share triangle configurations
- **Audit Trail**: Complete documentation for regulatory review
- **Help & Documentation**: Built-in methodology guides and glossary

## 📋 Data Requirements

The application processes claims data with these fields:

1. **Incurred Date** (date): Date when the claim was incurred
2. **Paid Date** (date): Date when the claim was paid
3. **Paid Amount** (currency): Amount paid for the claim (decimal precision to cents)
4. **Delimiter** (string, optional): Category identifier for grouping claims into reserving buckets

## 💻 System Requirements

### Web Application
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Must be enabled
- **File Access**: Local file access permissions required

## 🔧 Technical Implementation

### Core Technology
- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Visualization**: Chart.js for interactive pattern charts
- **Styling**: Modern CSS with Font Awesome icons
- **Data Processing**: Client-side CSV parsing and triangle calculations
- **Export**: Multiple format support with audit trail generation

### Desktop Application
- **Framework**: Electron for cross-platform desktop deployment
- **Packaging**: electron-packager for creating portable executables
- **Security**: Sandboxed renderer process with secure file access
- **Distribution**: Standalone executable with no installation required

## 🤝 Contributing

This project is open source and welcomes contributions. Please refer to the documentation in the `docs/` folder for detailed information.

## 📄 License

This project is licensed under the MIT License - see the `docs/LICENSE` file for details.

## 🔄 Future Development

The application continues to evolve with planned enhancements for:
- **Multi-platform support**: macOS and Linux desktop applications
- **Advanced statistical testing**: Additional actuarial methodologies
- **Enhanced visualization**: Interactive charts and graphs
- **Performance optimization**: Large dataset handling improvements
- **Cloud integration**: Optional cloud storage and collaboration features