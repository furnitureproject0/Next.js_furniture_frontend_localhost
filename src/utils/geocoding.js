/**
 * Geocoding utilities for converting addresses to coordinates
 * Uses OpenStreetMap Nominatim API
 */

/**
 * Geocode a manual address entry (street, zip, city, country)
 * Returns lat/lon of the best match or null if not found
 */
export async function geocodeAddress({ street, zip, city, country }) {
    // Build query string from available parts
    const parts = [];
    if (street) parts.push(street);
    if (zip) parts.push(zip);
    if (city) parts.push(city);
    if (country) parts.push(country);
    
    const query = parts.join(', ');
    
    if (!query || query.length < 3) {
        return null;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
            const place = data[0];
            return {
                lat: place.lat,
                lon: place.lon,
                place_id: place.place_id,
                display_name: place.display_name,
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Parse address components from a Nominatim place object
 * Returns structured address data matching your form fields
 */
export function parseAddressFromPlace(place) {
    const addr = place.address || {};
    
    return {
        street: addr.road || addr.street || '',
        zip: addr.postcode || '',
        city: addr.city || addr.town || addr.village || '',
        country: addr.country || '',
        lat: place.lat,
        lon: place.lon,
        place_id: place.place_id,
    };
}

