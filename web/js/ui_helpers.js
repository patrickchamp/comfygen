// web/js/ui_helpers.js

/**
 * @fileoverview Provides utility functions for updating common UI state
 * like progress bars, scrolling, etc.
 */

import { getProgressBarElement, getMainImageElement } from './ui_elements.js';

/**
 * Updates the generation progress bar.
 *
 * @param {number} [max=0] - The maximum value of the progress bar (e.g., total steps).
 * @param {number} [value=0] - The current value of the progress.
 */
export function updateProgress(max = 0, value = 0) {
    const progressBar = getProgressBarElement();
    if (!progressBar) return;
    progressBar.max = max;
    progressBar.value = value;
}

/**
 * Scrolls the main image element into the browser's viewport smoothly.
 * Useful after a new image is loaded.
 */
export function scrollImageIntoView() {
    const mainImageElement = getMainImageElement();
    if (mainImageElement) {
        mainImageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}