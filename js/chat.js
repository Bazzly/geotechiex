// GeoAI Chat — Main chat logic and command handler
(function() {
  const messagesDiv = document.getElementById('messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

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
      return `Available commands:
/polygon add <lat> <lon> — Add a point to the polygon
/polygon area — Calculate polygon area
/polygon export — Export polygon as GeoJSON
/polygon csv — Export polygon as CSV
/polygon clear — Clear all points
/polygon status — Show polygon status
/help — Show this help`;
    }

    // /polygon commands
    if (trimmed.startsWith('/polygon')) {
      const args = trimmed.split(' ');
      const action = args[1];

      if (action === 'add' && args[2] && args[3]) {
        return polygonModule.addPoint(args[2], args[3]);
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
• /polygon add 6.5244 3.3792
• /polygon area
• /polygon export
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
