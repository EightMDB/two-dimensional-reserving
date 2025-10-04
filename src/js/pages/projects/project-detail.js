// Project Detail - Handle project detail view and tabs
(function() {
    'use strict';

    function init() {
        loadProjectData();
        setupTabs();
    }

    function loadProjectData() {
        // Get project ID from URL
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');

        // Sample data - in real app, load from backend/localStorage
        const project = {
            name: 'Q3 2024 Chain Ladder Analysis',
            methodology: 'Chain Ladder',
            status: 'Active',
            records: 1250,
            lastModified: '2025-09-28',
            created: '2025-09-15',
            owner: 'Current User'
        };

        // Update page elements
        document.getElementById('project-title').innerHTML =
            `<i class="fas fa-folder-open"></i> ${project.name}`;
        document.getElementById('stat-methodology').textContent = project.methodology;
        document.getElementById('stat-status').textContent = project.status;
        document.getElementById('stat-records').textContent = project.records.toLocaleString();
        document.getElementById('stat-date').textContent = project.lastModified;

        // Update info tab
        document.getElementById('info-name').textContent = project.name;
        document.getElementById('info-created').textContent = project.created;
        document.getElementById('info-methodology').textContent = project.methodology;
        document.getElementById('info-owner').textContent = project.owner;
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                this.classList.add('active');
                document.querySelector(`[data-panel="${targetTab}"]`).classList.add('active');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
