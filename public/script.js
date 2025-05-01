const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// --- Oblast Details with Risk Levels ---
// IMPORTANT: This is EXAMPLE data distribution for demonstration.
// Replace with actual, verified data for a real application!
const oblastDetails = {
  // --- High Risk (Red) ---
  "Donetska Oblast": {
    riskLevel: "High Risk", riskClass: "risk-high",
    safetyAdvice: "Avoid all travel. Active conflict zone.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
  "Luhanska Oblast": {
    riskLevel: "High Risk", riskClass: "risk-high",
    safetyAdvice: "Avoid all travel. Active conflict zone.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
   "Zaporizka Oblast": {
    riskLevel: "High Risk", riskClass: "risk-high",
    safetyAdvice: "Avoid non-essential travel. High risk near front lines.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
  "Khersonska Oblast": {
    riskLevel: "High Risk", riskClass: "risk-high",
    safetyAdvice: "Avoid non-essential travel. Security situation volatile.",
    currency: "UAH", languages: "Ukrainian", emergency: "112"
  },
   "Kharkivska Oblast": {
    riskLevel: "High Risk", riskClass: "risk-high",
    safetyAdvice: "Exercise increased caution, especially near border areas. Risk of shelling.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },

  // --- Medium Risk (Yellow) ---
   "Odeska Oblast": {
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution. Monitor local alerts. Risk of missile strikes.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
   "Dnipropetrovska Oblast": {
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution. Risk of missile strikes.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
   "Sumska Oblast": {
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution, especially near border. Risk of cross-border attacks.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
  "Chernihivska Oblast": {
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution, especially near border. Risk of shelling.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
  },
  "Mykolaivska Oblast": {
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution. Check local advisories.",
    currency: "UAH", languages: "Ukrainian", emergency: "112"
  },
   "Kyiv City": { // Keeping Kyiv City separate
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution. Risk of air raids. Monitor alerts.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
   },
   "Kyivska Oblast": { // Surrounding oblast
    riskLevel: "Medium Risk", riskClass: "risk-medium",
    safetyAdvice: "Exercise increased caution. Monitor alerts.",
    currency: "UAH", languages: "Ukrainian, Russian", emergency: "112"
   },

  // --- Default: Low Risk (Green) ---
  "Default": {
    riskLevel: "Low Risk", riskClass: "risk-low", // Changed default class to low
    safetyAdvice: "Exercise normal precautions, but remain vigilant and follow local advice.",
    currency: "UAH", languages: "Ukrainian", emergency: "112"
  }
  // Oblasts not listed above will use this Default (Low Risk / Green)
};

// Reference to the info box element
const infoBox = document.getElementById('info-box');

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
                // Determine Oblast Name
                let oblastName = 'N/A';
                if (feature.properties) {
                    if (feature.properties.name_en) {
                       oblastName = feature.properties.name_en;
                    } else if (feature.properties.Name_en) {
                       oblastName = feature.properties.Name_en;
                    } else if (feature.properties.name) {
                       oblastName = feature.properties.name;
                    } else if (feature.properties.Name) {
                       oblastName = feature.properties.Name;
                    } else if (feature.properties.NAME) {
                       oblastName = feature.properties.NAME;
                    }
                    // Specific check for common name variations if needed
                    if (!oblastDetails[oblastName] && feature.properties.name && feature.properties.name.includes("Львівська")) {
                        oblastName = "Lvivska Oblast"; // Assuming this maps to a default entry
                    }
                     // Add other specific name checks if necessary
                }

                // Get Risk Details
                const details = oblastDetails[oblastName] || oblastDetails["Default"];

                // Determine Fill Color Based on Risk
                let fillColor;
                switch (details.riskClass) {
                    case 'risk-high':   fillColor = '#d9534f'; break; // Red
                    case 'risk-medium': fillColor = '#f0ad4e'; break; // Orange/Yellow
                    case 'risk-low':    fillColor = '#5cb85c'; break; // Green
                    default:            fillColor = '#777';    break; // Gray (fallback)
                }

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
                // Determine Oblast Name (repeat logic for access within this scope)
                 let oblastName = 'N/A';
                 if (feature.properties) {
                     if (feature.properties.name_en) {
                        oblastName = feature.properties.name_en;
                     } else if (feature.properties.Name_en) {
                        oblastName = feature.properties.Name_en;
                     } else if (feature.properties.name) {
                        oblastName = feature.properties.name;
                     } else if (feature.properties.Name) {
                        oblastName = feature.properties.Name;
                     } else if (feature.properties.NAME) {
                        oblastName = feature.properties.NAME;
                     }
                     if (!oblastDetails[oblastName] && feature.properties.name && feature.properties.name.includes("Львівська")) {
                         oblastName = "Lvivska Oblast";
                     }
                 }

                // Define mouse interaction events
                layer.on({
                    // Action when mouse enters an oblast polygon
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        // Apply highlight style
                        currentLayer.setStyle({
                            weight: 3,          // Thicker border
                            color: '#ffffff',   // Keep border white (or change if desired)
                            // fillOpacity: 0.9 // Optional: slightly change opacity
                        });
                        // Bring highlighted layer to the front
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            currentLayer.bringToFront();
                        }

                        // Get details for this oblast or use default
                        const details = oblastDetails[oblastName] || oblastDetails["Default"];

                        // Update the info box content
                        infoBox.innerHTML = `
                            <h4>${oblastName}</h4>
                            <p><strong>Risk Level:</strong> <span class="risk-level ${details.riskClass}">${details.riskLevel}</span></p>
                            <p><strong>Safety Advice:</strong> ${details.safetyAdvice}</p>
                            <p><strong>Currency:</strong> ${details.currency}</p>
                            <p><strong>Languages:</strong> ${details.languages}</p>
                            <p><strong>Emergency:</strong> ${details.emergency}</p>
                        `;

                        // Position and display the info box near the cursor
                        const containerPoint = e.containerPoint; // Mouse coordinates relative to map container
                        infoBox.style.left = (containerPoint.x + 15) + 'px'; // Offset slightly right
                        infoBox.style.top = (containerPoint.y + 15) + 'px';  // Offset slightly down
                        infoBox.style.display = 'block'; // Make info box visible
                    },
                    // Action when mouse leaves an oblast polygon
                    mouseout: function(e) {
                         // Reset the polygon style using the layer group's style function
                         geoJsonLayer.resetStyle(e.target);
                         // Hide the info box
                         infoBox.style.display = 'none';
                    }
                });
            }
        });
        // Add the configured GeoJSON layer to the map
        geoJsonLayer.addTo(map);
    })
    .catch(error => {
        // Handle errors during data loading/processing
        console.error('Error loading or processing the GeoJSON data:', error);
        alert('Failed to load map data. Check console (F12 -> Console) and ensure ukraine_oblasts.geojson is in the public folder.');
    });