// web/js/utils.js

/**
 * @fileoverview Provides utility functions potentially used across the application.
 * Currently includes a function to generate Version 4 UUIDs.
 */

// ==========================================================================
// UUID Generation
// ==========================================================================

/**
 * Generates a Version 4 (random) UUID string.
 * Uses `crypto.getRandomValues` for cryptographic randomness, which is preferred over `Math.random`.
 * Format: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" where 'x' is random hex and 'y' is 8, 9, A, or B.
 *
 * @returns {string} A randomly generated Version 4 UUID.
 */
export function uuidv4() {
    // Check if crypto API is available (should be in modern browsers/secure contexts)
    if (!crypto || !crypto.getRandomValues) {
        console.error("🚨 [Utils] `crypto.getRandomValues` not available. Falling back to less secure Math.random() for UUID.");
        // Fallback using Math.random (less secure, avoid if possible)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Standard implementation using crypto API
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        // Explanation:
        // c => Number(c) gives the digit (0, 1, 8)
        // crypto.getRandomValues(new Uint8Array(1))[0] gets a random byte (0-255)
        // & 15 >> c / 4 applies bitmasking based on the position character 'c' to ensure UUID format compliance
        // (c ^ ...) XORs the original character's numeric value with the masked random bits
        // .toString(16) converts the result to a hexadecimal character
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// Add other utility functions here if needed, e.g.:
// export function debounce(func, wait) { ... }
// export function throttle(func, limit) { ... }