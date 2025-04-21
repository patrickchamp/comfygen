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
        loraSelect: 'lora-select',
        loraStrength: 'lora-strength',
        loraStrengthValue: 'lora-strength-value',
        keepSeedCheckbox: 'keep-seed',
        seedInput: 'seed-input',
        currentSeedDisplaySpan: 'current-seed', // Added from seed_management needs
        
        // Image Upload Controls
        imageUploadInput: 'image-upload-input',
        uploadedFilenameSpan: 'uploaded-filename',
        varySubtleButton: 'vary-subtle-button',
        varyStrongButton: 'vary-strong-button',
        denoiseStrengthManualInput: 'denoise-strength-manual',

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

        // Quality Mode
        qualityModeFastRadio: 'quality-mode-fast',
        qualityModeQualityRadio: 'quality-mode-quality',
    };

    let foundAll = true;
    for (const key in elementIds) {
        const element = document.getElementById(elementIds[key]);
        if (element) {
            elements[key] = element;
        } else {
            if (key !== 'loraStrengthValue') {
                 console.error(`🚨 [UI Elements] Failed to find essential element with ID: ${elementIds[key]}`);
                 foundAll = false;
            } else {
                 console.warn(`⚠️ [UI Elements] Non-essential element not found: ${elementIds[key]}`);
            }
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
export const getLoraSelectElement = () => elements.loraSelect;
export const getLoraStrengthElement = () => elements.loraStrength;
export const getLoraStrengthValueElement = () => elements.loraStrengthValue;
export const getKeepSeedCheckboxElement = () => elements.keepSeedCheckbox;
export const getSeedInputElement = () => elements.seedInput;
export const getCurrentSeedDisplaySpanElement = () => elements.currentSeedDisplaySpan; // Added getter

// Image Upload Controls
export const getImageUploadInputElement = () => elements.imageUploadInput;
export const getUploadedFilenameSpanElement = () => elements.uploadedFilenameSpan;
export const getVarySubtleButtonElement = () => elements.varySubtleButton;
export const getVaryStrongButtonElement = () => elements.varyStrongButton;
export const getDenoiseStrengthManualInputElement = () => elements.denoiseStrengthManualInput;

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

// Quality Mode Getters
export const getQualityModeFastRadioElement = () => elements.qualityModeFastRadio;
export const getQualityModeQualityRadioElement = () => elements.qualityModeQualityRadio;