// Survey Plan Parser for structured data extraction
class SurveyPlanParser {
    constructor() {
        this.patterns = {
            // Plan title patterns
            title: [
                /(?:(?:PLAN|SURVEY)\s*(?:SHOWING|OF|FOR)\s*(?:PROPERTY|LAND|PLOT)\s*(?:KNOWN AS|BELONGING TO|BELONGS TO|OWNED BY|SAID TO BELONG TO)\s*[:-]?\s*)([^\n-]{5,50})/i,
                /(?:PROPERTY\s*(?:OF|FOR)\s*|OWNER\s*[:-]?\s*)([^\n-]{5,50})/i,
                /^[\s-]*([A-Z][A-Z\s]{5,50}?(?:ADUDU|OBI|ADEGOKE|ADEWALE|ADEKUNLE|MOHAMMED|CHUKWU|OKAFOR))[\s-]*$/im
            ],
            
            // Address patterns
            address: [
                /(?:OF|AT|SITUATED AT|LOCATED AT|ADDRESS\s*[:-]?\s*)([^\n]{10,100}?(?:STREET|ROAD|AVENUE|LANE|CLOSE|WAY|VILLAGE|TOWN|CITY|LOCAL GOVERNMENT|L\.G\.A|STATE)[^\n]{0,50})/i,
                /(?:VIA|THROUGH|ALONG)\s*([^\n]{10,80})/i,
                /(?:IN\s*(?:THE\s*)?(?:AREA\s*OF\s*)?|WITHIN\s*)([^\n]{10,80}?(?:LOCAL GOVERNMENT|L\.G\.A|STATE)[^\n]{0,30})/i
            ],
            
            // Scale patterns
            scale: [
                /SCALE\s*[:-]?\s*(?:1\s*[:=]?\s*)?(\d{1,5}(?:\.\d{1,3})?)\s*(?::|;|,|$)/i,
                /SCALE\s*[:-]?\s*(?:[\d\.,]+\s*(?:m|meter|metre)s?\s*=\s*)?(\d+)\s*(?:units?|$)/i,
                /(?:1\s*[:=]\s*(\d{1,5}))/i
            ],
            
            // Area patterns
            area: [
                /AREA\s*[:-]?\s*(\d+(?:\.\d+)?)\s*(?:SQ\.?\s*(?:M|MTS?|METERS?|METRES?)|SQUARE\s*(?:M|METERS?|METRES?)|HECTARES?|ACRES?)/i,
                /(\d+(?:\.\d+)?)\s*(?:SQ\.?\s*(?:M|MTS?|METERS?|METRES?)|SQUARE\s*(?:M|METERS?|METRES?))\s*(?:AREA|OF LAND|SIZE)/i,
                /TOTAL\s*(?:AREA|LAND)\s*[:-]?\s*(\d+(?:\.\d+)?)\s*(?:SQ\.?\s*(?:M|MTS?))/i
            ],
            
            // Coordinate origin patterns
            origin: [
                /ORIGIN\s*[:-]?\s*(U\.?T\.?M\s*(?:ZONE\s*\d{1,2})?|MINNA\s+DATUM|WGS84|CLARKE\s+1880)/i,
                /DATUM\s*[:-]?\s*(U\.?T\.?M|MINNA|WGS)/i,
                /COORDINATE\s+SYSTEM\s*[:-]?\s*(U\.?T\.?M|WGS)/i
            ],
            
            // UTM Zone patterns
            zone: [
                /ZONE\s*(\d{1,2})\s*(?:[A-Z]|NORTH|SOUTH)?/i,
                /U\.?T\.?M\s*ZONE\s*(\d{1,2})/i,
                /(\d{1,2})\s*(?:[A-Z])\s*(?:ZONE|UTM)/i
            ],
            
            // Northing patterns (with N suffix)
            northing: [
                /(\d{6,8}\.\d{1,3})\s*(?:m\s*)?N\b/i,
                /N\s*[:=]?\s*(\d{6,8}\.\d{1,3})\s*(?:m|meter|metre)?/i,
                /NORTHING\s*[:-]?\s*(\d{6,8}\.\d{1,3})\s*(?:m)?/i,
                /\b(\d{6,8}\.\d{1,3})m?\s*(?:north|northing)\b/i
            ],
            
            // Easting patterns (with E suffix or implied)
            easting: [
                /(\d{6,8}\.\d{1,3})\s*(?:m\s*)?E\b/i,
                /E\s*[:=]?\s*(\d{6,8}\.\d{1,3})\s*(?:m|meter|metre)?/i,
                /EASTING\s*[:-]?\s*(\d{6,8}\.\d{1,3})\s*(?:m)?/i,
                /\b(\d{6,8}\.\d{1,3})m?\s*(?:east|easting)\b/i
            ],
            
            // Combined coordinate patterns (Easting, Northing)
            coordinates: [
                /(\d{6,8}\.\d{1,3})\s*[,;\s]\s*(\d{6,8}\.\d{1,3})/,
                /E\s*(\d{6,8}\.\d{1,3})\s*N\s*(\d{6,8}\.\d{1,3})/i,
                /(\d{6})\s+(\d{7})/  // For UTM without decimals
            ],
            
            // Plan number patterns
            planNumber: [
                /PLAN\s*(?:NO|NUMBER|#)\s*[:-]?\s*([A-Z]{0,3}\s*\d+\s*\/\s*\d+\s*\/\s*[A-Z\d]+(?:\s*\/\s*\d{3})?)/i,
                /(?:OG|LA|OY|ED|AB)\s*\d+\s*\/\s*\d+\s*\/\s*\d+/i,
                /CERTIFICATE\s+(?:NO|NUMBER)\s*[:-]?\s*([A-Z\d\/-]+)/i
            ],
            
            // Surveyor name patterns
            surveyor: [
                /(?:SURVEYED\s+BY|CERTIFIED\s+BY|MADE\s+BY|SURVEYOR)\s*[:-]?\s*([A-Z][A-Z\s,\.]{10,50}?mnis)/i,
                /(?:BY|PREPARED BY)\s*([A-Z][A-Z\s,\.]{10,50}(?:SURVEYOR|mnis))/i,
                /ALLI\s+BAZEET\s+D\.|ENG[R]?\.?\s+[A-Z][A-Z\s]+/i
            ],
            
            // Date patterns
            date: [
                /DATE\s*[:-]?\s*(\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4})/i,
                /(\d{1,2}\s*(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*\d{4})/i,
                /(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/
            ]
        };
        
        // Nigerian states and LGAs for validation
        this.nigerianStates = [
            'OGUN', 'LAGOS', 'OYO', 'OGUN STATE', 'LAGOS STATE', 'OYO STATE',
            'ONDO', 'EKITI', 'OSUN', 'OYO', 'KWARA', 'KOGI', 'EDO', 'DELTA',
            'RIVERS', 'BAYELSA', 'AKWA IBOM', 'CROSS RIVER', 'ABIA', 'IMO',
            'ANAMBRA', 'ENUGU', 'EBONYI', 'ABUJA', 'KANO', 'KADUNA', 'KATSINA'
        ];
        
        this.nigerianLGAs = [
            'OBAFEMI/OWODE', 'ABEOKUTA NORTH', 'ABEOKUTA SOUTH', 'ADO-ODO/OTA',
            'IFO', 'IJEBU ODE', 'IJEBU NORTH', 'IJEBU EAST', 'IKENNE', 'REMO NORTH',
            'SAGAMU', 'ODOGBOLU', 'IMEKO/AFON', 'EWEKORO', 'IKENNE'
        ];
    }
    
    // Main parsing function
    parseSurveyPlan(text) {
        const result = {
            title: null,
            address: {
                full: null,
                street: null,
                area: null,
                lga: null,
                state: null,
                via: null
            },
            scale: null,
            area: {
                value: null,
                unit: null,
                inAcres: null
            },
            coordinates: {
                origin: null,
                zone: null,
                datum: null,
                easting: null,
                northing: null,
                combined: null,
                points: []
            },
            planNumber: null,
            surveyor: null,
            date: null,
            confidence: 0,
            rawText: text
        };
        
        // Extract each field
        result.title = this.extractTitle(text);
        result.address = this.extractAddress(text);
        result.scale = this.extractScale(text);
        result.area = this.extractArea(text);
        result.coordinates = this.extractCoordinates(text);
        result.planNumber = this.extractPlanNumber(text);
        result.surveyor = this.extractSurveyor(text);
        result.date = this.extractDate(text);
        
        // Calculate confidence score
        result.confidence = this.calculateConfidence(result);
        
        return result;
    }
    
    extractTitle(text) {
        for (const pattern of this.patterns.title) {
            const match = text.match(pattern);
            if (match) {
                let title = match[1] || match[0];
                title = this.cleanText(title);
                
                // Common Nigerian name patterns
                if (title.match(/(?:MRS?|MISS|CHIEF|DR|ENGR?|ALHAJI|ALHAJA)\s+[A-Z]/)) {
                    return title;
                }
                
                // Look for names with typical Nigerian surname patterns
                const namePattern = /([A-Z][A-Z\s]{3,30}?(?:ADUDU|OBI|ADEGOKE|ADEWALE|ADEKUNLE|MOHAMMED|CHUKWU|OKAFOR|BELLO|HASSAN|YUSUF))/;
                const nameMatch = text.match(namePattern);
                if (nameMatch) {
                    return this.cleanText(nameMatch[1]);
                }
                
                return title;
            }
        }
        return null;
    }
    
    extractAddress(text) {
        const address = {
            full: null,
            street: null,
            area: null,
            lga: null,
            state: null,
            via: null
        };
        
        // Extract full address
        for (const pattern of this.patterns.address) {
            const match = text.match(pattern);
            if (match) {
                address.full = this.cleanText(match[1] || match[0]);
                break;
            }
        }
        
        // If no structured address found, try to extract from common patterns
        if (!address.full) {
            // Look for address-like patterns in the text
            const lines = text.split('\n');
            for (let i = 0; i < Math.min(lines.length, 10); i++) {
                const line = lines[i].trim();
                if (line.match(/OF\s+[A-Z]/) || line.match(/VIA\s+[A-Z]/) || line.match(/STREET|ROAD|AVENUE/i)) {
                    address.full = line;
                    break;
                }
            }
        }
        
        // Parse components from full address
        if (address.full) {
            // Extract street
            const streetMatch = address.full.match(/([A-Z][A-Z\s]{5,40}?(?:STREET|ROAD|AVENUE|LANE|CLOSE|WAY))/i);
            if (streetMatch) address.street = this.cleanText(streetMatch[1]);
            
            // Extract "VIA" location
            const viaMatch = address.full.match(/VIA\s+([A-Z][A-Z\s]{5,30})/i);
            if (viaMatch) address.via = this.cleanText(viaMatch[1]);
            
            // Extract LGA
            for (const lga of this.nigerianLGAs) {
                if (address.full.toUpperCase().includes(lga)) {
                    address.lga = lga;
                    break;
                }
            }
            
            // Extract State
            for (const state of this.nigerianStates) {
                if (address.full.toUpperCase().includes(state)) {
                    address.state = state.replace(' STATE', '');
                    break;
                }
            }
            
            // Extract area (everything before VIA or after street)
            if (address.full.includes('VIA')) {
                const parts = address.full.split('VIA');
                address.area = this.cleanText(parts[0]);
            } else if (address.street) {
                const idx = address.full.indexOf(address.street);
                if (idx > 0) {
                    address.area = this.cleanText(address.full.substring(0, idx));
                }
            }
        }
        
        return address;
    }
    
    extractScale(text) {
        for (const pattern of this.patterns.scale) {
            const match = text.match(pattern);
            if (match) {
                let scale = match[1] || match[0];
                scale = scale.replace(/[^\d\.]/g, '');
                
                // Standardize scale format
                if (scale && !isNaN(parseFloat(scale))) {
                    return `1:${parseInt(scale)}`;
                }
            }
        }
        return null;
    }
    
    extractArea(text) {
        const result = {
            value: null,
            unit: null,
            inAcres: null
        };
        
        for (const pattern of this.patterns.area) {
            const match = text.match(pattern);
            if (match) {
                const areaText = match[1] || match[0];
                const numMatch = areaText.match(/(\d+(?:\.\d+)?)/);
                
                if (numMatch) {
                    result.value = parseFloat(numMatch[1]);
                    
                    // Determine unit
                    if (areaText.match(/SQ\.?\s*M|SQUARE\s*M|MTS?/i)) {
                        result.unit = 'square meters';
                        result.inAcres = (result.value / 4046.86).toFixed(4);
                    } else if (areaText.match(/HECTARES?/i)) {
                        result.unit = 'hectares';
                        result.inAcres = (result.value * 2.47105).toFixed(4);
                    } else if (areaText.match(/ACRES?/i)) {
                        result.unit = 'acres';
                        result.inAcres = result.value.toFixed(4);
                    }
                    
                    break;
                }
            }
        }
        
        return result;
    }
    
    extractCoordinates(text) {
        const result = {
            origin: null,
            zone: null,
            datum: null,
            easting: null,
            northing: null,
            combined: null,
            points: []
        };
        
        // Extract origin/datum
        for (const pattern of this.patterns.origin) {
            const match = text.match(pattern);
            if (match) {
                result.origin = match[1] || match[0];
                
                // Infer datum from origin
                if (result.origin.toUpperCase().includes('MINNA')) {
                    result.datum = 'Minna Datum';
                } else if (result.origin.toUpperCase().includes('WGS')) {
                    result.datum = 'WGS84';
                } else if (result.origin.toUpperCase().includes('UTM')) {
                    result.datum = 'UTM';
                }
                break;
            }
        }
        
        // Extract zone
        for (const pattern of this.patterns.zone) {
            const match = text.match(pattern);
            if (match) {
                result.zone = match[1];
                break;
            }
        }
        
        // Extract northing
        for (const pattern of this.patterns.northing) {
            const match = text.match(pattern);
            if (match) {
                result.northing = parseFloat(match[1]);
                break;
            }
        }
        
        // Extract easting
        for (const pattern of this.patterns.easting) {
            const match = text.match(pattern);
            if (match) {
                result.easting = parseFloat(match[1]);
                break;
            }
        }
        
        // Try to find combined coordinates
        for (const pattern of this.patterns.coordinates) {
            // Ensure we use a global RegExp with matchAll to avoid runtime errors
            let re;
            try {
                const flags = (pattern.flags || '') + (pattern.flags && pattern.flags.includes('g') ? '' : 'g');
                re = pattern.global ? pattern : new RegExp(pattern.source, flags);
            } catch (e) {
                // Fallback: if pattern is not a RegExp or construction fails, skip it
                continue;
            }

            const matches = [...text.matchAll(re)];
            for (const match of matches) {
                const easting = parseFloat(match[1]);
                const northing = parseFloat(match[2]);

                // Validate reasonable UTM coordinates for Nigeria
                if (easting >= 200000 && easting <= 900000 && 
                    northing >= 600000 && northing <= 1500000) {
                    
                    if (!result.easting) result.easting = easting;
                    if (!result.northing) result.northing = northing;
                    
                    result.points.push({
                        easting: easting,
                        northing: northing,
                        label: `Point ${result.points.length + 1}`
                    });
                }
            }
        }
        
        // Create combined coordinate string
        if (result.easting && result.northing) {
            result.combined = `${result.easting.toFixed(3)}mE, ${result.northing.toFixed(3)}mN`;
            
            // Add zone if available
            if (result.zone) {
                result.combined += ` (Zone ${result.zone})`;
            }
            
            if (result.datum) {
                result.combined += ` [${result.datum}]`;
            }
        }
        
        return result;
    }
    
    extractPlanNumber(text) {
        for (const pattern of this.patterns.planNumber) {
            const match = text.match(pattern);
            if (match) {
                let planNo = match[1] || match[0];
                planNo = this.cleanText(planNo);
                
                // Standardize format
                planNo = planNo.replace(/\s+/g, ' ').trim();
                
                // Common Nigerian plan number patterns
                if (planNo.match(/^OG\/\d+\/\d+\/\d+$/i)) {
                    return planNo.toUpperCase();
                }
                
                return planNo;
            }
        }
        return null;
    }
    
    extractSurveyor(text) {
        for (const pattern of this.patterns.surveyor) {
            const match = text.match(pattern);
            if (match) {
                let surveyor = match[1] || match[0];
                surveyor = this.cleanText(surveyor);
                
                // Remove common prefixes
                surveyor = surveyor.replace(/^(?:BY|SURVEYED BY|CERTIFIED BY|MADE BY)\s*[:-]?\s*/i, '');
                
                // Look for Nigerian surveyor name patterns
                if (surveyor.match(/(?:ALLI\s+BAZEET|ENG[R]?\.|SURVEYOR)/i)) {
                    return surveyor;
                }
                
                // Look for "mnis" designation
                const mnisMatch = text.match(/([A-Z][A-Z\s,\.]{10,50}mnis)/);
                if (mnisMatch) {
                    return this.cleanText(mnisMatch[1]);
                }
                
                return surveyor;
            }
        }
        return null;
    }
    
    extractDate(text) {
        for (const pattern of this.patterns.date) {
            const match = text.match(pattern);
            if (match) {
                let dateStr = match[1] || match[0];
                dateStr = this.cleanText(dateStr);
                
                // Try to parse date
                try {
                    // Handle DD - MM - YYYY format
                    if (dateStr.match(/\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4}/)) {
                        const parts = dateStr.split(/[-/]/).map(p => parseInt(p.trim()));
                        if (parts.length === 3) {
                            const [day, month, year] = parts;
                            if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 2000) {
                                return new Date(year, month - 1, day).toLocaleDateString();
                            }
                        }
                    }
                    
                    // Return as-is if parsing fails
                    return dateStr;
                } catch (e) {
                    return dateStr;
                }
            }
        }
        return null;
    }
    
    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/^[\s\-:_]+|[\s\-:_]+$/g, '')  // Remove leading/trailing dashes/spaces
            .replace(/\s+/g, ' ')                   // Normalize spaces
            .trim();
    }
    
    calculateConfidence(result) {
        let score = 0;
        let totalPossible = 0;
        
        // Title (10 points)
        totalPossible += 10;
        if (result.title) score += 10;
        
        // Address components (30 points)
        totalPossible += 30;
        if (result.address.full) score += 10;
        if (result.address.state) score += 10;
        if (result.address.lga) score += 10;
        
        // Scale (10 points)
        totalPossible += 10;
        if (result.scale) score += 10;
        
        // Area (10 points)
        totalPossible += 10;
        if (result.area.value) score += 10;
        
        // Coordinates (20 points)
        totalPossible += 20;
        if (result.coordinates.easting && result.coordinates.northing) score += 20;
        else if (result.coordinates.easting || result.coordinates.northing) score += 10;
        
        // Plan Number (10 points)
        totalPossible += 10;
        if (result.planNumber) score += 10;
        
        // Surveyor (5 points)
        totalPossible += 5;
        if (result.surveyor) score += 5;
        
        // Date (5 points)
        totalPossible += 5;
        if (result.date) score += 5;
        
        return totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    }
    
    // Train the parser with example data
    trainWithExamples(examples) {
        // This method can be expanded to learn from examples
        console.log('Training parser with', examples.length, 'examples');
        
        // Update patterns based on examples
        examples.forEach(example => {
            // Extract patterns from successful examples
            // This is a simplified version - in production, you'd use ML
            this.learnFromExample(example.text, example.parsed);
        });
        
        return this;
    }
    
    learnFromExample(text, parsedData) {
        // Simple pattern learning - extract and add new patterns
        // This is a placeholder for more sophisticated learning
        
        if (parsedData.title && !this.patterns.title.some(p => text.match(p))) {
            // Extract title pattern
            const titlePattern = this.createPatternFromText(parsedData.title, 'title');
            if (titlePattern) {
                this.patterns.title.push(titlePattern);
            }
        }
        
        // Similar learning for other fields...
        
        console.log('Learned new patterns from example');
    }
    
    createPatternFromText(text, fieldType) {
        // Create a regex pattern from text
        // This is simplified - real implementation would be more sophisticated
        
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        switch(fieldType) {
            case 'title':
                return new RegExp(escaped, 'i');
            case 'planNumber':
                // For plan numbers, create pattern that matches format
                const pattern = escaped.replace(/\d/g, '\\d').replace(/\//g, '\\/');
                return new RegExp(pattern, 'i');
            default:
                return new RegExp(escaped, 'i');
        }
    }
    
    // Export parsed data as structured object
    exportAsJSON(parsedData) {
        return {
            metadata: {
                parser: "SurveyPlanParser v1.0",
                timestamp: new Date().toISOString(),
                confidence: parsedData.confidence
            },
            surveyPlan: {
                identification: {
                    title: parsedData.title,
                    planNumber: parsedData.planNumber,
                    date: parsedData.date
                },
                location: {
                    fullAddress: parsedData.address.full,
                    street: parsedData.address.street,
                    area: parsedData.address.area,
                    localGovernment: parsedData.address.lga,
                    state: parsedData.address.state,
                    via: parsedData.address.via
                },
                technicalDetails: {
                    scale: parsedData.scale,
                    area: {
                        value: parsedData.area.value,
                        unit: parsedData.area.unit,
                        inAcres: parsedData.area.inAcres
                    }
                },
                coordinates: {
                    system: parsedData.coordinates.origin,
                    datum: parsedData.coordinates.datum,
                    zone: parsedData.coordinates.zone,
                    easting: parsedData.coordinates.easting,
                    northing: parsedData.coordinates.northing,
                    combined: parsedData.coordinates.combined,
                    controlPoints: parsedData.coordinates.points
                },
                personnel: {
                    surveyor: parsedData.surveyor
                }
            },
            rawText: parsedData.rawText.substring(0, 500) + '...' // First 500 chars only
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SurveyPlanParser = SurveyPlanParser;
}