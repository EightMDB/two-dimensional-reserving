// Analysis Dashboard
(function() {
    'use strict';

    function init() {
        setupStatusTabs();
    }

    function setupStatusTabs() {
        const tabs = document.querySelectorAll('.status-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                filterAnalyses(this.getAttribute('data-status'));
            });
        });
    }

    function filterAnalyses(status) {
        const items = document.querySelectorAll('.analysis-item');
        items.forEach(item => {
            if (status === 'all' || item.classList.contains(status)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
