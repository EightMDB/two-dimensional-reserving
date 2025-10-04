/**
 * Theme Manager
 * Handles theme switching (light, dark, sepia) and persistence
 */

export class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.themeButtons = [];
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Setup theme buttons
        this.themeButtons = document.querySelectorAll('.theme-btn');
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.applyTheme(theme);
            });
        });

        console.log(`✓ ThemeManager initialized (theme: ${this.currentTheme})`);
    }

    loadTheme() {
        // Load from localStorage, default to light
        return localStorage.getItem('app-theme') || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem('app-theme', theme);
    }

    applyTheme(theme) {
        // Validate theme
        const validThemes = ['light', 'dark', 'sepia'];
        if (!validThemes.includes(theme)) {
            console.warn(`Invalid theme: ${theme}, defaulting to light`);
            theme = 'light';
        }

        // Apply to body
        document.body.setAttribute('data-theme', theme);

        // Update current theme
        this.currentTheme = theme;

        // Save to localStorage
        this.saveTheme(theme);

        // Update button states
        this.updateButtonStates();

        console.log(`Theme switched to: ${theme}`);
    }

    updateButtonStates() {
        this.themeButtons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme');
            if (btnTheme === this.currentTheme) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    getTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM is ready
let themeManager = null;

function initThemeManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeManager);
        return;
    }

    themeManager = new ThemeManager();
    window.themeManager = themeManager; // Expose for debugging
}

initThemeManager();

export default ThemeManager;
