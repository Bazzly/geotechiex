// Initialize the map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Load GeoJSON
fetch('../data/PRIME_PLYG.geojson')
  .then(response => response.json())
  .then(data => {
    // Add the polygon to the map
    const geojsonLayer = L.geoJSON(data).addTo(map);

    // Fit map to the polygon
    map.fitBounds(geojsonLayer.getBounds());

    // Buffer the polygon
    const buffered = turf.buffer(data, 5, { units: 'kilometers' }); // Adjust distance/unit as needed

    // Add buffered polygon to the map
    L.geoJSON(buffered, { style: { color: 'red' } }).addTo(map);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));
