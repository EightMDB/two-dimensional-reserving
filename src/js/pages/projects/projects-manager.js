// Projects Manager - Handle project list and creation
(function() {
    'use strict';

    // Sample project data
    const sampleProjects = [
        {
            id: 1,
            name: 'Q3 2024 Chain Ladder Analysis',
            methodology: 'chain-ladder',
            status: 'active',
            lastModified: '2025-09-28',
            records: 1250
        },
        {
            id: 2,
            name: 'H1 2024 BF Analysis',
            methodology: 'bornhuetter-ferguson',
            status: 'active',
            lastModified: '2025-09-27',
            records: 1180
        }
    ];

    // Initialize page
    function init() {
        loadProjects();
        setupEventListeners();
    }

    // Load and display projects
    function loadProjects() {
        const grid = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-state');

        if (!grid) return;

        if (sampleProjects.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        grid.innerHTML = sampleProjects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-card-header">
                    <div class="project-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="project-status ${project.status}">
                        ${project.status}
                    </div>
                </div>
                <div class="project-card-body">
                    <h3>${project.name}</h3>
                    <p class="project-meta">
                        <i class="fas fa-chart-line"></i> ${formatMethodology(project.methodology)}
                    </p>
                    <p class="project-meta">
                        <i class="fas fa-database"></i> ${project.records} records
                    </p>
                    <p class="project-meta">
                        <i class="fas fa-calendar"></i> ${formatDate(project.lastModified)}
                    </p>
                </div>
                <div class="project-card-footer">
                    <button class="btn btn-sm btn-secondary" onclick="window.location='project-detail.html?id=${project.id}'">
                        <i class="fas fa-eye"></i> Open
                    </button>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-play"></i> Run Analysis
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        const createBtn = document.getElementById('create-project-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const projectForm = document.getElementById('project-form');
        const searchInput = document.getElementById('project-search');

        if (createBtn) {
            createBtn.addEventListener('click', openProjectModal);
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeProjectModal);
        }

        if (projectForm) {
            projectForm.addEventListener('submit', handleProjectCreate);
        }

        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
    }

    // Modal functions
    function openProjectModal() {
        const modal = document.getElementById('project-modal');
        if (modal) modal.style.display = 'block';
    }

    function closeProjectModal() {
        const modal = document.getElementById('project-modal');
        if (modal) modal.style.display = 'none';
    }

    // Handle project creation
    function handleProjectCreate(e) {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        const methodology = document.getElementById('project-methodology').value;

        console.log('Creating project:', name, methodology);
        closeProjectModal();
        // In a real app, this would save to backend/localStorage
    }

    // Search functionality
    function handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    }

    // Utility functions
    function formatMethodology(method) {
        const names = {
            'chain-ladder': 'Chain Ladder',
            'bornhuetter-ferguson': 'Bornhuetter-Ferguson',
            'benktander': 'Benktander',
            'cape-cod': 'Cape Cod'
        };
        return names[method] || method;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
