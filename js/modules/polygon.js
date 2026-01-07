// Polygon Module — provides polygon operations
const polygonModule = {
  currentPolygon: [],

  // Add a point to the polygon
  addPoint(lat, lon) {
    this.currentPolygon.push({ lat: parseFloat(lat), lon: parseFloat(lon) });
    return `Point added: (${lat}, ${lon}). Total points: ${this.currentPolygon.length}`;
  },

  // Clear polygon
  clear() {
    this.currentPolygon = [];
    return 'Polygon cleared.';
  },

  // Get current polygon
  getCurrent() {
    if (this.currentPolygon.length === 0) return null;
    return this.currentPolygon;
  },

  // Calculate area using shoelace formula (in square meters, rough approximation)
  calculateArea() {
    const points = this.currentPolygon;
    if (points.length < 3) {
      return 'Need at least 3 points to calculate area.';
    }

    // Simple shoelace formula for lat/lon
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lon * points[j].lat;
      area -= points[j].lon * points[i].lat;
    }
    area = Math.abs(area) / 2;

    // Rough conversion to square meters (1 degree ≈ 111km at equator)
    // This is a simplified approximation
    const sqMeters = area * 111000 * 111000;
    const sqKm = sqMeters / 1e6;
    const hectares = sqKm * 100;

    return `Area: ${sqMeters.toFixed(2)} m² | ${sqKm.toFixed(4)} km² | ${hectares.toFixed(2)} ha`;
  },

  // Export to GeoJSON
  exportGeoJSON() {
    if (this.currentPolygon.length < 3) {
      return 'Need at least 3 points to export.';
    }

    const coordinates = this.currentPolygon.map(p => [p.lon, p.lat]);
    // Close the polygon
    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0]);
    }

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      },
      properties: {
        createdAt: new Date().toISOString()
      }
    };

    return JSON.stringify(geojson, null, 2);
  },

  // Export to CSV
  exportCSV() {
    if (this.currentPolygon.length === 0) {
      return 'No points to export.';
    }

    let csv = 'latitude,longitude\n';
    this.currentPolygon.forEach(p => {
      csv += `${p.lat},${p.lon}\n`;
    });

    return csv;
  },

  // Get status
  status() {
    return `Polygon has ${this.currentPolygon.length} points.`;
  }
};
