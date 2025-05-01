const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const oblastDetails = {
  "Kyiv City": {
    riskLevel: "High Risk",
    riskClass: "risk-high",
    safetyAdvice: "Exercise increased caution. High levels of crime reported in some areas. Monitor local alerts closely.",
    currency: "UAH (Ukrainian Hryvnia)",
    languages: "Ukrainian, Russian",
    emergency: "101 (Fire), 102 (Police), 103 (Ambulance), 112 (General)"
  },
  "Lvivska Oblast": {
    riskLevel: "Medium Risk",
    riskClass: "risk-medium",
    safetyAdvice: "Exercise normal precautions in Lviv city. Increased caution advised near border areas. Check local news.",
    currency: "UAH (Ukrainian Hryvnia)",
    languages: "Ukrainian",
    emergency: "101 (Fire), 102 (Police), 103 (Ambulance), 112 (General)"
  },
  "Default": {
    riskLevel: "Unknown",
    riskClass: "risk-unknown",
    safetyAdvice: "No specific advice available. Check official government travel advisories for the region.",
    currency: "UAH (Ukrainian Hryvnia)",
    languages: "Ukrainian",
    emergency: "112"
  }
};

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
            style: function(feature) {
                return {
                    color: '#0000ff',
                    weight: 1,
                    fillColor: '#0000ff',
                    fillOpacity: 0.2
                };
            },
            onEachFeature: function(feature, layer) {
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

                layer.on({
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        currentLayer.setStyle({
                            weight: 2,
                            color: '#ff0000',
                            fillColor: '#ff0000',
                            fillOpacity: 0.5
                        });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            currentLayer.bringToFront();
                        }

                        const details = oblastDetails[oblastName] || oblastDetails["Default"];

                        infoBox.innerHTML = `
                            <h4>${oblastName}</h4>
                            <p><strong>Risk Level:</strong> <span class="risk-level ${details.riskClass}">${details.riskLevel}</span></p>
                            <p><strong>Safety Advice:</strong> ${details.safetyAdvice}</p>
                            <p><strong>Currency:</strong> ${details.currency}</p>
                            <p><strong>Languages:</strong> ${details.languages}</p>
                            <p><strong>Emergency:</strong> ${details.emergency}</p>
                        `;
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