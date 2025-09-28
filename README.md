# Two Dimensional Reserving

A professional actuarial claims triangle analysis application designed as an open source alternative to proprietary solutions like Moody's Axis. Available as both a web application and a native desktop application.

## 🚀 Quick Start

### Desktop Application (Recommended)
Double-click `launch-app.bat` to start the desktop application

### Web Application
Open `src/index.html` in your web browser

## 📁 Project Structure

```
two-dimensional-reserving/
├── src/                    # Application source code
│   ├── index.html         # Main application interface
│   ├── script.js          # Core logic and calculations
│   └── styles.css         # Professional styling
├── docs/                  # Documentation
│   ├── README.md         # Comprehensive documentation
│   └── LICENSE           # License information
├── sample-data/          # Example CSV files for testing
├── dist/                 # Built desktop application
├── main.js               # Electron main process
├── package.json          # Project configuration
├── launch-app.bat        # Windows launcher script
└── .gitignore           # Git ignore rules
```

## 🖥️ Deployment Options

### Desktop Application
- **Native Windows executable** with professional menu system
- **File menu integration** for opening CSV files (Ctrl+O)
- **Keyboard shortcuts** for common operations
- **Portable installation** - no dependencies required
- **Professional window management** with resizing and full-screen support

### Web Application
- **Browser-based** interface for cross-platform compatibility
- **Direct file upload** via drag & drop or file browser
- **Modern responsive design** optimized for desktop browsers

## 🏗️ Development Commands

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

## 📊 Features

### Data Management
- **CSV Upload Wizard**: Step-by-step guided import with column mapping
- **Drag & Drop Interface**: Modern file upload with visual feedback
- **Data Validation**: Automatic validation of required fields and formats
- **Real-time Filtering**: Filter claims by date range, amount, delimiter, and search
- **Data Export**: Multiple formats (CSV, JSON, Excel) with audit trails

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

### Statistical Analysis
- **Development Factors**: Multiple calculation methodologies with detailed breakdowns
- **Reserve Projections**: Automated reserve calculations using chain ladder methods
- **Method Comparison**: Side-by-side comparison of different actuarial methods
- **Enhanced Statistics**: Comprehensive statistical summaries and pattern analysis
- **Pattern Visualization**: Interactive charts showing development patterns

### Export & Audit Capabilities
- **Comprehensive Audit Package**: Complete documentation for regulatory review
- **Intermediate Triangles**: Export of all calculation stages
- **Method Comparison Reports**: Detailed comparison analysis
- **Configuration Management**: Save, load, and share triangle configurations

## 📋 Data Requirements

The application processes claims data with these fields:

1. **Incurred Date** (date): Date when the claim was incurred
2. **Paid Date** (date): Date when the claim was paid
3. **Paid Amount** (currency): Amount paid for the claim (decimal precision to cents)
4. **Delimiter** (string, optional): Category identifier for grouping claims into reserving buckets

## 💻 System Requirements

### Desktop Application
- **Windows**: Windows 10 or later (64-bit)
- **Memory**: 512 MB RAM minimum, 1 GB recommended
- **Storage**: 200 MB available space
- **Dependencies**: None (completely portable)

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

## 📦 Distribution

The desktop application is distributed as a portable executable requiring no installation. Simply copy the `dist/Two Dimensional Reserving-win32-x64/` folder to any Windows computer and run the executable.

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