const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- Oblast Details with Risk Levels ---
// (Data remains the same as the previous step - ensure this part is correct)
const oblastDetails = {
  // --- High Risk (Red) ---
  "Donetska Oblast": { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid all travel. Active conflict zone.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Luhanska Oblast": { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid all travel. Active conflict zone.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Zaporizka Oblast": { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid non-essential travel. High risk near front lines.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Khersonska Oblast": { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid non-essential travel. Security situation volatile.", currency: "UAH", languages: "Ukrainian", emergency: "112" },
  "Kharkivska Oblast": { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Exercise increased caution, especially near border areas. Risk of shelling.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  // --- Medium Risk (Yellow) ---
  "Odeska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Monitor local alerts. Risk of missile strikes.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Dnipropetrovska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Risk of missile strikes.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Sumska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution, especially near border. Risk of cross-border attacks.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Chernihivska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution, especially near border. Risk of shelling.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Mykolaivska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Check local advisories.", currency: "UAH", languages: "Ukrainian", emergency: "112" },
  "Kyiv City": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Risk of air raids. Monitor alerts.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Kyivska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Monitor alerts.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  // --- Default: Low Risk (Green) ---
  "Default": { riskLevel: "Low Risk", riskClass: "risk-low", safetyAdvice: "Exercise normal precautions, but remain vigilant and follow local advice.", currency: "UAH", languages: "Ukrainian", emergency: "112" }
};

// Reference to the info box element
const infoBox = document.getElementById('info-box');

// Helper function to extract the best available oblast name
function getOblastNameFromProperties(properties) {
    if (!properties) return 'N/A';

    // Prioritize English names
    if (properties.name_en) return properties.name_en.trim();
    if (properties.Name_en) return properties.Name_en.trim();
    if (properties.NAME_EN) return properties.NAME_EN.trim();

    // Fallback to other common names
    if (properties.name) return properties.name.trim();
    if (properties.Name) return properties.Name.trim();
    if (properties.NAME) return properties.NAME.trim();

    // Specific check for known variations if needed (example)
    // if (properties.alt_name === 'SomeOtherName') return 'StandardName';

    return 'N/A'; // Return N/A if no suitable name found
}


fetch('ukraine_oblasts.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const geoJsonLayer = L.geoJson(data, {
            // Style function to color oblasts based on risk
            style: function(feature) {
                const properties = feature.properties;

                // --- Determine Oblast Name using helper function ---
                const oblastName = getOblastNameFromProperties(properties);

                // --- Get Risk Details ---
                // Look up details using the found name, fall back to Default if no match
                const details = oblastDetails[oblastName] || oblastDetails["Default"];

                // --- Determine Fill Color Based on Risk ---
                let fillColor;
                switch (details.riskClass) {
                    case 'risk-high':   fillColor = '#d9534f'; break; // Red
                    case 'risk-medium': fillColor = '#f0ad4e'; break; // Orange/Yellow
                    case 'risk-low':    fillColor = '#5cb85c'; break; // Green
                    default:            fillColor = '#777';    break; // Gray (fallback)
                }

                // --- !!! LOGGING FOR DEBUGGING !!! ---
                console.log(`GeoJSON Properties:`, properties); // Log raw properties
                console.log(`Determined Name: "${oblastName}" | Matched Risk Class: "${details.riskClass}" | Assigned Color: ${fillColor}`);
                // --- End Logging ---

                // Return Style Object for the polygon
                return {
                    color: '#ffffff',      // White border for better contrast
                    weight: 1,
                    fillColor: fillColor, // Dynamic fill color based on risk
                    fillOpacity: 0.7      // Make fill slightly more opaque
                };
            },
            // Function executed for each feature (oblast)
            onEachFeature: function(feature, layer) {
                // Determine Oblast Name using the same helper function
                const oblastName = getOblastNameFromProperties(feature.properties);

                // Define mouse interaction events
                layer.on({
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        currentLayer.setStyle({ weight: 3, color: '#ffffff' });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            currentLayer.bringToFront();
                        }

                        const details = oblastDetails[oblastName] || oblastDetails["Default"];
                        infoBox.innerHTML = `<h4>${oblastName}</h4><p><strong>Risk Level:</strong> <span class="risk-level ${details.riskClass}">${details.riskLevel}</span></p><p><strong>Safety Advice:</strong> ${details.safetyAdvice}</p><p><strong>Currency:</strong> ${details.currency}</p><p><strong>Languages:</strong> ${details.languages}</p><p><strong>Emergency:</strong> ${details.emergency}</p>`;

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
    })
    .catch(error => {
        console.error('Error loading or processing the GeoJSON data:', error);
        alert('Failed to load map data. Check console (F12 -> Console) and ensure ukraine_oblasts.geojson is in the public folder.');
    });