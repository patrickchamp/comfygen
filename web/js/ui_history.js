// web/js/ui_history.js

/**
 * @fileoverview Handles UI updates related to the recent and favorite
 * prompt history lists.
 */

import { getRecentPromptsListElement, getFavoritePromptsListElement } from './ui_elements.js';
import { setPromptInputValue } from './ui_prompt_controls.js'; // Need this for reuse click

/**
 * Creates a list item element representing a prompt in the history.
 * Includes text and action buttons (Use, Favorite/Unfavorite, Remove).
 *
 * @param {string} prompt - The text of the prompt.
 * @param {number} index - The index of the prompt in its respective array.
 * @param {boolean} isFavorite - True if the prompt is from the favorites list.
 * @param {object} actions - Object containing callback functions for buttons:
 *                           { onUse, onToggleFavorite, onRemove }
 * @returns {HTMLLIElement} The created list item element.
 */
function createPromptItem(prompt, index, isFavorite, actions) {
    const li = document.createElement('li');
    li.className = 'prompt-item';
    li.setAttribute('data-index', index);

    // --- Prompt Text Span ---
    const promptText = document.createElement('span');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt;
    promptText.addEventListener('click', () => {
        setPromptInputValue(prompt); // Use function from prompt_controls
        if (actions.onUse) actions.onUse(prompt); // Optional callback
        console.log(`🔄 Reusing prompt: "${prompt.substring(0, 50)}..."`);
    });

    // --- Favorite/Unfavorite Button (Star) ---
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-button';
    favoriteButton.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
    favoriteButton.innerHTML = isFavorite ? '★' : '☆';
    favoriteButton.addEventListener('click', () => {
        if (actions.onToggleFavorite) actions.onToggleFavorite(prompt, index, isFavorite);
    });

    // --- Remove Button (Cross) ---
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.setAttribute('aria-label', 'Remove this prompt');
    removeButton.innerHTML = '×';
    removeButton.addEventListener('click', () => {
        if (actions.onRemove) actions.onRemove(index, isFavorite);
    });

    li.appendChild(promptText);
    li.appendChild(favoriteButton);
    li.appendChild(removeButton);

    return li;
}

/**
 * Helper function to create the list item used when a prompt list is empty.
 * @param {string} text - The message to display.
 * @returns {HTMLLIElement} The created list item element.
 */
function createEmptyListItem(text) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-message';
    emptyItem.textContent = text;
    return emptyItem;
}




// web/js/ui_history.js

// ... (imports and other functions like createPromptItem, createEmptyListItem) ...

/**
 * Clears and repopulates the recent and favorite prompt lists in the UI.
 *
 * @param {string[]} recentPromptsData - Array of recent prompt strings.
 * @param {string[]} favoritePromptsData - Array of favorite prompt strings.
 * @param {object} actions - Object containing callback functions for buttons (see createPromptItem).
 */
export function updatePromptListsUI(recentPromptsData, favoritePromptsData, actions) {
    const recentListElem = getRecentPromptsListElement();
    const favoriteListElem = getFavoritePromptsListElement();

    if (!recentListElem || !favoriteListElem) {
        console.warn("[UI History] Cannot update UI lists: Elements not found.");
        return;
    }

    // Clear existing content
    recentListElem.innerHTML = '';
    favoriteListElem.innerHTML = '';

    // --- Populate Recent Prompts List ---
    if (recentPromptsData.length === 0) {
        recentListElem.appendChild(createEmptyListItem('No recent prompts yet.'));
    } else {
        recentPromptsData.forEach((prompt, index) => {
            // *** FIX: Check if the current recent prompt is ALSO in the favorites list ***
            const actualIsFavorite = favoritePromptsData.includes(prompt);
            // *** Pass the ACTUAL favorite status to createPromptItem ***
            recentListElem.appendChild(createPromptItem(prompt, index, actualIsFavorite, actions));
        });
    }

    // --- Populate Favorite Prompts List ---
    if (favoritePromptsData.length === 0) {
        favoriteListElem.appendChild(createEmptyListItem('No favorite prompts yet.'));
    } else {
        // This loop correctly assumes all items here are favorites
        favoritePromptsData.forEach((prompt, index) => {
            favoriteListElem.appendChild(createPromptItem(prompt, index, true, actions));
        });
    }
     // console.log("[UI History] UI prompt lists updated.");
}