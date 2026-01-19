// ============================================================================
// GLOBAL STATE
// ============================================================================
let locations = [];
let map = null;
let markersLayer = null;
let routeLayer = null;
let currentRouteType = 'inter-city'; // 'inter-city' or 'intra-city'
let realRoadsAvailable = false;

// ============================================================================
// MAP INITIALIZATION
// ============================================================================
function initMap() {
    map = L.map('map').setView([-23.5505, -46.6333], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);

    // Invalidate map size on window resize to handle dynamic height
    window.addEventListener('resize', () => {
        setTimeout(() => map.invalidateSize(), 100);
    });

    // Initial invalidation after CSS loads
    setTimeout(() => map.invalidateSize(), 200);
}

// ============================================================================
// REAL ROADS API STATUS
// ============================================================================

async function checkRealRoadsStatus() {
    try {
        const response = await fetch('/api/routing-status');
        const data = await response.json();

        realRoadsAvailable = data.real_roads_available;

        const checkbox = document.getElementById('use-real-roads');
        const statusIndicator = document.getElementById('real-roads-status');
        const apiKeySection = document.getElementById('api-key-section');

        if (checkbox) {
            checkbox.disabled = !realRoadsAvailable;
            if (!realRoadsAvailable) {
                checkbox.checked = false;
            }
        }

        if (statusIndicator) {
            if (realRoadsAvailable) {
                statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i> API Connected';
                statusIndicator.className = 'status-indicator status-connected';
            } else {
                statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i> API Not Configured';
                statusIndicator.className = 'status-indicator status-disconnected';
            }
        }

        if (apiKeySection) {
            apiKeySection.style.display = realRoadsAvailable ? 'none' : 'block';
        }


    } catch (error) {
        console.error('Error checking routing status:', error);
        realRoadsAvailable = false;
    }
}

async function setApiKey() {
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKey = apiKeyInput?.value?.trim();

    if (!apiKey || apiKey.length < 10) {
        showNotification('error', 'Please enter a valid API key');
        return;
    }

    try {
        const response = await fetch('/api/set-api-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('success', 'API key configured successfully!');
            apiKeyInput.value = '';
            await checkRealRoadsStatus();
        } else {
            showNotification('error', data.error || 'Failed to set API key');
        }
    } catch (error) {
        console.error('Error setting API key:', error);
        showNotification('error', 'Failed to configure API key');
    }
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

function toggleRouteTypeUI() {
    const routeType = document.getElementById('route-type').value;
    currentRouteType = routeType;

    const intraCityConfig = document.getElementById('intra-city-config');
    const interCityConfig = document.getElementById('inter-city-config');

    if (routeType === 'intra-city') {
        intraCityConfig.style.display = 'block';
        interCityConfig.style.display = 'none';
    } else {
        intraCityConfig.style.display = 'none';
        interCityConfig.style.display = 'block';
    }

    // Clear loaded points when switching modes
    clearPoints();
    updateUI();
}

function updatePointsLimitIntraCity() {
    const algorithm = document.getElementById('algorithm').value;
    const numPointsSelect = document.getElementById('num-delivery-points');
    const pointsInfo = document.getElementById('points-info');

    // Limitar opções baseadas no algoritmo
    if (algorithm === 'quantum') {
        // Quantum: apenas 1-3 pontos permitidos
        numPointsSelect.innerHTML = `
            <option value="1">1 point</option>
            <option value="2">2 points</option>
            <option value="3" selected>3 points</option>
        `;
        pointsInfo.textContent = 'Quantum limited to 3 points (total 4 with hub)';
        pointsInfo.classList.add('warning');
    } else {
        // Classical: 1-9 pontos permitidos
        numPointsSelect.innerHTML = `
            <option value="1">1 point</option>
            <option value="2">2 points</option>
            <option value="3" selected>3 points</option>
            <option value="4">4 points</option>
            <option value="5">5 points</option>
            <option value="6">6 points</option>
            <option value="7">7 points</option>
            <option value="8">8 points</option>
            <option value="9">9 points</option>
        `;
        pointsInfo.textContent = 'Random neighborhoods (excluding hub)';
        pointsInfo.classList.remove('warning');
    }
}

function updatePointsLimitInterCity() {
    const algorithm = document.getElementById('algorithm-inter').value;
    const numPointsSelect = document.getElementById('num-additional-points');
    const numAdditionalInfo = document.getElementById('num-additional-info');

    // Limitar opções baseadas no algoritmo
    if (algorithm === 'quantum') {
        // Quantum: apenas 1-3 cidades adicionais permitidas
        numPointsSelect.innerHTML = `
            <option value="1">1 city</option>
            <option value="2">2 cities</option>
            <option value="3" selected>3 cities</option>
        `;
        numAdditionalInfo.textContent = 'Quantum limited to 3 cities (total 4 with depot)';
        numAdditionalInfo.classList.add('warning');
    } else {
        // Classical: 1-9 cidades permitidas
        numPointsSelect.innerHTML = `
            <option value="1">1 city</option>
            <option value="2">2 cities</option>
            <option value="3" selected>3 cities</option>
            <option value="4">4 cities</option>
            <option value="5">5 cities</option>
            <option value="6">6 cities</option>
            <option value="7">7 cities</option>
            <option value="8">8 cities</option>
            <option value="9">9 cities (all others)</option>
        `;
        numAdditionalInfo.textContent = 'Random cities from other capitals';
        numAdditionalInfo.classList.remove('warning');
    }
}

function updateUI() {
    const numPoints = locations.length;

    // Determinar qual algoritmo está ativo baseado no modo
    let algorithm;
    if (currentRouteType === 'intra-city') {
        algorithm = document.getElementById('algorithm').value;
    } else {
        algorithm = document.getElementById('algorithm-inter').value;
    }

    // Update points count
    document.getElementById('total-points').textContent = numPoints;

    // Update points list
    const pointsList = document.getElementById('points-list');
    if (numPoints === 0) {
        pointsList.innerHTML = '<p class="empty-state">No points added yet</p>';
    } else {
        pointsList.innerHTML = locations.map((loc, idx) =>
            `<div class="point-item">${idx + 1}. ${loc.name}${idx === 0 ? ' (Hub)' : ''}</div>`
        ).join('');
    }

    // Show/hide Clear Points button based on whether points are loaded
    const clearBtn = document.getElementById('clear-points');
    if (clearBtn) {
        clearBtn.style.display = numPoints > 0 ? 'flex' : 'none';
    }

    // Update validation message
    const validationMsg = document.getElementById('validation-message');
    const calculateBtn = document.getElementById('calculate-route');

    validationMsg.className = 'validation-message';
    validationMsg.style.display = 'block';

    if (numPoints === 0) {
        validationMsg.textContent = 'Load points first';
        validationMsg.classList.add('warning');
        calculateBtn.disabled = true;
    } else if (numPoints < 2) {
        validationMsg.textContent = 'Need at least 2 points to calculate';
        validationMsg.classList.add('warning');
        calculateBtn.disabled = true;
    } else if (algorithm === 'quantum' && numPoints > 4) {
        validationMsg.textContent = 'Quantum mode: maximum 4 points (RAM memory limit)';
        validationMsg.classList.add('error');
        calculateBtn.disabled = true;
    } else {
        validationMsg.style.display = 'none';
        calculateBtn.disabled = false;
    }
}

// ============================================================================
// MAP RENDERING
// ============================================================================

function renderMarkers() {
    markersLayer.clearLayers();

    locations.forEach((loc, idx) => {
        const displayNumber = idx + 1; // 1-based numbering
        const isHub = idx === 0;
        const markerIcon = L.divIcon({
            className: isHub ? 'custom-marker hub-marker' : 'custom-marker',
            html: `<div style="background-color: ${isHub ? '#FF0055' : '#6929C4'}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${displayNumber}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([loc.lat, loc.lon], { icon: markerIcon });
        marker.bindPopup(`<b>${displayNumber}. ${loc.name}</b>${isHub ? ' (Hub)' : ''}<br>Lat: ${loc.lat.toFixed(4)}<br>Lon: ${loc.lon.toFixed(4)}`);
        markersLayer.addLayer(marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// ============================================================================
// DATA LOADING FUNCTIONS
// ============================================================================

// Load São Paulo Test Data (Inter-City mode)
async function loadTestData() {
    try {
        const response = await fetch('/api/test-data');
        const data = await response.json();

        locations = data.locations;
        renderMarkers();
        updateUI();

        showNotification('success', `${locations.length} points loaded!`);
    } catch (error) {
        console.error('Error loading test data:', error);
        showNotification('error', 'Failed to load test data');
    }
}

// Load Brazil Capitals (Inter-City mode - depot + random additional)
async function loadBrazilCapitals() {
    try {
        const response = await fetch('/api/brazil-capitals');
        const data = await response.json();

        const allCapitals = data.locations;
        const depotIndex = parseInt(document.getElementById('depot-capital').value);
        const numAdditional = parseInt(document.getElementById('num-additional-points').value);

        // Get depot city
        const depot = allCapitals[depotIndex];

        // Get other capitals (excluding depot)
        const otherCapitals = allCapitals.filter((_, idx) => idx !== depotIndex);

        // Shuffle and select random additional points
        const shuffled = otherCapitals.sort(() => 0.5 - Math.random());
        const additionalPoints = shuffled.slice(0, numAdditional);

        // Combine: depot first + random additional points
        locations = [depot, ...additionalPoints];

        // Re-index all locations
        locations = locations.map((loc, idx) => ({
            ...loc,
            id: idx
        }));

        renderMarkers();
        updateUI();

        const totalPoints = locations.length;
        const algorithm = document.getElementById('algorithm-inter').value;

        if (algorithm === 'quantum' && totalPoints > 4) {
            showNotification('warning', `${totalPoints} points loaded (depot + ${numAdditional}). Switch to Classical!`);
        } else {
            showNotification('success', `Route loaded: ${depot.name} + ${numAdditional} random cities`);
        }
    } catch (error) {
        console.error('Error loading Brazil capitals:', error);
        showNotification('error', 'Failed to load Brazil capitals');
    }
}

// Generate Intra-City Route (Hub + Random Neighborhoods)
async function generateIntraCityRoute() {
    try {
        const cityKey = document.getElementById('city-selection').value;
        const algorithm = document.getElementById('algorithm').value;
        const numPoints = parseInt(document.getElementById('num-delivery-points').value);

        const response = await fetch('/api/generate-route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                city_key: cityKey,
                algorithm: algorithm,
                num_points: numPoints
            })
        });

        const data = await response.json();

        if (!data.success) {
            showNotification('error', data.error || 'Failed to generate route');
            return;
        }

        locations = data.locations;
        renderMarkers();
        updateUI();

        showNotification('success', `Route generated: ${data.city_name} (Hub + ${numPoints} random points)`);

    } catch (error) {
        console.error('Error generating intra-city route:', error);
        showNotification('error', 'Failed to generate route');
    }
}

// Clear all points
function clearPoints() {
    locations = [];
    markersLayer.clearLayers();
    routeLayer.clearLayers();
    updateUI();
    clearResults();
    showNotification('info', 'All points cleared');
}

// ============================================================================
// ROUTE CALCULATION
// ============================================================================

async function calculateRoute() {
    if (locations.length < 2) {
        showNotification('warning', 'Need at least 2 points to calculate');
        return;
    }

    // Determinar qual algoritmo usar baseado no modo
    let algorithm;
    if (currentRouteType === 'intra-city') {
        algorithm = document.getElementById('algorithm').value;
    } else {
        algorithm = document.getElementById('algorithm-inter').value;
    }

    // Check if real roads is enabled
    const realRoadsCheckbox = document.getElementById('use-real-roads');
    const useRealRoads = realRoadsCheckbox ? realRoadsCheckbox.checked : false;

    // Show loading with appropriate message
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay.querySelector('p');

    if (useRealRoads) {
        loadingText.textContent = 'Calculating route with real roads...';
    } else {
        loadingText.textContent = 'Calculating optimized route...';
    }

    loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locations: locations,
                algorithm: algorithm,
                use_real_roads: useRealRoads
            })
        });

        const result = await response.json();

        if (!result.success) {
            showNotification('error', result.error || 'Calculation failed');
            document.getElementById('loading-overlay').style.display = 'none';
            return;
        }

        // Display results
        displayResults(result);

        // Draw route on map (with real geometry if available)
        drawRoute(result.route, result.route_geometry);

        const routeType = result.used_real_roads ? 'real roads' : 'straight lines';
        showNotification('success', `Route calculated successfully using ${routeType}!`);

    } catch (error) {
        console.error('Error calculating route:', error);
        showNotification('error', 'Failed to calculate route');
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

function displayResults(result) {
    const resultsContent = document.getElementById('results-content');

    // Calculate cost (R$ 0.635 per km for Brazil 2026)
    const cost = (result.total_distance * 0.635).toFixed(2);

    // Format route with proper numbering (1-based)
    const routeSequence = result.route.map((idx, position) => {
        const loc = locations[idx];
        return `<div class="route-step">
            <span class="step-number">${position + 1}</span>
            <span class="step-name">${loc.name}</span>
        </div>`;
    }).join('');

    // Build duration HTML if available
    let durationHtml = '';
    if (result.total_duration_min !== undefined) {
        const hours = Math.floor(result.total_duration_min / 60);
        const mins = Math.round(result.total_duration_min % 60);
        const durationStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
        durationHtml = `
            <div class="result-metric">
                <div class="metric-label">Estimated Duration</div>
                <div class="metric-value">${durationStr}</div>
            </div>
        `;
    }

    // Build route type indicator
    const routeTypeHtml = result.used_real_roads ?
        '<span class="route-type-badge real-roads"><i class="fas fa-road"></i> Real Roads</span>' :
        '<span class="route-type-badge straight-line"><i class="fas fa-ruler"></i> Straight Line</span>';

    resultsContent.innerHTML = `
        <div class="result-metric">
            <div class="metric-label">Total Distance</div>
            <div class="metric-value">${result.total_distance.toFixed(2)} <span class="metric-unit">km</span></div>
            ${routeTypeHtml}
        </div>
        ${durationHtml}
        <div class="result-metric">
            <div class="metric-label">Estimated Cost</div>
            <div class="metric-value">R$ ${cost}</div>
        </div>
        <div class="result-metric">
            <div class="metric-label">Calculation Time</div>
            <div class="metric-value">${result.time_ms.toFixed(2)} <span class="metric-unit">ms</span></div>
        </div>
        <div class="result-metric">
            <div class="metric-label">Algorithm</div>
            <div class="metric-value-small">${result.method}</div>
        </div>
        <div class="divider"></div>
        <div class="route-section">
            <div class="route-header">Route Sequence</div>
            <div class="route-sequence">
                ${routeSequence}
            </div>
        </div>
    `;
}

function clearResults() {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = '<p class="empty-state">Calculate a route to see results</p>';
}

function drawRoute(route, routeGeometry = null) {
    routeLayer.clearLayers();
    markersLayer.clearLayers();


    // Update markers with route order (1, 2, 3...)
    // Skip the last index if it's the same as the first (return to hub)
    const uniqueRoute = route[route.length - 1] === route[0] ? route.slice(0, -1) : route;

    uniqueRoute.forEach((locIdx, orderIdx) => {
        const loc = locations[locIdx];
        const isHub = orderIdx === 0;
        const displayNumber = orderIdx + 1; // 1-based numbering

        const markerIcon = L.divIcon({
            className: isHub ? 'custom-marker hub-marker' : 'custom-marker',
            html: `<div style="background-color: ${isHub ? '#FF0055' : '#6929C4'}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${displayNumber}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([loc.lat, loc.lon], { icon: markerIcon });
        marker.bindPopup(`<b>${displayNumber}. ${loc.name}</b>${isHub ? ' (Hub)' : ''}<br>Lat: ${loc.lat.toFixed(4)}<br>Lon: ${loc.lon.toFixed(4)}`);
        markersLayer.addLayer(marker);
    });

    if (routeGeometry && routeGeometry.length > 0) {
        // Draw real road geometry
        // ORS returns [lon, lat], Leaflet uses [lat, lon]
        const path = routeGeometry.map(coord => [coord[1], coord[0]]);

        const polyline = L.polyline(path, {
            color: '#FF0055',
            weight: 5,
            opacity: 0.9
        });

        routeLayer.addLayer(polyline);

        // Fit map to show the entire route
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    } else {
        // Fallback: Draw straight lines between points
        const path = route.map(idx => {
            const loc = locations[idx];
            return [loc.lat, loc.lon];
        });

        const polyline = L.polyline(path, {
            color: '#FF0055',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10' // Dashed line for straight-line routes
        });

        routeLayer.addLayer(polyline);
    }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(type, message) {

    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to page
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateUI();
    checkRealRoadsStatus();

    // Route type selection
    document.getElementById('route-type').addEventListener('change', toggleRouteTypeUI);

    // Intra-city mode listeners
    document.getElementById('algorithm').addEventListener('change', () => {
        updatePointsLimitIntraCity();
        updateUI();
    });
    document.getElementById('generate-intra-city-route').addEventListener('click', generateIntraCityRoute);

    // Inter-city mode listeners
    document.getElementById('algorithm-inter').addEventListener('change', () => {
        updatePointsLimitInterCity();
        updateUI();
    });
    document.getElementById('load-brazil-capitals').addEventListener('click', loadBrazilCapitals);
    document.getElementById('clear-points').addEventListener('click', clearPoints);

    // Calculate button
    document.getElementById('calculate-route').addEventListener('click', calculateRoute);

    // API Key button
    const setApiKeyBtn = document.getElementById('set-api-key-btn');
    if (setApiKeyBtn) {
        setApiKeyBtn.addEventListener('click', setApiKey);
    }

    // Initialize points limits
    updatePointsLimitIntraCity();
    updatePointsLimitInterCity();
});
