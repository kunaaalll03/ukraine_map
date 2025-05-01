const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- Oblast Details with Risk Levels ---
// Keys here MUST EXACTLY match the 'name_en' property from the GeoJSON file
const oblastDetails = {
  // --- High Risk (Red) ---
  "Donetska Oblast":    { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid all travel. Active conflict zone.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Luhanska Oblast":    { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid all travel. Active conflict zone.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Zaporizka Oblast":   { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid non-essential travel. High risk near front lines.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Khersonska Oblast":  { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Avoid non-essential travel. Security situation volatile.", currency: "UAH", languages: "Ukrainian", emergency: "112" },
  "Kharkivska Oblast":  { riskLevel: "High Risk", riskClass: "risk-high", safetyAdvice: "Exercise increased caution, especially near border areas. Risk of shelling.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },

  // --- Medium Risk (Yellow) ---
  "Odeska Oblast":      { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Monitor local alerts. Risk of missile strikes.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Dnipropetrovska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Risk of missile strikes.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Sumska Oblast":      { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution, especially near border. Risk of cross-border attacks.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Chernihivska Oblast":{ riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution, especially near border. Risk of shelling.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Mykolaivska Oblast": { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Check local advisories.", currency: "UAH", languages: "Ukrainian", emergency: "112" },
  "Kyiv City":          { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Risk of air raids. Monitor alerts.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },
  "Kyivska Oblast":     { riskLevel: "Medium Risk", riskClass: "risk-medium", safetyAdvice: "Exercise increased caution. Monitor alerts.", currency: "UAH", languages: "Ukrainian, Russian", emergency: "112" },

  // --- Default: Low Risk (Green) ---
  // Any oblast whose 'name_en' doesn't match the keys above will get this style
  "Default":            { riskLevel: "Low Risk", riskClass: "risk-low", safetyAdvice: "Exercise normal precautions, but remain vigilant and follow local advice.", currency: "UAH", languages: "Ukrainian", emergency: "112" }
};

// Reference to the info box element
const infoBox = document.getElementById('info-box');

// Helper function to get the primary English name, trimming whitespace
function getOblastNameFromProperties(properties) {
    if (properties && properties.name_en) {
        return properties.name_en.trim(); // Use name_en and trim whitespace
    }
    // Fallback if name_en doesn't exist (less ideal)
    if (properties && properties.name) {
        return properties.name.trim();
    }
    return 'N/A'; // Return 'N/A' if no suitable name found
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
            style: function(feature) {
                const properties = feature.properties;
                const oblastName = getOblastNameFromProperties(properties); // Use the helper function
                const details = oblastDetails[oblastName] || oblastDetails["Default"]; // Match using the exact name

                let fillColor;
                switch (details.riskClass) {
                    case 'risk-high':   fillColor = '#d9534f'; break;
                    case 'risk-medium': fillColor = '#f0ad4e'; break;
                    case 'risk-low':    fillColor = '#5cb85c'; break;
                    default:            fillColor = '#777';    break;
                }

                // --- LOGGING --- Still useful for debugging if needed
                // console.log(`Props:`, properties);
                // console.log(`Name Found: "${oblastName}" | Risk Class: "${details.riskClass}" | Color: ${fillColor}`);
                // ---

                return {
                    color: '#ffffff', weight: 1, fillColor: fillColor, fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const oblastName = getOblastNameFromProperties(feature.properties); // Use the same name logic

                layer.on({
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        currentLayer.setStyle({ weight: 3, color: '#ffffff' });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) { currentLayer.bringToFront(); }

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
        alert('Failed to load map data. Check console and ensure ukraine_oblasts.geojson is in the public folder.');
    });