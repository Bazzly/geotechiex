// Minimal base Geo AI Tool class used by PlanOcr pages
class GeoAITool {
    constructor() {
        this.extractedText = '';
        this.geoData = { area: { unit: 'sq.m' }, coordinates: {} };
    }

    updateStatus(message, level = 'info') {
        const el = document.getElementById('status');
        if (el) el.textContent = typeof message === 'string' ? message : JSON.stringify(message);
        console.log('[GeoAITool status]', level, message);
    }

    addAIMessage(html) {
        const container = document.getElementById('chatContainer');
        if (!container) return console.log('[GeoAITool AI]', html);
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-message bg-blue-900/30 p-4 rounded-lg mb-3';
        wrapper.innerHTML = `<div class="font-semibold text-blue-300 mb-1">Geo AI</div><div class="text-gray-200">${html}</div>`;
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
    }

    generateAIResponse(message) {
        const msg = (message || '').toString().trim();
        if (!msg) {
            return "Please type a question about the survey plan (e.g. title, plan number, address, coordinates, scale, area).";
        }

        // Heuristic for unclear/gibberish input
        const shortOrNonsense = msg.length < 3 || /^[^a-zA-Z0-9\s]+$/.test(msg);
        if (shortOrNonsense) {
            if (this.parsedSurveyData) {
                return "I didn't understand that. Try asking about: Title, Plan No., Date, Full Address, LGA, State, Scale, Area, System, Datum, Zone, Easting, Northing.";
            }
            return "I didn't understand that. Upload and analyze a survey plan, then ask things like 'What is the plan number?' or 'What are the coordinates?'";
        }

        if (this.parsedSurveyData) {
            return `I received your message: ${message}. You can also ask me specific questions about the analyzed survey plan (title, address, coordinates, scale, area, surveyor).`;
        }

        return `I received your message: ${message}`;
    }
}

if (typeof window !== 'undefined') window.GeoAITool = GeoAITool;
