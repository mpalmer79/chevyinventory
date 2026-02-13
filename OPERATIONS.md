# Operations Guide

This document covers how to update inventory data, expected data formats, and error handling behavior.

---

## Updating Inventory Data

### File Locations

| Dealership | File Path | Format |
|------------|-----------|--------|
| Chevrolet | `/public/inventory.xlsx` | Excel (.xlsx) |
| Buick GMC | `/public/gmc-inventory.xlsx` | Excel (.xlsx) |

### Update Process

1. Export inventory data from your DMS (PBS, VIN Solutions, etc.)
2. Ensure the file matches the expected schema (see below)
3. Replace the appropriate file in `/public/`
4. Deploy to Netlify (automatic on push to `main`)

### Expected Schema

The Excel file must contain these columns (case-sensitive):

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `Stock Number` | String | ✅ | Unique vehicle identifier |
| `Year` | Number | ✅ | Model year (e.g., 2024) |
| `Make` | String | ✅ | CHEVROLET, BUICK, GMC |
| `Model` | String | ✅ | SILVERADO 1500, TAHOE, etc. |
| `Exterior Color` | String | ✅ | Full color name |
| `Trim` | String | ✅ | LT, RST, HIGH COUNTRY, etc. |
| `Model Number` | String | ✅ | OEM code (CK10543, TK10743) |
| `Cylinders` | Number | ❌ | Engine cylinder count |
| `Age` | Number | ✅ | Days on lot |
| `MSRP` | Number | ✅ | Vehicle price |
| `Category` | String | ✅ | Status indicator (see below) |
| `VIN` | String | ✅ | 17-character VIN |
| `Body` | String | ❌ | Body description |
| `Body Type` | String | ❌ | Body type category |

### Category Values

The `Category` column determines vehicle status:

| Value | Status | Display |
|-------|--------|---------|
| `ON DEALER LOT` | In Stock | Included in aging calculations |
| `ON DEALER LOT ` (trailing space) | In Stock | Also recognized |
| `IN TRANSIT` | In Transit | Excluded from aging, shown in Transit count |
| `IN TRANSIT SOLD` | In Transit (Sold) | Same as IN TRANSIT |

### Body Field Format

For trucks (Silverado/Sierra), the Body field should follow this pattern:
```
4WD Crew Cab 147" w/1
4WD Reg Cab 126"
4WD Double Cab 162" w/3SB
```

The dashboard normalizes these to display format:
```
4WD CREW CAB 147" WB
4WD REG CAB 126" WB
4WD DOUBLE CAB 162" WB
```

For other vehicles (Corvette, Tahoe, Equinox, etc.):
```
2dr Stingray Cpe w/    → 2DR STINGRAY CPE
FWD 4dr                → FWD 4DR
AWD 4dr LT w/2LT       → AWD 4DR LT
```

---

## Error Handling

### Malformed Files

| Issue | Dashboard Behavior |
|-------|-------------------|
| Missing file | Shows loading error, prompts to check file path |
| Invalid Excel format | Shows parse error message |
| Missing required columns | Loads with empty/undefined values |
| Wrong data types | Attempts to coerce, may show NaN |
| Empty file | Shows "0 vehicles" with empty state |

### Data Validation

The dashboard performs minimal validation:
- Numeric fields (`Year`, `Age`, `MSRP`) are coerced to numbers
- Missing `Category` defaults to empty string (treated as in-stock)
- Missing `Body` field shows "-" in tables

### Recommended Validation Checklist

Before uploading, verify:
- [ ] File opens in Excel without errors
- [ ] All required columns are present with exact names
- [ ] `Stock Number` column has no duplicates
- [ ] `Year` values are 4-digit numbers
- [ ] `MSRP` values are numeric (no $ or commas in data)
- [ ] `Age` values are non-negative integers
- [ ] `Category` uses one of the recognized values

---

## Troubleshooting

### "No vehicles found"
1. Check that the Excel file exists in `/public/`
2. Verify the file has data rows (not just headers)
3. Check browser console for parse errors

### Incorrect vehicle counts
1. Verify `Category` column values match expected patterns
2. Check for trailing spaces in category values
3. Confirm filters are cleared (Model = "All Models", etc.)

### Model dropdown shows raw codes (CK10543)
The model number is not in the `MODEL_NUMBER_DISPLAY_MAP`. Add it to:
```
src/utils/modelFormatting.ts
```

### Body column shows "2" WB" or similar
The `formatBodyDescription` function didn't recognize the body format. Check the raw data in the Excel file and update the function if needed.

---

## Deployment

### Netlify (Production)
- Automatic deploy on push to `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20

### Local Development
```bash
npm install
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Environment
No environment variables required. All data is loaded from static Excel files.

---

## Data Refresh Frequency

The dashboard loads data once on page load. To see updated inventory:
1. Replace the Excel file(s)
2. Deploy (or refresh in development)
3. User refreshes their browser

The "Updated X minutes ago" indicator reflects when the page was loaded, not when the data file was modified.
