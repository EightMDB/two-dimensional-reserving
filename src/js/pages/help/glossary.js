// Glossary
(function() {
    'use strict';

    function init() {
        setupSearch();
    }

    function setupSearch() {
        const searchInput = document.getElementById('glossary-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
    }

    function handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.glossary-item');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'block' : 'none';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
