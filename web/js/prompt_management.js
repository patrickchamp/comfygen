// web/js/prompt_management.js

/**
 * @fileoverview Manages recent and favorite prompts, including storage and UI updates.
 */

// ==========================================================================
// Imports
// ==========================================================================

import { updatePromptListsUI } from './ui_history.js'; // Specific UI update function
import { STORAGE_KEYS } from './settings_manager.js'; // For saving last prompt

// ==========================================================================
// Module Variables
// ==========================================================================

let recentPrompts = [];
let favoritePrompts = [];
const maxRecentPrompts = 25;

// UI elements are handled by ui_history.js
// Function to set prompt input is passed during init

// Callbacks for UI actions
let actions = {
    onUse: null, // Function to call when prompt text is clicked (handled internally now)
    onToggleFavorite: (prompt, index, isFavorite) => {
        if (isFavorite) {
            removeFromFavorites(index);
        } else {
            addToFavorites(prompt);
        }
    },
    onRemove: (index, isFavorite) => {
        if (isFavorite) {
            removeFromFavorites(index);
        } else {
            removeFromRecent(index);
        }
    }
};

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initializes the module. Placeholder for potentially passing dependencies later.
 * Note: UI element references are now managed within ui_history.js.
 * The setPromptInputValue function needs to be available, but is handled
 * by the click listener setup in ui_history.js.
 *
 * @param {HTMLElement} recentListElem - The <ul> element for recent prompts.
 * @param {HTMLElement} favoriteListElem - The <ul> element for favorite prompts.
 * @param {function(string):void} setPromptInputFunc - Function to set main prompt input.
 */
export function initializePromptManagement(recentListElem, favoriteListElem, setPromptInputFunc) {
    // Store the function if needed for other actions, though reuse is now in ui_history
    // actions.onUse = setPromptInputFunc;
    console.log("  ✅ [Prompt Management] Initialized.");
    // UI Element association happens within ui_history.js now
}

// ==========================================================================
// Data Persistence (localStorage)
// ==========================================================================

/** Loads prompts from localStorage. Called by app_init. */
export function loadPromptsFromStorage() {
    console.log("💾 [Prompt Management] Loading prompts from localStorage...");
    try {
        const storedRecent = localStorage.getItem('recentPrompts'); // Use direct key
        recentPrompts = storedRecent ? JSON.parse(storedRecent) : [];
        console.log(`  Loaded ${recentPrompts.length} recent prompts.`);

        const storedFavorite = localStorage.getItem('favoritePrompts'); // Use direct key
        favoritePrompts = storedFavorite ? JSON.parse(storedFavorite) : [];
        console.log(`  Loaded ${favoritePrompts.length} favorite prompts.`);

        // Update UI after loading
        updatePromptListsUI(recentPrompts, favoritePrompts, actions);

    } catch (error) {
        console.error("⚠️ [Prompt Management] Error parsing prompts from localStorage:", error);
        recentPrompts = [];
        favoritePrompts = [];
        updatePromptListsUI(recentPrompts, favoritePrompts, actions); // Show empty lists
    }
}

/** Saves the current prompt arrays to localStorage. */
function savePromptsToStorage() {
    try {
        localStorage.setItem('recentPrompts', JSON.stringify(recentPrompts));
        localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
    } catch (error) {
        console.error("⚠️ [Prompt Management] Error saving prompts to localStorage:", error);
    }
}

/** Clears the 'lastPrompt' item from localStorage. Called by app.js. */
export function clearLastPromptStorage() {
    localStorage.removeItem(STORAGE_KEYS.LAST_PROMPT); // Use key from SettingsManager
    console.log("🧹 [Prompt Management] Cleared last prompt from storage.");
}

// ==========================================================================
// Prompt Management Functions
// ==========================================================================

/** Adds a prompt to recent history, saves, and updates UI. */
export function addToRecentPrompts(prompt) {
    if (!prompt || !prompt.trim()) return;
    recentPrompts = recentPrompts.filter(p => p !== prompt); // Remove duplicates
    recentPrompts.unshift(prompt); // Add to front
    if (recentPrompts.length > maxRecentPrompts) {
        recentPrompts.pop(); // Limit size
    }
    savePromptsToStorage();
    updatePromptListsUI(recentPrompts, favoritePrompts, actions);
    console.log(`[Prompt Management] Added to recent: "${prompt.substring(0, 50)}..."`);
}

/** Adds a prompt to favorites if unique, saves, and updates UI. */
export function addToFavorites(prompt) {
    if (!prompt || !prompt.trim()) return;
    if (!favoritePrompts.includes(prompt)) {
        favoritePrompts.unshift(prompt); // Add to front
        savePromptsToStorage();
        updatePromptListsUI(recentPrompts, favoritePrompts, actions);
        console.log(`⭐ [Prompt Management] Added to favorites: "${prompt.substring(0, 50)}..."`);
    } else {
        console.log(`[Prompt Management] Already in favorites: "${prompt.substring(0, 50)}..."`);
    }
}

/** Removes from recent list by index, saves, updates UI. */
export function removeFromRecent(index) {
    if (index >= 0 && index < recentPrompts.length) {
        const removed = recentPrompts.splice(index, 1)[0];
        savePromptsToStorage();
        updatePromptListsUI(recentPrompts, favoritePrompts, actions);
        console.log(`[Prompt Management] Removed from recent: "${removed.substring(0, 50)}..."`);
    }
}

/** Removes from favorite list by index, saves, updates UI. */
export function removeFromFavorites(index) {
     if (index >= 0 && index < favoritePrompts.length) {
        const removed = favoritePrompts.splice(index, 1)[0];
        savePromptsToStorage();
        updatePromptListsUI(recentPrompts, favoritePrompts, actions);
        console.log(`[Prompt Management] Removed from favorites: "${removed.substring(0, 50)}..."`);
    }
}