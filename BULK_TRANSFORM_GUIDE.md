Owner name:  (current: PATIENCE OBEHI ADUDU).-  correct
Full address: FAGBAMIYE SEUN STREET ORINYANRIN,MOWE,OBAFEMI/OWODE LOCAL GOVERNMENT AREA, OGUN STATE. should be writtent like this and also split below (not conrrected and fix)
Street: "FAGBAMIYE SEUN STREET ORINYANRIN" — confirm.
Via: "MOWE" —  confirm.
LGA: "OBAFEMI/OWODE" —  confirm.
State: "OGUN" —  confirm.
Scale: should be parsed as numeric ratio "1:500" — confirm.
Area: OCR shows "462.151 SO.MTS" — should this be "462.151 SQ.MTS" (square meters)? Confirm value and unit. -  confirm.
Coordinate system: confirm "UTM" and zone is "31" and whether datum is WGS84 (confirm if present). -  confirm.
 northing  - "74955.594mN"
 easting - "Not detected but we have it as 542540.622mE"
coordinate(s):  should be "542540.622mE,74955.594" — not conrrected and fix
Point IDs: confirm meanings of labels like "FM565AHX", "FM566AHX" ,   confirm. but not all id is detected 
Plan number / registry: confirm "OG/5093/2025/O53" — i have correcte it
Surveyor: confirm full surveyor name and credentials ("ALLI BAZEET D., mnis") — not conrrected and fix?
Date: confirm format should be ISO (YYYY-MM-DD) — here "17-09-2025" → 2025-09-17.
Misc fields: any extraction of bearings(as value with  ° and ' which is degree amd minut sign ), distances(m unit), scale bars (e.g., "m10 5 0 10 20 30 40m"),  - not conrrected and fix?


Title / heading: "PLAN SHEWING PROPERTY"
Owner / name: "PATIENCE OBEHI ADUDU"
Street / via: "OF FAGBAMIYE SEUN STREET ORINYANRIN VIA MOWE"
LGA: "OBAFEMI/OWODE LOCAL GOVERNMENT AREA"
State: "OGUN - STATE"
Scale: "1:500"
Origin / system: "U.T.M (ZONE 31)"
Area: "462.151 SO.MTS" (OCR; likely "SQ.MTS")
Plan number / certificate: "OG/5093/2025/OS3"
Surveyor: "ALLI BAZEET D., mms" (SURVEYOR)
Date: "17 - 09 - 2025"
Coordinate snippets / point labels: "FM565AHX", "FM566AHX", "FM567AHX", "FM568AHX"; one numeric: "74955.594mN"
Other: "Certified true copy of original plan", "NO", small fragments like "19. m", "40m"
Labeling questions (please correct/confirm)

Owner name: confirm exact owner string (current: PATIENCE OBEHI ADUDU). Any extra parts (e.g., titles)?
Full address: confirm street, via, LGA, and state as separate fields:
Street: "FAGBAMIYE SEUN STREET ORINYANRIN" — correct?
Via: "MOWE" — correct?
LGA: "OBAFEMI/OWODE" — correct?
State: "OGUN" — correct?
Scale: should be parsed as numeric ratio "1:500" — confirm.
Area: OCR shows "462.151 SO.MTS" — should this be "462.151 SQ.MTS" (square meters)? Confirm value and unit.
Coordinate system: confirm "UTM" and zone is "31" and whether datum is WGS84 (confirm if present).
Primary coordinate(s): OCR shows "74955.594mN" — is this a northing? Do you have the easting for that point, or is a combined point elsewhere? Provide the primary reference point (easting, northing, zone) if available.
Point IDs: confirm meanings of labels like "FM565AHX", "FM566AHX", etc. Are these control point IDs to be stored as points[].id?
Plan number / registry: confirm "OG/5093/2025/OS3" — any prefix/suffix normalization rules?
Surveyor: confirm full surveyor name and credentials ("ALLI BAZEET D., mms") — how should we store (name / registration)?
Date: confirm format should be ISO (YYYY-MM-DD) — here "17-09-2025" → 2025-09-17.
Misc fields: any extraction of bearings, distances, scale bars (e.g., "40m"), or seals to capture?
Priority: which fields are highest priority to extract correctly for you? (e.g., owner, coordinates, area, plan number)
If you confirm/correct these, I will:

Create a normalized JSON label for this image (example training sample).
Add it to the AdvancedSurveyTrainer store (instructions or automatic via UI).
Suggest a few additional questions or bounding-box tasks (if you want region-level annotations).