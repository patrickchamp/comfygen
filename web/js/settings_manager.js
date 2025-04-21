// web/js/settings_manager.js

/**
 * @fileoverview Manages loading and saving user settings to localStorage.
 */

import * as PromptControlUI from './ui_prompt_controls.js';
import * as UIElements from './ui_elements.js'; // For accessing elements like checkboxes, presets
import * as SeedManagement from './seed_management.js'; // To set initial seed state

// --- localStorage Keys ---
const KEYS = {
    LAST_PROMPT: 'lastPrompt',
    IMAGE_WIDTH: 'imageWidth',
    IMAGE_HEIGHT: 'imageHeight',
    STEPS: 'steps',
    ENABLE_LORA: 'enableLora',
    SAVED_SEED: 'savedSeed', // Stores the seed value when "Keep Seed" is ON
    KEEP_SEED_PREF: 'keepSeedPreference', // Explicitly save checkbox state
    DENOISE_STRENGTH: 'denoiseStrength', // New key for img2img denoise strength
    GENERATION_MODE: 'generationMode' // New key for txt2img/img2img mode
};

/**
 * Loads initial settings from localStorage and applies them to the UI.
 * Called once during application startup by app_init.js.
 */
export function loadInitialSettings() {
    console.log("💾 [Settings Manager] Loading initial settings...");

    // --- Load Last Prompt ---
    const lastPrompt = localStorage.getItem(KEYS.LAST_PROMPT);
    if (lastPrompt) {
        PromptControlUI.setPromptInputValue(lastPrompt);
    }

    // --- Load Generation Mode ---
    const savedMode = localStorage.getItem(KEYS.GENERATION_MODE) || 'txt2img';
    const txt2imgRadio = UIElements.getModeTxt2imgRadioElement();
    const img2imgRadio = UIElements.getModeImg2imgRadioElement();
    const img2imgControls = UIElements.getImg2imgControlsElement();
    
    if (txt2imgRadio && img2imgRadio && img2imgControls) {
        if (savedMode === 'img2img') {
            img2imgRadio.checked = true;
            img2imgControls.style.display = 'block';
        } else {
            txt2imgRadio.checked = true;
            img2imgControls.style.display = 'none';
        }
    }

    // --- Load Denoise Strength ---
    const savedDenoise = localStorage.getItem(KEYS.DENOISE_STRENGTH);
    const denoiseInput = UIElements.getDenoiseStrengthElement();
    if (savedDenoise && denoiseInput) {
        denoiseInput.value = savedDenoise;
    } else if (denoiseInput) {
        // If nothing saved, ensure the default from HTML is saved now
        saveSetting(KEYS.DENOISE_STRENGTH, denoiseInput.value);
    }

    // --- Load Image Dimensions ---
    const savedWidth = localStorage.getItem(KEYS.IMAGE_WIDTH);
    const savedHeight = localStorage.getItem(KEYS.IMAGE_HEIGHT);
    const widthInput = UIElements.getImageWidthInputElement();
    const heightInput = UIElements.getImageHeightInputElement();
    // Use saved values OR the current input values (which might be HTML defaults)
    const initialWidth = savedWidth || (widthInput ? widthInput.value : '576'); // Provide defaults
    const initialHeight = savedHeight || (heightInput ? heightInput.value : '1024');
    PromptControlUI.updateImageDimensionInputs(initialWidth, initialHeight);

    // Try to match loaded dimensions to a preset option
    const currentPresetValue = `${initialWidth}x${initialHeight}`;
    const presetSelector = UIElements.getImageSizePresetElement();
    if (presetSelector) {
        const presetFound = [...presetSelector.options].some(option => option.value === currentPresetValue);
        presetSelector.value = presetFound ? currentPresetValue : ""; // Set to preset or "Custom"
    }

    // --- Load Steps ---
    const savedSteps = localStorage.getItem(KEYS.STEPS);
    const stepsInput = UIElements.getStepsInputElement();
    if (savedSteps && stepsInput) {
        stepsInput.value = savedSteps;
    } else if (stepsInput) {
        // If nothing saved, ensure the default from HTML is saved now
        saveSetting(KEYS.STEPS, stepsInput.value);
    }

    // --- Load LoRA Preference ---
    const savedEnableLora = localStorage.getItem(KEYS.ENABLE_LORA);
    const loraCheckbox = UIElements.getEnableLoraCheckboxElement();
    if (loraCheckbox) {
        if (savedEnableLora !== null) {
            loraCheckbox.checked = savedEnableLora === 'true'; // Compare against 'true' string
        } else {
            // Default to checked if never saved before and save it
            loraCheckbox.checked = true;
            saveSetting(KEYS.ENABLE_LORA, 'true');
        }
    }

    // --- Load Seed State ---
    const keepSeedCheckbox = UIElements.getKeepSeedCheckboxElement();
    const seedInput = UIElements.getSeedInputElement();

    if (keepSeedCheckbox && seedInput) {
        // Restore checkbox state first
        const savedKeepSeedPref = localStorage.getItem(KEYS.KEEP_SEED_PREF);
        if (savedKeepSeedPref !== null) {
            keepSeedCheckbox.checked = savedKeepSeedPref === 'true';
        } else {
            // Default to unchecked if never saved
            keepSeedCheckbox.checked = false;
            saveSetting(KEYS.KEEP_SEED_PREF, 'false');
        }

        // Now handle the seed value based on the checkbox state
        if (keepSeedCheckbox.checked) {
            const savedSeedValue = localStorage.getItem(KEYS.SAVED_SEED);
            if (savedSeedValue && !isNaN(parseInt(savedSeedValue))) {
                seedInput.value = savedSeedValue;
                // CRITICAL: Update the internal seed state in SeedManagement
                SeedManagement.setSeed(parseInt(savedSeedValue, 10)); // Use a dedicated setter
                console.log(`  Restored Saved Seed: ${savedSeedValue} (Keep Seed is ON)`);
            } else {
                // Keep seed is ON, but no valid seed saved: Use initial random, display it, and save it.
                SeedManagement.updateSeedDisplay(); // Updates input & span from internal state
                saveSetting(KEYS.SAVED_SEED, SeedManagement.getCurrentSeedValue());
                 console.log(`  Keep Seed ON, but no valid saved seed. Using and saving current: ${SeedManagement.getCurrentSeedValue()}`);
            }
        } else {
            // Keep seed is OFF: Display the current internal (random) seed.
            SeedManagement.updateSeedDisplay();
            // Optionally clear the localStorage saved seed if keep seed is off?
            // localStorage.removeItem(KEYS.SAVED_SEED);
            console.log("  Keep Seed is OFF. UI reflects current internal seed.");
        }
    }

    console.log("💾 [Settings Manager] Finished loading initial settings.");
}

/**
 * Saves a specific setting to localStorage.
 * @param {string} key - The localStorage key (use KEYS object).
 * @param {string | number | boolean} value - The value to save. Booleans are saved as 'true'/'false'.
 */
export function saveSetting(key, value) {
    try {
        let valueToStore = value;
        if (typeof value === 'boolean') {
            valueToStore = value ? 'true' : 'false';
        }
        localStorage.setItem(key, valueToStore);
        // console.log(`💾 [Settings Manager] Saved ${key} = ${valueToStore}`); // Verbose log
    } catch (error) {
        console.error(`⚠️ [Settings Manager] Error saving setting ${key}:`, error);
    }
}

// --- Specific Save Handlers (Optional but can be convenient) ---

export function savePrompt(promptText) {
    saveSetting(KEYS.LAST_PROMPT, promptText);
}

export function saveDimensions(width, height) {
    saveSetting(KEYS.IMAGE_WIDTH, width);
    saveSetting(KEYS.IMAGE_HEIGHT, height);
}

export function saveSteps(steps) {
    saveSetting(KEYS.STEPS, steps);
}

export function saveLoraPreference(isEnabled) {
    saveSetting(KEYS.ENABLE_LORA, isEnabled); // Pass boolean, saveSetting handles conversion
}

export function saveKeepSeedPreference(isChecked) {
    saveSetting(KEYS.KEEP_SEED_PREF, isChecked); // Pass boolean
}

export function saveCurrentSeedValue(seedValue) {
     saveSetting(KEYS.SAVED_SEED, seedValue);
}

export function saveDenoiseStrength(value) {
    saveSetting(KEYS.DENOISE_STRENGTH, value);
}

export function saveGenerationMode(mode) {
    saveSetting(KEYS.GENERATION_MODE, mode);
}

export function removeSavedSeedValue() {
    localStorage.removeItem(KEYS.SAVED_SEED);
    console.log(`💾 [Settings Manager] Removed ${KEYS.SAVED_SEED}`);
}

// Expose KEYS if needed by other modules (though preferably use save functions)
export { KEYS };