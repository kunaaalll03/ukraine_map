const map = L.map('map').setView([49.0, 31.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch the GeoJSON file located in the SAME (public) folder
fetch('ukraine_oblasts.geojson')
    .then(response => {
        if (!response.ok) {
            // If file not found or other error, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        // Successfully loaded and parsed GeoJSON data
        const geoJsonLayer = L.geoJson(data, {
            style: function(feature) {
                // Style for each oblast polygon
                return {
                    color: '#0000ff', // Blue outline
                    weight: 1,
                    fillColor: '#0000ff', // Blue fill
                    fillOpacity: 0.2
                };
            },
            onEachFeature: function(feature, layer) {
                // Action for each feature (oblast)
                let oblastName = 'N/A'; // Default name
                // Try to find the name in different properties
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
                }

                // Add a popup showing the name
                layer.bindPopup('Oblast: ' + oblastName);

                // Add interaction for mouse hover
                layer.on({
                    mouseover: function(e) {
                        const currentLayer = e.target;
                        // Highlight style
                        currentLayer.setStyle({
                            weight: 2,
                            color: '#ff0000', // Red outline
                            fillColor: '#ff0000', // Red fill
                            fillOpacity: 0.5
                        });
                        // Bring highlighted layer to front
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            currentLayer.bringToFront();
                        }
                    },
                    mouseout: function(e) {
                         // Reset style using the layer group's reset function
                         geoJsonLayer.resetStyle(e.target);
                    }
                });
            }
        });
        // Add the GeoJSON layer to the map
        geoJsonLayer.addTo(map);
    })
    .catch(error => {
        // Handle errors during fetch or processing
        console.error('Error loading or processing the GeoJSON data:', error);
        alert('Failed to load map data. Check console (F12 -> Console) and ensure ukraine_oblasts.geojson is in the public folder.');
    });