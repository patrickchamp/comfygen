// web/js/ui_elements.js

/**
 * @fileoverview Caches references to all necessary DOM elements
 * and provides getter functions for accessing them.
 * This centralizes element lookup.
 */

// --- Module Variables (Cached DOM Elements) ---
let elements = {}; // Store elements in an object for easy access

// --- Initialization ---

/**
 * Caches references to all necessary DOM elements by their IDs.
 * This MUST be called once during application startup (`app_init.js`).
 * Throws an error if essential elements are not found.
 */
export function initializeUIElements() {
    console.log("🔌 [UI Elements] Initializing element references...");
    const elementIds = {
        // Prompt & Settings
        prompt: 'prompt',
        sendPromptButton: 'send-prompt-button',
        clearPromptButton: 'clear-prompt-button',
        imageWidthInput: 'image-width',
        imageHeightInput: 'image-height',
        imageSizePreset: 'image-size-preset',
        stepsInput: 'steps',
        enableLoraCheckbox: 'enable-lora',
        keepSeedCheckbox: 'keep-seed',
        seedInput: 'seed-input',
        currentSeedDisplaySpan: 'current-seed', // Added from seed_management needs
        
        // Img2Img Controls
        modeTxt2imgRadio: 'mode-txt2img',
        modeImg2imgRadio: 'mode-img2img',
        imageUploadInput: 'image-upload-input',
        denoiseStrengthInput: 'denoise-strength',
        denoisePresetSubtleButton: 'denoise-preset-subtle',
        denoisePresetStrongButton: 'denoise-preset-strong',
        img2imgControls: 'img2img-controls',
        uploadedFilenameSpan: 'uploaded-filename',

        // Progress
        progressBar: 'main-progress',

        // Image Display
        mainImageElement: 'maingen',
        prevImageButton: 'prev-image-button',
        nextImageButton: 'next-image-button',
        imageCounter: 'image-counter',

        // History
        recentPromptsList: 'recent-prompts-list',
        favoritePromptsList: 'favorite-prompts-list',
    };

    let foundAll = true;
    for (const key in elementIds) {
        const element = document.getElementById(elementIds[key]);
        if (element) {
            elements[key] = element;
        } else {
            console.error(`🚨 [UI Elements] Failed to find essential element with ID: ${elementIds[key]}`);
            foundAll = false;
            elements[key] = null; // Explicitly set to null if not found
        }
    }

    if (!foundAll) {
        // Consider if a more granular error is needed depending on which element is missing
        console.error("⚠️ [UI Elements] One or more UI elements could not be found. Some features might be disabled or broken.");
        // Decide if it's fatal
        // throw new Error("Fatal Error: Essential UI elements missing.");
    } else {
        console.log("  ✅ [UI Elements] All required UI elements cached.");
    }
}

// --- Getters for Cached Elements ---
// Provides controlled access to the cached DOM elements

// Prompt & Settings
export const getPromptElement = () => elements.prompt;
export const getSendPromptButtonElement = () => elements.sendPromptButton;
export const getClearPromptButtonElement = () => elements.clearPromptButton;
export const getImageWidthInputElement = () => elements.imageWidthInput;
export const getImageHeightInputElement = () => elements.imageHeightInput;
export const getImageSizePresetElement = () => elements.imageSizePreset;
export const getStepsInputElement = () => elements.stepsInput;
export const getEnableLoraCheckboxElement = () => elements.enableLoraCheckbox;
export const getKeepSeedCheckboxElement = () => elements.keepSeedCheckbox;
export const getSeedInputElement = () => elements.seedInput;
export const getCurrentSeedDisplaySpanElement = () => elements.currentSeedDisplaySpan; // Added getter

// Img2Img Controls
export const getModeTxt2imgRadioElement = () => elements.modeTxt2imgRadio;
export const getModeImg2imgRadioElement = () => elements.modeImg2imgRadio;
export const getImageUploadInputElement = () => elements.imageUploadInput;
export const getDenoiseStrengthElement = () => elements.denoiseStrengthInput;
export const getDenoisePresetSubtleButtonElement = () => elements.denoisePresetSubtleButton;
export const getDenoisePresetStrongButtonElement = () => elements.denoisePresetStrongButton;
export const getImg2imgControlsElement = () => elements.img2imgControls;
export const getUploadedFilenameSpanElement = () => elements.uploadedFilenameSpan;

// Progress
export const getProgressBarElement = () => elements.progressBar;

// Image Display
export const getMainImageElement = () => elements.mainImageElement;
export const getPrevImageButtonElement = () => elements.prevImageButton;
export const getNextImageButtonElement = () => elements.nextImageButton;
export const getImageCounterElement = () => elements.imageCounter;

// History
export const getRecentPromptsListElement = () => elements.recentPromptsList;
export const getFavoritePromptsListElement = () => elements.favoritePromptsList;