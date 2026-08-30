/**
 * Utility to asynchronously load the Google Maps JavaScript API.
 * Uses the API key from Vite env, with fallback to the provided demo key.
 */

const DEFAULT_KEY = 'AIzaSyCw34wRhYoLDd03xoNv33qdN17lYe-GWGc';

let loadPromise = null;

export function getGoogleMapsApiKey() {
  return import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || DEFAULT_KEY;
}

export function loadGoogleMapsScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window undefined'));

  // If already loaded and Map constructor is ready
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve(window.google.maps);
  }

  // Return existing in-flight promise if one exists
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Check if window.google.maps.Map is already ready
    if (window.google && window.google.maps && window.google.maps.Map) {
      resolve(window.google.maps);
      return;
    }

    // Check if script tag is already in DOM
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Poll briefly for Map constructor
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.google && window.google.maps && window.google.maps.Map) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps script exists but Map constructor timed out'));
        }
      }, 5000);
      return;
    }

    const callbackName = `__initGoogleMapsCallback_${Date.now()}`;
    window[callbackName] = () => {
      try {
        delete window[callbackName];
      } catch (e) {
        window[callbackName] = undefined;
      }

      if (window.google && window.google.maps && window.google.maps.Map) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps loaded but Map constructor is not ready'));
      }
    };

    const apiKey = getGoogleMapsApiKey();
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    // NOTE: DO NOT use &loading=async here as it only loads a 13KB stub without the Map class
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;

    script.onerror = (err) => {
      try {
        delete window[callbackName];
      } catch (e) {
        window[callbackName] = undefined;
      }
      loadPromise = null; // allow retry on next attempt
      console.warn('Google Maps script failed to load:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Night theme custom map style for Google Maps to match GetAlong's dark aesthetic
 */
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d23' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#15171b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8e939d' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f2b705' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#858992' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#232822' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b8a4f' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2b3038' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1c1f24' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d4450' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#23272f' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f2b705' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#23272e' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1115' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a5160' }]
  }
];
