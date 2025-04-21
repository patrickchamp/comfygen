// web/js/seed_management.js

/**
 * @fileoverview Manages the seed value for image generation,
 * handling randomization, persistence, and UI updates.
 */

// ==========================================================================
// Imports
// ==========================================================================
import * as UIElements from './ui_elements.js'; // To get elements

// ==========================================================================
// Module Variables
// ==========================================================================

let currentSeed = Math.floor(Math.random() * 10000000000);
let keepSeedCheckbox = null;
let seedInput = null;
let currentSeedDisplaySpan = null;

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initializes the module, caching UI elements and setting initial display.
 * @param {HTMLInputElement} keepSeedCheckboxElem
 * @param {HTMLInputElement} seedInputElem
 * @param {HTMLSpanElement} seedDisplaySpanElem
 */
export function initializeSeedUI(keepSeedCheckboxElem, seedInputElem, seedDisplaySpanElem) {
    if (!keepSeedCheckboxElem || !seedInputElem || !seedDisplaySpanElem) {
        console.error("🚨 [Seed Management] Init failed: Invalid UI elements.");
        return;
    }
    keepSeedCheckbox = keepSeedCheckboxElem;
    seedInput = seedInputElem;
    currentSeedDisplaySpan = seedDisplaySpanElem;

    console.log("  ✅ [Seed Management] UI elements initialized.");
    updateSeedDisplay(); // Initial UI update
}

// ==========================================================================
// UI Update Functions
// ==========================================================================

/** Updates the seed input field and display span with the current internal seed. */
export function updateSeedDisplay() {
    if (seedInput && currentSeedDisplaySpan) {
        const displaySeed = currentSeed;
        currentSeedDisplaySpan.textContent = `Seed: ${displaySeed}`;
        seedInput.value = displaySeed;
        // console.log(`[Seed Management] UI updated to display seed: ${displaySeed}`);
    } else {
         console.warn("[Seed Management] Cannot update seed display: UI elements not ready.");
    }
}

// ==========================================================================
// Seed Logic Functions
// ==========================================================================

/**
 * Sets the internal currentSeed value.
 * @param {number} seedValue - The new seed value.
 */
export function setSeed(seedValue) {
    if (!isNaN(seedValue) && seedValue >= 0) {
        currentSeed = seedValue;
        console.log(`[Seed Management] Internal seed set to: ${currentSeed}`);
        updateSeedDisplay(); // Update UI after setting
    } else {
        console.warn(`[Seed Management] Attempted to set invalid seed: ${seedValue}`);
    }
}


/**
 * Handles changes to the seed input field. Parses input, updates internal seed,
 * and refreshes UI. Called by event listener in app_init.js.
 * @returns {number | null} The parsed seed value if valid, otherwise null.
 */
export function handleSeedInputChange() {
    if (!seedInput) return null;

    const enteredValue = seedInput.value;
    const enteredSeed = parseInt(enteredValue, 10);

    if (!isNaN(enteredSeed) && enteredSeed >= 0) {
        currentSeed = enteredSeed;
        console.log(`[Seed Management] Internal seed updated by input: ${currentSeed}`);
        updateSeedDisplay(); // Reflect change in span
        return currentSeed; // Return valid seed
    } else if (enteredValue === '') {
        console.log("[Seed Management] Seed input cleared. Internal seed unchanged.");
        // Keep internal seed, UI span updated via updateSeedDisplay called elsewhere if needed
         // Might need to manually call updateSeedDisplay here if clearing should immediately show the internal seed again in the input
         updateSeedDisplay();
        return null; // Indicate invalid/empty input
    } else {
        console.warn(`[Seed Management] Invalid seed input: "${enteredValue}". Reverting display.`);
        updateSeedDisplay(); // Revert input field to last valid internal seed
        return null; // Indicate invalid input
    }
}

/**
 * Determines the seed for the next run based on "Keep Seed" checkbox.
 * Randomizes if needed and updates internal state/UI.
 * @param {boolean} [randomizeIfNeeded=false] - If true, randomizes when "Keep Seed" is off.
 * @returns {number} The seed value to use.
 */
export function getSeedForNextRun(randomizeIfNeeded = false) {
    if (!keepSeedCheckbox || !seedInput) {
        console.error("🚨 [Seed Management] Cannot get seed: UI elements not ready.");
        return currentSeed; // Fallback
    }

    if (randomizeIfNeeded && !keepSeedCheckbox.checked) {
        currentSeed = Math.floor(Math.random() * 10000000000);
        console.log(`[Seed Management] Randomized seed (Keep OFF): ${currentSeed}`);
        updateSeedDisplay(); // Show new random seed
        return currentSeed;
    } else {
        // Keep Seed is ON, or no randomization requested.
        // Ensure internal state matches input field in case it was manually edited while Keep Seed was ON.
        if (keepSeedCheckbox.checked) {
             const inputSeedValue = parseInt(seedInput.value, 10);
             if (!isNaN(inputSeedValue) && inputSeedValue >= 0 && inputSeedValue !== currentSeed) {
                console.warn(`[Seed Management] Syncing internal seed (${currentSeed}) with input (${inputSeedValue}) as Keep Seed is ON.`);
                currentSeed = inputSeedValue;
                // No need to call updateSeedDisplay(), input already shows the value. We sync internal state.
             }
        }
        console.log(`[Seed Management] Using existing/fixed seed (Keep ON or no randomize): ${currentSeed}`);
        return currentSeed;
    }
}

/** Returns the current internal seed value without modification. */
export function getCurrentSeedValue() {
    return currentSeed;
}