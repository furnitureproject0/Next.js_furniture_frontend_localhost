# Map Visibility Fix - Summary

## 🐛 Issue
When users selected an address from autocomplete (map appeared), then started editing the street field manually, the map would **disappear immediately** because we were clearing `lat/lon` on every field change.

## ✅ Fix Applied

### What Changed

#### 1. **Stopped Clearing Coordinates** (`CustomerAddressStep.js`)
- **Before**: `handleFieldChange` would clear `lat/lon/place_id` whenever street/zip/city changed
- **After**: We keep the last known coordinates while the user types, ensuring the map stays visible

#### 2. **Smarter Geocoding Logic**
- **Before**: Only geocoded if `!address.lat` (never updated existing coordinates)
- **After**: Always re-geocodes when address fields change, but:
  - Tracks the last query to avoid redundant API calls
  - Only updates if geocoding succeeds (keeps old marker if it fails)
  - Shows loading state while geocoding is in progress

#### 3. **Added Loading State UI**
- New `isGeocoding` state tracks when we're fetching updated coordinates
- Blue "Updating map location..." hint appears above the map
- Map dims with a semi-transparent overlay
- Spinner shows in the center with "Updating location..." message

#### 4. **Enhanced Map Component** (`OSMMapPreview.js`)
- Added `isLoading` prop
- Map iframe dims to 50% opacity while loading
- Beautiful overlay with backdrop blur and centered spinner
- Smooth transition when loading completes

---

## 🎯 New User Experience

### Scenario: Refining an Autocomplete Selection

1. **User types** "Bahnhofstrasse" in search → selects from dropdown
2. ✅ **Map appears** with marker
3. **User edits** street field: "Bahnhofstrasse 1" → "Bahnhofstrasse 15"
4. 🔄 **Map stays visible** (shows last known location)
5. 🔵 **Blue hint appears**: "Updating map location..."
6. 💫 **Map dims** with spinner overlay
7. ⏱️ **After 1.5s** of no typing: geocodes new address
8. ✅ **Map updates** to new marker position
9. 🟢 **Green hint**: "Location found! The map below shows your address."

### Smart Features

**No Redundant API Calls**
- Tracks the last geocoded query
- Only calls Nominatim if the address actually changed
- Example: Typing "Zurich" → "Zürich" won't trigger a new API call if result is the same

**Graceful Degradation**
- If geocoding fails (no results), map stays on last known good location
- User doesn't see a blank space or error—just the previous marker

**Visual Feedback**
- Blue hint + spinner = "I'm working on it"
- Green checkmark = "Done! New location found"
- Map never disappears while you're actively refining the address

---

## 📊 Technical Details

### State Management
```javascript
const [isGeocoding, setIsGeocoding] = useState(false);
const lastGeocodeQueryRef = useRef("");
```

### Query Tracking
Prevents duplicate API calls by comparing current vs. last geocoded query:
```javascript
const query = [street, zip, city, country].filter(Boolean).join(", ");
if (query === lastGeocodeQueryRef.current) return; // Skip
```

### Loading Overlay (OSMMapPreview)
```javascript
{isLoading && (
  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]">
    <Spinner + "Updating location..." />
  </div>
)}
```

---

## 🎨 Visual Changes

### Before Fix
```
User edits street field
         ↓
Map disappears (no coordinates)
         ↓
Wait 1.5s...
         ↓
Map reappears (geocoded)
```
❌ **Jarring experience**: Map blinks in/out

### After Fix
```
User edits street field
         ↓
Map stays visible (last location)
         ↓
Blue hint + spinner overlay appear
         ↓
Wait 1.5s...
         ↓
Map smoothly updates to new location
         ↓
Green success hint
```
✅ **Smooth experience**: Map stays visible, just updates in place

---

## 🧪 Testing

To test the fix:

1. **Open order creation** (any role)
2. **Navigate to** "Addresses & Details" step
3. **Search autocomplete**: Type "Paris" → select "Paris, France"
4. ✅ Map appears
5. **Edit street field**: Type additional text like "15 Rue de..."
6. ✅ Map should **stay visible** (dimmed)
7. ✅ Blue "Updating..." hint should appear
8. ✅ Wait 1.5s → map should update to new location
9. ✅ Green "Location found!" hint should appear

---

## 📝 Files Modified

- ✅ `CustomerAddressStep.js` - Removed coordinate clearing, added loading state
- ✅ `OSMMapPreview.js` - Added loading overlay with spinner

---

## 🚀 Result

The address input now feels like a **professional mapping application**:
- Instant visual feedback
- Map never disappears unexpectedly
- Smooth loading transitions
- Clear status indicators

Users can confidently refine their addresses knowing the map will stay visible and update intelligently! 🎉

