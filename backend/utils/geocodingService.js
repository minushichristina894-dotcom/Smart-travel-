const axios = require('axios');
const SRI_LANKA_PLACES = require('../data/sriLankaPlaces');

const OWM_GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const getApiKey = () => {
  const key = process.env.OPENWEATHER_API_KEY?.trim();
  if (!key || key === 'your_openweathermap_api_key') return null;
  return key;
};

/** Search local Sri Lanka places list */
const searchLocalPlaces = (query, limit = 8) => {
  const q = query.trim().toLowerCase();
  if (!q) return SRI_LANKA_PLACES.slice(0, limit).map(formatLocalPlace);

  return SRI_LANKA_PLACES
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(formatLocalPlace);
};

const formatLocalPlace = (p) => ({
  name: p.name,
  lat: p.lat,
  lon: p.lon,
  country: 'Sri Lanka',
  state: '',
});

/**
 * Search any place in Sri Lanka (OpenWeather Geocoding + local fallback)
 */
const searchPlaces = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { places: searchLocalPlaces('', 10) };
  }

  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const { data } = await axios.get(OWM_GEO_URL, {
        params: { q: `${trimmed},LK`, limit: 8, appid: apiKey },
        timeout: 10000,
      });

      const places = (data || [])
        .filter((p) => p.country === 'LK')
        .map((p) => ({
          name: p.local_names?.en || p.name,
          lat: p.lat,
          lon: p.lon,
          country: 'Sri Lanka',
          state: p.state || '',
        }));

      if (places.length) return { places };
    } catch (error) {
      if (error.response?.status !== 401) {
        console.warn('Geocoding search failed:', error.message);
      }
    }
  }

  const local = searchLocalPlaces(trimmed);
  if (local.length) return { places: local };

  throw new Error(`Place "${trimmed}" not found in Sri Lanka. Try: Kandy, Ella, Galle, Colombo...`);
};

/**
 * Resolve place name to coordinates for weather fetch
 */
const resolvePlace = async (placeName) => {
  const trimmed = placeName?.trim();
  if (!trimmed) {
    throw new Error('Please enter a place name in Sri Lanka.');
  }

  const { places } = await searchPlaces(trimmed);
  if (!places.length) {
    throw new Error(`"${trimmed}" not found. Enter a valid Sri Lanka city or town.`);
  }

  // Exact match first, otherwise first result
  const exact = places.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  return exact || places[0];
};

module.exports = { searchPlaces, resolvePlace };
