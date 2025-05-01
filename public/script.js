const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Reference to the info box element
const infoBox = document.getElementById('info-box');

// --- Risk Level Templates ---
// Define the basic structure with improved placeholder advice
const riskTemplates = {
    high: {
        riskLevel: "High Risk",
        riskClass: "risk-high",
        safetyAdvice: "Travel likely discouraged or restricted due to severe conditions. Exercise extreme caution. Monitor official channels constantly.", // Updated advice
        currency: "UAH", languages: "Ukrainian", emergency: "112"
    },
    medium: {
        riskLevel: "Medium Risk",
        riskClass: "risk-medium",
        safetyAdvice: "Exercise increased caution. Be aware of your surroundings and potential localized risks. Follow local authorities' guidance.", // Updated advice
        currency: "UAH", languages: "Ukrainian", emergency: "112"
    },
    low: {
        riskLevel: "Low Risk",
        riskClass: "risk-low",
        safetyAdvice: "Exercise normal safety precautions. Remain vigilant, especially in unfamiliar areas. Stay informed about current events.", // Updated advice
        currency: "UAH", languages: "Ukrainian", emergency: "112"
    },
    default: { // Fallback if something goes wrong
        riskLevel: "Unknown",
        riskClass: "risk-unknown",
        safetyAdvice: "Risk level data unavailable for this area. Check official travel advisories.",
        currency: "UAH", languages: "Ukrainian", emergency: "112"
    }
};

// --- Helper function to extract oblast name ---
function getOblastNameFromProperties(properties) {
    if (properties && properties.name_en) return properties.name_en.trim();
    if (properties && properties.name) return properties.name.trim(); // Fallback
    return null; // Return null if no name found
}

// --- Fisher-Yates Shuffle function ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

fetch('ukraine_oblasts.geojson')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        // --- Dynamic Risk Assignment ---
        let oblastNames = [];
        data.features.forEach(feature => {
            const name = getOblastNameFromProperties(feature.properties);
            if (name && !oblastNames.includes(name)) { // Add unique, valid names
                oblastNames.push(name);
            }
        });

        shuffleArray(oblastNames); // Shuffle the names randomly

        const dynamicOblastDetails = {};
        const numHighRisk = 5;
        const numMediumRisk = 6;

        oblastNames.forEach((name, index) => {
            if (index < numHighRisk) {
                dynamicOblastDetails[name] = { ...riskTemplates.high }; // Assign high risk
            } else if (index < numHighRisk + numMediumRisk) {
                dynamicOblastDetails[name] = { ...riskTemplates.medium }; // Assign medium risk
            } else {
                dynamicOblastDetails[name] = { ...riskTemplates.low }; // Assign low risk
            }
        });
        // Add a default for safety, though all names should be covered
        dynamicOblastDetails["Default"] = riskTemplates.default;
        // --- End Dynamic Risk Assignment ---


        // --- Create GeoJSON Layer (NOW uses dynamicOblastDetails) ---
        const geoJsonLayer = L.geoJson(data, {
            style: function(feature) {
                const oblastName = getOblastNameFromProperties(feature.properties);
                // Use the DYNAMICALLY generated details
                const details = dynamicOblastDetails[oblastName] || dynamicOblastDetails["Default"];

                let fillColor;
                switch (details.riskClass) {
                    case 'risk-high':   fillColor = '#d9534f'; break;
                    case 'risk-medium': fillColor = '#f0ad4e'; break;
                    case 'risk-low':    fillColor = '#5cb85c'; break;
                    default:            fillColor = '#777';    break;
                }
                return {
                    color: '#ffffff', weight: 1, fillColor: fillColor, fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const oblastName = getOblastNameFromProperties(feature.properties);

                layer.on({
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        currentLayer.setStyle({ weight: 3, color: '#ffffff' });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) { currentLayer.bringToFront(); }

                         // Use the DYNAMICALLY generated details
                        const details = dynamicOblastDetails[oblastName] || dynamicOblastDetails["Default"];
                        infoBox.innerHTML = `<h4>${oblastName || 'Unknown Oblast'}</h4><p><strong>Risk Level:</strong> <span class="risk-level ${details.riskClass}">${details.riskLevel}</span></p><p><strong>Safety Advice:</strong> ${details.safetyAdvice}</p><p><strong>Currency:</strong> ${details.currency}</p><p><strong>Languages:</strong> ${details.languages}</p><p><strong>Emergency:</strong> ${details.emergency}</p>`;

                        const containerPoint = e.containerPoint;
                        infoBox.style.left = (containerPoint.x + 15) + 'px';
                        infoBox.style.top = (containerPoint.y + 15) + 'px';
                        infoBox.style.display = 'block';
                    },
                    mouseout: function(e) {
                         geoJsonLayer.resetStyle(e.target);
                         infoBox.style.display = 'none';
                    }
                });
            }
        });
        geoJsonLayer.addTo(map);
        // --- End GeoJSON Layer ---

    })
    .catch(error => {
        console.error('Error loading or processing the GeoJSON data:', error);
        alert('Failed to load map data. Check console and ensure ukraine_oblasts.geojson is in the public folder.');
    });