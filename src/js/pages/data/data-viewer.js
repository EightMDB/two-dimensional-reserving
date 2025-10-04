// Data Viewer - Interactive table functionality
(function() {
    'use strict';

    function init() {
        setupTableControls();
        updateStats();
    }

    function setupTableControls() {
        const searchInput = document.getElementById('table-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleTableSearch);
        }

        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', handleSelectAll);
        }
    }

    function handleTableSearch(e) {
        // Filter table rows based on search
        console.log('Searching for:', e.target.value);
    }

    function handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('#data-table tbody input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    }

    function updateStats() {
        document.getElementById('row-count').textContent = '1,250';
        document.getElementById('col-count').textContent = '6';
        document.getElementById('filtered-count').textContent = '0';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
