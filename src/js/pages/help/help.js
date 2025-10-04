// Help Center
(function() {
    'use strict';

    function init() {
        setupSearch();
        setupFAQ();
    }

    function setupSearch() {
        const searchInput = document.getElementById('help-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
    }

    function handleSearch(e) {
        console.log('Searching help for:', e.target.value);
    }

    function setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
