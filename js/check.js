
    document.getElementById("checkButton").addEventListener("click", async () => {
        const xCoord = parseFloat(document.getElementById("xCoord").value);
        const yCoord = parseFloat(document.getElementById("yCoord").value);
        const output = document.getElementById("output");
        
        if (isNaN(xCoord) || isNaN(yCoord)) {
            output.textContent = "Please enter valid X and Y coordinates.";
            return;
        }
        
        // new start
    
        // new end
        const point = turf.point([xCoord, yCoord]);
        const dataFolder = '../data/'; // Path to the folder containing GeoJSON files
        const fileNames = ['PRIME_AREA.geojson', 'SPECIAL_PRIME_AREA.geojson']; // Updated file names
        let pointFoundInFile = null;

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

                if (pointFoundInFile) break; // Stop further checking if point is found
            } catch (error) {
                console.error(`Error loading file ${fileName}:`, error);
            }
        }

        output.textContent = pointFoundInFile
            ? `The point is inside : ${pointFoundInFile}.`
            : "The point is a general area.";
    });
