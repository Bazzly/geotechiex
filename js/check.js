document.addEventListener("DOMContentLoaded", () => {
    // Initialize Proj4 with EPSG definitions
    proj4.defs([
        [
            'EPSG:26331',
            '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs +towgs84=-92,-93,-122,0,0,0,0'
        ],
        [
            'EPSG:4326',
            '+proj=longlat +datum=WGS84 +no_defs'
        ]
    ]);

    const map = L.map('map').setView([0, 0], 2); // Initialize the map with a default view

    // Add a base map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker; // To store the point marker

    document.getElementById("checkButton").addEventListener("click", async () => {
        const xCoord = parseFloat(document.getElementById("xCoord").value);
        const yCoord = parseFloat(document.getElementById("yCoord").value);
        const output = document.getElementById("output");

        if (isNaN(xCoord) || isNaN(yCoord)) {
            output.textContent = "Please enter valid X and Y coordinates.";
            return;
        }

        // Convert coordinates from EPSG:26331 to EPSG:4326
        const [longitude, latitude] = proj4('EPSG:26331', 'EPSG:4326', [xCoord, yCoord]);

        // Create a point for Turf.js using transformed coordinates
        const point = turf.point([longitude, latitude]);
        const dataFolder = '../data/'; // Path to the folder containing GeoJSON files
        const fileNames = ['PRIME_AREA.geojson', 'SPECIAL_PRIME_AREA.geojson']; // Updated file names
        let pointFoundInFile = null;

        // Check the point against GeoJSON files
        for (const fileName of fileNames) {
            try {
                const response = await fetch(dataFolder + fileName);
                if (!response.ok) throw new Error(`Failed to load ${fileName}`);

                const geojson = await response.json();

                for (const feature of geojson.features) {
                    if (turf.booleanPointInPolygon(point, feature)) {
                        pointFoundInFile = fileName;
                        break;
                    }
                }

                if (pointFoundInFile) break; // Stop further checking if the point is found
            } catch (error) {
                console.error(`Error loading file ${fileName}:`, error);
            }
        }

        // Update output text based on the results
        if (pointFoundInFile === 'PRIME_AREA.geojson') {
            output.textContent = "The coordinate falls within Prime area.";
        } else if (pointFoundInFile === 'SPECIAL_PRIME_AREA.geojson') {
            output.textContent = "The coordinate falls within Special Prime area.";
        } else {
            output.textContent = "The coordinate falls within General area.";
        }

        // Display the point on the map
        if (marker) {
            map.removeLayer(marker); // Remove the existing marker if any
        }

        marker = L.marker([latitude, longitude]).addTo(map)
            .bindPopup("Checked Coordinate").openPopup();

        map.setView([latitude, longitude], 12); // Zoom to the checked point
    });
});
