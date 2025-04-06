let wakeLock = null;
let startTime = null;
let durationInterval = null;

const toggleButton = document.getElementById('toggleButton');
const statusText = document.getElementById('statusText');
const durationElement = document.getElementById('duration');
const browserSupportElement = document.getElementById('browserSupport');
const datetimeElement = document.getElementById('datetime');
const temperatureElement = document.getElementById('temperature');
const weatherDescElement = document.getElementById('weather-description');
const locationElement = document.getElementById('location');

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

// Update date and time
function updateDateTime() {
    const now = new Date();
    
    // Add more dramatic fade out and scale down effect
    datetimeElement.style.opacity = '0';
    datetimeElement.style.transform = 'scale(0.9) translateY(10px)';
    
    // Update with enhanced animations after a short delay
    setTimeout(() => {
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Split date and time for separate animations
        datetimeElement.innerHTML = `
            <div class="date-part">${dateStr}</div>
            <div class="time-part">${timeStr}</div>
        `;
        
        // Enhanced animation with bounce effect
        datetimeElement.style.opacity = '1';
        datetimeElement.style.transform = 'scale(1.05) translateY(0)';
        
        // Final settle animation
        setTimeout(() => {
            datetimeElement.style.transform = 'scale(1) translateY(0)';
        }, 150);
    }, 300);
}

// Update temperature animation with more visual appeal
function animateValue(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Enhanced easing function for smoother animation
        const easeOutBack = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
        const value = Math.floor(start + (end - start) * easeOutBack);
        
        // More dynamic scale and color effects during update
        const scale = 1 + (0.2 * Math.sin(progress * Math.PI));
        const hue = 30 + (200 * progress);
        element.style.transform = `scale(${scale})`;
        element.style.color = `hsl(${hue}, 80%, 50%)`;
        element.textContent = `${value}${suffix}`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Final state
            element.style.color = '';
            element.style.transform = '';
        }
    }
    
    requestAnimationFrame(update);
}

// Add CSS transitions for smooth animations
datetimeElement.style.transition = 'all 0.5s ease-in-out';
temperatureElement.style.transition = 'all 0.5s ease-in-out';

// Add initial transform scale
datetimeElement.style.transform = 'scale(1)';
temperatureElement.style.transform = 'scale(1)';

// Update weather information
function getWeatherIcon(weatherCode) {
    const icons = {
        '01': '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /><circle cx="12" cy="12" r="4" />',
        '02': '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /><circle cx="12" cy="12" r="4" /><path d="M3 20h18" stroke-dasharray="2 2" />',
        '03': '<path d="M3 15h18M3 20h18" stroke-dasharray="2 2" />',
        '04': '<path d="M3 15h18M3 20h18" />',
        '09': '<path d="M20 16.2A4.5 4.5 0 0017 8h-1.26A8 8 0 104 16.2" /><path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2" stroke-linecap="round" />',
        '10': '<path d="M20 16.2A4.5 4.5 0 0017 8h-1.26A8 8 0 104 16.2" /><path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2" stroke-linecap="round" />',
        '11': '<path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9" /><path d="M13 11l-4 6h6l-4 6" />',
        '13': '<path d="M11 19l2 2m-2-2l-2 2m2-2V5m0 14l2-2m-2 2l-2-2" /><path d="M20 16.2A4.5 4.5 0 0017 8h-1.26A8 8 0 104 16.2" />',
        '50': '<path d="M3 15h18M3 20h18M3 10h18" stroke-dasharray="1 3" />'
    };
    const code = weatherCode.toString().slice(0, 2);
    return icons[code] || icons['01'];
}

async function updateWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const apiKey = 'ff9258b34c24f0dec0094c90245df7e0';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        
        if (!response.ok) throw new Error('Weather data not available');
        
        const data = await response.json();
        
        // Update weather icon
        const weatherIconSvg = document.getElementById('weather-icon-svg');
        weatherIconSvg.innerHTML = getWeatherIcon(data.weather[0].id);
        
        // Animate temperature update
        const currentTemp = parseInt(temperatureElement.textContent) || 0;
        const newTemp = Math.round(data.main.temp);
        animateValue(temperatureElement, currentTemp, newTemp, 1000, '°C');
        
        // Update other weather information with fade effect
        weatherDescElement.style.opacity = '0';
        locationElement.style.opacity = '0';
        
        setTimeout(() => {
            weatherDescElement.textContent = data.weather[0].description;
            locationElement.textContent = data.name;
            weatherDescElement.style.opacity = '1';
            locationElement.style.opacity = '1';
        }, 300);
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherDescElement.textContent = 'Weather data unavailable';
    }
}

function animateValue(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Add easing function for smoother animation
        const easeOutQuad = progress * (2 - progress);
        const value = Math.floor(start + (end - start) * easeOutQuad);
        
        // Add fade and scale effect during update
        const opacity = progress < 0.5 ? 0.7 : 1;
        const scale = progress < 0.5 ? 0.95 : 1;
        element.style.opacity = opacity;
        element.style.transform = `scale(${scale})`;
        element.textContent = `${value}${suffix}`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Update date-time every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial update

// Update weather every 5 minutes
updateWeather();
setInterval(updateWeather, 300000);
