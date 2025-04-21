// web/js/app_init.js

/**
 * @fileoverview Handles initialization of the ComfyGen Studio application.
 * - Initializes UI Element caching.
 * - Initializes helper modules (Prompts, Images, Seed, Settings).
 * - Establishes WebSocket connection via the dedicated manager.
 * - Sets up event listeners for user interactions.
 * - Triggers loading of settings and prompts.
 */

// ==========================================================================
// Imports
// ==========================================================================

// Core Initialization & Managers
import { initializeUIElements } from './ui_elements.js'; // Step 1: Cache all elements
import * as WebSocketManager from './websocket_manager.js';
import * as SettingsManager from './settings_manager.js';
import * as PromptManagement from './prompt_management.js';
import * as ImageManagement from './image_management.js';
import * as SeedManagement from './seed_management.js';
import * as api from './api.js'; // Import api module for image upload

// UI Element Getters (for event listeners & passing to modules)
import * as UIElements from './ui_elements.js';

// UI Control Functions (for event listeners)
import * as PromptControlUI from './ui_prompt_controls.js';

// ==========================================================================
// Initialization Function
// ==========================================================================

/**
 * Main entry point for application initialization. Called by app.js.
 * Orchestrates the setup sequence.
 *
 * @param {function(string): Promise<void>} queuePromptFunc - Reference to app.js function.
 * @param {function(Event): void} handleSocketMessageFunc - Reference to app.js function.
 * @param {function(): void} clearPromptFunc - Reference to app.js function.
 */
export function initializeApp(queuePromptFunc, handleSocketMessageFunc, clearPromptFunc) {
    console.log("🚀 [App Init] Initializing ComfyGen Studio...");

    // 1. Initialize UI Element References (MUST be first)
    try {
        initializeUIElements();
        console.log("  ✅ [App Init] UI elements initialized.");
    } catch (error) {
        console.error("🚨 [App Init] CRITICAL: Failed to initialize UI elements.", error);
        alert("Fatal Error: Could not find essential UI elements. App cannot start.");
        return; // Stop initialization
    }

    // 2. Initialize Management Modules (passing necessary element getters/functions)
    try {
        // Prompt Management needs list elements and the input setter for reuse clicks
        PromptManagement.initializePromptManagement(
            UIElements.getRecentPromptsListElement(),
            UIElements.getFavoritePromptsListElement(),
            PromptControlUI.setPromptInputValue // Pass the setter function
        );
        // Image Management needs the image element
        ImageManagement.initializeImageDisplay(UIElements.getMainImageElement());
        // Seed Management needs its specific UI elements
        SeedManagement.initializeSeedUI(
            UIElements.getKeepSeedCheckboxElement(),
            UIElements.getSeedInputElement(),
            UIElements.getCurrentSeedDisplaySpanElement() // Pass the span element
        );
        // Settings Manager doesn't strictly need UI elements for init, but loadInitialSettings does
        console.log("  ✅ [App Init] Management modules initialized.");
    } catch (error) {
        console.error("🚨 [App Init] Error initializing management modules:", error);
        alert("Error: Failed to set up core management components.");
        // Decide if critical enough to stop
    }

    // 3. Establish WebSocket Connection (pass the handler from app.js)
    WebSocketManager.connect(handleSocketMessageFunc);
    // Logging/status handled within WebSocketManager

    // 4. Setup Event Listeners (pass necessary functions from app.js and managers)
    try {
        setupEventListeners(queuePromptFunc, clearPromptFunc);
        console.log("  ✅ [App Init] Event listeners attached.");
    } catch (error) {
        console.error("🚨 [App Init] Error setting up event listeners:", error);
        alert("Error: Failed to set up UI interactions.");
    }

    // 5. Load Initial Settings & State (after UI elements are ready)
    try {
        SettingsManager.loadInitialSettings(); // Uses SettingsManager logic now
        PromptManagement.loadPromptsFromStorage(); // Load and display prompts
        console.log("  ✅ [App Init] Initial settings and prompts loaded.");
    } catch (error) {
        console.error("⚠️ [App Init] Error loading settings or prompts:", error);
    }

    console.log("🎉 [App Init] ComfyGen Studio Initialization Complete");
}

// ==========================================================================
// Event Listener Setup
// ==========================================================================

/**
 * Attaches event listeners to interactive UI elements.
 * Connects actions to functions from app.js or management modules.
 *
 * @param {function(string): Promise<void>} queuePromptFunc - Function from app.js.
 * @param {function(): void} clearPromptFunc - Function from app.js.
 */
function setupEventListeners(queuePromptFunc, clearPromptFunc) {
    // --- Main Actions ---
    UIElements.getSendPromptButtonElement()?.addEventListener('click', () => {
        const promptText = PromptControlUI.getPromptInputValue();
        queuePromptFunc(promptText); // Call main generation function in app.js
    });
    UIElements.getClearPromptButtonElement()?.addEventListener('click', clearPromptFunc);

    // --- Image Navigation ---
    UIElements.getPrevImageButtonElement()?.addEventListener('click', ImageManagement.showPreviousImage);
    UIElements.getNextImageButtonElement()?.addEventListener('click', ImageManagement.showNextImage);

    // --- Prompt Input ---
    UIElements.getPromptElement()?.addEventListener('input', (e) => {
        SettingsManager.savePrompt(e.target.value); // Use SettingsManager to save
    });

    // --- Image Size Controls ---
    UIElements.getImageSizePresetElement()?.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        const widthInput = UIElements.getImageWidthInputElement();
        const heightInput = UIElements.getImageHeightInputElement();
        if (selectedValue && widthInput && heightInput) {
            const [width, height] = selectedValue.split('x').map(Number);
            PromptControlUI.updateImageDimensionInputs(width, height); // Update UI fields
            SettingsManager.saveDimensions(width, height); // Save using SettingsManager
        }
    });
    UIElements.getImageWidthInputElement()?.addEventListener('change', (e) => {
        const preset = UIElements.getImageSizePresetElement();
        if (preset) preset.value = ''; // Clear preset dropdown
        SettingsManager.saveDimensions(e.target.value, UIElements.getImageHeightInputElement()?.value);
    });
    UIElements.getImageHeightInputElement()?.addEventListener('change', (e) => {
        const preset = UIElements.getImageSizePresetElement();
        if (preset) preset.value = ''; // Clear preset dropdown
        SettingsManager.saveDimensions(UIElements.getImageWidthInputElement()?.value, e.target.value);
    });

    // --- Steps Control ---
    UIElements.getStepsInputElement()?.addEventListener('change', (e) => {
        SettingsManager.saveSteps(e.target.value);
    });

    // --- LoRA Control ---
    UIElements.getEnableLoraCheckboxElement()?.addEventListener('change', (e) => {
        SettingsManager.saveLoraPreference(e.target.checked); // Save boolean
    });

    // --- Seed Controls ---
    UIElements.getKeepSeedCheckboxElement()?.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        SettingsManager.saveKeepSeedPreference(isChecked); // Save checkbox state

        if (isChecked) {
            // If checked, display current internal seed and save it
            SeedManagement.updateSeedDisplay();
            SettingsManager.saveCurrentSeedValue(SeedManagement.getCurrentSeedValue());
            console.log(`🌱 Keep Seed ON. Saved seed ${SeedManagement.getCurrentSeedValue()}.`);
        } else {
            // If unchecked, remove the saved seed value from storage
            // SettingsManager.removeSavedSeedValue(); // Decide if you want this behavior
            console.log("🌱 Keep Seed OFF. Seed will randomize.");
            // Optionally clear input visually or set placeholder? SeedManagement handles display update
             SeedManagement.updateSeedDisplay(); // Ensure display reflects randomization possibility
        }
    });

    UIElements.getSeedInputElement()?.addEventListener('change', (e) => {
        // Update internal state first via SeedManagement
        const newSeed = SeedManagement.handleSeedInputChange(); // Returns the parsed seed or null

        // If "Keep Seed" is ON *and* input was valid, save this manually entered seed
        if (UIElements.getKeepSeedCheckboxElement()?.checked && newSeed !== null) {
            SettingsManager.saveCurrentSeedValue(newSeed);
            console.log(`🌱 Manual seed entered (${newSeed}) and saved (Keep Seed ON).`);
        } else if (newSeed !== null){
             console.log(`🌱 Manual seed entered (${newSeed}), but not saved (Keep Seed OFF).`);
        }
    });

    // --- Img2Img Controls ---
    // Mode selection radio buttons
    const txt2imgRadio = UIElements.getModeTxt2imgRadioElement();
    const img2imgRadio = UIElements.getModeImg2imgRadioElement();
    const img2imgControls = UIElements.getImg2imgControlsElement();
    
    if (txt2imgRadio && img2imgRadio && img2imgControls) {
        // Function to update UI based on selected mode
        const updateModeUI = () => {
            const selectedMode = document.querySelector('input[name="generation-mode"]:checked').value;
            img2imgControls.style.display = selectedMode === 'img2img' ? 'block' : 'none';
            SettingsManager.saveGenerationMode(selectedMode);
            console.log(`🔄 Generation mode changed to: ${selectedMode}`);
        };
        
        // Add listeners to both radio buttons
        txt2imgRadio.addEventListener('change', updateModeUI);
        img2imgRadio.addEventListener('change', updateModeUI);
    }
    
    // Image upload input
    const imageUploadInput = UIElements.getImageUploadInputElement();
    const uploadedFilenameSpan = UIElements.getUploadedFilenameSpanElement();
    
    if (imageUploadInput && uploadedFilenameSpan) {
        imageUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                // Show loading state
                uploadedFilenameSpan.textContent = 'Uploading...';
                
                // Upload the image
                const result = await api.uploadImage(file);
                
                // Store the filename for use in img2img generation
                window.uploadedImageFilename = result.name;
                
                // Update the UI
                uploadedFilenameSpan.textContent = `Uploaded: ${result.name}`;
                console.log(`🖼️ Image uploaded successfully: ${result.name}`);
            } catch (error) {
                uploadedFilenameSpan.textContent = 'Upload failed';
                console.error('Failed to upload image:', error);
            }
        });
    }
    
    // Denoise strength input
    const denoiseStrengthInput = UIElements.getDenoiseStrengthElement();
    if (denoiseStrengthInput) {
        denoiseStrengthInput.addEventListener('change', (e) => {
            SettingsManager.saveDenoiseStrength(e.target.value);
        });
    }
}