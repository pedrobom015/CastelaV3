// src/services/serverStatus.js

// The variable that holds the server's status.
// It starts as 'online' by default.
let serverStatus = false;

// A list of functions to notify when the state changes.
let statusListeners = [];

// Function to get the current status.
export const getServerStatus = () => serverStatus;

// Function to change the server status and notify all listeners.
export const setServerStatus = (newStatus) => {
	if (serverStatus !== newStatus) {
		serverStatus = newStatus;
		statusListeners.forEach((listener) => listener(serverStatus));
	}
};

// Function to subscribe and "listen" for state changes.
export const subscribeToServerStatus = (listener) => {
	statusListeners.push(listener);
	// Returns a cleanup function for React.
	return () => {
		statusListeners = statusListeners.filter((l) => l !== listener);
	};
};
