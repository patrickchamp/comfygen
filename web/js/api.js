// web/js/api.js

/**
 * @fileoverview Handles communication with the ComfyUI backend server.
 * Responsibilities include:
 * - Providing functions to interact with the ComfyUI HTTP API endpoints:
 *   - Sending prompts for execution (`/prompt`).
 *   - Loading the base workflow definition (`/comfygen/js/base_workflow.json`).
 * - Exporting the unique client ID required for WebSocket and prompt queuing.
 */

// ==========================================================================
// Imports
// ==========================================================================

import { uuidv4 } from './utils.js';

// ==========================================================================
// Module Constants and Variables
// ==========================================================================

/**
 * @const {string} A unique identifier for this browser session/client instance.
 * Sent to the server with WebSocket connections and prompt requests. Allows the
 * server to associate messages and tasks with a specific client.
 */
export const clientId = uuidv4();

// ==========================================================================
// HTTP API Interaction
// ==========================================================================

/**
 * Sends a workflow definition to the ComfyUI backend's `/prompt` endpoint to queue it for execution.
 *
 * @param {object} workflow - The complete workflow object (usually a modified copy of the base workflow).
 * @returns {Promise<object>} A promise that resolves with the JSON response from the server (contains prompt_id, etc.)
 * @throws {Error} Throws an error if the fetch request fails (network issue, server error response).
 */
export async function queuePrompt(workflow) {
    const payload = {
        prompt: workflow,
        client_id: clientId
    };

    console.log(`[API Module] Sending prompt to /prompt (Client ID: ${clientId})`);
    // console.log("[API Module] Workflow Payload:", JSON.stringify(payload, null, 2)); // Very verbose

    try {
        const response = await fetch('/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorDetails = `HTTP status ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetails += `: ${JSON.stringify(errorData)}`;
            } catch (e) {
                errorDetails += ` - ${response.statusText}`;
            }
            throw new Error(`Failed to queue prompt. ${errorDetails}`);
        }

        const result = await response.json();
        console.log("[API Module] Prompt queue response:", result);
        return result;

    } catch (error) {
        console.error('[API Module] Error queuing prompt:', error);
        alert(`An error occurred submitting the prompt: ${error.message}\nPlease check server connection and console.`);
        throw error;
    }
}

/**
 * Fetches the base workflow definition from the specified JSON file.
 *
 * @returns {Promise<object>} A promise that resolves with the parsed JSON workflow object.
 * @throws {Error} Throws an error if the fetch request fails or if the response is not valid JSON.
 */
export async function loadWorkflow() {
    const workflowPath = '/comfygen/js/base_workflow.json';
    console.log(`[API Module] Loading base workflow from: ${workflowPath}`);

    try {
        const response = await fetch(workflowPath);

        if (!response.ok) {
            throw new Error(`Failed to load workflow file. HTTP ${response.status} - ${response.statusText}`);
        }

        const workflowData = await response.json();
        console.log("[API Module] Base workflow loaded successfully.");
        return workflowData;

    } catch (error) {
        console.error('[API Module] Error loading base workflow:', error);
        alert(`Failed to load the base workflow from ${workflowPath}. Ensure the file exists and the server is configured. Check console.`);
        throw error;
    }
}

/**
 * Uploads an image file to the ComfyUI server.
 * 
 * @param {File} file - The image file to upload.
 * @returns {Promise<object>} A promise that resolves with the server response containing image details.
 * @throws {Error} Throws an error if the upload fails.
 */
export async function uploadImage(file) {
    console.log(`[API Module] Uploading image: ${file.name}`);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/upload/image', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Failed to upload image. HTTP ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("[API Module] Image upload successful:", result);
        return result;
        
    } catch (error) {
        console.error('[API Module] Error uploading image:', error);
        alert(`Failed to upload image: ${error.message}`);
        throw error;
    }
}

// Removed the deprecated updateWorkflow function