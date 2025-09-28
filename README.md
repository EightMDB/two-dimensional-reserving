# Two Dimensional Reserving

A professional web-based actuarial claims triangle analysis application designed as an open source alternative to proprietary solutions like Moody's Axis.

## Description

This project provides a comprehensive solution for actuarial reserving with an intuitive web interface that processes claims data through development triangles. The application offers advanced configuration options, multiple development factor calculation methods, and comprehensive export capabilities for regulatory compliance and auditing.

## Current Status

**Phase: Advanced Prototype Development** ✅

The application has evolved from initial research into a fully* functional web-based prototype with sophisticated features:

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

- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **Visualization**: Chart.js for interactive pattern charts
- **Styling**: Modern CSS with Font Awesome icons
- **Data Processing**: Client-side CSV parsing and triangle calculations
- **Export**: Multiple format support with audit trail generation

## Usage

1. Open `index.html` in a modern web browser
2. Navigate to the "Data Input" tab
3. Upload your claims CSV file using the guided wizard
4. Configure triangle settings in the "Claims Triangle" tab
5. Generate and analyze development triangles
6. Review statistical analysis in the "Analysis" tab
7. Export results and audit packages from the "Export" tab

## File Structure

```
├── index.html          # Main application interface
├── script.js           # Core application logic and triangle calculations
├── styles.css          # Professional styling and responsive design
└── README.md          # This documentation
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Development

The application continues to evolve with planned enhancements for:
- Advanced statistical testing
- Additional reserving methodologies
- Enhanced visualization options
- Performance optimization for large datasets
- Further formatting