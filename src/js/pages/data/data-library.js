// Data Library Manager
(function() {
    'use strict';

    function init() {
        updateStats();
        setupEventListeners();
    }

    function updateStats() {
        document.getElementById('total-datasets').textContent = '3';
        document.getElementById('total-records').textContent = '3,680';
        document.getElementById('total-size').textContent = '368';
        document.getElementById('last-upload').textContent = 'Today';
    }

    function setupEventListeners() {
        const uploadBtn = document.getElementById('upload-new-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                alert('Upload dataset functionality would open upload wizard');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
