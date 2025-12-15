// Coordinate Transformation Tool with Bulk Processing
// Define all projection systems
proj4.defs([
    ["EPSG:26331", "+proj=utm +zone=31 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26332", "+proj=utm +zone=32 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26391", "+proj=tmerc +lat_0=4 +lon_0=4.5 +k=0.99975 +x_0=230738.26 +y_0=0 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26392", "+proj=tmerc +lat_0=4 +lon_0=8.5 +k=0.99975 +x_0=670553.98 +y_0=0 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"],
    ["EPSG:26393", "+proj=tmerc +lat_0=4 +lon_0=12.5 +k=0.99975 +x_0=1110369.7 +y_0=0 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"],
    ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"]
]);

// Mode switching
const singleModeBtn = document.getElementById('singleModeBtn');
const bulkModeBtn = document.getElementById('bulkModeBtn');
const singleMode = document.getElementById('singleMode');
const bulkMode = document.getElementById('bulkMode');

singleModeBtn.addEventListener('click', () => {
    singleMode.classList.remove('hidden');
    bulkMode.classList.add('hidden');
    singleModeBtn.classList.add('bg-purple-600', 'text-white');
    singleModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    bulkModeBtn.classList.remove('bg-purple-600', 'text-white');
    bulkModeBtn.classList.add('bg-gray-700', 'text-gray-300');
});

bulkModeBtn.addEventListener('click', () => {
    bulkMode.classList.remove('hidden');
    singleMode.classList.add('hidden');
    bulkModeBtn.classList.add('bg-purple-600', 'text-white');
    bulkModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    singleModeBtn.classList.remove('bg-purple-600', 'text-white');
    singleModeBtn.classList.add('bg-gray-700', 'text-gray-300');
});

// Single Transform Mode
const transformButton = document.getElementById('transformButton');
const coordinateSystem = document.getElementById('coordinateSystem');
const transformSystem = document.getElementById('transformSystem');
const xCoordInput = document.getElementById('xCoord');
const yCoordInput = document.getElementById('yCoord');
const output = document.getElementById('output');
const mapDiv = document.getElementById('map');

let map = null;

transformButton.addEventListener('click', () => {
    const sourceEPSG = coordinateSystem.value;
    const targetEPSG = transformSystem.value;
    const xCoord = parseFloat(xCoordInput.value);
    const yCoord = parseFloat(yCoordInput.value);

    if (isNaN(xCoord) || isNaN(yCoord)) {
        output.innerHTML = '<p class="text-red-400">⚠️ Please enter valid numeric coordinates.</p>';
        return;
    }

    try {
        const [transformedX, transformedY] = proj4(sourceEPSG, targetEPSG, [xCoord, yCoord]);
        
        output.innerHTML = `
            <div class="space-y-2">
                <div class="bg-gray-800 p-3 rounded">
                    <p class="text-xs text-gray-400 mb-1">Source (${sourceEPSG})</p>
                    <p class="font-mono text-sm"><strong>X:</strong> ${xCoord.toFixed(6)}</p>
                    <p class="font-mono text-sm"><strong>Y:</strong> ${yCoord.toFixed(6)}</p>
                </div>
                <div class="text-center text-green-400 text-2xl">↓</div>
                <div class="bg-green-900/30 p-3 rounded border border-green-600">
                    <p class="text-xs text-green-400 mb-1">Target (${targetEPSG})</p>
                    <p class="font-mono text-sm text-green-300"><strong>X:</strong> ${transformedX.toFixed(6)}</p>
                    <p class="font-mono text-sm text-green-300"><strong>Y:</strong> ${transformedY.toFixed(6)}</p>
                </div>
            </div>
        `;

        // Show map if target is WGS84
        if (targetEPSG === 'EPSG:4326') {
            showOnMap(transformedX, transformedY);
        } else {
            mapDiv.classList.add('hidden');
        }
    } catch (error) {
        output.innerHTML = `<p class="text-red-400">⚠️ Error transforming coordinates: ${error.message}</p>`;
    }
});

function showOnMap(lon, lat) {
    mapDiv.classList.remove('hidden');
    
    if (!map) {
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 13);
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }
    
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<strong>Coordinates:</strong><br>Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}`)
        .openPopup();
}

// Bulk Transform Mode
const bulkTransformButton = document.getElementById('bulkTransformButton');
const bulkCoordinateSystem = document.getElementById('bulkCoordinateSystem');
const bulkTransformSystem = document.getElementById('bulkTransformSystem');
const bulkInput = document.getElementById('bulkInput');
const bulkOutput = document.getElementById('bulkOutput');
const csvFileInput = document.getElementById('csvFileInput');
const fileName = document.getElementById('fileName');
const downloadBtn = document.getElementById('downloadBtn');
const resultCount = document.getElementById('resultCount');

let transformedData = [];

// CSV File Upload
csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = `📁 ${file.name}`;
        fileName.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = (event) => {
            bulkInput.value = event.target.result;
        };
        reader.readAsText(file);
    }
});

// Bulk Transform
bulkTransformButton.addEventListener('click', () => {
    const sourceEPSG = bulkCoordinateSystem.value;
    const targetEPSG = bulkTransformSystem.value;
    const inputText = bulkInput.value.trim();

    if (!inputText) {
        bulkOutput.innerHTML = '<p class="text-red-400 text-sm">⚠️ Please enter or upload coordinates.</p>';
        return;
    }

    const lines = inputText.split('\n').filter(line => line.trim());
    transformedData = [];
    let successCount = 0;
    let errorCount = 0;

    const results = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length < 3) {
            errorCount++;
            return `
                <div class="bg-red-900/30 border border-red-600 rounded p-2 mb-2 text-xs">
                    <p class="text-red-300">❌ Line ${index + 1}: Invalid format (needs at least ID,X,Y)</p>
                </div>
            `;
        }

        const id = parts[0];
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parts[3] ? parseFloat(parts[3]) : 0;
        const name = parts[4] || `Point ${id}`;

        if (isNaN(x) || isNaN(y)) {
            errorCount++;
            return `
                <div class="bg-red-900/30 border border-red-600 rounded p-2 mb-2 text-xs">
                    <p class="text-red-300">❌ Line ${index + 1}: Invalid coordinates (${id})</p>
                </div>
            `;
        }

        try {
            const [transformedX, transformedY] = proj4(sourceEPSG, targetEPSG, [x, y]);
            successCount++;
            
            transformedData.push({
                id,
                original_x: x,
                original_y: y,
                z,
                name,
                transformed_x: transformedX,
                transformed_y: transformedY,
                source_epsg: sourceEPSG,
                target_epsg: targetEPSG
            });

            return `
                <div class="bg-gray-800 border border-gray-600 rounded p-3 mb-2 text-xs hover:border-purple-500 transition">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-semibold text-purple-400">${id}: ${name}</span>
                        <span class="text-green-400 text-xs">✓</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 font-mono text-xs">
                        <div class="text-gray-400">
                            <p>Source: ${x.toFixed(2)}, ${y.toFixed(2)}</p>
                        </div>
                        <div class="text-green-300">
                            <p>Target: ${transformedX.toFixed(6)}, ${transformedY.toFixed(6)}</p>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            errorCount++;
            return `
                <div class="bg-red-900/30 border border-red-600 rounded p-2 mb-2 text-xs">
                    <p class="text-red-300">❌ ${id}: Transformation failed - ${error.message}</p>
                </div>
            `;
        }
    });

    bulkOutput.innerHTML = `
        <div class="mb-4 p-3 bg-gray-800 rounded text-sm">
            <p class="text-green-400">✅ Success: ${successCount}</p>
            ${errorCount > 0 ? `<p class="text-red-400">❌ Errors: ${errorCount}</p>` : ''}
            <p class="text-gray-400">Total: ${lines.length}</p>
        </div>
        ${results.join('')}
    `;

    resultCount.textContent = successCount;

    if (successCount > 0) {
        downloadBtn.classList.remove('hidden');
    }
});

// Download CSV
downloadBtn.addEventListener('click', () => {
    if (transformedData.length === 0) return;

    const headers = ['ID', 'Name', 'Original_X', 'Original_Y', 'Z', 'Transformed_X', 'Transformed_Y', 'Source_EPSG', 'Target_EPSG'];
    const csvContent = [
        headers.join(','),
        ...transformedData.map(row => 
            `${row.id},"${row.name}",${row.original_x},${row.original_y},${row.z},${row.transformed_x},${row.transformed_y},${row.source_epsg},${row.target_epsg}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformed_coordinates_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});
