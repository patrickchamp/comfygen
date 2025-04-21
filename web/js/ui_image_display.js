// web/js/ui_image_display.js

/**
 * @fileoverview Handles UI updates related to the main image display
 * and its navigation controls (Prev/Next buttons, counter).
 */

import {
    getPrevImageButtonElement,
    getNextImageButtonElement,
    getImageCounterElement
    // getMainImageElement is available via ui_elements.js if needed directly here
} from './ui_elements.js';

/**
 * Enables or disables the 'Previous Image' button.
 * @param {boolean} disabled - True to disable the button, false to enable.
 */
export function disablePrevImageButton(disabled) {
    const button = getPrevImageButtonElement();
    if (button) {
        button.disabled = disabled;
    }
}

/**
 * Enables or disables the 'Next Image' button.
 * @param {boolean} disabled - True to disable the button, false to enable.
 */
export function disableNextImageButton(disabled) {
    const button = getNextImageButtonElement();
    if (button) {
        button.disabled = disabled;
    }
}

/**
 * Sets the text content of the image counter span (e.g., "1 / 10").
 * @param {string} text - The text to display in the counter.
 */
export function setImageCounterText(text) {
    const counter = getImageCounterElement();
    if (counter) {
        counter.textContent = text;
    }
}