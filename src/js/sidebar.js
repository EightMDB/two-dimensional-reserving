/**
 * Sidebar Manager
 * Handles collapsible sidebar, navigation, themes, and project management
 */

class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.isCollapsed = this.loadCollapsedState();
        this.isMobileOpen = false;

        this.init();
    }

    init() {
        // Apply saved collapsed state
        if (this.isCollapsed) {
            this.sidebar.classList.add('collapsed');
        }

        // Setup event listeners
        this.setupSidebarToggle();
        this.setupMobileMenu();
        this.setupSubmenuToggles();
        this.setupThemeSelector();
        this.setupProjectButtons();
        this.setupNavigationItems();
        this.setupModalHandlers();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('✓ SidebarManager initialized');
    }

    // Sidebar Toggle
    setupSidebarToggle() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        this.sidebar.classList.toggle('collapsed');
        this.saveCollapsedState();

        // Close all submenus when collapsing
        if (this.isCollapsed) {
            this.closeAllSubmenus();
        }
    }

    // Mobile Menu
    setupMobileMenu() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 &&
                this.isMobileOpen &&
                !this.sidebar.contains(e.target) &&
                e.target !== this.mobileMenuBtn &&
                !this.mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.isMobileOpen = !this.isMobileOpen;
        this.sidebar.classList.toggle('mobile-open');
    }

    closeMobileMenu() {
        this.isMobileOpen = false;
        this.sidebar.classList.remove('mobile-open');
    }

    // Submenu Toggles
    setupSubmenuToggles() {
        // Projects submenu
        const projectsTrigger = document.getElementById('projects-trigger');
        const projectsSubmenu = document.getElementById('projects-submenu');

        if (projectsTrigger && projectsSubmenu) {
            projectsTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(projectsTrigger, projectsSubmenu);
            });
        }

        // Theme submenu
        const themeTrigger = document.getElementById('theme-trigger');
        const themeSubmenu = document.getElementById('theme-submenu');

        if (themeTrigger && themeSubmenu) {
            themeTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(themeTrigger, themeSubmenu);
            });
        }
    }

    toggleSubmenu(trigger, submenu) {
        const isExpanded = submenu.classList.contains('expanded');

        // Close all other submenus
        this.closeAllSubmenus();

        // Toggle this submenu
        if (!isExpanded) {
            trigger.classList.add('expanded');
            trigger.setAttribute('aria-expanded', 'true');
            submenu.classList.add('expanded');
        }
    }

    closeAllSubmenus() {
        const triggers = document.querySelectorAll('[aria-expanded]');
        const submenus = document.querySelectorAll('.nav-submenu');

        triggers.forEach(trigger => {
            trigger.classList.remove('expanded');
            trigger.setAttribute('aria-expanded', 'false');
        });

        submenus.forEach(submenu => {
            submenu.classList.remove('expanded');
        });
    }

    // Theme Selector
    setupThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        const themeNameSpan = document.getElementById('theme-name');

        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);

                // Update theme indicator
                if (themeNameSpan) {
                    const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
                    themeNameSpan.textContent = `${themeName} Theme`;
                }

                // Close mobile menu if open
                if (window.innerWidth <= 1024) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
        console.log(`Theme changed to: ${theme}`);

        // Trigger custom event for other components
        const event = new CustomEvent('themeChange', { detail: { theme } });
        document.dispatchEvent(event);
    }

    // Project Buttons
    setupProjectButtons() {
        const newProjectNav = document.getElementById('new-project-nav');
        const openProjectNav = document.getElementById('open-project-nav');
        const saveProjectNav = document.getElementById('save-project-nav');
        const recentProjectsNav = document.getElementById('recent-projects-nav');

        if (newProjectNav) {
            newProjectNav.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProjectModal('new');
                this.closeMobileMenu();
            });
        }

        if (openProjectNav) {
            openProjectNav.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProjectModal('open');
                this.closeMobileMenu();
            });
        }

        if (saveProjectNav) {
            saveProjectNav.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProjectModal('save');
                this.closeMobileMenu();
            });
        }

        if (recentProjectsNav) {
            recentProjectsNav.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProjectModal('open');
                this.closeMobileMenu();
            });
        }

        // Setup settings button
        this.setupSettingsButton();
    }

    setupSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Determine correct path based on current page location
                const path = window.location.pathname;
                let settingsPath = 'settings/settings.html';

                // Adjust path for pages in subdirectories
                if (path.includes('/projects/') || path.includes('/data/') ||
                    path.includes('/analysis/') || path.includes('/tools/') ||
                    path.includes('/settings/') || path.includes('/help/')) {
                    settingsPath = '../settings/settings.html';
                }

                window.location.href = settingsPath;
            });
        }
    }

    openProjectModal(tab = 'open') {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.switchModalTab(tab);

            // Load projects list if opening "open" tab
            if (tab === 'open' && window.projectManager) {
                window.projectManager.renderProjectsList();
            }
        }
    }

    switchModalTab(tabId) {
        const modalTabs = document.querySelectorAll('.modal-tab');
        const tabPanes = document.querySelectorAll('.tab-pane');

        modalTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-modal-tab') === tabId;
            tab.classList.toggle('active', isActive);
        });

        tabPanes.forEach(pane => {
            const paneId = pane.id.replace('-tab', '');
            pane.classList.toggle('active', paneId === tabId);
        });
    }

    // Navigation Items
    setupNavigationItems() {
        const navItems = document.querySelectorAll('.nav-item[data-methodology], .nav-item[data-action]');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const methodology = item.getAttribute('data-methodology');
                const action = item.getAttribute('data-action');

                if (methodology) {
                    e.preventDefault();
                    console.log(`Selected methodology: ${methodology}`);
                    this.setActiveNavItem(item);

                    // Show notification about methodology selection
                    if (window.app && window.app.showNotification) {
                        const methodName = methodology.split('-').map(w =>
                            w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ');
                        window.app.showNotification(
                            `Methodology: ${methodName}. This would navigate to the ${methodName} module.`,
                            'info'
                        );
                    }
                } else if (action === 'home') {
                    e.preventDefault();
                    this.setActiveNavItem(item);
                    // Home functionality already showing main content
                }

                // Close mobile menu
                this.closeMobileMenu();
            });
        });

        // Setup help and settings buttons
        this.setupTopBarButtons();
    }

    // Top Bar Buttons
    setupTopBarButtons() {
        const helpBtn = document.getElementById('help-btn');
        const settingsBtn = document.getElementById('settings-btn');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelpDialog();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsDialog();
            });
        }
    }

    showHelpDialog() {
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Help: Use the sidebar to navigate between methodologies. Upload CSV data to begin analysis.', 'info');
        } else {
            alert('Help:\n\n• Use the sidebar to navigate between methodologies\n• Upload CSV data to begin analysis\n• Save your work using the Projects menu\n• Change themes in the Settings menu');
        }
        console.log('Help button clicked');
    }

    showSettingsDialog() {
        const settingsModal = document.getElementById('settings-modal');
        const backdrop = document.getElementById('modal-backdrop');

        if (settingsModal && backdrop) {
            settingsModal.classList.add('active');
            backdrop.classList.add('active');
            this.loadSettingsValues();
        }

        console.log('Settings button clicked');
    }

    closeSettingsDialog() {
        const settingsModal = document.getElementById('settings-modal');
        const backdrop = document.getElementById('modal-backdrop');

        if (settingsModal && backdrop) {
            settingsModal.classList.remove('active');
            backdrop.classList.remove('active');
        }
    }

    loadSettingsValues() {
        // Load theme
        const themeSelect = document.getElementById('settings-theme-select');
        const currentTheme = localStorage.getItem('app-theme') || 'light';
        if (themeSelect) {
            themeSelect.value = currentTheme;
        }

        // Load other settings from localStorage
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');

        const compactToggle = document.getElementById('settings-compact-toggle');
        if (compactToggle && settings.compactMode) {
            compactToggle.classList.add('active');
        }

        const autocalcToggle = document.getElementById('settings-autocalc-toggle');
        if (autocalcToggle && settings.autoCalculate !== false) {
            autocalcToggle.classList.add('active');
        }

        const decimalsSelect = document.getElementById('settings-decimals-select');
        if (decimalsSelect && settings.decimalPlaces) {
            decimalsSelect.value = settings.decimalPlaces;
        }

        const autosaveToggle = document.getElementById('settings-autosave-toggle');
        if (autosaveToggle && settings.autoSave !== false) {
            autosaveToggle.classList.add('active');
        }

        const dateformatSelect = document.getElementById('settings-dateformat-select');
        if (dateformatSelect && settings.dateFormat) {
            dateformatSelect.value = settings.dateFormat;
        }

        const notificationsToggle = document.getElementById('settings-notifications-toggle');
        if (notificationsToggle && settings.showNotifications !== false) {
            notificationsToggle.classList.add('active');
        }

        const warningsToggle = document.getElementById('settings-warnings-toggle');
        if (warningsToggle && settings.showWarnings !== false) {
            warningsToggle.classList.add('active');
        }
    }

    saveSettingValue(key, value) {
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        settings[key] = value;
        localStorage.setItem('app-settings', JSON.stringify(settings));
        console.log(`Setting saved: ${key} = ${value}`);
    }

    setActiveNavItem(activeItem) {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    // Modal Handlers
    setupModalHandlers() {
        const modal = document.getElementById('project-modal');
        const closeBtn = document.getElementById('project-modal-close');
        const backdrop = modal?.querySelector('.modal-backdrop');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }

        // Modal tabs
        const modalTabs = document.querySelectorAll('.modal-tab');
        modalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-modal-tab');
                this.switchModalTab(tabId);
            });
        });

        // Save project button
        const saveBtn = document.getElementById('save-project-confirm');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveProject());
        }

        // New project button
        const newBtn = document.getElementById('new-project-confirm');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.handleNewProject());
        }

        // Enter key on project name input
        const projectNameInput = document.getElementById('project-name-input');
        if (projectNameInput) {
            projectNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleSaveProject();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleSaveProject() {
        const input = document.getElementById('project-name-input');
        const projectName = input?.value.trim();

        if (!projectName) {
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Please enter a project name', 'error');
            } else {
                alert('Please enter a project name');
            }
            input?.focus();
            return;
        }

        // Use ProjectManager if available
        if (window.projectManager) {
            window.projectManager.saveProject(projectName, {});
        } else {
            // Fallback: save to localStorage
            const projects = JSON.parse(localStorage.getItem('reserving-projects') || '[]');
            projects.push({
                id: Date.now(),
                name: projectName,
                timestamp: new Date().toISOString(),
                config: {}
            });
            localStorage.setItem('reserving-projects', JSON.stringify(projects));

            if (window.app && window.app.showNotification) {
                window.app.showNotification(`Project "${projectName}" saved successfully`, 'success');
            }
        }

        // Clear input and close modal
        if (input) input.value = '';
        this.closeModal();
    }

    handleNewProject() {
        const hasData = window.appState && window.appState.get &&
                       window.appState.get('claimsData')?.length > 0;

        if (hasData) {
            if (!confirm('Create a new project? Current unsaved work will be cleared.')) {
                return;
            }
        }

        // Use ProjectManager if available
        if (window.projectManager) {
            window.projectManager.createNewProject();
        } else {
            // Fallback
            if (window.app && window.app.showNotification) {
                window.app.showNotification('New project created', 'success');
            }
            this.closeModal();
            // Optionally reload
            // window.location.reload();
        }
    }

    // State Persistence
    loadCollapsedState() {
        const saved = localStorage.getItem('sidebar-collapsed');
        // Default to collapsed (true) if no saved state
        return saved === null ? true : saved === 'true';
    }

    saveCollapsedState() {
        localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
    }

    // Responsive Handler
    handleResize() {
        if (window.innerWidth > 1024) {
            this.closeMobileMenu();
        }
    }
}

// Enhanced Project Manager Integration
class ProjectManagerExtended {
    constructor() {
        this.projects = this.loadProjects();
        this.init();
    }

    init() {
        console.log(`✓ ProjectManagerExtended initialized (${this.projects.length} projects)`);
    }

    loadProjects() {
        try {
            const stored = localStorage.getItem('reserving-projects');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load projects:', error);
            return [];
        }
    }

    saveProjects() {
        try {
            localStorage.setItem('reserving-projects', JSON.stringify(this.projects));
        } catch (error) {
            console.error('Failed to save projects:', error);
        }
    }

    saveProject(name, config) {
        const project = {
            id: Date.now(),
            name: name,
            timestamp: new Date().toISOString(),
            config: config || {}
        };

        this.projects.push(project);
        this.saveProjects();

        if (window.app && window.app.showNotification) {
            window.app.showNotification(`Project "${name}" saved successfully`, 'success');
        }

        this.renderProjectsList();
    }

    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        if (window.app && window.app.showNotification) {
            window.app.showNotification(`Loaded project: ${project.name}`, 'success');
        }

        // Close modal
        const modal = document.getElementById('project-modal');
        if (modal) modal.style.display = 'none';
    }

    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        if (confirm(`Delete project "${project.name}"?`)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjectsList();

            if (window.app && window.app.showNotification) {
                window.app.showNotification(`Project "${project.name}" deleted`, 'success');
            }
        }
    }

    createNewProject() {
        const hasData = window.appState && window.appState.get &&
                       window.appState.get('claimsData')?.length > 0;

        if (hasData) {
            if (!confirm('Create a new project? Current unsaved work will be cleared.')) {
                return;
            }
        }

        if (window.app && window.app.showNotification) {
            window.app.showNotification('New project created', 'success');
        }

        // Close modal
        const modal = document.getElementById('project-modal');
        if (modal) modal.style.display = 'none';
    }

    renderProjectsList() {
        const container = document.getElementById('saved-projects-list');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--gray-500);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <p>No saved projects yet</p>
                </div>
            `;
            return;
        }

        const sortedProjects = [...this.projects].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedProjects.map(project => `
            <div style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 0.25rem; color: var(--gray-900);">${this.escapeHtml(project.name)}</strong>
                    <small style="color: var(--gray-600); font-size: 0.875rem;">
                        <i class="fas fa-clock"></i> ${new Date(project.timestamp).toLocaleString()}
                    </small>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="button button-primary" onclick="window.projectManager.loadProject(${project.id})" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i class="fas fa-folder-open"></i> Load
                    </button>
                    <button class="button button-secondary" onclick="window.projectManager.deleteProject(${project.id})" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--error-color); color: white; border-color: var(--error-color);">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
function initSidebar() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
        return;
    }

    // Initialize sidebar
    const sidebarManager = new SidebarManager();
    window.sidebarManager = sidebarManager;

    // Initialize project manager if not already available
    if (!window.projectManager) {
        const projectManager = new ProjectManagerExtended();
        window.projectManager = projectManager;
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    // Update theme indicator
    const themeNameSpan = document.getElementById('theme-name');
    if (themeNameSpan) {
        const themeName = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
        themeNameSpan.textContent = `${themeName} Theme`;
    }

    // Setup settings modal event listeners
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', () => {
            sidebarManager.closeSettingsDialog();
        });
    }

    // Settings theme selector
    const settingsThemeSelect = document.getElementById('settings-theme-select');
    if (settingsThemeSelect) {
        settingsThemeSelect.addEventListener('change', (e) => {
            sidebarManager.applyTheme(e.target.value);
        });
    }

    // Settings toggle buttons
    const setupToggle = (toggleId, settingKey) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const isActive = toggle.classList.contains('active');
                sidebarManager.saveSettingValue(settingKey, isActive);
            });
        }
    };

    setupToggle('settings-compact-toggle', 'compactMode');
    setupToggle('settings-autocalc-toggle', 'autoCalculate');
    setupToggle('settings-autosave-toggle', 'autoSave');
    setupToggle('settings-notifications-toggle', 'showNotifications');
    setupToggle('settings-warnings-toggle', 'showWarnings');

    // Settings select elements
    const setupSelect = (selectId, settingKey) => {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', (e) => {
                sidebarManager.saveSettingValue(settingKey, e.target.value);
            });
        }
    };

    setupSelect('settings-decimals-select', 'decimalPlaces');
    setupSelect('settings-dateformat-select', 'dateFormat');
}

// Methodology Menu Handler (Global function for inline onclick)
window.showMethodologyMenu = function(methodology) {
    const menuOptions = [
        { label: 'View Details', icon: 'info-circle' },
        { label: 'Start Analysis', icon: 'play' },
        { label: 'View Examples', icon: 'file-alt' },
        { label: 'Documentation', icon: 'book' }
    ];

    const message = `${methodology} methodology:\n\n` +
        menuOptions.map(opt => `• ${opt.label}`).join('\n');

    alert(message);
    console.log(`Methodology menu for: ${methodology}`);
};

// Dashboard Cards Manager
class DashboardManager {
    constructor() {
        this.stats = {
            projects: 0,
            analyses: 0,
            triangles: 0,
            claims: 0
        };
        this.init();
    }

    init() {
        this.loadStats();
        this.updateStatsDisplay();
        this.setupQuickActions();
    }

    loadStats() {
        // Load stats from localStorage
        const savedStats = localStorage.getItem('dashboard-stats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        } else {
            // Initialize with project count
            const projects = JSON.parse(localStorage.getItem('reserving-projects') || '[]');
            this.stats.projects = projects.length;
        }
    }

    updateStatsDisplay() {
        // Update stat values
        const totalProjectsEl = document.getElementById('total-projects');
        const totalAnalysesEl = document.getElementById('total-analyses');
        const totalTrianglesEl = document.getElementById('total-triangles');
        const totalClaimsEl = document.getElementById('total-claims');

        if (totalProjectsEl) totalProjectsEl.textContent = this.stats.projects;
        if (totalAnalysesEl) totalAnalysesEl.textContent = this.stats.analyses;
        if (totalTrianglesEl) totalTrianglesEl.textContent = this.stats.triangles;
        if (totalClaimsEl) totalClaimsEl.textContent = this.stats.claims;
    }

    incrementStat(statName) {
        if (this.stats.hasOwnProperty(statName)) {
            this.stats[statName]++;
            this.saveStats();
            this.updateStatsDisplay();
        }
    }

    saveStats() {
        localStorage.setItem('dashboard-stats', JSON.stringify(this.stats));
    }

    setupQuickActions() {
        // New Project action
        const newProjectCard = document.getElementById('action-new-project');
        if (newProjectCard) {
            newProjectCard.addEventListener('click', () => {
                this.openProjectModal('new');
            });
        }

        // Import Data action
        const importDataCard = document.getElementById('action-import-data');
        if (importDataCard) {
            importDataCard.addEventListener('click', () => {
                // Trigger file input or navigate to data import
                console.log('Import Data action clicked');
                alert('Import data functionality: Please use the sidebar navigation to access data import features.');
            });
        }

        // Load Project action
        const loadProjectCard = document.getElementById('action-load-project');
        if (loadProjectCard) {
            loadProjectCard.addEventListener('click', () => {
                this.openProjectModal('load');
            });
        }

        // View Documentation action
        const viewDocsCard = document.getElementById('action-view-docs');
        if (viewDocsCard) {
            viewDocsCard.addEventListener('click', () => {
                console.log('View Documentation action clicked');
                alert('Documentation: Please refer to the methodology cards below or use the Help menu for detailed guides.');
            });
        }
    }

    openProjectModal(tab) {
        const projectModal = document.getElementById('project-modal');
        const backdrop = document.getElementById('modal-backdrop');

        if (projectModal && backdrop) {
            projectModal.classList.add('active');
            backdrop.classList.add('active');

            // Switch to appropriate tab
            const tabButton = document.querySelector(`[data-modal-tab="${tab}"]`);
            if (tabButton) {
                tabButton.click();
            }
        }
    }
}

// Initialize Dashboard Manager
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on home page (index.html)
    if (document.querySelector('.dashboard-stats')) {
        dashboardManager = new DashboardManager();
    }
});

// Start initialization
initSidebar();

// Export to window for global access (non-module script)
window.SidebarManager = SidebarManager;
window.ProjectManagerExtended = ProjectManagerExtended;
window.DashboardManager = DashboardManager;
