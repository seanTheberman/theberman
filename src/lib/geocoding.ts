/**
 * Geocodes an address string using OpenStreetMap's Nominatim API.
 * Returns { latitude, longitude } or null if not found.
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address) return null;

    try {
        // Append ", Ireland" context if not present to improve accuracy for this app context if needed
        const query = address.toLowerCase().includes('ireland') ? address : `${address}, Ireland`;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
            headers: {
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.warn('Geocoding failed for address:', address, error);
    }

    return null;
};

/**
 * Approximate center coordinates for Irish counties to serve as a fallback.
 */
export const COUNTY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
    'Carlow': { latitude: 52.7183, longitude: -6.8778 },
    'Cavan': { latitude: 53.9897, longitude: -7.3633 },
    'Clare': { latitude: 52.8917, longitude: -9.0939 },
    'Cork': { latitude: 51.8985, longitude: -8.4756 },
    'Donegal': { latitude: 54.7084, longitude: -8.1041 },
    'Dublin': { latitude: 53.3498, longitude: -6.2603 },
    'Galway': { latitude: 53.2707, longitude: -9.0568 },
    'Kerry': { latitude: 52.1417, longitude: -9.5236 },
    'Kildare': { latitude: 53.1599, longitude: -6.7412 },
    'Kilkenny': { latitude: 52.6541, longitude: -7.2448 },
    'Laois': { latitude: 52.9943, longitude: -7.3323 },
    'Leitrim': { latitude: 54.1247, longitude: -8.0494 },
    'Limerick': { latitude: 52.6638, longitude: -8.6267 },
    'Longford': { latitude: 53.7272, longitude: -7.7932 },
    'Louth': { latitude: 53.9213, longitude: -6.4333 },
    'Mayo': { latitude: 53.8508, longitude: -9.2988 },
    'Meath': { latitude: 53.6055, longitude: -6.6592 },
    'Monaghan': { latitude: 54.2492, longitude: -6.9683 },
    'Offaly': { latitude: 53.2339, longitude: -7.5259 },
    'Roscommon': { latitude: 53.6273, longitude: -8.1897 },
    'Sligo': { latitude: 54.2766, longitude: -8.4761 },
    'Tipperary': { latitude: 52.4735, longitude: -7.9531 },
    'Waterford': { latitude: 52.2593, longitude: -7.1101 },
    'Westmeath': { latitude: 53.5345, longitude: -7.4653 },
    'Wexford': { latitude: 52.3369, longitude: -6.4633 },
    'Wicklow': { latitude: 52.9808, longitude: -6.3675 }
};
