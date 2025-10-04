# Chain-Ladder Methodology Documentation

## Overview

This document provides comprehensive documentation of the chain-ladder method implementation in the Two Dimensional Reserving application. The chain-ladder method is a fundamental actuarial technique used for estimating claim reserves by analyzing the development patterns of claims over time.

## Table of Contents

1. [Core Methodology](#core-methodology)
2. [Implementation Architecture](#implementation-architecture)
3. [Data Processing Workflow](#data-processing-workflow)
4. [Triangle Construction](#triangle-construction)
5. [Development Factor Calculation](#development-factor-calculation)
6. [Reserve Projections](#reserve-projections)
7. [Configuration Options](#configuration-options)
8. [Detailed Step-by-Step Instructions](#detailed-step-by-step-instructions)
9. [Technical Reference](#technical-reference)

## Related Documentation

- [README.md](README.md) - Project overview and quick start
- [project-structure.md](project-structure.md) - File organization and architecture
- [html-templates.md](html-templates.md) - Templates for extending the application
- [ROADMAP.md](ROADMAP.md) - Future development plans

## Core Methodology

The chain-ladder method operates on the fundamental assumption that claims will develop according to historical patterns. The methodology involves:

1. **Triangle Construction**: Organizing claims data into a development triangle
2. **Development Factor Calculation**: Computing age-to-age factors from historical data
3. **Reserve Projection**: Applying factors to incomplete diagonals to estimate ultimate claims

### Mathematical Foundation

For each development period `d`, the development factor is calculated as:

```
Development Factor(d,d+1) = C(i,d+1) / C(i,d)
```

Where:
- `C(i,d)` represents cumulative claims for incurred period `i` at development period `d`
- `C(i,d+1)` represents cumulative claims for incurred period `i` at development period `d+1`
- The development factor represents the ratio between consecutive development periods

This is the standard chain-ladder development factor formula where each factor represents the cumulative multiplier from one development period to the next.

## Implementation Architecture

### Key Components

1. **Data Processing Layer** (`js/services/CalculationService.js`)
   - Raw claims data ingestion and validation
   - Period assignment and aggregation
   - Triangle matrix construction

2. **Analysis Engine** (`js/services/CalculationService.js`)
   - Development factor calculations
   - Multiple calculation methodologies
   - Statistical outlier handling

3. **Projection Module** (`js/services/CalculationService.js`)
   - Reserve estimates using calculated factors
   - Ultimate claim value projections
   - Period-by-period reserve breakdown

4. **UI Layer** (`js/views/TriangleView.js`, `js/views/AnalysisView.js`)
   - Triangle rendering and visualization
   - Analysis results display
   - Interactive configuration

### File Structure

The application now uses a modular structure with separate files for different concerns:

```
src/
├── index.html               # User interface
├── css/                    # Stylesheets (organized by component and view)
└── js/                     # JavaScript modules
    ├── main.js            # Application initialization
    ├── services/
    │   └── CalculationService.js  # Core actuarial calculations
    ├── controllers/
    │   └── TriangleController.js  # Triangle generation logic
    └── views/
        ├── TriangleView.js        # Triangle visualization
        └── AnalysisView.js        # Analysis display
```

See [project-structure.md](project-structure.md) for complete file organization.

## Data Processing Workflow

### Input Requirements

The application expects claims data with the following fields:

```javascript
{
    incurredDate: "YYYY-MM-DD",    // Date claim was incurred
    paidDate: "YYYY-MM-DD",        // Date payment was made
    paidAmount: Number,            // Payment amount (numeric)
    delimiter: String              // Optional grouping identifier
}
```

### Processing Steps

1. **Data Validation** (handled by `js/services/ValidationService.js`)
   - Date format validation
   - Numeric amount validation
   - Missing value detection

2. **Period Assignment** (`js/services/CalculationService.js`)
   - Incurred period calculation based on granularity
   - Development period calculation using specified method

3. **Aggregation** (`js/services/CalculationService.js`)
   - Claims grouped by incurred and development periods
   - Cumulative totals calculated

## Triangle Construction

### Primary Function: `buildTriangleMatrix(data)`

**Location**: `js/services/CalculationService.js`

**Purpose**: Constructs both incremental and cumulative claims development triangles from raw claims data.

#### Process Flow:

1. **Configuration Retrieval**
   ```javascript
   const config = getCurrentConfiguration();
   const { dateGranularity, developmentMethod } = config;
   ```

2. **Incremental Triangle Building**
   ```javascript
   // Group payments by incurred period and development period
   data.forEach(claim => {
       const incurredPeriod = getIncurredPeriod(claim.incurredDate, dateGranularity);
       const developmentPeriod = getDevelopmentPeriod(claim.incurredDate, claim.paidDate, dateGranularity, developmentMethod);

       if (!incremental[incurredPeriod]) {
           incremental[incurredPeriod] = {};
       }
       incremental[incurredPeriod][developmentPeriod] += claim.paidAmount;
   });
   ```

3. **Cumulative Conversion**
   ```javascript
   sortedPeriods.forEach(period => {
       cumulative[period] = {};
       let runningTotal = 0;

       for (let dev = 1; dev <= maxDevPeriod; dev++) {
           const incrementalValue = incremental[period][dev] || 0;
           runningTotal += incrementalValue;
           cumulative[period][dev] = runningTotal;
       }
   });
   ```

### Return Structure

```javascript
{
    matrix: {
        "2020-Q1": { 1: 100000, 2: 150000, 3: 175000 },
        "2020-Q2": { 1: 120000, 2: 180000 },
        "2020-Q3": { 1: 110000 }
    },
    periods: ["2020-Q1", "2020-Q2", "2020-Q3"],
    maxDevPeriod: 3
}
```

## Development Factor Calculation

### Primary Function: `calculateDevelopmentFactors(triangle)`

**Location**: `js/services/CalculationService.js`

**Purpose**: Calculates age-to-age development factors using various methodological approaches.

#### Development Factor Formula

For each pair of consecutive development periods, the basic development factor is calculated as:

```javascript
// Standard chain-ladder development factor: C(i,j) / C(i,j-1)
triangle.periods.forEach(period => {
    const current = triangle.matrix[period][dev];     // C(i,j-1)
    const next = triangle.matrix[period][dev + 1];    // C(i,j)

    if (current > 0 && next > 0) {
        const factor = next / current;  // This is the development factor
        factors.push(factor);
        weights.push(current);
    }
});
```

#### Calculation Methods

1. **Simple Average** (Default)
   ```javascript
   developmentFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
   ```

2. **Volume Weighted Average**
   ```javascript
   const weightedSum = factors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
   developmentFactor = weightedSum / totalWeight;
   ```

3. **Recent Periods** (Limited historical data)
   ```javascript
   if (config.factorMethod === 'recent-periods') {
       const recentCount = Math.min(config.recentPeriodsCount, factors.length);
       factors = factors.slice(-recentCount);
       weights = weights.slice(-recentCount);
   }
   ```

4. **Exclude High/Low** (Remove extreme values)
   ```javascript
   if (config.factorMethod === 'exclude-high-low') {
       const filtered = excludeHighLowFactors(factors, weights, config);
       factors = filtered.factors;
       weights = filtered.weights;
   }
   ```

#### Statistical Enhancements

1. **Outlier Removal** (`js/services/CalculationService.js`)
   ```javascript
   function removeOutliers(factors, weights) {
       const mean = factors.reduce((sum, f) => sum + f, 0) / factors.length;
       const stdDev = Math.sqrt(variance);

       // Remove factors beyond 3 standard deviations
       const filtered = factors.filter(factor =>
           Math.abs(factor - mean) <= 3 * stdDev
       );
       return { factors: filtered, weights: filtered };
   }
   ```

2. **Smoothing Application**
   ```javascript
   if (config.applySmoothing && devFactors[dev - 1]) {
       developmentFactor = (developmentFactor + devFactors[dev - 1]) / 2;
   }
   ```

3. **Factor Override**
   ```javascript
   if (config.enableFactorOverride && dev >= config.overridePeriod) {
       devFactors[dev] = config.overrideFactor;
   }
   ```

## Reserve Projections

### Primary Function: `generateReserveProjections(triangle)`

**Location**: `js/services/CalculationService.js`

**Purpose**: Projects ultimate claim values and calculates required reserves.

#### Projection Process

1. **Current Position Calculation**
   ```javascript
   triangle.periods.forEach(period => {
       const paidToDate = Object.values(triangle.matrix[period] || {})
           .reduce((sum, val) => sum + val, 0);
   });
   ```

2. **Ultimate Estimate Calculation**

   **Note**: The current implementation uses a simplified approach:
   ```javascript
   const ultimateEstimate = paidToDate * 1.2; // Simplified demonstration factor
   ```

   **Proper Chain-Ladder Implementation** (from detailed functions):
   ```javascript
   // Apply development factors sequentially
   let ultimateEstimate = paidToDate;
   Object.entries(factorsByPeriod).forEach(([dev, factorData]) => {
       const currentPaid = triangle.matrix[period][dev] || 0;
       if (currentPaid > 0) {
           const cumulativeMultiplier = 1 + factorData.factor;
           ultimateEstimate = Math.max(ultimateEstimate, currentPaid * cumulativeMultiplier);
       }
   });
   ```

3. **Reserve Calculation**
   ```javascript
   const reserve = Math.max(0, ultimateEstimate - paidToDate);
   ```

## Configuration Options

### Date Granularity Options

- **Monthly**: Claims aggregated by calendar month
- **Quarterly**: Claims aggregated by calendar quarter
- **Annual**: Claims aggregated by calendar year

### Development Period Methods

1. **Lag Method**: Time elapsed since incurred date
   ```javascript
   const diffMonths = (paid.getFullYear() - incurred.getFullYear()) * 12 +
                     (paid.getMonth() - incurred.getMonth());
   ```

2. **Calendar Period Method**: Based on calendar period differences
   ```javascript
   const incurredPeriod = getIncurredPeriod(incurredDate, granularity);
   const paidPeriod = getIncurredPeriod(paidDate, granularity);
   return Math.max(1, paidTotal - incTotal + 1);
   ```

### Factor Calculation Methods

1. **Simple Average**: Arithmetic mean of all factors
2. **Volume Weighted**: Weighted by claim volumes
3. **Recent Periods**: Limited to recent historical data
4. **Exclude High/Low**: Removes extreme values

### Advanced Options

- **Outlier Exclusion**: 3-sigma statistical filter
- **Factor Smoothing**: Adjacent period averaging
- **Factor Override**: Manual override for tail periods
- **Custom Exclude Periods**: n-of-m period selection

## Detailed Step-by-Step Instructions

### Step 1: Data Preparation

1. **Upload Claims Data**
   - Use CSV format with required fields
   - Ensure date formats are YYYY-MM-DD
   - Verify numeric amounts are properly formatted

2. **Data Validation**
   - Application automatically validates:
     - Date field formats
     - Numeric amount values
     - Required field completeness

### Step 2: Configure Triangle Parameters

1. **Select Date Granularity**
   ```javascript
   // Available options: 'monthly', 'quarterly', 'annual'
   config.dateGranularity = 'quarterly';
   ```

2. **Choose Development Method**
   ```javascript
   // Options: 'lag', 'calendar'
   config.developmentMethod = 'lag';
   ```

3. **Set Factor Calculation Method**
   ```javascript
   // Options: 'simple-average', 'volume-weighted', 'recent-periods', 'exclude-high-low'
   config.factorMethod = 'volume-weighted';
   ```

### Step 3: Generate Triangle

1. **Execute Triangle Generation**
   ```javascript
   // Triggered by: Generate Triangle button in UI
   // Handled by: TriangleController.generateTriangle()
   ```

2. **Triangle Construction Process**
   - Data filtered based on current configuration
   - Periods calculated using selected methods
   - Matrix populated with cumulative values

### Step 4: Development Factor Analysis

1. **Automatic Factor Calculation**
   ```javascript
   calculateDevelopmentFactors(triangle);
   ```

2. **Factor Validation**
   - Review calculated factors for reasonableness
   - Apply statistical filters if necessary
   - Override factors for tail periods if required

### Step 5: Reserve Projection

1. **Generate Projections**
   ```javascript
   generateReserveProjections(triangle);
   ```

2. **Review Results**
   - Examine ultimate estimates by period
   - Validate total reserve requirements
   - Compare with prior estimates

### Step 6: Export and Analysis

1. **Export Options**
   - Triangle data (CSV format)
   - Intermediate calculations
   - Audit package with full details

2. **Method Comparison**
   ```javascript
   generateMethodComparison(triangle, data);
   ```

## Technical Reference

### Key Functions and Locations

| Function | Location | Purpose |
|----------|----------|---------|
| `generateTriangle()` | `js/controllers/TriangleController.js` | Main triangle generation controller |
| `buildTriangleMatrix(data)` | `js/services/CalculationService.js` | Core triangle construction |
| `getDevelopmentPeriod()` | `js/services/CalculationService.js` | Development period calculation |
| `calculateDevelopmentFactors()` | `js/services/CalculationService.js` | Age-to-age factor calculation |
| `generateReserveProjections()` | `js/services/CalculationService.js` | Ultimate value projection |
| `render()` | `js/views/TriangleView.js` | Triangle visualization |

### Data Structures

#### Triangle Matrix Structure
```javascript
{
    matrix: {
        [incurredPeriod]: {
            [developmentPeriod]: cumulativeAmount
        }
    },
    periods: [sortedIncurredPeriods],
    maxDevPeriod: maximumDevelopmentPeriod
}
```

#### Configuration Object
```javascript
{
    dateGranularity: 'quarterly',
    developmentMethod: 'lag',
    factorMethod: 'volume-weighted',
    excludeOutliers: true,
    applySmoothing: false,
    enableFactorOverride: false,
    overridePeriod: 10,
    overrideFactor: 1.05
}
```

### Performance Considerations

1. **Memory Usage**: Triangles stored in memory as JavaScript objects
2. **Calculation Complexity**: O(n²) where n is the number of development periods
3. **UI Updates**: Real-time calculation updates as configuration changes

### Error Handling

1. **Data Validation**: Comprehensive input validation before processing
2. **Division by Zero**: Protected division operations in factor calculations
3. **Missing Data**: Graceful handling of incomplete triangles
4. **Configuration Validation**: Parameter boundary checking

### Browser Compatibility

- **Minimum Requirements**: ES6+ support
- **Tested Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Performance**: Optimized for datasets up to 100,000 claims

---

*This documentation covers the complete chain-ladder methodology implementation as of the current version. For technical support or implementation questions, refer to the application's README.md file.*