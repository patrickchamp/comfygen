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
import { STORAGE_KEYS } from './settings_manager.js';

// ==========================================================================
// Module Variables
// ==========================================================================

let imageHistory = [];
let currentImageIndex = -1;
let mainImageElement = null; // Initialized by initializeImageDisplay

// ==========================================================================
// Initialization
// ==========================================================================

/** Loads image history and index from localStorage and updates the UI. */
function loadImageStateFromStorage() {
    console.log("💾 [Image Management] Attempting to load image state from localStorage...");
    try {
        const storedHistory = localStorage.getItem(STORAGE_KEYS.IMAGE_HISTORY);
        const storedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_IMAGE_INDEX);

        if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                imageHistory = parsedHistory;
                console.log(`  Loaded ${imageHistory.length} images from history.`);

                // Load index, default to last image if index is invalid or missing
                let parsedIndex = storedIndex !== null ? parseInt(storedIndex, 10) : imageHistory.length - 1;
                if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= imageHistory.length) {
                    console.warn(`  Invalid stored index (${storedIndex}). Defaulting to last image.`);
                    parsedIndex = imageHistory.length - 1;
                }
                currentImageIndex = parsedIndex;
                console.log(`  Set current image index to: ${currentImageIndex}`);

                // Update the UI with the loaded state
                updateCurrentImage(); // This will set the src and call updateImageNavigation/scroll

            } else {
                 console.log("  No valid image history found in storage.");
                 // Reset state if stored data is invalid/empty array
                 imageHistory = [];
                 currentImageIndex = -1;
                 updateImageNavigation(); // Update UI for empty state
            }
        } else {
            console.log("  No image history found in storage.");
            updateImageNavigation(); // Ensure UI reflects empty state if nothing was stored
        }
    } catch (error) {
        console.error("⚠️ [Image Management] Error loading image state from localStorage:", error);
        // Reset state on error
        imageHistory = [];
        currentImageIndex = -1;
        updateImageNavigation(); // Update UI for empty state
    }
}

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
    console.log("  ✅ [Image Management] Image display initialized (element cached).");

    // Load state from storage
    loadImageStateFromStorage();
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
    saveImageStateToStorage();
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
    saveImageStateToStorage();
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

/**
 * Saves the current image history and index to localStorage.
 */
function saveImageStateToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.IMAGE_HISTORY, JSON.stringify(imageHistory));
        localStorage.setItem(STORAGE_KEYS.CURRENT_IMAGE_INDEX, currentImageIndex.toString());
        // console.log(`[Image Management] Saved state: ${imageHistory.length} images, index ${currentImageIndex}`); // Optional: for debugging
    } catch (error) {
        console.error("⚠️ [Image Management] Error saving image state to localStorage:", error);
    }
}