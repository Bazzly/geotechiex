// Initialize Proj4js definitions
proj4.defs([
    ["EPSG:26331", "+proj=utm +zone=31 +ellps=clrk80 +towgs84=-93.603,82.328,115.703,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26332", "+proj=utm +zone=32 +ellps=clrk80 +towgs84=-93.603,82.328,115.703,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26391", "+proj=tmerc +lat_0=4 +lon_0=4.5 +k=1.0 +x_0=230738.26 +y_0=0 +ellps=clrk80 +towgs84=-93.603,82.328,115.703,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26392", "+proj=tmerc +lat_0=4 +lon_0=6.5 +k=1.0 +x_0=230738.26 +y_0=0 +ellps=clrk80 +towgs84=-93.603,82.328,115.703,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26393", "+proj=tmerc +lat_0=4 +lon_0=8.5 +k=1.0 +x_0=230738.26 +y_0=0 +ellps=clrk80 +towgs84=-93.603,82.328,115.703,0,0,0,0 +units=m +no_defs"],
    ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"]
]);

const output = document.getElementById("output");

// Initialize Leaflet map
const map = L.map("map").setView([6.5244, 3.3792], 6); // Default view over Nigeria
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Transform coordinates on button click
document.getElementById("transformButton").addEventListener("click", () => {
    const xCoord = parseFloat(document.getElementById("xCoord").value);
    const yCoord = parseFloat(document.getElementById("yCoord").value);
    const sourceEPSG = document.getElementById("coordinateSystem").value;
    const targetEPSG = document.getElementById("transformSystem").value;

    if (isNaN(xCoord) || isNaN(yCoord)) {
        output.textContent = "Please enter valid X and Y coordinates.";
        return;
    }

    try {
        // Transform coordinates
        const transformedCoord = proj4(sourceEPSG, targetEPSG, [xCoord, yCoord]);
        output.textContent = `Transformed Coordinates (${targetEPSG}): X: ${transformedCoord[0].toFixed(3)}, Y: ${transformedCoord[1].toFixed(3)}`;

        // Add marker to map
        if (targetEPSG === "EPSG:4326") {
            L.marker([transformedCoord[1], transformedCoord[0]])
                .addTo(map)
                .bindPopup(`Transformed Point: (${transformedCoord[1]}, ${transformedCoord[0]})`)
                .openPopup();
            map.setView([transformedCoord[1], transformedCoord[0]], 12);
        }
    } catch (error) {
        output.textContent = `Error transforming coordinates: ${error.message}`;
    }
});
