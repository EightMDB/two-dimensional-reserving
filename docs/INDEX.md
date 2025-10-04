# Two Dimensional Reserving - Documentation Index

## Welcome to the Documentation

This directory contains comprehensive documentation for the Two Dimensional Reserving application, a professional actuarial claims triangle analysis tool available as both a web and desktop application.

---

## Quick Links

### Getting Started
- **[README.md](README.md)** - Start here! Overview, features, and quick start guide

### For Developers
- **[project-structure.md](project-structure.md)** - Complete project organization and architecture
- **[html-templates.md](html-templates.md)** - Templates and patterns for adding features

### For Actuaries
- **[chain-ladder-methodology.md](chain-ladder-methodology.md)** - Detailed actuarial methodology

### Planning
- **[ROADMAP.md](ROADMAP.md)** - Long-term development vision and planned features

---

## Documentation Overview

### 1. [README.md](README.md)
**Purpose**: Project overview and getting started guide

**Topics Covered**:
- Project description and current status
- Project structure with organized directories
- Deployment options (Desktop vs Web)
- Complete feature list including:
  - Navigation & Interface
  - Actuarial Methodologies (4 methods)
  - Data Management
  - Analysis Tools
  - Project Features
- Core data requirements
- Technical implementation
- Quick start instructions
- System requirements
- Development commands

**Best For**:
- New users wanting to understand the application
- Setting up the application for the first time
- Understanding available features
- System administrators deploying the application

---

### 2. [project-structure.md](project-structure.md)
**Purpose**: Complete guide to project organization and architecture

**Topics Covered**:
- Directory structure and file organization
- HTML, CSS, and JavaScript file purposes
- Module responsibilities and relationships
- Architecture patterns (MVC-like structure)
- File naming conventions
- Build artifacts and distribution
- Best practices for development
- Adding new features workflow

**Best For**:
- Developers joining the project
- Understanding code organization
- Planning new features
- Maintaining code quality
- Troubleshooting file locations

---

### 3. [html-templates.md](html-templates.md)
**Purpose**: Templates and patterns for extending the application

**Topics Covered**:
- Adding new tabs to the interface
- Component templates (forms, buttons, tables, modals)
- CSS organization and variable system
- JavaScript integration patterns
- MVC architecture implementation
- Best practices for HTML, CSS, and JavaScript
- Complete example implementations

**Best For**:
- Developers adding new features
- Creating consistent UI components
- Following established patterns
- Understanding the component system
- Learning the codebase conventions

---

### 4. [chain-ladder-methodology.md](chain-ladder-methodology.md)
**Purpose**: Detailed documentation of actuarial methodology and algorithms

**Topics Covered**:
- Chain-ladder mathematical foundation
- Implementation architecture
- Data processing workflow
- Triangle construction algorithms
- Development factor calculation methods
- Reserve projection techniques
- Configuration options
- Step-by-step usage instructions
- Technical reference and function locations

**Best For**:
- Actuaries using the application
- Understanding the methodology
- Validating calculations
- Configuring analysis parameters
- Academic or regulatory review
- Algorithm implementation details

---

### 5. [ROADMAP.md](ROADMAP.md)
**Purpose**: Long-term development vision and feature planning

**Topics Covered**:
- Vision statement and goals
- Current implementation status
- Planned methodology enhancements
- Additional reserving methods (B-F, Cape Cod, etc.)
- Life, Health, and Disability insurance features
- Regulatory compliance (ASOP, NAIC, IFRS 17)
- Enterprise integration plans
- Statistical software integration
- Advanced analytics and AI features
- Implementation priorities

**Best For**:
- Understanding project direction
- Planning contributions
- Stakeholder discussions
- Feature prioritization
- Compliance planning
- Strategic decision making

---

## Documentation Structure

```
docs/
├── INDEX.md                                    # This file - documentation index
├── README.md                                   # Comprehensive project documentation
├── project-structure.md                        # File organization and architecture
├── SITE-STRUCTURE.md                          # Complete site structure and navigation
├── html-templates.md                          # Component templates and patterns
├── chain-ladder-methodology.md                # Actuarial methodology
├── ROADMAP.md                                 # Development roadmap
└── Actuarial Reserving Methodologies-*.md    # Regulatory framework analysis
```

---

## Documentation Cross-References

### If You Want To...

#### Learn About the Application
1. Start with [README.md](README.md) for overview
2. Read [chain-ladder-methodology.md](chain-ladder-methodology.md) for methodology
3. Check [ROADMAP.md](ROADMAP.md) for future features

#### Set Up Development Environment
1. Read [README.md](README.md) - Development Commands section
2. Review [project-structure.md](project-structure.md) - Development Workflow
3. Check [html-templates.md](html-templates.md) - Best Practices

#### Add a New Feature
1. Review [project-structure.md](project-structure.md) - Adding New Features
2. Use templates from [html-templates.md](html-templates.md)
3. Follow patterns in existing code
4. Update relevant documentation

#### Understand Calculations
1. Read [chain-ladder-methodology.md](chain-ladder-methodology.md) - Core Methodology
2. Review [chain-ladder-methodology.md](chain-ladder-methodology.md) - Technical Reference
3. Check code in `src/js/services/CalculationService.js`

#### Plan Future Work
1. Review [ROADMAP.md](ROADMAP.md) for planned features
2. Check [project-structure.md](project-structure.md) for architecture constraints
3. Review [html-templates.md](html-templates.md) for implementation patterns

---

## Document Relationships

```
README.md (Entry Point)
    ├─→ project-structure.md (Architecture & Organization)
    │       └─→ html-templates.md (Implementation Patterns)
    ├─→ chain-ladder-methodology.md (Methodology Details)
    └─→ ROADMAP.md (Future Plans)
```

---

## Key Concepts by Document

### README.md
- Features and capabilities
- Deployment options
- Quick start guide
- System requirements

### project-structure.md
- MVC-like architecture
- Module separation (state, services, controllers, views)
- File organization patterns
- Development workflow

### html-templates.md
- Component templates
- Tab system
- CSS variable system
- Event handling patterns
- Observer pattern for state

### chain-ladder-methodology.md
- Triangle construction
- Development factors
- Reserve projections
- Statistical methods
- Configuration options

### ROADMAP.md
- Phase-by-phase development
- Regulatory compliance
- Methodology expansion
- Enterprise features
- AI and automation

---

## Contributing to Documentation

When updating documentation:

1. **Keep It Current**: Update docs when code changes
2. **Cross-Reference**: Link related documents
3. **Be Specific**: Include file paths and line numbers where helpful
4. **Use Examples**: Code examples clarify concepts
5. **Update This Index**: Keep the index current when adding new docs

### Documentation Standards

- Use markdown formatting
- Include table of contents for long documents
- Add code examples with syntax highlighting
- Use relative links for cross-references
- Keep line length reasonable (80-120 characters)
- Use clear, descriptive headings

---

## Getting Help

### For Users
- Check [README.md](README.md) for basic usage
- Review [chain-ladder-methodology.md](chain-ladder-methodology.md) for methodology questions

### For Developers
- Review [project-structure.md](project-structure.md) for architecture
- Check [html-templates.md](html-templates.md) for patterns
- Examine existing code for examples

### For Stakeholders
- Read [README.md](README.md) for overview
- Review [ROADMAP.md](ROADMAP.md) for future plans

---

## External Resources

- **Font Awesome Icons**: https://fontawesome.com/icons
- **Electron Documentation**: https://www.electronjs.org/docs
- **JavaScript MDN**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **CSS Tricks**: https://css-tricks.com/
- **Actuarial Standards of Practice**: https://www.actuarialstandardsboard.org/

---

## Changelog

### 2025-10-03
- Updated README.md with current project structure
- Updated project-structure.md with actual file organization
- Updated SITE-STRUCTURE.md with correct methodology paths
- Refactored all HTML files to follow consistent template
- Removed breadcrumb navigation from all pages (except index.html)
- Updated all sidebar navigation links to work correctly
- Added comprehensive feature documentation

### 2025-09-29
- Created comprehensive documentation set
- Added html-templates.md with component templates
- Added project-structure.md with architecture details
- Updated chain-ladder-methodology.md with modular file references
- Updated README.md with documentation links
- Created this index file

---

*This documentation index should be updated whenever new documentation is added or the structure changes significantly.*