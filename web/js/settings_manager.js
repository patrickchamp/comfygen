// web/js/settings_manager.js

/**
 * @fileoverview Manages application settings using localStorage
 */

import { 
    getImageWidthInputElement,
    getImageHeightInputElement,
    getStepsInputElement,
    getEnableLoraCheckboxElement,
    getLoraSelectElement,
    getLoraStrengthElement,
    getKeepSeedCheckboxElement,
    getSeedInputElement,
    getDenoiseStrengthManualInputElement
} from './ui_elements.js';

import { setPromptInputValue } from './ui_prompt_controls.js';

// --- Constants ---
const STORAGE_KEYS = {
    IMAGE_WIDTH: 'imageWidth',
    IMAGE_HEIGHT: 'imageHeight',
    STEPS: 'steps',
    ENABLE_LORA: 'enableLora',
    LORA_NAME: 'loraName',
    LORA_STRENGTH: 'loraStrength',
    KEEP_SEED: 'keepSeed',
    SEED: 'seed',
    DENOISE_STRENGTH: 'denoiseStrength',
    LAST_PROMPT: 'lastPrompt'
};

// --- Settings Loading ---

/**
 * Loads all saved settings from localStorage and applies them to the UI
 */
export function loadAllSettings() {
    console.log('🔧 [Settings] Loading saved settings...');
    
    // Image Dimensions
    const savedWidth = localStorage.getItem(STORAGE_KEYS.IMAGE_WIDTH);
    const savedHeight = localStorage.getItem(STORAGE_KEYS.IMAGE_HEIGHT);
    if (savedWidth) getImageWidthInputElement().value = savedWidth;
    if (savedHeight) getImageHeightInputElement().value = savedHeight;
    
    // Steps
    const savedSteps = localStorage.getItem(STORAGE_KEYS.STEPS);
    if (savedSteps) getStepsInputElement().value = savedSteps;
    
    // LoRA Settings
    const savedEnableLora = localStorage.getItem(STORAGE_KEYS.ENABLE_LORA);
    const savedLoraName = localStorage.getItem(STORAGE_KEYS.LORA_NAME);
    const savedLoraStrength = localStorage.getItem(STORAGE_KEYS.LORA_STRENGTH);
    
    if (savedEnableLora) {
        getEnableLoraCheckboxElement().checked = savedEnableLora === 'true';
        if (savedLoraName) getLoraSelectElement().value = savedLoraName;
        if (savedLoraStrength) getLoraStrengthElement().value = savedLoraStrength;
    }
    
    // Seed Settings
    const savedKeepSeed = localStorage.getItem(STORAGE_KEYS.KEEP_SEED);
    const savedSeed = localStorage.getItem(STORAGE_KEYS.SEED);
    if (savedKeepSeed) getKeepSeedCheckboxElement().checked = savedKeepSeed === 'true';
    if (savedSeed) getSeedInputElement().value = savedSeed;
    
    // Denoise Strength
    const savedDenoiseStrength = localStorage.getItem(STORAGE_KEYS.DENOISE_STRENGTH);
    if (savedDenoiseStrength) getDenoiseStrengthManualInputElement().value = savedDenoiseStrength;

    // Last Prompt
    const savedPrompt = localStorage.getItem(STORAGE_KEYS.LAST_PROMPT);
    if (savedPrompt) {
        setPromptInputValue(savedPrompt); // Use imported function
    }
    
    console.log('  ✅ [Settings] Settings loaded successfully');
}

// --- Settings Saving ---

/**
 * Saves the current image width to localStorage
 */
export function saveImageWidth() {
    const width = getImageWidthInputElement().value;
    localStorage.setItem(STORAGE_KEYS.IMAGE_WIDTH, width);
}

/**
 * Saves the current image height to localStorage
 */
export function saveImageHeight() {
    const height = getImageHeightInputElement().value;
    localStorage.setItem(STORAGE_KEYS.IMAGE_HEIGHT, height);
}

/**
 * Saves the current steps value to localStorage
 */
export function saveSteps() {
    const steps = getStepsInputElement().value;
    localStorage.setItem(STORAGE_KEYS.STEPS, steps);
}

/**
 * Saves the current LoRA enable state to localStorage
 */
export function saveEnableLora() {
    const enabled = getEnableLoraCheckboxElement().checked;
    localStorage.setItem(STORAGE_KEYS.ENABLE_LORA, enabled);
}

/**
 * Saves the current LoRA name to localStorage
 */
export function saveLoraName() {
    const loraName = getLoraSelectElement().value;
    localStorage.setItem(STORAGE_KEYS.LORA_NAME, loraName);
}

/**
 * Saves the current LoRA strength to localStorage
 */
export function saveLoraStrength() {
    const strength = getLoraStrengthElement().value;
    localStorage.setItem(STORAGE_KEYS.LORA_STRENGTH, strength);
}

/**
 * Saves the current keep seed state to localStorage
 */
export function saveKeepSeed() {
    const keepSeed = getKeepSeedCheckboxElement().checked;
    localStorage.setItem(STORAGE_KEYS.KEEP_SEED, keepSeed);
}

/**
 * Saves the current seed value to localStorage
 */
export function saveSeed() {
    const seed = getSeedInputElement().value;
    localStorage.setItem(STORAGE_KEYS.SEED, seed);
}

/**
 * Saves the current denoise strength to localStorage
 */
export function saveDenoiseStrength() {
    const strength = getDenoiseStrengthManualInputElement().value;
    localStorage.setItem(STORAGE_KEYS.DENOISE_STRENGTH, strength);
}

/**
 * Alias for loadAllSettings to maintain compatibility with app_init.js
 */
export function loadInitialSettings() {
    return loadAllSettings();
}

/**
 * Saves the current prompt to localStorage
 */
export function savePrompt(prompt) {
    localStorage.setItem(STORAGE_KEYS.LAST_PROMPT, prompt);
}

// Export the STORAGE_KEYS object for use in other modules
export { STORAGE_KEYS };