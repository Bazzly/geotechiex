// Coordinate Transformation Module
// Converts between Geographic (lat/lon), UTM, and Nigeria-specific coordinate systems

const coordinatesModule = {
  // Minna datum parameters (relative to WGS84)
  // Molodensky transformation parameters
  minnaDatum: {
    name: 'Minna',
    ellipsoid: {
      a: 6378249.145, // Clarke 1880 (RGS) semi-major axis
      f: 1 / 293.465, // flattening
    },
    // Approximate transformation parameters (Minna to WGS84)
    dx: -92.0, // X-axis translation (meters)
    dy: -93.0, // Y-axis translation (meters)
    dz: 122.0, // Z-axis translation (meters)
  },

  // Nigeria Belt System parameters
  nigeriaBelts: {
    west: {
      name: 'Nigeria West Belt',
      epsg: 26391,
      centralMeridian: 4.5, // 4°30'E
      falseEasting: 230738.26,
      falseNorthing: 0,
      scaleFactor: 0.99975,
    },
    mid: {
      name: 'Nigeria Mid Belt',
      epsg: 26392,
      centralMeridian: 8.5, // 8°30'E
      falseEasting: 670553.98,
      falseNorthing: 0,
      scaleFactor: 0.99975,
    },
    east: {
      name: 'Nigeria East Belt',
      epsg: 26393,
      centralMeridian: 12.5, // 12°30'E
      falseEasting: 1110369.7,
      falseNorthing: 0,
      scaleFactor: 0.99975,
    },
  },
  // Convert Geographic (lat/lon) to UTM
  toUTM(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return 'Invalid coordinates. Please provide valid numbers.';
    }

    if (lat < -80 || lat > 84) {
      return 'Latitude must be between -80° and 84° for UTM.';
    }

    if (lon < -180 || lon > 180) {
      return 'Longitude must be between -180° and 180°.';
    }

    // Calculate UTM zone
    const zone = Math.floor((lon + 180) / 6) + 1;
    const hemisphere = lat >= 0 ? 'N' : 'S';

    // WGS84 ellipsoid parameters
    const a = 6378137.0; // semi-major axis
    const f = 1 / 298.257223563; // flattening
    const k0 = 0.9996; // scale factor

    const e = Math.sqrt(2 * f - f * f); // eccentricity
    const e2 = e * e / (1 - e * e); // second eccentricity squared

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const lonOrigin = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180; // central meridian

    const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = e2 * Math.cos(latRad) * Math.cos(latRad);
    const A = (lonRad - lonOrigin) * Math.cos(latRad);

    const M = a * (
      (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256) * latRad -
      (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * e * e * e * e * e * e / 1024) * Math.sin(2 * latRad) +
      (15 * e * e * e * e / 256 + 45 * e * e * e * e * e * e / 1024) * Math.sin(4 * latRad) -
      (35 * e * e * e * e * e * e / 3072) * Math.sin(6 * latRad)
    );

    const easting = k0 * N * (
      A + (1 - T + C) * A * A * A / 6 +
      (5 - 18 * T + T * T + 72 * C - 58 * e2) * A * A * A * A * A / 120
    ) + 500000.0;

    let northing = k0 * (
      M + N * Math.tan(latRad) * (
        A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 +
        (61 - 58 * T + T * T + 600 * C - 330 * e2) * A * A * A * A * A * A / 720
      )
    );

    if (lat < 0) {
      northing += 10000000.0; // False northing for southern hemisphere
    }

    return {
      zone,
      hemisphere,
      easting: Math.round(easting * 100) / 100,
      northing: Math.round(northing * 100) / 100,
      formatted: `Zone ${zone}${hemisphere}: ${Math.round(easting * 100) / 100}E, ${Math.round(northing * 100) / 100}N`
    };
  },

  // Convert UTM to Geographic (lat/lon)
  toGeographic(zone, hemisphere, easting, northing) {
    zone = parseInt(zone);
    easting = parseFloat(easting);
    northing = parseFloat(northing);

    if (isNaN(zone) || isNaN(easting) || isNaN(northing)) {
      return 'Invalid UTM coordinates. Please provide valid numbers.';
    }

    if (zone < 1 || zone > 60) {
      return 'UTM zone must be between 1 and 60.';
    }

    hemisphere = hemisphere.toUpperCase();
    if (hemisphere !== 'N' && hemisphere !== 'S') {
      return 'Hemisphere must be N or S.';
    }

    // WGS84 ellipsoid parameters
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const k0 = 0.9996;

    const e = Math.sqrt(2 * f - f * f);
    const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));

    const x = easting - 500000.0;
    let y = northing;

    if (hemisphere === 'S') {
      y -= 10000000.0;
    }

    const M = y / k0;
    const mu = M / (a * (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256));

    const phi1 = mu +
      (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
      (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
      (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

    const N1 = a / Math.sqrt(1 - e * e * Math.sin(phi1) * Math.sin(phi1));
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const C1 = e * e / (1 - e * e) * Math.cos(phi1) * Math.cos(phi1);
    const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = x / (N1 * k0);

    let lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
      D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e * e / (1 - e * e)) * D * D * D * D / 24 +
      (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e * e / (1 - e * e) - 3 * C1 * C1) * D * D * D * D * D * D / 720
    );

    lat = lat * 180 / Math.PI;

    let lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 +
      (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e * e / (1 - e * e) + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1);

    lon = ((zone - 1) * 6 - 180 + 3) + lon * 180 / Math.PI;

    return {
      latitude: Math.round(lat * 1000000) / 1000000,
      longitude: Math.round(lon * 1000000) / 1000000,
      formatted: `${Math.round(lat * 1000000) / 1000000}°, ${Math.round(lon * 1000000) / 1000000}°`
    };
  },

  // Convert Transverse Mercator (Nigeria Belt) to Minna Geographic
  fromTransverseMercator(easting, northing, belt) {
    const beltParams = this.nigeriaBelts[belt];
    if (!beltParams) {
      return 'Invalid belt. Use: west, mid, or east';
    }

    const { a, f } = this.minnaDatum.ellipsoid;
    const { centralMeridian, falseEasting, falseNorthing, scaleFactor } = beltParams;

    const x = easting - falseEasting;
    const y = northing - falseNorthing;

    const e = Math.sqrt(2 * f - f * f);
    const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));

    const M = y / scaleFactor;
    const mu = M / (a * (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256));

    const phi1 = mu +
      (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
      (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
      (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

    const N1 = a / Math.sqrt(1 - e * e * Math.sin(phi1) * Math.sin(phi1));
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const C1 = e * e / (1 - e * e) * Math.cos(phi1) * Math.cos(phi1);
    const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = x / (N1 * scaleFactor);

    let lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
      D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e * e / (1 - e * e)) * D * D * D * D / 24 +
      (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e * e / (1 - e * e) - 3 * C1 * C1) * D * D * D * D * D * D / 720
    );

    lat = lat * 180 / Math.PI;

    let lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 +
      (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e * e / (1 - e * e) + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1);

    lon = centralMeridian + lon * 180 / Math.PI;

    return {
      latitude: lat,
      longitude: lon
    };
  },

  // Convert Minna UTM to Minna Geographic
  utmMinnaToGeographic(zone, easting, northing) {
    const { a, f } = this.minnaDatum.ellipsoid;
    const k0 = 0.9996;

    const e = Math.sqrt(2 * f - f * f);
    const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));

    const x = easting - 500000.0;
    const y = northing;

    const M = y / k0;
    const mu = M / (a * (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256));

    const phi1 = mu +
      (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
      (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
      (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

    const N1 = a / Math.sqrt(1 - e * e * Math.sin(phi1) * Math.sin(phi1));
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const C1 = e * e / (1 - e * e) * Math.cos(phi1) * Math.cos(phi1);
    const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = x / (N1 * k0);

    let lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
      D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e * e / (1 - e * e)) * D * D * D * D / 24 +
      (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e * e / (1 - e * e) - 3 * C1 * C1) * D * D * D * D * D * D / 720
    );

    lat = lat * 180 / Math.PI;

    let lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 +
      (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e * e / (1 - e * e) + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1);

    lon = ((zone - 1) * 6 - 180 + 3) + lon * 180 / Math.PI;

    return {
      latitude: lat,
      longitude: lon
    };
  },

  // Convert any projection to WGS84 (for polygon storage)
  toWGS84(projection, ...coords) {
    switch(projection.toLowerCase()) {
      case 'wgs84':
      case 'latlon':
        // Already in WGS84
        return { latitude: parseFloat(coords[0]), longitude: parseFloat(coords[1]) };

      case 'utm':
        // UTM: zone, hemisphere, easting, northing
        const utmResult = this.toGeographic(coords[0], coords[1], coords[2], coords[3]);
        if (typeof utmResult === 'string') return utmResult;
        return { latitude: utmResult.latitude, longitude: utmResult.longitude };

      case 'nigeria-west':
      case 'west':
        // Nigeria West Belt: easting, northing
        const westMinna = this.fromTransverseMercator(parseFloat(coords[0]), parseFloat(coords[1]), 'west');
        if (typeof westMinna === 'string') return westMinna;
        return this.minnaToWGS84(westMinna.latitude, westMinna.longitude);

      case 'nigeria-mid':
      case 'mid':
        // Nigeria Mid Belt: easting, northing
        const midMinna = this.fromTransverseMercator(parseFloat(coords[0]), parseFloat(coords[1]), 'mid');
        if (typeof midMinna === 'string') return midMinna;
        return this.minnaToWGS84(midMinna.latitude, midMinna.longitude);

      case 'nigeria-east':
      case 'east':
        // Nigeria East Belt: easting, northing
        const eastMinna = this.fromTransverseMercator(parseFloat(coords[0]), parseFloat(coords[1]), 'east');
        if (typeof eastMinna === 'string') return eastMinna;
        return this.minnaToWGS84(eastMinna.latitude, eastMinna.longitude);

      case 'minna-utm31':
      case 'utm31':
        // Minna UTM 31N: easting, northing
        const utm31Minna = this.utmMinnaToGeographic(31, parseFloat(coords[0]), parseFloat(coords[1]));
        return this.minnaToWGS84(utm31Minna.latitude, utm31Minna.longitude);

      case 'minna-utm32':
      case 'utm32':
        // Minna UTM 32N: easting, northing
        const utm32Minna = this.utmMinnaToGeographic(32, parseFloat(coords[0]), parseFloat(coords[1]));
        return this.minnaToWGS84(utm32Minna.latitude, utm32Minna.longitude);

      default:
        return `Unknown projection: ${projection}. Use: wgs84, utm, nigeria-west, nigeria-mid, nigeria-east, minna-utm31, minna-utm32`;
    }
  },

  // Convert WGS84 lat/lon to Minna datum lat/lon (approximate)
  wgs84ToMinna(lat, lon) {
    // Simple approximation using average shift for Nigeria region
    // For production use, implement proper Molodensky transformation
    return {
      latitude: lat + 0.0008, // approximately +3 arc-seconds
      longitude: lon + 0.0011, // approximately +4 arc-seconds
    };
  },

  // Convert Minna datum lat/lon to WGS84 (approximate)
  minnaToWGS84(lat, lon) {
    return {
      latitude: lat - 0.0008,
      longitude: lon - 0.0011,
    };
  },

  // Transverse Mercator projection (for Nigeria Belt systems)
  toTransverseMercator(lat, lon, belt) {
    const beltParams = this.nigeriaBelts[belt];
    if (!beltParams) {
      return 'Invalid belt. Use: west, mid, or east';
    }

    const { a, f } = this.minnaDatum.ellipsoid;
    const { centralMeridian, falseEasting, falseNorthing, scaleFactor } = beltParams;

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const lonOriginRad = centralMeridian * Math.PI / 180;

    const e = Math.sqrt(2 * f - f * f);
    const e2 = e * e / (1 - e * e);

    const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = e2 * Math.cos(latRad) * Math.cos(latRad);
    const A = (lonRad - lonOriginRad) * Math.cos(latRad);

    const M = a * (
      (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256) * latRad -
      (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * e * e * e * e * e * e / 1024) * Math.sin(2 * latRad) +
      (15 * e * e * e * e / 256 + 45 * e * e * e * e * e * e / 1024) * Math.sin(4 * latRad) -
      (35 * e * e * e * e * e * e / 3072) * Math.sin(6 * latRad)
    );

    const easting = scaleFactor * N * (
      A + (1 - T + C) * A * A * A / 6 +
      (5 - 18 * T + T * T + 72 * C - 58 * e2) * A * A * A * A * A / 120
    ) + falseEasting;

    const northing = scaleFactor * (
      M + N * Math.tan(latRad) * (
        A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 +
        (61 - 58 * T + T * T + 600 * C - 330 * e2) * A * A * A * A * A * A / 720
      )
    ) + falseNorthing;

    return {
      belt: beltParams.name,
      epsg: beltParams.epsg,
      easting: Math.round(easting * 100) / 100,
      northing: Math.round(northing * 100) / 100,
      formatted: `${beltParams.name} (EPSG:${beltParams.epsg})\nEasting: ${Math.round(easting * 100) / 100}m, Northing: ${Math.round(northing * 100) / 100}m`
    };
  },

  // Convert Minna geographic to UTM (zones 31N or 32N)
  minnaToUTM(lat, lon, zone) {
    if (zone !== 31 && zone !== 32) {
      return 'Nigeria uses UTM zones 31N or 32N only.';
    }

    const { a, f } = this.minnaDatum.ellipsoid;
    const k0 = 0.9996;

    const e = Math.sqrt(2 * f - f * f);
    const e2 = e * e / (1 - e * e);

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const lonOrigin = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

    const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
    const T = Math.tan(latRad) * Math.tan(latRad);
    const C = e2 * Math.cos(latRad) * Math.cos(latRad);
    const A = (lonRad - lonOrigin) * Math.cos(latRad);

    const M = a * (
      (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256) * latRad -
      (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * e * e * e * e * e * e / 1024) * Math.sin(2 * latRad) +
      (15 * e * e * e * e / 256 + 45 * e * e * e * e * e * e / 1024) * Math.sin(4 * latRad) -
      (35 * e * e * e * e * e * e / 3072) * Math.sin(6 * latRad)
    );

    const easting = k0 * N * (
      A + (1 - T + C) * A * A * A / 6 +
      (5 - 18 * T + T * T + 72 * C - 58 * e2) * A * A * A * A * A / 120
    ) + 500000.0;

    const northing = k0 * (
      M + N * Math.tan(latRad) * (
        A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 +
        (61 - 58 * T + T * T + 600 * C - 330 * e2) * A * A * A * A * A * A / 720
      )
    );

    const epsg = zone === 31 ? 26331 : 26332;

    return {
      zone: `${zone}N`,
      epsg,
      datum: 'Minna',
      easting: Math.round(easting * 100) / 100,
      northing: Math.round(northing * 100) / 100,
      formatted: `Minna / UTM zone ${zone}N (EPSG:${epsg})\nEasting: ${Math.round(easting * 100) / 100}m, Northing: ${Math.round(northing * 100) / 100}m`
    };
  },

  // Format help for coordinate transformations
  help() {
    return `Coordinate Transformation Commands:
/utm <lat> <lon> — Convert geographic to UTM
Example: /utm 6.5244 3.3792

/geo <zone> <hemisphere> <easting> <northing> — Convert UTM to geographic
Example: /geo 31 N 500000 720000

Supported:
• WGS84 datum
• UTM zones 1-60
• Hemispheres: N (north) or S (south)
• Latitude range: -80° to 84°`;
  }
};
