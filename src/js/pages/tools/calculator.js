// Reserve Calculator
(function() {
    'use strict';

    function init() {
        setupTabs();
        setupCalculators();
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

    function setupCalculators() {
        const ldfBtn = document.getElementById('calc-ldf-btn');
        if (ldfBtn) {
            ldfBtn.addEventListener('click', calculateLDF);
        }

        const ibnrBtn = document.getElementById('calc-ibnr-btn');
        if (ibnrBtn) {
            ibnrBtn.addEventListener('click', calculateIBNR);
        }
    }

    function calculateLDF() {
        const val12 = parseFloat(document.getElementById('ldf-12').value);
        const val24 = parseFloat(document.getElementById('ldf-24').value);

        if (val12 && val24) {
            const ldf = val24 / val12;
            document.querySelector('#ldf-result .result-value').textContent = ldf.toFixed(3);
        }
    }

    function calculateIBNR() {
        const ultimate = parseFloat(document.getElementById('ibnr-ultimate').value);
        const paid = parseFloat(document.getElementById('ibnr-paid').value);

        if (ultimate && paid) {
            const ibnr = ultimate - paid;
            document.querySelector('#ibnr-result .result-value').textContent =
                '$' + ibnr.toLocaleString();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
