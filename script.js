// DOM Elements
const cat = document.getElementById('cat');
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const happinessBar = document.getElementById('happiness-bar');
const happinessText = document.getElementById('happiness-text');

// Load cat state
let catState = JSON.parse(localStorage.getItem('catState')) || {
    happiness: 50,
    lastFed: Date.now(),
    lastPlayed: Date.now()
};

// Current mood (for temporary states)
let currentMood = 'default';
let moodTimeout = null;

// Update cat sprite
function updateCatSprite() {
    // Force sad state if happiness ≤ 20%
    if (catState.happiness <= 20) {
        cat.src = 'assets/cat-sad.png';
        currentMood = 'sad';
        return;
    }

    // Otherwise use current mood
    switch (currentMood) {
        case 'playing':
            cat.src = 'assets/cat-play.png';
            break;
        case 'happy':
            cat.src = 'assets/cat-happy.png';
            break;
        default:
            cat.src = 'assets/cat.png';
    }
}

// Set temporary mood (with auto-revert)
function setTemporaryMood(mood, duration = 2000) {
    // Clear any existing timeout
    if (moodTimeout) clearTimeout(moodTimeout);
    
    // Only set if not in permanent sad state
    if (catState.happiness > 20) {
        currentMood = mood;
        updateCatSprite();
        
        // Revert after duration
        moodTimeout = setTimeout(() => {
            currentMood = 'default';
            updateCatSprite();
        }, duration);
    }
}

// Update happiness logic
function updateHappiness() {
    const now = Date.now();
    const hoursSinceFed = (now - catState.lastFed) / (1000 * 60 * 60);
    const hoursSincePlayed = (now - catState.lastPlayed) / (1000 * 60 * 60);

    if (hoursSinceFed > 4) catState.happiness -= (hoursSinceFed - 4) * 5;
    if (hoursSincePlayed > 8) catState.happiness -= (hoursSincePlayed - 8) * 2;
    
    catState.happiness = Math.max(0, Math.min(100, catState.happiness));
}

// Update UI
function updateUI() {
    updateHappiness();
    localStorage.setItem('catState', JSON.stringify(catState));

    happinessBar.style.width = `${catState.happiness}%`;
    happinessText.textContent = `${catState.happiness}%`;

    // Update happiness bar color
    if (catState.happiness > 70) {
        happinessBar.style.backgroundColor = '#a8e6cf';
    } else if (catState.happiness > 30) {
        happinessBar.style.backgroundColor = '#ffd3b6';
    } else {
        happinessBar.style.backgroundColor = '#ffaaa5';
    }

    // Force sad state if needed
    if (catState.happiness <= 20 && currentMood !== 'sad') {
        currentMood = 'sad';
        updateCatSprite();
    }
    // Exit sad state if happiness improves
    else if (catState.happiness > 20 && currentMood === 'sad') {
        currentMood = 'default';
        updateCatSprite();
    }
}

// Feed the cat
feedBtn.addEventListener('click', () => {
    catState.lastFed = Date.now();
    catState.happiness = Math.min(100, catState.happiness + 15);
    
    setTemporaryMood('happy');
    updateUI();
    
    // Jump animation
    cat.classList.add('jump');
    setTimeout(() => cat.classList.remove('jump'), 500);
});

// Play with the cat
playBtn.addEventListener('click', () => {
    catState.lastPlayed = Date.now();
    catState.happiness = Math.min(100, catState.happiness + 10);
    
    setTemporaryMood('playing');
    updateUI();
    
    // Jump animation
    cat.classList.add('jump');
    setTimeout(() => cat.classList.remove('jump'), 500);
});

// Initialize
updateUI();
setInterval(updateUI, 60000); // Update every minute