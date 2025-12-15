# Bulk Coordinate Transformation Tool - User Guide

## Overview
The enhanced Coordinate Transformation tool now supports bulk processing of coordinates through CSV upload or direct paste.

## Features

### 🔄 Single Transform Mode
- Transform individual coordinates
- Interactive map display (for WGS84 output)
- Real-time visual results
- Support for all Nigerian coordinate systems

### 📊 Bulk Transform Mode
- Process multiple coordinates at once
- CSV file upload support
- Direct paste functionality
- Download results as CSV
- Real-time validation and error reporting

## Input Format

### CSV Format
```
ID,X,Y,Z,Name
1,538156,787954,0,Control Point A
2,538200,788000,0,Control Point B
3,538300,788100,0,Control Point C
```

### Field Descriptions
- **ID**: Unique identifier (required)
- **X**: Easting/Longitude coordinate (required)
- **Y**: Northing/Latitude coordinate (required)
- **Z**: Elevation (optional, defaults to 0)
- **Name**: Point description (optional, defaults to "Point [ID]")

### Minimum Format
You can use simplified format with just ID, X, Y:
```
1,538156,787954
2,538200,788000
3,538300,788100
```

## How to Use

### Single Transformation
1. Select **Single Transform** tab
2. Choose source coordinate system
3. Choose target coordinate system
4. Enter X and Y coordinates
5. Click **Transform Coordinates**
6. View results and map (if applicable)

### Bulk Transformation

#### Method 1: Upload CSV File
1. Select **Bulk Transform** tab
2. Choose source and target coordinate systems
3. Click the upload area or drag and drop CSV file
4. Click **Transform All Coordinates**
5. Review results
6. Click **Download CSV** to save results

#### Method 2: Paste Coordinates
1. Select **Bulk Transform** tab
2. Choose source and target coordinate systems
3. Paste coordinates in the text area (one per line)
4. Click **Transform All Coordinates**
5. Review results
6. Click **Download CSV** to save results

## Output Format

The downloaded CSV includes:
- ID
- Name
- Original_X
- Original_Y
- Z
- Transformed_X
- Transformed_Y
- Source_EPSG
- Target_EPSG

## Supported Coordinate Systems

### Source Systems
- **EPSG:26331** - Minna / UTM zone 31N
- **EPSG:26332** - Minna / UTM zone 32N
- **EPSG:26391** - Minna / Nigeria West Belt
- **EPSG:26392** - Minna / Nigeria Mid Belt
- **EPSG:26393** - Minna / Nigeria East Belt
- **EPSG:4326** - WGS84 (Lat/Long)

### Target Systems
Same as source systems

## Tips & Best Practices

1. **File Size**: For optimal performance, process up to 1000 coordinates at a time
2. **Format Check**: Ensure no extra commas or spaces in your CSV
3. **Validation**: Review the success/error summary before downloading
4. **Naming**: Use descriptive names for better identification
5. **Backup**: Keep original files before transformation

## Error Messages

- **"Invalid format"**: Line doesn't have minimum required fields (ID,X,Y)
- **"Invalid coordinates"**: X or Y values are not valid numbers
- **"Transformation failed"**: Coordinates are outside valid range for projection

## Example Use Cases

### Survey Data Processing
Convert multiple survey points from Minna datum to WGS84 for GIS applications

### CAD to GIS Conversion
Transform CAD coordinates to geographical coordinates for mapping

### Field Data Integration
Batch convert GPS coordinates between different systems

### Legacy Data Update
Modernize old coordinate datasets to current standards

## Sample Files

A sample CSV file (`sample_coordinates.csv`) is included in the project directory for testing.

## Technical Details

- Built with Proj4js for accurate transformations
- Supports WGS84 datum shifts for Nigerian coordinate systems
- Client-side processing (no data uploaded to servers)
- Real-time validation and feedback

## Support

For issues or questions:
- Check format requirements
- Ensure coordinates are within valid ranges
- Contact GeoTechieX support team

---
**Version**: 2.0
**Last Updated**: December 15, 2025
**Developer**: GeoTechieX Team
