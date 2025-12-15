# Coordinate Conversion Feature - Survey Fee Estimator

## 🎯 Overview
The Survey Fee Estimator now supports direct input of coordinates in multiple Nigerian coordinate systems, which are automatically converted to WGS84 (Latitude/Longitude) for analysis.

## 🗺️ Supported Coordinate Systems

### 1. **WGS84 (EPSG:4326)** - Default
- **Format**: Latitude, Longitude (Decimal Degrees)
- **Example**: 6.5244, 3.3792
- **Use**: GPS coordinates, Google Maps coordinates
- **No conversion needed**

### 2. **Minna / UTM zone 31N (EPSG:26331)**
- **Format**: Easting (X), Northing (Y) in meters
- **Example**: 450000, 750000
- **Coverage**: Western Nigeria (≈ 3°-9° E longitude)
- **Use**: Older survey plans, western region

### 3. **Minna / UTM zone 32N (EPSG:26332)**
- **Format**: Easting (X), Northing (Y) in meters
- **Example**: 550000, 800000
- **Coverage**: Eastern Nigeria (≈ 9°-15° E longitude)
- **Use**: Older survey plans, eastern region

### 4. **Minna / Nigeria West Belt (EPSG:26391)**
- **Format**: Easting (X), Northing (Y) in meters
- **Example**: 538156, 787954
- **Coverage**: Lagos, Ogun, Oyo, Ondo states
- **Use**: Most common for Lagos region survey plans

### 5. **Minna / Nigeria Mid Belt (EPSG:26392)**
- **Format**: Easting (X), Northing (Y) in meters
- **Example**: 978500, 820000
- **Coverage**: Edo, Delta, Kwara, Kogi, Abuja states
- **Use**: Central Nigeria survey plans

### 6. **Minna / Nigeria East Belt (EPSG:26393)**
- **Format**: Easting (X), Northing (Y) in meters
- **Example**: 1418000, 850000
- **Coverage**: Anambra, Enugu, Ebonyi, Cross River states
- **Use**: Eastern Nigeria survey plans

---

## 🔄 How to Use

### Step 1: Select Coordinate System
1. Open the Survey Fee Estimator page
2. Look for the **"Coordinate System"** dropdown at the top of the form
3. Select your coordinate system from the list
4. Labels will automatically update:
   - WGS84: Shows "Latitude" and "Longitude"
   - Others: Shows "Easting (X)" and "Northing (Y)"

### Step 2: Enter Coordinates
**For WGS84 (Default):**
```
Latitude: 6.5244
Longitude: 3.3792
```

**For Minna Datum (e.g., West Belt):**
```
Easting (X): 538156
Northing (Y): 787954
```

### Step 3: Complete Other Fields
- Land Area (sq.m)
- Analysis Radius (km)
- Survey Type
- Accuracy Level
- Urgency

### Step 4: Analyze
- Click **"Analyze & Calculate Fees"**
- Coordinates are automatically converted to WGS84
- Analysis proceeds with converted coordinates
- Results show conversion information

---

## 📍 Example Use Cases

### Use Case 1: Lagos Survey Plan Coordinates
**Scenario**: You have a survey plan with Minna West Belt coordinates

**Input:**
- Coordinate System: `Minna / Nigeria West Belt`
- Easting (X): `538156`
- Northing (Y): `787954`
- Land Area: `500 sq.m`

**Result:**
- Automatically converts to: `~6.5244°N, 3.3792°E`
- Performs analysis at converted location
- Shows "Converted from Minna West Belt to WGS84" in results

### Use Case 2: GPS Coordinates from Phone
**Scenario**: You got coordinates from Google Maps or GPS device

**Input:**
- Coordinate System: `WGS84` (Default)
- Latitude: `6.4541`
- Longitude: `3.3947`
- Land Area: `1000 sq.m`

**Result:**
- No conversion needed
- Direct analysis
- Accurate fee calculation

### Use Case 3: Old Survey Plan (Abuja)
**Scenario**: Survey plan from Abuja in Mid Belt coordinates

**Input:**
- Coordinate System: `Minna / Nigeria Mid Belt`
- Easting (X): `978500`
- Northing (Y): `820000`
- Land Area: `750 sq.m`

**Result:**
- Converts to WGS84 automatically
- Analysis for Abuja area
- Fee calculation based on location

---

## 🧮 Technical Details

### Conversion Parameters
All Minna datum projections use:
- **Ellipsoid**: Clarke 1880
- **Transformation**: -92, -93, 122 meters (to WGS84)
- **Units**: Meters

### Coordinate Ranges

| System | Easting Range | Northing Range |
|--------|---------------|----------------|
| Minna UTM 31N | 160,000 - 833,000m | 600,000 - 1,500,000m |
| Minna UTM 32N | 160,000 - 833,000m | 600,000 - 1,500,000m |
| Minna West Belt | 230,000 - 670,000m | 600,000 - 1,200,000m |
| Minna Mid Belt | 670,000 - 1,110,000m | 600,000 - 1,200,000m |
| Minna East Belt | 1,110,000 - 1,550,000m | 600,000 - 1,200,000m |

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Error converting coordinates"
**Cause**: Input values are outside valid range for selected system

**Solution:**
- Verify coordinate system matches your data
- Check if values are in correct order (X/Easting first, Y/Northing second)
- Ensure values are within valid range for that system

### Issue 2: Location appears in wrong place on map
**Cause**: Wrong coordinate system selected

**Solution:**
- Double-check survey plan header for coordinate system
- Try different belt (West/Mid/East) if uncertain
- Look for zone information in original document

### Issue 3: Coordinates from survey plan don't work
**Cause**: Survey plan may use different datum (e.g., NNA)

**Solutions:**
1. Check if plan specifies "Minna Datum" or other
2. Look for EPSG code or zone information
3. Try the most common system for your state (see coverage above)
4. Contact surveyor for confirmation

---

## 📖 Reading Survey Plans

### Finding Coordinate System Information
Look for these indicators on your survey plan:

1. **Header Section**: Usually states datum and zone
   - "Minna Datum, West Belt"
   - "UTM Zone 32N, Minna"
   - "EPSG:26391"

2. **Coordinate Values**:
   - WGS84: Small numbers with decimals (6.5244)
   - Minna: Large numbers, usually 6-7 digits (538156)

3. **State/Location**:
   - Lagos, Ogun, Oyo → Usually West Belt
   - Abuja, Kwara, Kogi → Usually Mid Belt
   - Anambra, Enugu, Ebonyi → Usually East Belt

---

## 🔍 Validation Tips

### Check Your Conversion
After entering coordinates and clicking analyze:
1. **Check Map Location**: Does the marker appear in the expected area?
2. **Check Area Name**: Does it match your expected location?
3. **Check Coordinates**: Results show converted WGS84 values

### Coordinate Sanity Check
**Nigeria is approximately:**
- Latitude: 4° to 14° N
- Longitude: 3° to 15° E

If converted coordinates are far outside this range, recheck your inputs.

---

## 💡 Pro Tips

1. **Save Conversions**: Download the report to keep converted coordinates
2. **Batch Conversion**: For multiple coordinates, use the Coordinate Transformation tool (`coordTrans.html`)
3. **Mobile Use**: GPS coordinates from phone always use WGS84
4. **Google Maps**: Right-click location → coordinates shown are WGS84
5. **Survey Plans**: Usually need Minna West/Mid/East Belt conversion

---

## 🆘 Need Help?

### Quick Reference by State

| State | Recommended System |
|-------|-------------------|
| Lagos | Minna West Belt (EPSG:26391) |
| Ogun | Minna West Belt (EPSG:26391) |
| Oyo | Minna West Belt (EPSG:26391) |
| Abuja (FCT) | Minna Mid Belt (EPSG:26392) |
| Edo | Minna Mid Belt (EPSG:26392) |
| Delta | Minna Mid Belt (EPSG:26392) |
| Anambra | Minna East Belt (EPSG:26393) |
| Enugu | Minna East Belt (EPSG:26393) |

### Still Confused?
1. Use WGS84 and enter GPS coordinates from Google Maps
2. Take photo of survey plan and use GPS coordinates from site visit
3. Contact GeoTechieX support with your survey plan details

---

## 📚 Additional Resources

### Related Tools
- **Coordinate Transformer** (`coordTrans.html`): Bulk coordinate conversion
- **Area Checker** (`checkPoint.html`): Verify if coordinates are in specific zones

### External References
- [EPSG.io](https://epsg.io/) - Coordinate system database
- [Proj4js Documentation](http://proj4js.org/) - Projection library we use

---

## 🎓 Understanding the Systems

### Why Multiple Systems?
Nigeria uses multiple coordinate systems for historical reasons:
- **Minna Datum**: Based on astronomical observations at Minna in 1960s
- **WGS84**: Modern GPS standard, satellite-based
- **UTM/Belt Systems**: Different zones for better accuracy across large areas

### Which Should You Use?
- **New Projects**: WGS84 (GPS coordinates)
- **Old Survey Plans**: Check plan header, usually Minna + Belt/Zone
- **GPS Devices**: Always WGS84
- **When Unsure**: WGS84 with Google Maps coordinates

---

## ✅ Feature Benefits

1. **No Manual Conversion**: Automatic transformation
2. **Reduced Errors**: No need for external conversion tools
3. **Survey Plan Compatible**: Direct input from Nigerian survey plans
4. **GPS Compatible**: Works with modern GPS coordinates
5. **Visual Feedback**: See exact location on map
6. **Documentation**: Results show conversion performed

---

**Last Updated**: December 2025  
**Version**: 2.0.0  
**Supported Systems**: 6 coordinate systems  
**Coverage**: All of Nigeria
