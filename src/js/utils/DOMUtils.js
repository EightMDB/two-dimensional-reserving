/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

export class DOMUtils {
    /**
     * Safely get element by ID
     * @param {string} id - Element ID
     * @returns {Element|null} Element or null
     */
    static getElementById(id) {
        return document.getElementById(id);
    }

    /**
     * Safely query selector
     * @param {string} selector - CSS selector
     * @returns {Element|null} Element or null
     */
    static querySelector(selector) {
        return document.querySelector(selector);
    }

    /**
     * Safely query selector all
     * @param {string} selector - CSS selector
     * @returns {NodeList} NodeList
     */
    static querySelectorAll(selector) {
        return document.querySelectorAll(selector) || [];
    }

    /**
     * Add class to element
     * @param {Element} element - Target element
     * @param {string} className - Class name to add
     */
    static addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }

    /**
     * Remove class from element
     * @param {Element} element - Target element
     * @param {string} className - Class name to remove
     */
    static removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle class on element
     * @param {Element} element - Target element
     * @param {string} className - Class name to toggle
     */
    static toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    }
}