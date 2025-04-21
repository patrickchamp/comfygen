// web/js/ui_prompt_controls.js

/**
 * @fileoverview Handles getting/setting values and state
 * related to the prompt input and generation settings card.
 */

import {
    getPromptElement,
    getImageWidthInputElement,
    getImageHeightInputElement,
    getStepsInputElement
} from './ui_elements.js';

/**
 * Gets the current value from the main prompt textarea.
 * @returns {string} The current text content of the prompt input. Returns empty string if element not found.
 */
export function getPromptInputValue() {
    const promptElement = getPromptElement();
    return promptElement ? promptElement.value : '';
}

/**
 * Clears the content of the main prompt textarea.
 */
export function clearPromptInput() {
    const promptElement = getPromptElement();
    if (promptElement) {
        promptElement.value = '';
    }
}

/**
 * Sets the value of the main prompt textarea.
 * @param {string} value - The text to set in the prompt input.
 */
export function setPromptInputValue(value) {
    const promptElement = getPromptElement();
    if (promptElement) {
        promptElement.value = value;
    }
}

/**
 * Updates the width and height input fields visually.
 * @param {number | string} width - The new width value.
 * @param {number | string} height - The new height value.
 */
export function updateImageDimensionInputs(width, height) {
    const widthInput = getImageWidthInputElement();
    const heightInput = getImageHeightInputElement();
    if (widthInput) widthInput.value = width;
    if (heightInput) heightInput.value = height;
}

/**
 * Gets the current width and height values from their respective input fields.
 * Parses them as integers. Used to update the workflow before sending.
 * @returns {{width: number, height: number}} An object containing the parsed width and height. Defaults to 0 if inputs not found or invalid.
 */
export function getWorkflowDimensions() {
    const widthInput = getImageWidthInputElement();
    const heightInput = getImageHeightInputElement();
    const width = widthInput ? parseInt(widthInput.value, 10) || 0 : 0;
    const height = heightInput ? parseInt(heightInput.value, 10) || 0 : 0;
    return { width, height };
}

/**
 * Gets the current steps value from its input field.
 * Parses it as an integer. Used to update the workflow before sending.
 * @returns {number} The parsed number of steps. Defaults to 0 if input not found or invalid.
 */
export function getWorkflowSteps() {
    const stepsInput = getStepsInputElement();
    return stepsInput ? parseInt(stepsInput.value, 10) || 0 : 0;
}

// NOTE: Getters for checkbox/seed inputs are directly available via ui_elements.js
// Functions related to updating seed display are in seed_management.js