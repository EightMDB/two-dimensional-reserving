// Project Comparison
(function() {
    'use strict';

    function init() {
        loadProjectOptions();
        setupComparisonLogic();
    }

    function loadProjectOptions() {
        const selects = document.querySelectorAll('[id^="project-select-"]');
        const projects = [
            { id: 1, name: 'Q3 2024 Chain Ladder' },
            { id: 2, name: 'H1 2024 BF Analysis' },
            { id: 3, name: 'Full Year Benktander' }
        ];

        selects.forEach(select => {
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                select.appendChild(option);
            });
        });
    }

    function setupComparisonLogic() {
        const compareBtn = document.getElementById('compare-btn');
        const selects = document.querySelectorAll('[id^="project-select-"]');

        selects.forEach(select => {
            select.addEventListener('change', () => {
                const selected = Array.from(selects)
                    .filter(s => s.value)
                    .length;
                compareBtn.disabled = selected < 2;
            });
        });

        compareBtn.addEventListener('click', () => {
            document.getElementById('comparison-section').style.display = 'block';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
