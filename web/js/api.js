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

/**
 * Fetches the list of available LoRAs from the backend API.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of LoRA objects (each containing at least a 'name' property), or an empty array on error.
 */
export async function fetchLoras() {
    const refreshEndpoint = '/comfyapi/v1/refresh-loras'; // Keep refresh attempt
    const fetchEndpoint = '/comfyapi/v1/loras';

    try {
        // Try refreshing the backend list first
        console.log(`[API Module] Attempting to refresh LoRA list via POST to: ${refreshEndpoint}`);
        try {
             await fetch(refreshEndpoint, { method: 'POST' });
             console.log(`[API Module] Refresh request sent.`);
        } catch (refreshError) {
             console.warn(`[API Module] Failed to send refresh request to ${refreshEndpoint}:`, refreshError);
        }

        console.log(`[API Module] Fetching LoRA list from GET: ${fetchEndpoint}`);
        const response = await fetch(fetchEndpoint);
        if (!response.ok) {
            let errorDetails = `HTTP status ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetails += `: ${JSON.stringify(errorData)}`;
            } catch (e) {
                errorDetails += ` - ${response.statusText}`;
            }
            throw new Error(`Failed to fetch LoRAs after refresh attempt. ${errorDetails}`);
        }

        const data = await response.json();
        let loras = data && Array.isArray(data.loras) ? data.loras : (Array.isArray(data) ? data : []);

        if (!Array.isArray(loras)) {
             console.warn("[API Module] Fetched LoRA data is not an array:", data);
             throw new Error("Invalid data format received for LoRAs.");
        }

        console.log(`[API Module] Received ${loras.length} LoRA objects from API. Processing paths...`);

        // Process to add relativePath and ensure lora_name is filename+extension
        const processedLoras = loras.map(lora => {
            if (lora && typeof lora.path === 'string') {
                let relativePath = '';
                const normalizedPath = lora.path.replace(/\\/g, '/');
                const keyword = 'models/loras/';
                const index = normalizedPath.indexOf(keyword);

                if (index !== -1) {
                    // Extract the relative path (e.g., Flux/Jockstrap.safetensors)
                    relativePath = normalizedPath.substring(index + keyword.length);
                    lora.relativePath = relativePath;

                    // Extract JUST the filename + extension (e.g., Jockstrap.safetensors)
                    const lastSlashIndex = relativePath.lastIndexOf('/');
                    if (lastSlashIndex !== -1) {
                        lora.lora_name = relativePath.substring(lastSlashIndex + 1); // Use part after last slash
                    } else {
                        lora.lora_name = relativePath; // Use as is if no slash
                    }
                    // Ensure 'name' field (used for display) is cleaned without extension/path
                    lora.name = lora.lora_name.replace(/\.(safetensors|ckpt|pt)$/i, '');

                } else {
                    console.warn(`[API Module] Could not find '${keyword}' in path for LoRA: ${lora.name} (Path: ${lora.path}). Using fallbacks.`);
                    lora.relativePath = lora.path; // Best guess
                    lora.lora_name = lora.path.substring(lora.path.replace(/\\/g, '/').lastIndexOf('/') + 1); // Filename fallback
                    lora.name = (lora.name || lora.lora_name).replace(/\.(safetensors|ckpt|pt)$/i, ''); // Clean display name fallback
                }
            } else {
                console.warn("[API Module] LoRA object missing 'path' property or path is not a string:", lora);
                lora.relativePath = lora.name || '';
                lora.lora_name = lora.name || ''; // Filename fallback
                lora.name = (lora.name || '').replace(/\.(safetensors|ckpt|pt)$/i, ''); // Clean display name fallback
            }
            return lora;
        }).filter(lora => lora.lora_name); // Keep only loras where we have a filename

        console.log(`[API Module] Finished processing paths. Valid LoRAs with filename: ${processedLoras.length}`);
        if (processedLoras.length > 0) {
             console.log("[DEBUG] Processed first LoRA object:", JSON.stringify(processedLoras[0], null, 2));
        }

        return processedLoras;

    } catch (error) {
        console.error('[API Module] Error fetching or processing LoRAs:', error);
        if (!error.message.includes("Failed to send refresh request")) {
             alert(`Failed to fetch or process the list of LoRAs: ${error.message}`);
         }
        return [];
    }
}

// Removed the deprecated updateWorkflow function