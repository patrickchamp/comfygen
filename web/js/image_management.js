// web/js/image_management.js

/**
 * @fileoverview Manages the display and history of generated images.
 */

// ==========================================================================
// Imports
// ==========================================================================

import { disablePrevImageButton, disableNextImageButton, setImageCounterText } from './ui_image_display.js';
import { scrollImageIntoView } from './ui_helpers.js';
import { getMainImageElement } from './ui_elements.js'; // Direct element access

// ==========================================================================
// Module Variables
// ==========================================================================

let imageHistory = [];
let currentImageIndex = -1;
let mainImageElement = null; // Initialized by initializeImageDisplay

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initializes the module by caching the main image element.
 * @param {HTMLImageElement} imageElement - The main `<img>` DOM element.
 */
export function initializeImageDisplay(imageElement) {
    if (!imageElement) {
        console.error("🚨 [Image Management] Init failed: Invalid image element provided.");
        return;
    }
    mainImageElement = imageElement;
    console.log("  ✅ [Image Management] Image display initialized.");
    updateImageNavigation(); // Initial UI state
}

// ==========================================================================
// Image Update and Display
// ==========================================================================

/**
 * Adds a new image URL to history and displays it.
 * @param {string} filename
 * @param {string} subfolder
 * @param {string} [type='output']
 */
export function updateImage(filename, subfolder = '', type = 'output') {
    if (!mainImageElement) {
        console.error("🚨 [Image Management] Cannot update image: Not initialized.");
        return;
    }
    if (!filename) {
        console.error("🚨 [Image Management] Cannot update image: Filename missing.");
        return;
    }

    const rand = Date.now();
    const imageUrl = `/view?filename=${encodeURIComponent(filename)}&type=${type}&subfolder=${encodeURIComponent(subfolder)}&rand=${rand}`;
    console.log(`[Image Management] New image URL: ${imageUrl}`);

    imageHistory.push(imageUrl);
    currentImageIndex = imageHistory.length - 1;

    mainImageElement.src = imageUrl;
    mainImageElement.alt = `Generated image: ${filename}`; // Update alt text
    console.log(`[Image Management] Displaying index ${currentImageIndex}: ${filename}`);

    updateImageNavigation();
    scrollImageIntoView();
}

/** Updates the displayed image based on currentImageIndex. */
function updateCurrentImage() {
    if (!mainImageElement || currentImageIndex < 0 || currentImageIndex >= imageHistory.length) {
        console.warn("[Image Management] Cannot update display: Invalid state/index.");
        return;
    }
    mainImageElement.src = imageHistory[currentImageIndex];
    mainImageElement.alt = `Generated image ${currentImageIndex + 1} of ${imageHistory.length}`;
    console.log(`[Image Management] Navigated to index ${currentImageIndex}`);
    updateImageNavigation();
    scrollImageIntoView();
}

// ==========================================================================
// Image Navigation
// ==========================================================================

/** Navigates to the previous image. */
export function showPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateCurrentImage();
    } else {
        console.log("[Image Management] Already at first image.");
    }
}

/** Navigates to the next image. */
export function showNextImage() {
    if (currentImageIndex < imageHistory.length - 1) {
        currentImageIndex++;
        updateCurrentImage();
    } else {
         console.log("[Image Management] Already at last image.");
    }
}

/** Updates navigation buttons and counter UI. */
function updateImageNavigation() {
    const totalImages = imageHistory.length;
    const currentPosition = totalImages > 0 ? currentImageIndex + 1 : 0;

    disablePrevImageButton(currentImageIndex <= 0);
    disableNextImageButton(currentImageIndex >= totalImages - 1);
    setImageCounterText(`${currentPosition} / ${totalImages}`);
}