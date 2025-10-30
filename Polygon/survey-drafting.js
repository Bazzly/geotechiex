// Survey Drafting Module with Project ID Verification
class SurveyDrafting {
    constructor() {
        this.points = [];
        this.validProjectIds = [
            'ABC123-2024-SURVEY',
            'DEF456-2024-MAPPING',
            'GHI789-2024-CONSTRUCTION',
            'POLYGON-SURVEY-2024',
            'SITE-PLAN-2024'
        ];
        this.currentProjectId = '';
    }
    
    // Set valid project IDs (for admin use)
    setValidProjectIds(ids) {
        this.validProjectIds = ids;
    }
    
    // Add a new valid project ID
    addValidProjectId(id) {
        if (!this.validProjectIds.includes(id.toUpperCase())) {
            this.validProjectIds.push(id.toUpperCase());
        }
    }
    
    // Verify project ID
    verifyProjectId(id) {
        return this.validProjectIds.includes(id.trim().toUpperCase());
    }
    
    // Extract project ID from text
    extractProjectId(text) {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('PROJECT_ID:')) {
                return line.replace('PROJECT_ID:', '').trim();
            }
        }
        return null;
    }
    
    // Validate input with project ID check
    validateInput(inputText) {
        if (!inputText.trim()) {
            return { isValid: false, message: 'Please enter some points data.' };
        }
        
        // Check for project ID in input
        const extractedId = this.extractProjectId(inputText);
        if (!extractedId) {
            return { 
                isValid: false, 
                message: 'No PROJECT_ID found in input. Please include PROJECT_ID: your-id in the first line.' 
            };
        }
        
        // Verify the project ID
        if (!this.verifyProjectId(extractedId)) {
            return { 
                isValid: false, 
                message: `Invalid PROJECT_ID: ${extractedId}. Please check your project ID.` 
            };
        }
        
        this.currentProjectId = extractedId;
        
        // Check for valid points format
        const points = this.parsePoints(inputText);
        if (points.length < 2) {
            return { isValid: false, message: 'Please enter at least 2 valid points.' };
        }
        
        return { isValid: true, message: 'Input validated successfully!', projectId: extractedId };
    }
    
    // Parse points from input text
    parsePoints(inputText) {
        const lines = inputText.split('\n').filter(line => line.trim() !== '');
        this.points = [];
        
        for (const line of lines) {
            // Skip PROJECT_ID line
            if (line.startsWith('PROJECT_ID:')) continue;
            
            const parts = line.split('-');
            if (parts.length >= 3) {
                // Handle both "point 1-547407.120-742340.095" and "PL1-547407.120-742340.095" formats
                let name, east, north;
                
                if (line.toLowerCase().startsWith('point')) {
                    // Format: "point 1-547407.120-742340.095"
                    name = parts[0].trim() + ' ' + parts[1].trim();
                    east = parseFloat(parts[2]);
                    north = parseFloat(parts[3]);
                } else {
                    // Format: "PL1-547407.120-742340.095"
                    name = parts[0].trim();
                    east = parseFloat(parts[1]);
                    north = parseFloat(parts[2]);
                }
                
                if (!isNaN(east) && !isNaN(north)) {
                    this.points.push({ name, east, north });
                }
            }
        }
        
        return this.points;
    }
    
    // Calculate distance between two points
    calculateDistance(p1, p2) {
        const dx = p2.east - p1.east;
        const dy = p2.north - p1.north;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate azimuth in radians
    calculateAzimuthRadians(p1, p2) {
        const dx = p2.east - p1.east;
        const dy = p2.north - p1.north;
        return Math.atan2(dx, dy);
    }
    
    // Convert radians to degrees
    radiansToDegrees(rad) {
        return (rad * 180 / Math.PI + 360) % 360;
    }
    
    // Convert decimal degrees to DMS format
    degreesToDMS(decimalDegrees) {
        const degrees = Math.floor(decimalDegrees);
        const minutesDecimal = (decimalDegrees - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = Math.round((minutesDecimal - minutes) * 60);
        
        return {
            degrees: degrees,
            minutes: minutes,
            seconds: seconds
        };
    }
    
    // Format azimuth as DDD°MM'
    formatAzimuth(azimuthDegrees) {
        const dms = this.degreesToDMS(azimuthDegrees);
        return `${dms.degrees.toString().padStart(3, '0')}D${dms.minutes.toString().padStart(2, '0')}'`;
    }
    
    // Generate complete calculation results
    generateResults(inputText) {
        const validation = this.validateInput(inputText);
        
        if (!validation.isValid) {
            return `ERROR: ${validation.message}`;
        }
        
        const points = this.parsePoints(inputText);
        let output = '';
        
        // Add project header
        output += `PROJECT ID: ${validation.projectId}\n`;
        output += `CALCULATION DATE: ${new Date().toLocaleDateString()}\n`;
        output += '='.repeat(50) + '\n\n';
        
        // Add coordinate list
        output += 'COORDINATES:\n';
        points.forEach((point, index) => {
            output += `${point.name}: E${point.east.toFixed(3)}, N${point.north.toFixed(3)}\n`;
        });
        
        output += '\n' + '='.repeat(50) + '\n\n';
        output += 'DISTANCES AND AZIMUTHS:\n';
        
        // Calculate for each pair of consecutive points
        for (let i = 0; i < points.length; i++) {
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % points.length];
            
            const distance = this.calculateDistance(currentPoint, nextPoint);
            const azimuthRad = this.calculateAzimuthRadians(currentPoint, nextPoint);
            const azimuthDeg = this.radiansToDegrees(azimuthRad);
            const azimuthFormatted = this.formatAzimuth(azimuthDeg);
            
            output += `${currentPoint.name} to ${nextPoint.name}\n`;
            output += `  Distance: ${distance.toFixed(3)}m\n`;
            output += `  Azimuth: ${azimuthFormatted} (${azimuthDeg.toFixed(4)}°)\n\n`;
        }
        
        // Add coordinate list for plotting
        output += 'COORDINATE LIST FOR PLOTTING:\n';
        output += points.map(p => `${p.east.toFixed(3)},${p.north.toFixed(3)}`).join(' ');
        
        return output;
    }
    
    // Generate coordinate list for CAD software
    generateCoordinateList(points) {
        if (!points || points.length === 0) {
            return '';
        }
        
        return points.map(p => `${p.east.toFixed(3)},${p.north.toFixed(3)}`).join(' ');
    }
    
    // Export results to file
    exportToFile(content, filename = null) {
        if (!filename) {
            filename = `survey-results-${this.currentProjectId || 'project'}.txt`;
        }
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Get current valid project IDs (for admin)
    getValidProjectIds() {
        return [...this.validProjectIds];
    }
}

// Make it available globally
window.SurveyDrafting = SurveyDrafting;