// Favoriten aus dem localStorage laden oder initialisieren
let favorites = JSON.parse(localStorage.getItem("favorites")) || [
    { name: "Liorith auf Github", url: "https://github.com/liorith" },
    { name: "Navium auf Github", url: "https://github.com/liorith/navium" },
    { name: "Ich auf Github", url: "https://github.com/jonatanktk" }
];

// Theme-Einstellungen aus dem localStorage laden oder initialisieren
let themeSettings = JSON.parse(localStorage.getItem("themeSettings")) || {
    theme: "dark",
    primaryColor: "#8000ff",
    backgroundEffect: false
};

// Menüpunkte und ihre Sichtbarkeit
let menuItems = JSON.parse(localStorage.getItem("menuItems")) || [
    { id: 'edit-favorites', name: 'Favoriten bearbeiten', visible: true },
    { id: 'edit-theme', name: 'Theme bearbeiten', visible: true }
];

// DOM-Elemente
const favoritesGrid = document.getElementById("favorites-grid");
const favoritesPopup = document.getElementById("favorites-popup");
const themePopup = document.getElementById("theme-popup");
const favoritesList = document.getElementById("favorites-list");
const addFavoriteButton = document.getElementById("add-favorite");
const saveFavoritesButton = document.getElementById("save-favorites");
const saveThemeButton = document.getElementById("save-theme");
const themeButtons = document.querySelectorAll(".theme-button");
const primaryColorInput = document.getElementById("primary-color");
const backgroundEffectCheckbox = document.getElementById("background-effect");
const editFavoritesButton = document.getElementById('edit-favorites-button');
const editThemeButton = document.getElementById('edit-theme-button');
const closeButtons = document.querySelectorAll('.close-button');
const quickAccessButtons = document.getElementById('quick-access-buttons'); // Quick-Access-Buttons

// Color Picker Variables
const colorField = document.getElementById('color-field');
const hueSlider = document.getElementById('hue-slider');
const redInput = document.getElementById('red-input');
const greenInput = document.getElementById('green-input');
const blueInput = document.getElementById('blue-input');
const hexInput = document.getElementById('hex-input');
const colorDisplay = document.getElementById('color-display');
const saturationValueIndicator = document.createElement('div');
saturationValueIndicator.id = 'saturation-value-indicator';
colorField.appendChild(saturationValueIndicator);

let hue = 0;
let saturation = 1;
let value = 1;
let isMouseDown = false;

// Fokus auf Suchfeld setzen
document.getElementById("search-bar").focus();

// Theme anwenden
function applyTheme() {
    document.documentElement.setAttribute("data-theme", themeSettings.theme);
    document.documentElement.style.setProperty("--primary-color", themeSettings.primaryColor);
    document.documentElement.style.setProperty("--primary-color-light", lightenColor(themeSettings.primaryColor, 20));

    if (themeSettings.backgroundEffect) {
        document.body.style.backgroundColor = `color-mix(in srgb, ${themeSettings.primaryColor} 10%, ${themeSettings.theme === "light" ? "#ffffff" : "#111111"})`;
        document.querySelectorAll(".favorite-item, .popup-content").forEach(element => {
            element.style.backgroundColor = `color-mix(in srgb, ${themeSettings.primaryColor} 10%, ${themeSettings.theme === "light" ? "#ffffff" : "#1a1a1a"})`;
        });
    } else {
        document.body.style.backgroundColor = themeSettings.theme === "light" ? "#ffffff" : "#111111";
        document.querySelectorAll(".favorite-item, .popup-content").forEach(element => {
            element.style.backgroundColor = themeSettings.theme === "light" ? "#ffffff" : "#1a1a1a";
        });
    }
}

// Farbe aufhellen
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
}

// Theme speichern
function saveTheme() {
    localStorage.setItem("themeSettings", JSON.stringify(themeSettings));
    applyTheme();
}

// Theme-Einstellungen laden
function loadTheme() {
    themeSettings = JSON.parse(localStorage.getItem("themeSettings")) || {
        theme: "light",
        primaryColor: "#1a73e8",
        backgroundEffect: false
    };
    applyTheme();
}

// Favoriten im Grid anzeigen
function renderFavorites() {
    favoritesGrid.innerHTML = "";
    favorites.forEach((favorite) => {
        const favoriteItem = document.createElement("a");
        favoriteItem.href = favorite.url;
        favoriteItem.target = "_blank";
        favoriteItem.className = "favorite-item";
        
        const img = document.createElement("img");
        img.alt = favorite.name;
        
        const hostname = new URL(favorite.url).hostname;
        const faviconkitUrl = `https://api.faviconkit.com/${hostname}/1282`;
        
        img.src = faviconkitUrl;
        img.onerror = function() {
            // Wenn Faviconkit fehlschlägt, versuchen wir das Favicon direkt von der Seite zu laden
            this.onerror = null;
            this.src = `${favorite.url}/favicon.ico`;
            this.onerror = function() {
                // Wenn auch das fehlschlägt, verwenden wir ein Standard-Favicon
                this.onerror = null;
                this.src = 'default-favicon.png';
            };
        };
        
        const span = document.createElement("span");
        span.textContent = favorite.name;
        
        favoriteItem.appendChild(img);
        favoriteItem.appendChild(span);
        favoritesGrid.appendChild(favoriteItem);
    });
}

// Favoritenliste im Popup anzeigen
function renderFavoritesList() {
    favoritesList.innerHTML = "";
    favorites.forEach((favorite, index) => {
        const favoriteEditItem = document.createElement("div");
        favoriteEditItem.className = "favorite-edit-item";
        favoriteEditItem.innerHTML = `
            <input type="text" value="${favorite.name}" data-index="${index}" data-type="name">
            <input type="text" value="${favorite.url}" data-index="${index}" data-type="url">
            <button class="remove-button" onclick="removeFavorite(${index})">🗑️</button>
        `;
        favoritesList.appendChild(favoriteEditItem);
    });

    document.querySelectorAll(".favorite-edit-item input").forEach(input => {
        input.addEventListener("change", (e) => {
            const index = e.target.dataset.index;
            const type = e.target.dataset.type;
            favorites[index][type] = e.target.value;
            saveFavorites();
            renderFavorites();
        });
    });
}

// Neuen Favoriten hinzufügen
addFavoriteButton.addEventListener("click", () => {
    favorites.push({ name: "Neuer Favorit", url: "https://" });
    saveFavorites();
    renderFavoritesList();
});

// Favorit entfernen
window.removeFavorite = (index) => {
    favorites.splice(index, 1);
    saveFavorites();
    renderFavoritesList();
    renderFavorites();
};

// Favoriten im localStorage speichern
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Popup öffnen
function openPopup(popup) {
    popup.style.display = 'flex';
}

// Popup schließen
function closePopup(popup) {
    popup.style.display = 'none';
}

   // Event-Listener für Popup-Öffnen-Buttons (im Header)
editFavoritesButton.addEventListener('click', () => {
    openPopup(favoritesPopup);
    renderFavoritesList();
});

editThemeButton.addEventListener('click', () => {
    openPopup(themePopup);
    primaryColorInput.value = themeSettings.primaryColor;
    backgroundEffectCheckbox.checked = themeSettings.backgroundEffect;
});

// Event-Listener für Schließen-Buttons
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const popup = button.closest('.popup-overlay');
        closePopup(popup);
    });
});

// Favoriten speichern
saveFavoritesButton.addEventListener('click', () => {
    saveFavorites();
    renderFavorites();
    closePopup(favoritesPopup);
});

// Theme speichern
saveThemeButton.addEventListener('click', () => {
    saveTheme();
    closePopup(themePopup);
});

// Theme ändern
themeButtons.forEach(button => {
    button.addEventListener("click", () => {
        themeSettings.theme = button.dataset.theme;
        saveTheme();
        themeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    });
});

// Primärfarbe ändern
primaryColorInput.addEventListener("change", (e) => {
    themeSettings.primaryColor = e.target.value;
    saveTheme();
});

// Hintergrund-Effekt aktivieren/deaktivieren
backgroundEffectCheckbox.addEventListener("change", (e) => {
    themeSettings.backgroundEffect = e.target.checked;
    saveTheme();
});

// Color Conversion Functions
function hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

function rgbToHex(r, g, b) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function drawColorField() {
    const ctx = colorField.getContext('2d');
    ctx.clearRect(0, 0, colorField.width, colorField.height);

    // Create gradient for saturation
    const saturationGradient = ctx.createLinearGradient(0, 0, colorField.width, 0);
    saturationGradient.addColorStop(0, 'white');
    saturationGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, colorField.width, colorField.height);

    // Create gradient for value (brightness)
    const valueGradient = ctx.createLinearGradient(0, 0, 0, colorField.height);
    valueGradient.addColorStop(0, 'transparent');
    valueGradient.addColorStop(1, 'black');
    ctx.fillStyle = valueGradient;
    ctx.fillRect(0, 0, colorField.width, colorField.height);
}

function updateIndicatorPosition() {
    const x = saturation * colorField.width;
    const y = (1 - value) * colorField.height;
    saturationValueIndicator.style.left = `${x}px`;
    saturationValueIndicator.style.top = `${y}px`;
}

function updateColor() {
    const [r, g, b] = hsvToRgb(hue / 360, saturation, value);
    
    // Update inputs
    redInput.value = r;
    greenInput.value = g;
    blueInput.value = b;
    hexInput.value = rgbToHex(r, g, b);
    
    // Update color display
    colorDisplay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    
    // Update theme settings
    themeSettings.primaryColor = hexInput.value;
    saveTheme();
}

function updateSaturationValue(e) {
    if (!isMouseDown) return;

    const rect = colorField.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    saturation = Math.max(0, Math.min(1, x / colorField.width));
    value = Math.max(0, Math.min(1, 1 - y / colorField.height));

    updateIndicatorPosition();
    updateColor();
}

// Event Listeners for Color Picker
colorField.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    updateSaturationValue(e);
});

document.addEventListener('mousemove', updateSaturationValue);
document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

hueSlider.addEventListener('input', () => {
    hue = parseInt(hueSlider.value);
    drawColorField();
    updateColor();
});

// RGB Input Event Listeners
[redInput, greenInput, blueInput].forEach(input => {
    input.addEventListener('change', () => {
        const r = parseInt(redInput.value);
        const g = parseInt(greenInput.value);
        const b = parseInt(blueInput.value);
        
        hexInput.value = rgbToHex(r, g, b);
        colorDisplay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        
        // Convert RGB to HSV
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const delta = max - min;

        let h = 0, s = 0, v = max;

        if (delta !== 0) {
            s = delta / max;
            const deltaR = (((max - r / 255) / 6) + (delta / 2)) / delta;
            const deltaG = (((max - g / 255) / 6) + (delta / 2)) / delta;
            const deltaB = (((max - b / 255) / 6) + (delta / 2)) / delta;

            if (r / 255 === max) h = deltaB - deltaG;
            else if (g / 255 === max) h = (1 / 3) + deltaR - deltaB;
            else if (b / 255 === max) h = (2 / 3) + deltaG - deltaR;

            if (h < 0) h += 1;
            if (h > 1) h -= 1;
        }

        hue = Math.round(h * 360);
        saturation = s;
        value = v;

        hueSlider.value = hue;
        drawColorField();
        updateIndicatorPosition();
        
        themeSettings.primaryColor = hexInput.value;
        saveTheme();
    });
});

hexInput.addEventListener('change', () => {
    const rgb = hexToRgb(hexInput.value);
    if (rgb) {
        redInput.value = rgb[0];
        greenInput.value = rgb[1];
        blueInput.value = rgb[2];
        colorDisplay.style.backgroundColor = hexInput.value;
        
        themeSettings.primaryColor = hexInput.value;
        saveTheme();
    }
});

// Initialize Color Picker
function initColorPicker() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    colorField.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    colorField.getContext = () => ctx;
    colorField.width = 200;
    colorField.height = 200;
    
    drawColorField();
    updateIndicatorPosition();
}

// YouTube IFrame API laden
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var isPlaying = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '4TV_128Fz2g', // Ersetzen Sie dies durch die ID Ihres gewünschten Videos
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    var videoButton = document.getElementById('video-button');
    videoButton.addEventListener('click', function() {
        if (isPlaying) {
            player.pauseVideo();
            videoButton.textContent = 'Easteregg Wiedergeben';
            isPlaying = false;
        } else {
            player.playVideo();
            videoButton.textContent = 'Easteregg Stoppen';
            isPlaying = true;
        }
    });
}

// Initialisierung
loadTheme();
renderFavorites();
initColorPicker();
