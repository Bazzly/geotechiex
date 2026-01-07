// GeoAI Chat — Main chat logic and command handler
(function() {
  const messagesDiv = document.getElementById('messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const locationBtn = document.getElementById('location-btn');

  // Geolocation state
  let currentLocation = null;

  // Get current geolocation
  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }

      addMessage('🌍 Getting your location...', 'bot');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          resolve(currentLocation);
        },
        (error) => {
          let errorMsg = '❌ Unable to get location.\n\n';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += '🚫 Reason: Location permission denied.\n\n';
              errorMsg += 'To fix:\n';
              errorMsg += '1. Click the 🔒 lock icon in your browser\'s address bar\n';
              errorMsg += '2. Allow location access for this site\n';
              errorMsg += '3. Try again';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += '📡 Reason: GPS signal unavailable.\n\n';
              errorMsg += 'Possible causes:\n';
              errorMsg += '• Indoors or poor GPS signal\n';
              errorMsg += '• No GPS hardware on this device\n';
              errorMsg += '• Location services disabled in system settings\n\n';
              errorMsg += 'Try:\n';
              errorMsg += '• Move outdoors or near a window\n';
              errorMsg += '• Enable Location Services in your device settings\n';
              errorMsg += '• Use manual coordinates: /polygon add <lat> <lon>';
              break;
            case error.TIMEOUT:
              errorMsg += '⏱️ Reason: Location request timed out.\n\n';
              errorMsg += 'Try:\n';
              errorMsg += '• Move to an area with better GPS signal\n';
              errorMsg += '• Wait a moment and try again\n';
              errorMsg += '• Use manual coordinates instead';
              break;
            default:
              errorMsg += '⚠️ An unknown error occurred.\n\n';
              errorMsg += 'Alternative: Enter coordinates manually using:\n';
              errorMsg += '/polygon add <latitude> <longitude>';
          }
          reject(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    });
  }

  // Location button click handler
  if (locationBtn) {
    locationBtn.addEventListener('click', async () => {
      try {
        const location = await getCurrentLocation();
        setTimeout(() => {
          addMessage(
            `📍 Current Location:\nLatitude: ${location.latitude.toFixed(6)}°\nLongitude: ${location.longitude.toFixed(6)}°\nAccuracy: ±${Math.round(location.accuracy)}m\n\nUse /add-location to add this point to your polygon.`,
            'bot'
          );
        }, 300);
      } catch (error) {
        setTimeout(() => {
          addMessage(`❌ ${error}`, 'bot');
        }, 300);
      }
    });
  }

  // Display a message in the chat
  function addMessage(text, sender = 'bot') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}`;
    messageEl.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Escape HTML to prevent injection
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Parse and handle commands
  function handleCommand(input) {
    const trimmed = input.trim();

    // /help
    if (trimmed === '/help') {
      return `📚 Quick Reference:

Geolocation:
/location — Get your current GPS location
/add-location — Add current location to polygon
🌍 Location button — Quick access to GPS

Polygon Tools:
/polygon add <lat> <lon> — Add points (WGS84)
/polygon add utm <zone> <hem> <e> <n> — Add UTM points
/polygon add nigeria-mid <e> <n> — Add Nigeria Belt points
/total — Calculate area
/polygon export — Export GeoJSON
/polygon clear — Clear all points

Coordinate Conversion:
/utm <lat> <lon> — WGS84 → UTM
/geo <zone> <hem> <e> <n> — UTM → WGS84
/nigeria mid <lat> <lon> — Convert to Nigeria Mid Belt

📖 For complete documentation with examples, visit:
https://geotechiex.com/help.html

Supported projections: WGS84, UTM, Nigeria West/Mid/East Belts, Minna UTM 31N/32N`;
    }

    // /total - shortcut for polygon area
    if (trimmed === '/total') {
      return polygonModule.calculateArea();
    }

    // /location - get current geolocation
    if (trimmed === '/location') {
      getCurrentLocation()
        .then(location => {
          setTimeout(() => {
            addMessage(
              `📍 Current Location:\nLatitude: ${location.latitude.toFixed(6)}°\nLongitude: ${location.longitude.toFixed(6)}°\nAccuracy: ±${Math.round(location.accuracy)}m\n\nUse /add-location to add this point to your polygon.`,
              'bot'
            );
          }, 300);
        })
        .catch(error => {
          setTimeout(() => {
            addMessage(`❌ ${error}`, 'bot');
          }, 300);
        });
      return 'Requesting location access...';
    }

    // /add-location - add current location to polygon
    if (trimmed === '/add-location') {
      if (!currentLocation) {
        return 'No location available. Use /location or click the Location button first.';
      }
      const result = polygonModule.addPoint(currentLocation.latitude, currentLocation.longitude);
      return `${result}\n📍 Added current location (±${Math.round(currentLocation.accuracy)}m accuracy)`;
    }

    // /utm command - convert geographic to UTM
    if (trimmed.startsWith('/utm')) {
      const args = trimmed.split(' ');
      if (args.length === 3) {
        const result = coordinatesModule.toUTM(args[1], args[2]);
        return typeof result === 'string' ? result : result.formatted;
      }
      return 'Usage: /utm <latitude> <longitude>';
    }

    // /geo command - convert UTM to geographic
    if (trimmed.startsWith('/geo')) {
      const args = trimmed.split(' ');
      if (args.length === 5) {
        const result = coordinatesModule.toGeographic(args[1], args[2], args[3], args[4]);
        return typeof result === 'string' ? result : result.formatted;
      }
      return 'Usage: /geo <zone> <hemisphere> <easting> <northing>';
    }

    // /nigeria command - Nigeria Belt systems and Minna UTM
    if (trimmed.startsWith('/nigeria')) {
      const args = trimmed.split(' ');
      const system = args[1];

      // Nigeria Belt systems: /nigeria west|mid|east <lat> <lon>
      if ((system === 'west' || system === 'mid' || system === 'east') && args.length === 4) {
        // First convert WGS84 to Minna datum
        const minna = coordinatesModule.wgs84ToMinna(parseFloat(args[2]), parseFloat(args[3]));
        const result = coordinatesModule.toTransverseMercator(minna.latitude, minna.longitude, system);
        return typeof result === 'string' ? result : result.formatted;
      }

      // Minna UTM: /nigeria utm31 <lat> <lon> or /nigeria utm32 <lat> <lon>
      if ((system === 'utm31' || system === 'utm32') && args.length === 4) {
        const zone = system === 'utm31' ? 31 : 32;
        const minna = coordinatesModule.wgs84ToMinna(parseFloat(args[2]), parseFloat(args[3]));
        const result = coordinatesModule.minnaToUTM(minna.latitude, minna.longitude, zone);
        return typeof result === 'string' ? result : result.formatted;
      }

      return `Usage:
/nigeria west <lat> <lon> — Nigeria West Belt (EPSG:26391)
/nigeria mid <lat> <lon> — Nigeria Mid Belt (EPSG:26392)
/nigeria east <lat> <lon> — Nigeria East Belt (EPSG:26393)
/nigeria utm31 <lat> <lon> — Minna/UTM 31N (EPSG:26331)
/nigeria utm32 <lat> <lon> — Minna/UTM 32N (EPSG:26332)

Note: Input coordinates should be in WGS84`;
    }

    // /polygon commands
    if (trimmed.startsWith('/polygon')) {
      const args = trimmed.split(' ');
      const action = args[1];

      if (action === 'add' && args.length >= 4) {
        // Check if projection type is specified
        const projections = ['wgs84', 'utm', 'nigeria-west', 'nigeria-mid', 'nigeria-east', 'minna-utm31', 'minna-utm32', 'west', 'mid', 'east', 'utm31', 'utm32'];
        const projection = projections.includes(args[2]?.toLowerCase()) ? args[2].toLowerCase() : 'wgs84';
        const startIndex = projection === 'wgs84' ? 2 : 3;

        // Parse coordinates based on projection type
        const coords = args.slice(startIndex);
        
        // Determine coordinate pair size based on projection
        let pairSize = 2; // Default for lat/lon
        if (projection === 'utm') {
          pairSize = 4; // zone, hemisphere, easting, northing
        }

        if (coords.length % pairSize !== 0) {
          if (projection === 'utm') {
            return 'Invalid UTM coordinates. Provide sets of: zone hemisphere easting northing';
          }
          return 'Invalid coordinates. Provide coordinate pairs.';
        }
        
        const results = [];
        for (let i = 0; i < coords.length; i += pairSize) {
          let wgs84;
          
          if (projection === 'utm') {
            // UTM: zone hemisphere easting northing
            wgs84 = coordinatesModule.toWGS84('utm', coords[i], coords[i+1], coords[i+2], coords[i+3]);
          } else if (projection === 'wgs84') {
            // WGS84: lat lon
            wgs84 = coordinatesModule.toWGS84('wgs84', coords[i], coords[i+1]);
          } else {
            // Nigeria systems: easting northing
            wgs84 = coordinatesModule.toWGS84(projection, coords[i], coords[i+1]);
          }

          if (typeof wgs84 === 'string') {
            return wgs84; // Error message
          }

          results.push(polygonModule.addPoint(wgs84.latitude, wgs84.longitude));
        }
        
        const count = projection === 'utm' ? coords.length / 4 : coords.length / 2;
        const projectionName = projection === 'wgs84' ? 'WGS84' : projection.toUpperCase();
        return `Added ${count} point${count > 1 ? 's' : ''} from ${projectionName}. Total points: ${polygonModule.currentPolygon.length}`;
      } else if (action === 'area') {
        return polygonModule.calculateArea();
      } else if (action === 'export') {
        const geojson = polygonModule.exportGeoJSON();
        // Create downloadable link
        setTimeout(() => {
          addMessage(`GeoJSON:\n\`\`\`\n${geojson}\n\`\`\`\n📥 Copy and save as .geojson file`, 'bot');
        }, 100);
        return 'Polygon exported as GeoJSON (see below):';
      } else if (action === 'csv') {
        const csv = polygonModule.exportCSV();
        setTimeout(() => {
          addMessage(`CSV:\n\`\`\`\n${csv}\n\`\`\`\n📥 Copy and save as .csv file`, 'bot');
        }, 100);
        return 'Polygon exported as CSV (see below):';
      } else if (action === 'clear') {
        return polygonModule.clear();
      } else if (action === 'status') {
        return polygonModule.status();
      } else {
        return 'Unknown polygon command. Try: /polygon add <lat> <lon>, /polygon area, /polygon export, /polygon csv, /polygon clear, /polygon status';
      }
    }

    // Default response for non-commands
    if (trimmed.startsWith('/')) {
      return 'Unknown command. Type /help for available commands.';
    }

    // Natural language fallback
    return `I'm here to help with geospatial tasks! Try commands like:
• /location (get your GPS coordinates)
• /add-location (add current location to polygon)
• /polygon add 6.5244 3.3792 (WGS84)
• /polygon add nigeria-mid 670000 1000000 (Nigeria Mid Belt)
• /polygon add utm 31 N 500000 720000 (UTM)
• /nigeria mid 9.0 7.5 (coordinate conversion)
• /total (calculate area)
Or type /help for all commands.`;
  }

  // Handle form submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    // Show user message
    addMessage(userInput, 'user');
    chatInput.value = '';

    // Generate bot response
    const response = handleCommand(userInput);
    setTimeout(() => {
      addMessage(response, 'bot');
    }, 300);
  });

  // Initial greeting
  addMessage('👋 Welcome to GeoAI Chat! I can help you with geospatial tasks like creating polygons, calculating areas, and coordinate transformations. Type /help to see available commands.', 'bot');
})();
