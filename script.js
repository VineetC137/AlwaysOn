let wakeLock = null;
let startTime = null;
let durationInterval = null;

const toggleButton = document.getElementById('toggleButton');
const statusText = document.getElementById('statusText');
const durationElement = document.getElementById('duration');
const browserSupportElement = document.getElementById('browserSupport');

// Check if Wake Lock API is supported
if ('wakeLock' in navigator) {
    browserSupportElement.textContent = 'Wake Lock is supported in your browser.';
} else {
    browserSupportElement.textContent = 'Wake Lock is not supported in your browser.';
    toggleButton.disabled = true;
}

// Function to request wake lock
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        toggleButton.textContent = 'Stop';
        toggleButton.classList.add('active');
        statusText.textContent = 'Your screen will stay awake.';
        startTime = Date.now();
        updateDuration();
        
        wakeLock.addEventListener('release', () => {
            handleWakeLockRelease();
        });
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
        statusText.textContent = 'Failed to keep screen awake. Please try again.';
    }
}

// Function to release wake lock
function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// Function to handle wake lock release
function handleWakeLockRelease() {
    wakeLock = null;
    toggleButton.textContent = 'Start';
    toggleButton.classList.remove('active');
    statusText.textContent = 'Your screen may sleep now.';
    startTime = null;
    if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
    }
    durationElement.textContent = '';
}

// Function to update duration display
function updateDuration() {
    if (durationInterval) {
        clearInterval(durationInterval);
    }
    
    durationInterval = setInterval(() => {
        if (startTime) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const seconds = duration % 60;
            
            durationElement.textContent = `Active for: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Handle button click
toggleButton.addEventListener('click', async () => {
    if (!wakeLock) {
        await requestWakeLock();
    } else {
        releaseWakeLock();
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});