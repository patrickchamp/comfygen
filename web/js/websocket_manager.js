// web/js/websocket_manager.js
import { clientId } from './api.js'; // Get client ID from api.js

let socket = null;
const serverAddress = `${window.location.hostname}:${window.location.port}`;
const socketUrl = `ws://${serverAddress}/ws?clientId=${clientId}`;
let reconnectTimeoutId = null;
const RECONNECT_DELAY = 2000;
let messageHandler = null; // Store the handler passed during connection
let isConnected = false; // Track connection state

function connectInternal() {
    // Prevent multiple concurrent connection attempts
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        console.log("🔌 [WebSocket Manager] Connection attempt skipped: Already connected or connecting.");
        return;
    }
    // Clear any pending reconnection attempts
    if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }

    console.log(`🔌 [WebSocket Manager] Attempting to connect to: ${socketUrl}`);
    isConnected = false; // Mark as disconnected until 'open' event
    try {
        socket = new WebSocket(socketUrl);
    } catch (error) {
        console.error('🔌❌ [WebSocket Manager] WebSocket constructor failed:', error);
        scheduleReconnect(); // Schedule a retry if constructor itself fails
        return;
    }


    socket.addEventListener('open', () => {
        console.log('✅ [WebSocket Manager] Connected.');
        isConnected = true;
        // Reset reconnection delay logic if needed (e.g., exponential backoff reset)
    });

    socket.addEventListener('message', (event) => {
        if (messageHandler) {
            try {
                 messageHandler(event); // Call the handler from app.js
            } catch (err) {
                console.error("🔌❌ [WebSocket Manager] Error in message handler:", err);
                console.error("   Message data:", event.data);
            }

        } else {
            console.warn("🔌 [WebSocket Manager] Received message but no handler is set.");
        }
    });

    socket.addEventListener('close', (event) => {
        console.warn(`🔌❌ [WebSocket Manager] Connection closed. Code: ${event.code}, Reason: "${event.reason || 'No reason provided'}"`);
        isConnected = false;
        socket = null; // Clear the instance
        // Only schedule reconnect if the close was unexpected or we intend to retry
        if (event.code !== 1000) { // 1000 = Normal Closure
             scheduleReconnect();
        } else {
            console.log("🔌 [WebSocket Manager] Normal WebSocket closure (code 1000). No automatic reconnect scheduled.")
        }

    });

    socket.addEventListener('error', (error) => {
        console.error('🔌❌ [WebSocket Manager] Error:', error);
        isConnected = false;
        // The 'close' event will likely fire after an error, triggering reconnect logic there.
        // Force close if it's somehow stuck without closing:
        if (socket && socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
            console.log("🔌 [WebSocket Manager] Forcing close after error to trigger close handler.");
            socket.close();
        }
        socket = null; // Ensure socket ref is cleared
    });
}

function scheduleReconnect() {
    // Avoid scheduling multiple reconnects
    if (!reconnectTimeoutId) {
        console.log(`🔌 [WebSocket Manager] Scheduling reconnect in ${RECONNECT_DELAY}ms...`);
        reconnectTimeoutId = setTimeout(() => {
            console.log("🔌 [WebSocket Manager] Attempting to reconnect now...");
            reconnectTimeoutId = null; // Clear the ID before the attempt
            connectInternal(); // Retry connection
        }, RECONNECT_DELAY);
    } else {
         console.log("🔌 [WebSocket Manager] Reconnect attempt already scheduled.");
    }
}

function handleVisibilityChange() {
    if (!document.hidden) {
        console.log("💡 [WebSocket Manager] Page became visible.");
        // Only attempt reconnect if we know we are not connected and not already trying
        if (!isConnected && (!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING))) {
            console.log("🔌 [WebSocket Manager] Page visible and socket not connected/connecting. Triggering reconnect check.");
            if (reconnectTimeoutId) {
                clearTimeout(reconnectTimeoutId);
                reconnectTimeoutId = null;
            }
            // Ensure any potentially broken socket instance is fully closed before reconnecting
            if (socket && socket.readyState !== WebSocket.CLOSED) {
                console.log("🔌 [WebSocket Manager] Closing potentially broken socket before visibility reconnect...");
                socket.close(); // Let the 'close' handler manage the reconnect attempt if needed
            } else {
                // If socket is null or already closed, initiate connection directly
                 connectInternal();
            }
        } else if (isConnected) {
             console.log("🔌 [WebSocket Manager] Page visible, socket appears to be connected.");
        }
    } else {
        console.log("💡 [WebSocket Manager] Page became hidden.");
    }
}

/**
 * Initializes the WebSocket connection and sets the message handler.
 * @param {function(Event): void} handler - The function to call when a message is received.
 */
export function connect(handler) {
    if (typeof handler !== 'function') {
        console.error("🚨 [WebSocket Manager] Invalid message handler provided during connect call.");
        messageHandler = null; // Ensure no invalid handler is stored
        return;
    }
    console.log("🔌 [WebSocket Manager] Setting message handler.");
    messageHandler = handler;

    // Start the connection process if not already connected/connecting
    if (!socket && !reconnectTimeoutId) {
         connectInternal();
    } else {
        console.log("🔌 [WebSocket Manager] Connection already in progress or established.");
    }


    // Set up visibility listener only once (remove previous to be safe)
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Checks if the WebSocket is currently connected.
 * @returns {boolean} True if the socket exists and its readyState is OPEN.
 */
export function isWebSocketConnected() {
    return isConnected && socket && socket.readyState === WebSocket.OPEN;
}

// Optional: Add a function to manually close the connection if needed
export function disconnect() {
    if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }
    if (socket) {
        console.log("🔌 [WebSocket Manager] Manually closing connection.");
        socket.close(1000, "Manual disconnect"); // Use normal closure code
    }
    isConnected = false;
    socket = null;
    messageHandler = null;
}