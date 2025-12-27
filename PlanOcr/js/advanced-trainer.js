/* AdvancedSurveyTrainer
   Lightweight client-side trainer to improve survey-plan field extraction.
   - Stores labeled examples in localStorage
   - Builds simple heuristics (known values, label hints, fallback regexes)
   - Exposes methods: addExample, train, extract, exportModel, importModel, clear
*/
(function(){
    class AdvancedSurveyTrainer {
        constructor(storageKey = 'advancedSurveyModel'){
            this.storageKey = storageKey;
            this.examplesKey = storageKey + '.examples';
            this.model = { fields: {}, hints: {} };
            this.examples = [];
            this.load();
        }

        load(){
            try{
                const m = localStorage.getItem(this.storageKey);
                const e = localStorage.getItem(this.examplesKey);
                if(m) this.model = JSON.parse(m);
                if(e) this.examples = JSON.parse(e);
            }catch(e){ console.warn('AdvancedSurveyTrainer load error', e); }
        }

        save(){
            try{
                localStorage.setItem(this.storageKey, JSON.stringify(this.model));
                localStorage.setItem(this.examplesKey, JSON.stringify(this.examples));
            }catch(e){ console.warn('AdvancedSurveyTrainer save error', e); }
        }

        addExample(text, labels){
            // labels: object mapping fieldName -> string value
            this.examples.push({ text, labels, created: Date.now() });
            this.save();
        }

        clear(){
            this.model = { fields: {}, hints: {} };
            this.examples = [];
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.examplesKey);
        }

        train(){
            // Build simple model from examples
            const fields = {};
            const hints = {};

            for(const ex of this.examples){
                const text = ex.text;
                for(const [field, value] of Object.entries(ex.labels||{})){
                    if(!fields[field]) fields[field] = { values: new Set() };
                    if(value && value.toString().trim()) fields[field].values.add(value.toString().trim());

                    // capture hint tokens around first occurrence
                    const idx = text.indexOf(value);
                    if(idx !== -1){
                        const before = text.substring(Math.max(0, idx-40), idx).trim();
                        const tokens = before.split(/\s+/).slice(-4).map(t=>t.replace(/[:.,]/g,''));
                        if(!hints[field]) hints[field] = new Set();
                        tokens.forEach(t=>{ if(t) hints[field].add(t.toLowerCase()); });
                    }
                }
            }

            // convert sets to arrays
            for(const f of Object.keys(fields)){
                fields[f].values = Array.from(fields[f].values);
            }
            for(const h of Object.keys(hints)) hints[h] = Array.from(hints[h]);

            this.model.fields = fields;
            this.model.hints = hints;
            this.model.trainedAt = Date.now();
            this.save();
            return this.model;
        }

        _searchKnown(text, field){
            const f = this.model.fields[field];
            if(!f || !f.values) return null;
            for(const v of f.values){
                if(!v) continue;
                if(text.includes(v)) return v;
                // relaxed match
                const norm = v.replace(/\s+/g,' ').trim();
                if(norm && text.indexOf(norm) !== -1) return norm;
            }
            return null;
        }

        _hintExtract(text, field){
            const hs = this.model.hints[field] || [];
            if(!hs.length) return null;
            // try lines
            const lines = text.split(/\r?\n/);
            for(const line of lines){
                const l = line.toLowerCase();
                for(const hint of hs){
                    if(hint && l.includes(hint)){
                        // attempt to extract after colon or last token
                        const m = line.match(/[:\-\|]\s*(.+)$/);
                        if(m && m[1]) return m[1].trim();
                        // fallback: take words after hint
                        const idx = l.indexOf(hint);
                        const after = line.substring(idx + hint.length).trim();
                        if(after) return after.split(/\s{2,}|,|;/)[0].trim();
                    }
                }
            }
            return null;
        }

        _fallbackRegex(text, field){
            const patterns = {
                'easting': /\b(\d{4,7}(?:\.\d+)?)\b/g,
                'northing': /\b(\d{4,7}(?:\.\d+)?)\b/g,
                'zone': /\b(zone\s*\d{1,2}|\b\d{1,2}[A-Z]\b)/i,
                'date': /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/,
                'area': /(\d+[\.,]?\d*\s*(?:sqm|m2|sq\s?m|ha|acres)?)/i,
                'planNumber': /(plan\s*(no\.?|number)?\s*[:#\-]?\s*\w[\w\-\/]*)/i
            };
            const p = patterns[field];
            if(!p) return null;
            const m = text.match(p);
            if(!m) return null;
            return Array.isArray(m[0])? m[0] : m[0];
        }

        extract(text){
            const out = {};
            const fieldNames = Object.keys(this.model.fields).length ? Object.keys(this.model.fields) : [
                'title','planNumber','date','fullAddress','LGA','State','scale','area','system','datum','zone','easting','northing','surveyor'
            ];

            for(const field of fieldNames){
                let v = this._searchKnown(text, field);
                if(!v) v = this._hintExtract(text, field);
                if(!v) v = this._fallbackRegex(text, field);
                out[field] = v || null;
            }
            return out;
        }

        exportModel(){
            return JSON.stringify({ model: this.model, examples: this.examples }, null, 2);
        }

        importModel(json){
            try{
                const o = typeof json === 'string' ? JSON.parse(json) : json;
                if(o.model) this.model = o.model;
                if(o.examples) this.examples = o.examples;
                this.save();
                return true;
            }catch(e){ console.warn('importModel error', e); return false; }
        }

        // Persist examples to server-side storage (api/trainer.php)
        async saveToServer(endpoint = '/api/trainer.php', token = ''){
            try{
                const headers = { 'Content-Type': 'application/json' };
                if(token) headers['X-TRAINER-TOKEN'] = token;
                else if(window.TRAINER_TOKEN) headers['X-TRAINER-TOKEN'] = window.TRAINER_TOKEN;
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ examples: this.examples })
                });
                return await res.json();
            }catch(e){ console.warn('saveToServer error', e); return { error: e.message || String(e) }; }
        }

        // Load examples from server and replace local examples
        async loadFromServer(endpoint = '/api/trainer.php', token = ''){
            try{
                const headers = {};
                if(token) headers['X-TRAINER-TOKEN'] = token;
                else if(window.TRAINER_TOKEN) headers['X-TRAINER-TOKEN'] = window.TRAINER_TOKEN;
                const res = await fetch(endpoint, { headers });
                if(!res.ok) throw new Error('Load failed: ' + res.status);
                const j = await res.json();
                if(j && Array.isArray(j.examples)){
                    this.examples = j.examples;
                    this.save();
                    return { ok: true, count: this.examples.length };
                }
                return { ok: false };
            }catch(e){ console.warn('loadFromServer error', e); return { error: e.message || String(e) }; }
        }

        // Delete example on server (by index or id)
        async deleteOnServer(endpoint = '/api/trainer.php', index = null, id = null, token = ''){
            try{
                const headers = { 'Content-Type': 'application/json' };
                if(token) headers['X-TRAINER-TOKEN'] = token;
                else if(window.TRAINER_TOKEN) headers['X-TRAINER-TOKEN'] = window.TRAINER_TOKEN;
                const body = { action: 'delete' };
                if (index !== null) body.index = parseInt(index);
                if (id !== null) body.id = id;
                const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
                return await res.json();
            }catch(e){ console.warn('deleteOnServer error', e); return { error: e.message || String(e) }; }
        }

        // Clear examples on server
        async clearOnServer(endpoint = '/api/trainer.php', token = ''){
            try{
                const headers = { 'Content-Type': 'application/json' };
                if(token) headers['X-TRAINER-TOKEN'] = token;
                else if(window.TRAINER_TOKEN) headers['X-TRAINER-TOKEN'] = window.TRAINER_TOKEN;
                const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ action: 'clear' }) });
                return await res.json();
            }catch(e){ console.warn('clearOnServer error', e); return { error: e.message || String(e) }; }
        }
    }

    // expose globally
    window.AdvancedSurveyTrainer = new AdvancedSurveyTrainer();
})();
