// Settings Manager
(function() {
    'use strict';

    function init() {
        setupTabs();
        loadSettings();
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

    function loadSettings() {
        // Load from localStorage if available
        const theme = localStorage.getItem('theme') || 'light';
        document.getElementById('theme-select').value = theme;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
