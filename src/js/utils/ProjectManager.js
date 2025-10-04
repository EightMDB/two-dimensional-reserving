/**
 * Project Manager
 * Handles saving, loading, and managing project configurations
 */

export class ProjectManager {
    constructor(appState) {
        this.appState = appState;
        this.projects = this.loadProjects();
        this.currentProject = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log(`✓ ProjectManager initialized (${this.projects.length} projects)`);
    }

    setupEventListeners() {
        // Toolbar buttons
        const saveBtn = document.getElementById('save-project-btn');
        const loadBtn = document.getElementById('load-project-btn');
        const newBtn = document.getElementById('new-project-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.openModal('save'));
        }
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.openModal('load'));
        }
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openModal('new'));
        }

        // Modal close button
        const closeBtn = document.getElementById('project-modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
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
        const saveConfirmBtn = document.getElementById('save-project-confirm-btn');
        if (saveConfirmBtn) {
            saveConfirmBtn.addEventListener('click', () => this.saveCurrentProject());
        }

        // New project button
        const newConfirmBtn = document.getElementById('new-project-confirm-btn');
        if (newConfirmBtn) {
            newConfirmBtn.addEventListener('click', () => this.createNewProject());
        }

        // Enter key on project name input
        const projectNameInput = document.getElementById('project-name-input');
        if (projectNameInput) {
            projectNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.saveCurrentProject();
                }
            });
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
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
            this.showNotification('Failed to save projects', 'error');
        }
    }

    openModal(tab = 'save') {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.switchModalTab(tab);

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, button');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    closeModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    switchModalTab(tabId) {
        // Update tab buttons
        const modalTabs = document.querySelectorAll('.modal-tab');
        modalTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-modal-tab') === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab panes
        const modalPanes = document.querySelectorAll('.modal-tab-pane');
        modalPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        const activePane = document.getElementById(`${tabId}-modal-tab`);
        if (activePane) {
            activePane.classList.add('active');
        }

        // If loading tab, render projects
        if (tabId === 'load') {
            this.renderProjectsList();
        }
    }

    saveCurrentProject() {
        const nameInput = document.getElementById('project-name-input');
        const projectName = nameInput ? nameInput.value.trim() : '';

        if (!projectName) {
            this.showNotification('Please enter a project name', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        // Capture current application state
        const projectData = {
            id: Date.now(),
            name: projectName,
            timestamp: new Date().toISOString(),
            config: this.captureCurrentState()
        };

        // Add to projects array
        this.projects.push(projectData);
        this.saveProjects();
        this.currentProject = projectData;

        // Clear input
        if (nameInput) nameInput.value = '';

        this.showNotification(`Project "${projectName}" saved successfully`, 'success');
        this.closeModal();

        console.log('Project saved:', projectData);
    }

    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            this.showNotification('Project not found', 'error');
            return;
        }

        // Restore project state
        this.restoreProjectState(project.config);
        this.currentProject = project;

        this.showNotification(`Project "${project.name}" loaded`, 'success');
        this.closeModal();

        console.log('Project loaded:', project);
    }

    deleteProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        if (confirm(`Delete project "${project.name}"?`)) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjectsList();
            this.showNotification(`Project "${project.name}" deleted`, 'success');
        }
    }

    createNewProject() {
        const hasData = this.appState && this.appState.get && this.appState.get('claimsData')?.length > 0;

        if (hasData) {
            if (!confirm('Create a new project? Current unsaved work will be cleared.')) {
                return;
            }
        }

        // Clear current project
        this.currentProject = null;

        // Reset application state
        if (this.appState && this.appState.reset) {
            this.appState.reset();
        }

        this.showNotification('New project created', 'success');
        this.closeModal();

        // Reload page to reset state
        window.location.reload();
    }

    renderProjectsList() {
        const container = document.getElementById('projects-list');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-projects-message">
                    <i class="fas fa-folder-open"></i>
                    <p>No saved projects</p>
                </div>
            `;
            return;
        }

        // Sort by timestamp (most recent first)
        const sortedProjects = [...this.projects].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedProjects.map(project => `
            <div class="project-item">
                <div class="project-info">
                    <h4>${this.escapeHtml(project.name)}</h4>
                    <p>
                        <i class="fas fa-clock"></i> ${new Date(project.timestamp).toLocaleString()}
                    </p>
                </div>
                <div class="project-actions">
                    <button class="button button-primary" onclick="window.projectManager.loadProject(${project.id})" title="Load project">
                        <i class="fas fa-folder-open"></i> Load
                    </button>
                    <button class="button button-secondary" onclick="window.projectManager.deleteProject(${project.id})" title="Delete project">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    captureCurrentState() {
        // Capture the current application state
        if (!this.appState || !this.appState.get) {
            return {};
        }

        return {
            claimsData: this.appState.get('claimsData') || [],
            triangleConfig: this.appState.get('triangleConfig') || {},
            claimsTriangle: this.appState.get('claimsTriangle') || null,
            developmentFactors: this.appState.get('developmentFactors') || null,
            currentTab: this.appState.get('currentTab') || 'data-input'
        };
    }

    restoreProjectState(config) {
        // Restore the application state from project config
        if (!this.appState || !this.appState.set || !config) {
            return;
        }

        try {
            if (config.claimsData) {
                this.appState.set('claimsData', config.claimsData);
            }
            if (config.triangleConfig) {
                this.appState.set('triangleConfig', config.triangleConfig);
            }
            if (config.claimsTriangle) {
                this.appState.set('claimsTriangle', config.claimsTriangle);
            }
            if (config.developmentFactors) {
                this.appState.set('developmentFactors', config.developmentFactors);
            }
            if (config.currentTab) {
                this.appState.set('currentTab', config.currentTab);
            }
        } catch (error) {
            console.error('Failed to restore project state:', error);
            this.showNotification('Error loading project data', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Use app's notification system if available
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getCurrentProject() {
        return this.currentProject;
    }

    getProjects() {
        return this.projects;
    }
}

// Initialize project manager when DOM and app are ready
let projectManager = null;

function initProjectManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectManager);
        return;
    }

    // Wait for app to be available
    const checkApp = setInterval(() => {
        if (window.app && window.appState) {
            clearInterval(checkApp);
            projectManager = new ProjectManager(window.appState);
            window.projectManager = projectManager; // Expose for debugging
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
        if (!projectManager) {
            clearInterval(checkApp);
            console.warn('ProjectManager: App not ready, initializing without app state');
            projectManager = new ProjectManager(null);
            window.projectManager = projectManager;
        }
    }, 5000);
}

initProjectManager();

export default ProjectManager;
