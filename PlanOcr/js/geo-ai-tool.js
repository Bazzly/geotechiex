// Enhanced Geo AI Tool with Survey Plan Recognition
class GeoAIToolEnhanced extends GeoAITool {
    constructor() {
        super(); // Call parent constructor
        
        // Initialize survey plan parser
        this.surveyParser = new SurveyPlanParser();
        this.parsedSurveyData = null;
        
        // Add survey analysis button
        this.addSurveyAnalysisButton();
        
        // Load training examples
        this.loadTrainingExamples();
    }
    
    addSurveyAnalysisButton() {
        // Create and add survey analysis button to UI
        const buttonContainer = document.querySelector('.mt-6.grid.grid-cols-2.gap-3');
        // Do not create if page already supplies a surveyAnalyzeBtn
        if (document.getElementById('surveyAnalyzeBtn')) return;
        if (buttonContainer) {
            const surveyBtn = document.createElement('button');
            surveyBtn.id = 'surveyAnalyzeBtn';
            surveyBtn.className = 'bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center col-span-2';
            surveyBtn.innerHTML = '<i class="fas fa-map mr-2"></i> Analyze Survey Plan';
            surveyBtn.addEventListener('click', () => this.analyzeSurveyPlan());
            
            buttonContainer.appendChild(surveyBtn);
        }
    }
    
    async loadTrainingExamples() {
        // Load training data from localStorage or API
        try {
            const savedExamples = localStorage.getItem('surveyPlanExamples');
            if (savedExamples) {
                const examples = JSON.parse(savedExamples);
                this.surveyParser.trainWithExamples(examples);
                console.log('Loaded', examples.length, 'training examples');
            }
        } catch (error) {
            console.warn('Could not load training examples:', error);
        }
    }
    
    async analyzeSurveyPlan() {
        if (!this.extractedText) {
            this.updateStatus('Please extract text first.', 'error');
            return;
        }
        
        this.updateStatus('Analyzing survey plan structure...', 'processing');
        
        try {
            // Parse the survey plan
            this.parsedSurveyData = this.surveyParser.parseSurveyPlan(this.extractedText);
            
            // Display results
            this.displaySurveyAnalysis();
            
            // Add to chat for AI interaction
            this.addSurveyAnalysisToChat();
            
            this.updateStatus(`Survey plan analyzed (${this.parsedSurveyData.confidence}% confidence)`, 'success');
            
            // Save as training example if confidence is high
            if (this.parsedSurveyData.confidence > 70) {
                this.saveAsTrainingExample();
            }
            
        } catch (error) {
            console.error('Survey analysis error:', error);
            this.updateStatus('Error analyzing survey plan structure.', 'error');
        }
    }
    
    displaySurveyAnalysis() {
        // Create or update survey analysis panel
        let analysisPanel = document.getElementById('surveyAnalysisPanel');
        
        if (!analysisPanel) {
            analysisPanel = document.createElement('div');
            analysisPanel.id = 'surveyAnalysisPanel';
            analysisPanel.className = 'bg-gray-800 rounded-xl p-6 shadow-lg mt-6';
            
            // Insert after geoDataPanel or in appropriate location
            const geoPanel = document.getElementById('geoDataPanel');
            if (geoPanel) {
                geoPanel.parentNode.insertBefore(analysisPanel, geoPanel.nextSibling);
            } else {
                document.querySelector('.lg\\:col-span-1').appendChild(analysisPanel);
            }
        }
        
        const data = this.parsedSurveyData;
        
        analysisPanel.innerHTML = `
            <h2 class="text-xl font-bold text-white mb-4 flex items-center">
                <i class="fas fa-file-contract mr-2 text-teal-400"></i> Survey Plan Analysis
                <span class="ml-auto text-sm font-normal bg-${data.confidence > 70 ? 'green' : data.confidence > 40 ? 'yellow' : 'red'}-600 px-2 py-1 rounded">
                    ${data.confidence}% Confidence
                </span>
            </h2>
            
            <div class="space-y-4">
                <!-- Identification -->
                <div class="bg-gray-900/50 p-4 rounded-lg">
                    <h3 class="font-semibold text-white mb-2 flex items-center">
                        <i class="fas fa-id-card mr-2 text-blue-400"></i> Identification
                    </h3>
                    <div class="text-sm space-y-1">
                        <div><span class="text-gray-400">Title:</span> <span class="text-white font-medium">${data.title || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Plan No:</span> <span class="text-white font-medium">${data.planNumber || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Date:</span> <span class="text-white font-medium">${data.date || 'Not found'}</span></div>
                    </div>
                </div>
                
                <!-- Location -->
                <div class="bg-gray-900/50 p-4 rounded-lg">
                    <h3 class="font-semibold text-white mb-2 flex items-center">
                        <i class="fas fa-map-marker-alt mr-2 text-green-400"></i> Location
                    </h3>
                    <div class="text-sm space-y-1">
                        <div><span class="text-gray-400">Full Address:</span> <span class="text-white">${data.address.full || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Street:</span> <span class="text-white">${data.address.street || 'Not found'}</span></div>
                        <div><span class="text-gray-400">LGA:</span> <span class="text-white">${data.address.lga || 'Not found'}</span></div>
                        <div><span class="text-gray-400">State:</span> <span class="text-white">${data.address.state || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Via:</span> <span class="text-white">${data.address.via || 'Not found'}</span></div>
                    </div>
                </div>
                
                <!-- Technical Details -->
                <div class="bg-gray-900/50 p-4 rounded-lg">
                    <h3 class="font-semibold text-white mb-2 flex items-center">
                        <i class="fas fa-ruler-combined mr-2 text-yellow-400"></i> Technical Details
                    </h3>
                    <div class="text-sm space-y-1">
                        <div><span class="text-gray-400">Scale:</span> <span class="text-white font-medium">${data.scale || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Area:</span> <span class="text-white font-medium">${data.area.value ? `${data.area.value} ${data.area.unit}` : 'Not found'}</span></div>
                        ${data.area.inAcres ? `<div><span class="text-gray-400">Area (Acres):</span> <span class="text-white">${data.area.inAcres} acres</span></div>` : ''}
                    </div>
                </div>
                
                <!-- Coordinates -->
                <div class="bg-gray-900/50 p-4 rounded-lg">
                    <h3 class="font-semibold text-white mb-2 flex items-center">
                        <i class="fas fa-crosshairs mr-2 text-purple-400"></i> Coordinates
                    </h3>
                    <div class="text-sm space-y-1">
                        <div><span class="text-gray-400">System:</span> <span class="text-white">${data.coordinates.origin || 'Not found'}</span></div>
                        <div><span class="text-gray-400">Datum:</span> <span class="text-white">${data.coordinates.datum || 'Inferred from origin'}</span></div>
                        <div><span class="text-gray-400">Zone:</span> <span class="text-white">${data.coordinates.zone || 'Not specified'}</span></div>
                        <div><span class="text-gray-400">Easting:</span> <span class="text-white font-medium">${data.coordinates.easting ? data.coordinates.easting.toFixed(3) + 'mE' : 'Not found'}</span></div>
                        <div><span class="text-gray-400">Northing:</span> <span class="text-white font-medium">${data.coordinates.northing ? data.coordinates.northing.toFixed(3) + 'mN' : 'Not found'}</span></div>
                        ${data.coordinates.combined ? `<div><span class="text-gray-400">Combined:</span> <span class="text-white font-bold">${data.coordinates.combined}</span></div>` : ''}
                    </div>
                </div>
                
                <!-- Surveyor -->
                ${data.surveyor ? `
                <div class="bg-gray-900/50 p-4 rounded-lg">
                    <h3 class="font-semibold text-white mb-2 flex items-center">
                        <i class="fas fa-user-tie mr-2 text-pink-400"></i> Surveyor
                    </h3>
                    <div class="text-sm">
                        <span class="text-white">${data.surveyor}</span>
                    </div>
                </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="flex space-x-2 pt-4">
                    <button id="exportSurveyJson" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition flex items-center justify-center">
                        <i class="fas fa-code mr-2"></i> Export as JSON
                    </button>
                    <button id="correctSurveyData" class="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition flex items-center justify-center">
                        <i class="fas fa-edit mr-2"></i> Correct Data
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners for new buttons
        document.getElementById('exportSurveyJson')?.addEventListener('click', () => this.exportSurveyAsJSON());
        document.getElementById('correctSurveyData')?.addEventListener('click', () => this.showDataCorrectionForm());
        
        // Show the panel
        analysisPanel.classList.remove('hidden');
    }
    
    addSurveyAnalysisToChat() {
        const data = this.parsedSurveyData;
        
        let analysis = "## 📋 Survey Plan Analysis Complete\n\n";
        
        analysis += "### 📍 **Identification**\n";
        analysis += `- **Title**: ${data.title || 'Not identified'}\n`;
        analysis += `- **Plan Number**: ${data.planNumber || 'Not found'}\n`;
        analysis += `- **Date**: ${data.date || 'Not specified'}\n\n`;
        
        analysis += "### 🗺️ **Location**\n";
        analysis += `- **Full Address**: ${data.address.full || 'Not found'}\n`;
        if (data.address.street) analysis += `- **Street**: ${data.address.street}\n`;
        if (data.address.lga) analysis += `- **LGA**: ${data.address.lga}\n`;
        if (data.address.state) analysis += `- **State**: ${data.address.state}\n`;
        if (data.address.via) analysis += `- **Via**: ${data.address.via}\n\n`;
        
        analysis += "### 📐 **Technical Details**\n";
        analysis += `- **Scale**: ${data.scale || 'Not specified'}\n`;
        if (data.area.value) {
            analysis += `- **Area**: ${data.area.value} ${data.area.unit || 'units'}\n`;
            if (data.area.inAcres) analysis += `- **Area in Acres**: ${data.area.inAcres}\n`;
        }
        analysis += "\n";
        
        analysis += "### 🎯 **Coordinates**\n";
        analysis += `- **Coordinate System**: ${data.coordinates.origin || 'Not specified'}\n`;
        if (data.coordinates.datum) analysis += `- **Datum**: ${data.coordinates.datum}\n`;
        if (data.coordinates.zone) analysis += `- **Zone**: ${data.coordinates.zone}\n`;
        if (data.coordinates.easting) analysis += `- **Easting**: ${data.coordinates.easting.toFixed(3)}mE\n`;
        if (data.coordinates.northing) analysis += `- **Northing**: ${data.coordinates.northing.toFixed(3)}mN\n`;
        if (data.coordinates.combined) analysis += `- **Combined Point**: ${data.coordinates.combined}\n\n`;
        
        analysis += `**Confidence Level**: ${data.confidence}%\n`;
        
        if (data.confidence < 70) {
            analysis += "\n⚠️ **Note**: Confidence is below 70%. Please verify the extracted data.";
        }
        
        this.addAIMessage(analysis);
    }
    
    exportSurveyAsJSON() {
        if (!this.parsedSurveyData) {
            this.updateStatus('No survey data to export.', 'error');
            return;
        }
        
        const jsonData = this.surveyParser.exportAsJSON(this.parsedSurveyData);
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        // Create and trigger download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey_plan_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.updateStatus('Survey data exported as JSON!', 'success');
    }
    
    showDataCorrectionForm() {
        // Create modal for data correction
        const modal = document.createElement('div');
        modal.id = 'correctionModal';
        modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-white">Correct Survey Plan Data</h3>
                    <button id="closeCorrectionModal" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input type="text" id="correctTitle" value="${this.parsedSurveyData.title || ''}" 
                               class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Plan No.</label>
                        <input type="text" id="correctPlanNo" value="${this.parsedSurveyData.planNumber || ''}" 
                               class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Date</label>
                            <input type="text" id="correctDate" value="${this.parsedSurveyData.date || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Scale</label>
                            <input type="text" id="correctScale" value="${this.parsedSurveyData.scale || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Full Address</label>
                        <input type="text" id="correctAddress" value="${this.parsedSurveyData.address?.full || ''}" 
                               class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">LGA</label>
                            <input type="text" id="correctLga" value="${this.parsedSurveyData.address?.lga || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">State</label>
                            <input type="text" id="correctState" value="${this.parsedSurveyData.address?.state || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Area (sq. meters)</label>
                            <input type="number" step="0.001" id="correctArea" 
                                   value="${this.parsedSurveyData.area?.value || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Area Unit</label>
                            <input type="text" id="correctAreaUnit" value="${this.parsedSurveyData.area?.unit || 'square meters'}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">System</label>
                            <input type="text" id="correctSystem" value="${this.parsedSurveyData.coordinates?.origin || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Datum</label>
                            <input type="text" id="correctDatum" value="${this.parsedSurveyData.coordinates?.datum || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Zone</label>
                            <input type="text" id="correctZone" value="${this.parsedSurveyData.coordinates?.zone || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">(Via not required)</label>
                            <input type="text" disabled class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-400" placeholder="Via not required">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Easting</label>
                            <input type="number" step="0.001" id="correctEasting" 
                                   value="${this.parsedSurveyData.coordinates?.easting || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Northing</label>
                            <input type="number" step="0.001" id="correctNorthing" 
                                   value="${this.parsedSurveyData.coordinates?.northing || ''}" 
                                   class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button id="saveCorrections" class="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg">
                            Save Corrections
                        </button>
                        <button id="cancelCorrections" class="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('closeCorrectionModal').addEventListener('click', () => modal.remove());
        document.getElementById('cancelCorrections').addEventListener('click', () => modal.remove());
        document.getElementById('saveCorrections').addEventListener('click', () => {
            this.saveCorrectedData(modal);
            modal.remove();
        });
    }
    
    saveCorrectedData(modal) {
        // Update parsed data with corrections
        try {
            this.parsedSurveyData.title = document.getElementById('correctTitle').value || this.parsedSurveyData.title;
            this.parsedSurveyData.planNumber = document.getElementById('correctPlanNo').value || this.parsedSurveyData.planNumber;
            this.parsedSurveyData.date = document.getElementById('correctDate').value || this.parsedSurveyData.date;
            this.parsedSurveyData.scale = document.getElementById('correctScale').value || this.parsedSurveyData.scale;

            // Address fields
            this.parsedSurveyData.address = this.parsedSurveyData.address || {};
            this.parsedSurveyData.address.full = document.getElementById('correctAddress').value || this.parsedSurveyData.address.full;
            this.parsedSurveyData.address.lga = document.getElementById('correctLga').value || this.parsedSurveyData.address.lga;
            this.parsedSurveyData.address.state = document.getElementById('correctState').value || this.parsedSurveyData.address.state;

            // Area
            this.parsedSurveyData.area = this.parsedSurveyData.area || {};
            const areaVal = parseFloat(document.getElementById('correctArea').value);
            if (!isNaN(areaVal)) this.parsedSurveyData.area.value = areaVal;
            const areaUnit = document.getElementById('correctAreaUnit').value;
            if (areaUnit) this.parsedSurveyData.area.unit = areaUnit;

            // Coordinates and system
            this.parsedSurveyData.coordinates = this.parsedSurveyData.coordinates || {};
            this.parsedSurveyData.coordinates.origin = document.getElementById('correctSystem').value || this.parsedSurveyData.coordinates.origin;
            this.parsedSurveyData.coordinates.datum = document.getElementById('correctDatum').value || this.parsedSurveyData.coordinates.datum;
            this.parsedSurveyData.coordinates.zone = document.getElementById('correctZone').value || this.parsedSurveyData.coordinates.zone;

            const eastingVal = parseFloat(document.getElementById('correctEasting').value);
            const northingVal = parseFloat(document.getElementById('correctNorthing').value);
            if (!isNaN(eastingVal)) this.parsedSurveyData.coordinates.easting = eastingVal;
            if (!isNaN(northingVal)) this.parsedSurveyData.coordinates.northing = northingVal;

            // Recalculate combined coordinates
            if (this.parsedSurveyData.coordinates.easting && this.parsedSurveyData.coordinates.northing) {
                this.parsedSurveyData.coordinates.combined = 
                    `${this.parsedSurveyData.coordinates.easting.toFixed(3)}mE, ${this.parsedSurveyData.coordinates.northing.toFixed(3)}mN`;
                if (this.parsedSurveyData.coordinates.zone) this.parsedSurveyData.coordinates.combined += ` (Zone ${this.parsedSurveyData.coordinates.zone})`;
                if (this.parsedSurveyData.coordinates.datum) this.parsedSurveyData.coordinates.combined += ` [${this.parsedSurveyData.coordinates.datum}]`;
            }

            // Update display
            this.displaySurveyAnalysis();

            // Save as training example
            this.saveAsTrainingExample(true);

            this.updateStatus('Corrections saved and added to training data!', 'success');
        } catch (err) {
            console.error('Error saving corrections', err);
            this.updateStatus('Failed to save corrections.', 'error');
        }
    }
    
    saveAsTrainingExample(isCorrected = false) {
        try {
            // Get existing examples
            const existing = localStorage.getItem('surveyPlanExamples');
            const examples = existing ? JSON.parse(existing) : [];
            
            // Add new example
            const newExample = {
                text: this.extractedText.substring(0, 1000), // First 1000 chars
                parsed: this.parsedSurveyData,
                timestamp: new Date().toISOString(),
                corrected: isCorrected
            };
            
            examples.push(newExample);
            
            // Keep only last 50 examples to avoid storage issues
            if (examples.length > 50) {
                examples.shift();
            }
            
            // Save back to localStorage
            localStorage.setItem('surveyPlanExamples', JSON.stringify(examples));
            
            // Retrain parser
            this.surveyParser.trainWithExamples(examples);
            
            console.log('Saved training example. Total:', examples.length);
            
        } catch (error) {
            console.warn('Could not save training example:', error);
        }
    }
    
    // Enhanced AI response for survey-specific questions
    generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Survey plan specific questions
        if (this.parsedSurveyData && (
            lowerMessage.includes('survey plan') ||
            lowerMessage.includes('plan title') ||
            lowerMessage.includes('owner') ||
            lowerMessage.includes('address of') ||
            lowerMessage.includes('coordinate of') ||
            lowerMessage.includes('scale of') ||
            lowerMessage.includes('area of')
        )) {
            return this.generateSurveySpecificResponse(lowerMessage);
        }
        
        // Fall back to parent's response generation
        return super.generateAIResponse(userMessage);
    }
    
    generateSurveySpecificResponse(query) {
        const data = this.parsedSurveyData;
        
        if (query.includes('title') || query.includes('owner') || query.includes('who own')) {
            return `The survey plan title is: **${data.title || 'Not identified'}**. ` +
                   `This appears to be the property owner's name.`;
                   
        } else if (query.includes('address') || query.includes('location') || query.includes('where')) {
            let response = `**Property Location:**\n`;
            if (data.address.full) response += `- Full Address: ${data.address.full}\n`;
            if (data.address.street) response += `- Street: ${data.address.street}\n`;
            if (data.address.lga) response += `- Local Government: ${data.address.lga}\n`;
            if (data.address.state) response += `- State: ${data.address.state}\n`;
            return response;
            
        } else if (query.includes('coordinate') || query.includes('easting') || query.includes('northing')) {
            let response = `**Coordinate Information:**\n`;
            if (data.coordinates.combined) {
                response += `- Primary Coordinate: ${data.coordinates.combined}\n`;
                response += `- This represents the starting/reference point on the survey plan.\n`;
            }
            if (data.coordinates.origin) response += `- Coordinate System: ${data.coordinates.origin}\n`;
            if (data.coordinates.zone) response += `- UTM Zone: ${data.coordinates.zone}\n`;
            return response;
            
        } else if (query.includes('scale')) {
            return `The survey plan scale is **${data.scale || 'not specified'}**. ` +
                   `This means 1 unit on the plan represents ${data.scale ? data.scale.split(':')[1] : 'unknown'} units on the ground.`;
                   
        } else if (query.includes('area') || query.includes('size') || query.includes('sq.m')) {
            if (data.area.value) {
                return `The total area of the survey plan is **${data.area.value} ${data.area.unit || 'square units'}**. ` +
                       `This is approximately **${data.area.inAcres || 'unknown'} acres**.`;
            }
            return `The area information was not found in the survey plan.`;
            
        } else if (query.includes('surveyor') || query.includes('who made') || query.includes('prepared by')) {
            if (data.surveyor) {
                return `The survey plan was prepared by **${data.surveyor}**.`;
            }
            return `The surveyor's information was not found in the document.`;
            
        } else if (query.includes('plan number') || query.includes('certificate')) {
            if (data.planNumber) {
                return `The survey plan number is **${data.planNumber}**.`;
            }
            return `The plan number was not found in the document.`;
        }
        
        // Default response for survey plan queries
        return `I've analyzed this survey plan with ${data.confidence}% confidence. ` +
               `You can ask me about: the plan title, property location, coordinates, scale, area, or surveyor details.`;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.GeoAIToolEnhanced = GeoAIToolEnhanced;
}