// web/js/app.js

/**
 * @fileoverview Core application script for ComfyGen Studio.
 * - Loads base workflow.
 * - Initializes the app via app_init.js.
 * - Handles queuing prompts (modifying workflow with settings).
 * - Processes WebSocket messages for UI updates.
 * - Manages user interaction triggers (clear prompt).
 */

// ==========================================================================
// Imports
// ==========================================================================

import { queuePrompt, loadWorkflow } from './api.js';
// Import specific UI interaction functions needed here
import * as PromptControlUI from './ui_prompt_controls.js';
import * as ImageDisplayUI from './ui_image_display.js'; // For enabling/disabling nav buttons potentially
import * as UIHelpers from './ui_helpers.js';
import { getEnableLoraCheckboxElement } from './ui_elements.js'; // Direct element access if needed
import * as UIElements from './ui_elements.js'; // Import the entire UIElements namespace
// Management Modules
import * as ImageManagement from './image_management.js';
import * as SeedManagement from './seed_management.js';
import * as PromptManagement from './prompt_management.js';
// Initialization
import { initializeApp } from './app_init.js';

// ==========================================================================
// Module Variables & Constants
// ==========================================================================

/** @type {object | null} Base ComfyUI workflow structure loaded from JSON. */
let txt2imgWorkflow = null;
/** @type {object | null} Img2img workflow structure loaded from JSON. */
let img2imgWorkflow = null;

/** Constants for Node IDs in the default base_workflow.json (API format) */
const TXT2IMG_NODE_IDS = {
    POSITIVE_PROMPT: '6',     // CLIPTextEncode (Positive)
    NEGATIVE_PROMPT: '33',    // CLIPTextEncode (Negative) - Optional if you modify it
    CHECKPOINT_LOADER: '30',  // CheckpointLoaderSimple
    LORA_LOADER: '38',        // LoraLoaderModelOnly
    FLUX_GUIDANCE: '35',      // FluxGuidance (Connects positive prompt)
    EMPTY_LATENT: '27',       // EmptySD3LatentImage
    KSAMPLER: '31',           // KSampler
    VAE_DECODE: '8',          // VAEDecode
    SAVE_IMAGE: '9',          // SaveImage
    SHOW_TEXT_HELPER: '42'    // ShowText|pysssss (Optional Helper)
};

/** Constants for Node IDs in the img2img workflow */
const IMG2IMG_NODE_IDS = {
    POSITIVE_PROMPT_ENCODER: '15', // CLIPTextEncodeFlux
    NEGATIVE_PROMPT_CONDITIONING: '16', // ConditioningZeroOut
    KSAMPLER: '3',
    LOAD_IMAGE: '21',
    VAE_ENCODE: '23',
    CHECKPOINT_LOADER: '24',
    OUTPUT_NODE: '17' // PreviewImage (Consider changing to SaveImage ID if workflow modified)
};

// ==========================================================================
// Main Application Logic
// ==========================================================================

/** Main entry point. Loads workflow, then initializes the application. */
async function main() {
    console.log("🚀 Starting ComfyGen Studio main logic...");
    try {
        // Load both workflows
        txt2imgWorkflow = await loadWorkflow();
        console.log("  ✅ Base txt2img workflow loaded successfully.");
        
        // Load img2img workflow
        try {
            const img2imgResponse = await fetch('/comfygen/js/Flux_img2img.json');
            if (!img2imgResponse.ok) {
                throw new Error(`Failed to load img2img workflow. HTTP ${img2imgResponse.status} - ${img2imgResponse.statusText}`);
            }
            img2imgWorkflow = await img2imgResponse.json();
            console.log("  ✅ Img2img workflow loaded successfully.");
        } catch (error) {
            console.error("⚠️ Failed to load img2img workflow:", error);
            alert("Failed to load the img2img workflow. Some features may be unavailable.");
        }

        if (!txt2imgWorkflow) {
            throw new Error("Txt2img workflow data is null or undefined after loading.");
        }

        // Initialize UI, WebSocket, event listeners, load settings.
        // Pass core functions as callbacks.
        initializeApp(queuePromptWithText, handleSocketMessage, clearPromptAction);

    } catch (error) {
        console.error("🚨 Critical Error: Failed to load workflows:", error);
        alert("Failed to load the essential workflow files. Application cannot start. Check console and ensure workflow files are accessible.");
        // Optionally display error in UI
    }
}

/**
 * Prepares and sends an image generation request to the backend.
 * - Validates prompt.
 * - Manages prompt history.
 * - Creates a deep copy of the appropriate workflow.
 * - Modifies the copy with user settings using NODE_IDS constants.
 * - Sends the modified workflow via the API.
 * - Handles API response/errors.
 * @param {string} text - The user-provided text prompt.
 */
async function queuePromptWithText(text) {
    if (!text || !text.trim()) {
        alert('Please enter a prompt.');
        console.warn("Prompt generation aborted: No text.");
        return;
    }
    console.log(`📝 Preparing prompt: "${text.substring(0, 100)}..."`);

    // --- Manage Prompt History & Save Input ---
    PromptManagement.addToRecentPrompts(text);
    // SettingsManager.savePrompt(text); // Handled by event listener in app_init

    // --- Get Generation Mode ---
    const generationMode = document.querySelector('input[name="generation-mode"]:checked').value;
    console.log(`  🔄 Generation Mode: ${generationMode}`);

    // --- Create Deep Copy of Appropriate Workflow ---
    let freshWorkflow;
    let nodeIds;
    
    try {
        if (generationMode === 'img2img') {
            // Check if an image is uploaded
            if (!window.uploadedImageFilename) {
                alert('Please upload an image first for img2img generation.');
                return;
            }
            
            if (!img2imgWorkflow) {
                alert('Img2img workflow not loaded. Please refresh the page or check console.');
                return;
            }
            
            freshWorkflow = JSON.parse(JSON.stringify(img2imgWorkflow));
            nodeIds = IMG2IMG_NODE_IDS;
            console.log("  🧬 Created deep copy of img2img workflow template.");
        } else {
            freshWorkflow = JSON.parse(JSON.stringify(txt2imgWorkflow));
            nodeIds = TXT2IMG_NODE_IDS;
            console.log("  🧬 Created deep copy of txt2img workflow template.");
        }
    } catch (e) {
        console.error("🚨 Failed to deep copy workflow:", e);
        alert("Internal error preparing workflow. Cannot proceed.");
        return;
    }

    // --- Modify Workflow Copy ---
    const seedForThisRun = SeedManagement.getSeedForNextRun(true); // Handles randomization
    console.log(`  🌱 Using Seed: ${seedForThisRun}`);

    try {
        if (generationMode === 'img2img') {
            // Set the uploaded image filename
            if (freshWorkflow[nodeIds.LOAD_IMAGE]?.inputs) {
                freshWorkflow[nodeIds.LOAD_IMAGE].inputs.image = window.uploadedImageFilename;
                console.log(`  🖼️ Set input image: ${window.uploadedImageFilename}`);
            }
            
            // Set denoise strength
            const denoiseValue = UIElements.getDenoiseStrengthElement().value;
            if (freshWorkflow[nodeIds.KSAMPLER]?.inputs) {
                freshWorkflow[nodeIds.KSAMPLER].inputs.denoise = parseFloat(denoiseValue);
                console.log(`  🎨 Set denoise strength: ${denoiseValue}`);
            }
            
            // Set prompt text
            if (freshWorkflow[nodeIds.POSITIVE_PROMPT_ENCODER]?.inputs) {
                freshWorkflow[nodeIds.POSITIVE_PROMPT_ENCODER].inputs.clip_l = text.replace(/(\r\n|\n|\r)/gm, ' ');
                freshWorkflow[nodeIds.POSITIVE_PROMPT_ENCODER].inputs.t5xxl = text.replace(/(\r\n|\n|\r)/gm, ' ');
                console.log("  📝 Set prompt text for img2img");
            }
            
            // Set seed
            if (freshWorkflow[nodeIds.KSAMPLER]?.inputs) {
                freshWorkflow[nodeIds.KSAMPLER].inputs.seed = seedForThisRun;
                console.log(`  🌱 Set seed for img2img: ${seedForThisRun}`);
            }
            
            // Set steps
            const steps = PromptControlUI.getWorkflowSteps();
            if (freshWorkflow[nodeIds.KSAMPLER]?.inputs) {
                freshWorkflow[nodeIds.KSAMPLER].inputs.steps = steps;
                console.log(`  🔢 Set steps for img2img: ${steps}`);
            }
        } else {
            // Original txt2img logic
            // Optional: Remove helper 'Show Text' node if present
            if (freshWorkflow[nodeIds.SHOW_TEXT_HELPER]) {
                delete freshWorkflow[nodeIds.SHOW_TEXT_HELPER];
                console.log(`  🗑️ Removed helper node (${nodeIds.SHOW_TEXT_HELPER}).`);
            }

            // Positive Prompt Text
            if (freshWorkflow[nodeIds.POSITIVE_PROMPT]?.inputs) {
                freshWorkflow[nodeIds.POSITIVE_PROMPT].inputs.text = text.replace(/(\r\n|\n|\r)/gm, '');
            } else {
                console.warn(`Node ${nodeIds.POSITIVE_PROMPT} (Positive Prompt) not found or structured as expected.`);
            }

            // Seed (KSampler)
            if (freshWorkflow[nodeIds.KSAMPLER]?.inputs) {
                freshWorkflow[nodeIds.KSAMPLER].inputs.seed = seedForThisRun;
            } else {
                console.warn(`Node ${nodeIds.KSAMPLER} (KSampler) not found or missing 'seed' input.`);
            }

            // Dimensions (EmptyLatentImage)
            const dimensions = PromptControlUI.getWorkflowDimensions();
            if (freshWorkflow[nodeIds.EMPTY_LATENT]?.inputs) {
                freshWorkflow[nodeIds.EMPTY_LATENT].inputs.width = dimensions.width;
                freshWorkflow[nodeIds.EMPTY_LATENT].inputs.height = dimensions.height;
                console.log(`  📏 Set Dimensions: ${dimensions.width}x${dimensions.height}`);
            } else {
                console.warn(`Node ${nodeIds.EMPTY_LATENT} (Empty Latent) not found or missing dimension inputs.`);
            }

            // Steps (KSampler)
            const steps = PromptControlUI.getWorkflowSteps();
            if (freshWorkflow[nodeIds.KSAMPLER]?.inputs) {
                freshWorkflow[nodeIds.KSAMPLER].inputs.steps = steps;
                console.log(`  🔢 Set Steps: ${steps}`);
            } else {
                console.warn(`Node ${nodeIds.KSAMPLER} (KSampler) not found or missing 'steps' input.`);
            }

            // --- Handle LoRA ---
            const loraCheckbox = getEnableLoraCheckboxElement(); // Get checkbox element
            const enableLora = loraCheckbox ? loraCheckbox.checked : false; // Default to false if element not found

            const kSamplerNode = freshWorkflow[nodeIds.KSAMPLER];
            const loraNode = freshWorkflow[nodeIds.LORA_LOADER];
            const checkpointNodeId = nodeIds.CHECKPOINT_LOADER;
            const loraNodeId = nodeIds.LORA_LOADER;

            if (kSamplerNode?.inputs) {
                if (enableLora) {
                    console.log("  💡 Enabling LoRA...");
                    // Ensure LoRA node exists (it should in the base workflow)
                    if (loraNode) {
                        // Connect KSampler model input to LoRA Loader output
                        kSamplerNode.inputs.model = [loraNodeId, 0];
                        // Ensure LoRA Loader model input comes from Checkpoint Loader
                        if(loraNode.inputs){
                            loraNode.inputs.model = [checkpointNodeId, 0];
                        } else {
                            console.warn(`LoRA Node ${loraNodeId} exists but missing inputs structure.`);
                        }
                        console.log(`     ✅ KSampler (${nodeIds.KSAMPLER}) input connected to LoRA Loader (${loraNodeId}).`);
                    } else {
                        console.warn(`LoRA enabled in UI, but LoRA Node (${loraNodeId}) not found in workflow! Defaulting to Checkpoint Loader.`);
                        kSamplerNode.inputs.model = [checkpointNodeId, 0];
                    }
                } else {
                    console.log("  ❌ LoRA Disabled.");
                    // Connect KSampler model input directly to Checkpoint Loader
                    kSamplerNode.inputs.model = [checkpointNodeId, 0];
                    console.log(`     ✅ KSampler (${nodeIds.KSAMPLER}) input connected directly to Checkpoint Loader (${checkpointNodeId}).`);

                    // Remove the LoRA Loader node from this execution if it exists
                    if (freshWorkflow[loraNodeId]) {
                        delete freshWorkflow[loraNodeId];
                        console.log(`     🗑️ Removed LoRA node (${loraNodeId}) from workflow.`);
                    }
                }
            } else {
                console.warn(`Node ${nodeIds.KSAMPLER} (KSampler) not found or missing inputs structure for LoRA handling.`);
            }
        }
    } catch (error) {
        console.error("🚨 Error modifying workflow inputs:", error);
        console.error("   Workflow state at error:", JSON.stringify(freshWorkflow, null, 2));
        alert("Internal error setting workflow parameters. Check console.");
        return; // Stop execution
    }

    // --- Send Prompt to API ---
    console.log("📤 Sending modified workflow to backend API...");
    // console.log("Final Workflow JSON:", JSON.stringify(freshWorkflow, null, 2)); // Verbose

    try {
        UIHelpers.updateProgress(0, 0); // Reset progress bar visually
        const result = await queuePrompt(freshWorkflow); // Call API
        console.log("🛰️ Prompt submitted. API Response:", result);

        // Handle API response (errors, success)
        if (result.node_errors && Object.keys(result.node_errors).length > 0) {
            console.error("🛑 Node execution errors reported by backend:", result.node_errors);
            let errorMessages = "Backend error during generation:\n";
            // ... (error message construction as before) ...
            alert("⚠️ Backend error during generation. Check console for detailed node errors.");
            UIHelpers.updateProgress(0, 0); // Reset progress on error
        } else if (result.error) {
            console.error("🛑 API reported an error:", result.error, "Details:", result.details);
            alert(`⚠️ API Error: ${result.error}. Check console.`);
            UIHelpers.updateProgress(0, 0);
        } else {
            console.log(`  ✅ Prompt successfully queued with ID: ${result.prompt_id}`);
            // UI updates like disabling button might happen based on WebSocket 'status'/'execution_start'
        }

    } catch (error) {
        // Handles errors during the `fetch` call itself (network, server unreachable)
        console.error("❌ Failed to send prompt request to server:", error);
        // Alert is handled within queuePrompt in api.js
        UIHelpers.updateProgress(0, 0); // Reset progress on network/fetch error
    }
}

/**
 * Handles messages received from the backend via WebSocket.
 * Parses message, updates UI based on message type (status, progress, executed).
 * @param {MessageEvent} event - The WebSocket message event.
 */
function handleSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        // console.log("WebSocket Message Received:", data.type, data.data); // Log type and data

        switch (data.type) {
            case 'status':
                // Handle status updates (e.g., queue position)
                console.log(`🔄 Status: ${data.data.status}`);
                break;

            case 'progress':
                // Update progress bar
                const { value, max } = data.data;
                UIHelpers.updateProgress(max, value);
                break;

            case 'executing':
                // Node execution started
                console.log(`▶️ Executing node: ${data.data.node}`);
                break;

            case 'executed':
                // Node execution completed
                console.log(`✅ Executed node: ${data.data.node}`);
                
                // Check if this is the output node (either txt2img or img2img)
                if ((data.data.node === TXT2IMG_NODE_IDS.SAVE_IMAGE || 
                     data.data.node === IMG2IMG_NODE_IDS.OUTPUT_NODE) && 
                    data.data.output?.images) {
                    
                    // Process the generated image
                    if (data.data.output.images && data.data.output.images.length > 0) {
                        const imageOutput = data.data.output.images[0];
                        // Pass filename, subfolder, and type separately
                        ImageManagement.updateImage(imageOutput.filename, imageOutput.subfolder, imageOutput.type);
                        console.log(`🖼️ Image updated from execution result: ${imageOutput.filename}`);
                    } else {
                         console.warn("Executed node returned an empty images array or no images property.");
                    }
                }
                break;

            case 'execution_error':
                // Handle execution errors
                console.error("❌ Execution error:", data.data);
                alert(`Error during execution: ${data.data.message || 'Unknown error'}`);
                UIHelpers.updateProgress(0, 0); // Reset progress on error
                break;

            case 'execution_cached':
                // Handle cached execution results
                console.log(`💾 Cached execution for node: ${data.data.node}`);
                break;

            default:
                // Log unknown message types
                console.log(`ℹ️ Unknown message type: ${data.type}`);
                break;
        }
    } catch (error) {
        console.error("🚨 Error processing WebSocket message:", error);
    }
}

/** Clears the prompt input UI and associated storage. */
function clearPromptAction() {
    PromptControlUI.clearPromptInput();
    PromptManagement.clearLastPromptStorage(); // Use dedicated function
    console.log("🧹 Prompt cleared.");
}

// ==========================================================================
// Application Start
// ==========================================================================

main(); // Execute the main function