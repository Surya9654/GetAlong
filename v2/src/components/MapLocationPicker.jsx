import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Check, X, Search, Plus, Trash2, ArrowRight } from 'lucide-react';
import { loadGoogleMapsScript, DARK_MAP_STYLE } from '../utils/googleMapsLoader.js';
import { computeDrivingRoute } from '../utils/routesService.js';

// Curated popular motorcycle hubs around South India for quick selection
const POPULAR_HUBS = [
  { name: 'ECR Toll Gate, Chennai', lat: 12.9056, lng: 80.2458 },
  { name: 'Mahabalipuram Shore', lat: 12.6190, lng: 80.1932 },
  { name: 'Pondicherry Promenade', lat: 11.9340, lng: 79.8350 },
  { name: 'Sriperumbudur Toll', lat: 12.9734, lng: 79.9427 },
  { name: 'Yelagiri Hills Top', lat: 12.5833, lng: 78.6333 },
  { name: 'Kolli Hills (70 Hairpins)', lat: 11.2500, lng: 78.3333 },
  { name: 'Vellore Golden Temple', lat: 12.8710, lng: 79.0850 },
  { name: 'Kanchipuram Bypass', lat: 12.8342, lng: 79.7036 }
];

export default function MapLocationPicker({
  initialStart = '',
  initialEnd = '',
  initialStops = [],
  initialDistanceKm = '',
  initialTarget = 'start', // 'start' | 'end' | 'add_stop'
  theme = 'night',
  colors = {},
  onSelectRoute,
  onClose
}) {
  const [activeTarget, setActiveTarget] = useState(initialTarget); // 'start' | 'end' | 'add_stop' | `stop_${id}`
  const [startName, setStartName] = useState(initialStart);
  const [endName, setEndName] = useState(initialEnd);
  // stops: array of { id: string, name: string, coords: { lat, lng } }
  const [stops, setStops] = useState(() =>
    (initialStops || []).map((s, idx) => ({
      id: `stop_${idx}_${Date.now()}`,
      name: typeof s === 'string' ? s : s.name,
      coords: typeof s === 'object' && s.coords ? s.coords : null,
    }))
  );

  const [distanceKm, setDistanceKm] = useState(initialDistanceKm);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routePolyline, setRoutePolyline] = useState('');

  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isComputingRoute, setIsComputingRoute] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const stopMarkersRef = useRef({});
  const roadPolylineRef = useRef(null);
  const geocoderRef = useRef(null);

  // Use a Ref for activeTarget to guarantee event listeners read the latest active target!
  const activeTargetRef = useRef(activeTarget);
  useEffect(() => {
    activeTargetRef.current = activeTarget;
  }, [activeTarget]);

  const C = colors;

  // Reverse geocode a lat/lng position to clean, concise address/locality
  const reverseGeocode = useCallback((coords, callback) => {
    if (!geocoderRef.current) return;
    setIsGeocoding(true);

    geocoderRef.current.geocode({ location: coords }, (results, status) => {
      setIsGeocoding(false);
      let bestName = `Point (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`;
      if (status === 'OK' && results && results[0]) {
        const comps = results[0].address_components || [];
        const poi = comps.find(c => c.types.includes('point_of_interest') || c.types.includes('establishment'))?.long_name;
        const sublocality = comps.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'))?.long_name;
        const locality = comps.find(c => c.types.includes('locality'))?.long_name;
        const route = comps.find(c => c.types.includes('route'))?.long_name;

        // Clean concise 1-2 part landmark/locality name
        const primary = poi || sublocality || route;
        if (primary && locality && primary !== locality) {
          bestName = `${primary}, ${locality}`;
        } else if (locality) {
          bestName = locality;
        } else if (primary) {
          bestName = primary;
        } else {
          bestName = results[0].formatted_address.split(',')[0].trim();
        }
      }
      callback(bestName);
    });
  }, []);

  // Compute road route through Start -> Stop 1 -> Stop 2 -> End
  const recalculateRoadRoute = useCallback(async (start, end, currentStops) => {
    if (!window.google?.maps || !start || !end || !mapInstanceRef.current) return;
    const gMaps = window.google.maps;

    setIsComputingRoute(true);

    // Collect intermediate coordinates for stops with valid coords
    const intermediateCoords = (currentStops || [])
      .map(s => s.coords)
      .filter(Boolean);

    try {
      const result = await computeDrivingRoute(start, end, intermediateCoords);
      setIsComputingRoute(false);

      if (result.distanceKm) {
        setDistanceKm(result.distanceKm);
      }
      if (result.polyline) {
        setRoutePolyline(result.polyline);
      }

      // Render actual road polyline on Google Map
      if (roadPolylineRef.current) {
        roadPolylineRef.current.setMap(null);
      }

      const path = result.path.map(p => new gMaps.LatLng(p.lat, p.lng));
      roadPolylineRef.current = new gMaps.Polyline({
        path,
        geodesic: true,
        strokeColor: C.amber || '#F2B705',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: mapInstanceRef.current,
      });

      // Fit map bounds to view entire route
      const bounds = new gMaps.LatLngBounds();
      path.forEach(pt => bounds.extend(pt));
      mapInstanceRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    } catch (err) {
      setIsComputingRoute(false);
      console.warn('Road routing error:', err);
    }
  }, [C.amber]);

  // Handle map click
  const handleMapClick = useCallback((latLng) => {
    const coords = { lat: latLng.lat(), lng: latLng.lng() };
    const currentTarget = activeTargetRef.current;

    if (currentTarget === 'start') {
      setStartCoords(coords);
      reverseGeocode(coords, (name) => setStartName(name));
      // Guide user to destination if not set yet
      if (!endCoords) {
        setActiveTarget('end');
        activeTargetRef.current = 'end';
      }
    } else if (currentTarget === 'end') {
      setEndCoords(coords);
      reverseGeocode(coords, (name) => setEndName(name));
    } else if (currentTarget === 'add_stop' || currentTarget.startsWith('stop_')) {
      // User is adding an intermediate stop within S and D
      const newStopId = currentTarget === 'add_stop' ? `stop_${Date.now()}` : currentTarget;
      reverseGeocode(coords, (name) => {
        setStops((prev) => {
          const exists = prev.find(s => s.id === newStopId);
          if (exists) {
            return prev.map(s => s.id === newStopId ? { ...s, coords, name } : s);
          } else {
            return [...prev, { id: newStopId, coords, name }];
          }
        });
      });
      // Return to viewing route
      setActiveTarget(null);
      activeTargetRef.current = null;
    }
  }, [endCoords, reverseGeocode]);

  // Load Google Maps and Initialize
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const defaultCenter = { lat: 12.98, lng: 80.18 }; // Chennai default
        const map = new googleMaps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 9,
          styles: theme === 'night' ? DARK_MAP_STYLE : [],
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new googleMaps.Geocoder();

        map.addListener('click', (e) => {
          handleMapClick(e.latLng);
        });

        // Geocode initial start and end text if present
        if (initialStart) {
          geocoderRef.current.geocode({ address: initialStart }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const loc = results[0].geometry.location;
              const c = { lat: loc.lat(), lng: loc.lng() };
              setStartCoords(c);
              if (initialTarget === 'start') map.panTo(c);
            }
          });
        }

        if (initialEnd) {
          geocoderRef.current.geocode({ address: initialEnd }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const loc = results[0].geometry.location;
              const c = { lat: loc.lat(), lng: loc.lng() };
              setEndCoords(c);
              if (initialTarget === 'end') map.panTo(c);
            }
          });
        }

        setLoadingMap(false);

        // Force resize trigger after modal mounts to ensure all tiles render
        setTimeout(() => {
          if (mapInstanceRef.current && window.google?.maps) {
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
            mapInstanceRef.current.setCenter(defaultCenter);
          }
        }, 150);
      })
      .catch((err) => {
        console.warn('Google Maps could not be loaded:', err);
        if (isMounted) {
          setMapError(err.message || 'Google Maps failed to load. Please check network connection.');
          setLoadingMap(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Start Marker
  useEffect(() => {
    if (!window.google?.maps || !mapInstanceRef.current || !startCoords) return;
    const gMaps = window.google.maps;

    if (!startMarkerRef.current) {
      const marker = new gMaps.Marker({
        position: startCoords,
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Starting Point (Drag to adjust)',
        label: { text: 'S', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px' },
        icon: {
          path: gMaps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: C.moss || '#7A9B5C',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      marker.addListener('dragend', (e) => {
        const c = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setStartCoords(c);
        reverseGeocode(c, (name) => setStartName(name));
      });

      startMarkerRef.current = marker;
    } else {
      startMarkerRef.current.setPosition(startCoords);
    }
  }, [startCoords, C.moss, reverseGeocode]);

  // Update Destination Marker
  useEffect(() => {
    if (!window.google?.maps || !mapInstanceRef.current || !endCoords) return;
    const gMaps = window.google.maps;

    if (!endMarkerRef.current) {
      const marker = new gMaps.Marker({
        position: endCoords,
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Destination (Drag to adjust)',
        label: { text: 'D', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px' },
        icon: {
          path: gMaps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: C.hardcoreRed || '#D9432E',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      marker.addListener('dragend', (e) => {
        const c = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setEndCoords(c);
        reverseGeocode(c, (name) => setEndName(name));
      });

      endMarkerRef.current = marker;
    } else {
      endMarkerRef.current.setPosition(endCoords);
    }
  }, [endCoords, C.hardcoreRed, reverseGeocode]);

  // Update Stop Markers
  useEffect(() => {
    if (!window.google?.maps || !mapInstanceRef.current) return;
    const gMaps = window.google.maps;

    // Remove obsolete stop markers
    Object.keys(stopMarkersRef.current).forEach((id) => {
      if (!stops.find(s => s.id === id)) {
        stopMarkersRef.current[id].setMap(null);
        delete stopMarkersRef.current[id];
      }
    });

    // Create or update stop markers
    stops.forEach((stop, index) => {
      if (!stop.coords) return;
      const markerNumber = String(index + 1);

      if (!stopMarkersRef.current[stop.id]) {
        const marker = new gMaps.Marker({
          position: stop.coords,
          map: mapInstanceRef.current,
          draggable: true,
          title: `Stop ${markerNumber}: ${stop.name}`,
          label: { text: markerNumber, color: '#15171B', fontWeight: 'bold', fontSize: '11px' },
          icon: {
            path: gMaps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: C.amber || '#F2B705',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        marker.addListener('dragend', (e) => {
          const c = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          reverseGeocode(c, (newName) => {
            setStops((prev) => prev.map(s => s.id === stop.id ? { ...s, coords: c, name: newName } : s));
          });
        });

        stopMarkersRef.current[stop.id] = marker;
      } else {
        stopMarkersRef.current[stop.id].setPosition(stop.coords);
        stopMarkersRef.current[stop.id].setLabel({
          text: markerNumber,
          color: '#15171B',
          fontWeight: 'bold',
          fontSize: '11px',
        });
      }
    });
  }, [stops, C.amber, reverseGeocode]);

  // Recalculate route whenever start, end, or stops change
  useEffect(() => {
    if (startCoords && endCoords) {
      recalculateRoadRoute(startCoords, endCoords, stops);
    }
  }, [startCoords, endCoords, stops, recalculateRoadRoute]);

  // Remove a stop
  const handleRemoveStop = (stopId) => {
    if (stopMarkersRef.current[stopId]) {
      stopMarkersRef.current[stopId].setMap(null);
      delete stopMarkersRef.current[stopId];
    }
    setStops(prev => prev.filter(s => s.id !== stopId));
  };

  // Add stop trigger
  const handleTriggerAddStop = () => {
    if (!startCoords || !endCoords) {
      alert('Please select both Starting Point and Destination before adding stops along the route.');
      return;
    }
    setActiveTarget('add_stop');
    activeTargetRef.current = 'add_stop';
  };

  // Search input submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !geocoderRef.current) return;
    setIsGeocoding(true);

    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        const name = results[0].address_components[0]?.long_name || searchQuery;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(coords);
          mapInstanceRef.current.setZoom(12);
        }

        const currentTarget = activeTargetRef.current;
        if (currentTarget === 'start') {
          setStartCoords(coords);
          setStartName(name);
          if (!endCoords) {
            setActiveTarget('end');
            activeTargetRef.current = 'end';
          }
        } else if (currentTarget === 'end') {
          setEndCoords(coords);
          setEndName(name);
        } else if (currentTarget === 'add_stop') {
          setStops(prev => [...prev, { id: `stop_${Date.now()}`, coords, name }]);
          setActiveTarget(null);
          activeTargetRef.current = null;
        }
        setSearchQuery('');
      } else {
        alert('Location not found. Try tapping directly on the map or picking a popular spot below.');
      }
    });
  };

  // Select a preset riding hub
  const handleSelectPresetHub = (hub) => {
    const coords = { lat: hub.lat, lng: hub.lng };
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(coords);
      mapInstanceRef.current.setZoom(11);
    }

    const currentTarget = activeTargetRef.current;
    if (currentTarget === 'start') {
      setStartCoords(coords);
      setStartName(hub.name);
      if (!endCoords) {
        setActiveTarget('end');
        activeTargetRef.current = 'end';
      }
    } else if (currentTarget === 'end') {
      setEndCoords(coords);
      setEndName(hub.name);
    } else if (currentTarget === 'add_stop') {
      setStops(prev => [...prev, { id: `stop_${Date.now()}`, coords, name: hub.name }]);
      setActiveTarget(null);
      activeTargetRef.current = null;
    }
  };

  // Apply route and return to form
  const handleApply = () => {
    onSelectRoute({
      start: startName,
      end: endName,
      stops: stops.map(s => s.name).filter(Boolean),
      distanceKm: distanceKm ? Number(distanceKm) : null,
      startCoords,
      endCoords,
      routePolyline
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 animate-blur-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      <div
        className="glass-card w-full max-w-lg rounded-2xl flex flex-col overflow-hidden border"
        style={{ height: '92vh', maxHeight: 780, borderColor: `${C.amber || '#F2B705'}44` }}
      >
        {/* ── Top Header ── */}
        <div className="p-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border || '#33373D'}44` }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full" style={{ backgroundColor: `${C.amber || '#F2B705'}18`, color: C.amber || '#F2B705' }}>
                <Navigation size={18} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: C.textPrimary || '#F2EFE9' }}>
                  Road Route & Stops Planner
                </h3>
                <p style={{ fontSize: 11, color: C.textMuted || '#9297A0' }}>
                  Select Start ➔ Add Stops within route ➔ Select Destination
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:brightness-125"
              style={{ color: C.textMuted || '#9297A0' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Route Target Selector: Start, Stops, Destination */}
          <div className="flex flex-col gap-1.5">
            {/* Start & Destination Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Start Point Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTarget('start');
                  activeTargetRef.current = 'start';
                  if (startCoords && mapInstanceRef.current) mapInstanceRef.current.panTo(startCoords);
                }}
                className="p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTarget === 'start' ? `${C.moss || '#7A9B5C'}25` : `${C.surfaceRaised || '#262A30'}88`,
                  borderColor: activeTarget === 'start' ? (C.moss || '#7A9B5C') : `${C.border || '#33373D'}66`,
                  boxShadow: activeTarget === 'start' ? `0 0 12px ${C.moss || '#7A9B5C'}40` : 'none',
                  transform: activeTarget === 'start' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-2xs font-bold text-white"
                  style={{ backgroundColor: C.moss || '#7A9B5C', boxShadow: `0 0 8px ${C.moss || '#7A9B5C'}` }}
                >
                  S
                </div>
                <div className="truncate flex-1">
                  <span className="block font-mono uppercase font-semibold" style={{ fontSize: 9, color: activeTarget === 'start' ? (C.moss || '#7A9B5C') : (C.textMuted || '#9297A0') }}>
                    {activeTarget === 'start' ? '● Setting Start' : 'Start Point'}
                  </span>
                  <span className="block font-medium truncate text-xs" style={{ color: C.textPrimary || '#F2EFE9' }}>
                    {startName || 'Click map to set'}
                  </span>
                </div>
              </button>

              {/* Destination Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTarget('end');
                  activeTargetRef.current = 'end';
                  if (endCoords && mapInstanceRef.current) mapInstanceRef.current.panTo(endCoords);
                }}
                className="p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTarget === 'end' ? `${C.hardcoreRed || '#D9432E'}25` : `${C.surfaceRaised || '#262A30'}88`,
                  borderColor: activeTarget === 'end' ? (C.hardcoreRed || '#D9432E') : `${C.border || '#33373D'}66`,
                  boxShadow: activeTarget === 'end' ? `0 0 12px ${C.hardcoreRed || '#D9432E'}40` : 'none',
                  transform: activeTarget === 'end' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-2xs font-bold text-white"
                  style={{ backgroundColor: C.hardcoreRed || '#D9432E', boxShadow: `0 0 8px ${C.hardcoreRed || '#D9432E'}` }}
                >
                  D
                </div>
                <div className="truncate flex-1">
                  <span className="block font-mono uppercase font-semibold" style={{ fontSize: 9, color: activeTarget === 'end' ? (C.hardcoreRed || '#D9432E') : (C.textMuted || '#9297A0') }}>
                    {activeTarget === 'end' ? '● Setting Destination' : 'Destination'}
                  </span>
                  <span className="block font-medium truncate text-xs" style={{ color: C.textPrimary || '#F2EFE9' }}>
                    {endName || 'Click map to set'}
                  </span>
                </div>
              </button>
            </div>

            {/* Intermediate Stops Strip (Within S and D) */}
            <div
              className="p-2 rounded-xl border flex flex-col gap-1.5"
              style={{
                backgroundColor: activeTarget === 'add_stop' ? `${C.amber || '#F2B705'}18` : `${C.surfaceRaised || '#262A30'}66`,
                borderColor: activeTarget === 'add_stop' ? (C.amber || '#F2B705') : `${C.border || '#33373D'}55`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xs uppercase text-amber-400 font-semibold flex items-center gap-1.5">
                  <span>Stops (Within S & D)</span>
                  {stops.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-2xs">
                      {stops.length}
                    </span>
                  )}
                </span>

                {/* Add Stop Button */}
                <button
                  type="button"
                  onClick={handleTriggerAddStop}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: activeTarget === 'add_stop' ? (C.amber || '#F2B705') : `${C.amber || '#F2B705'}22`,
                    color: activeTarget === 'add_stop' ? (C.bg || '#15171B') : (C.amber || '#F2B705'),
                    border: `1px solid ${C.amber || '#F2B705'}66`,
                  }}
                >
                  <Plus size={11} /> {activeTarget === 'add_stop' ? 'Tap map to place' : 'Add Stop'}
                </button>
              </div>

              {stops.length === 0 ? (
                <p className="text-2xs italic m-0" style={{ color: C.textFaint || '#5B5F66' }}>
                  No stops added yet. Click &quot;Add Stop&quot; then tap along the route on the map.
                </p>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {stops.map((stop, i) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-1.5 rounded-lg pl-2 pr-1 py-1 border flex-shrink-0 text-xs"
                      style={{
                        backgroundColor: `${C.surface || '#1E2126'}ee`,
                        borderColor: `${C.amber || '#F2B705'}44`,
                        color: C.textPrimary || '#F2EFE9',
                      }}
                    >
                      <span className="font-mono font-bold text-2xs px-1 rounded bg-amber-400/20 text-amber-400">
                        #{i + 1}
                      </span>
                      <span className="max-w-[110px] truncate text-2xs font-medium" title={stop.name}>
                        {stop.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="hover:text-red-400 p-0.5 rounded transition-colors text-gray-400"
                        title="Remove stop"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search location for ${
                  activeTarget === 'start'
                    ? 'Starting Point'
                    : activeTarget === 'end'
                    ? 'Destination'
                    : 'Intermediate Stop'
                }...`}
                className="w-full rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                style={{
                  backgroundColor: `${C.surface || '#1E2126'}ee`,
                  color: C.textPrimary || '#F2EFE9',
                  border: `1px solid ${C.border || '#33373D'}88`
                }}
              />
              <Search size={13} className="absolute left-2.5 top-2" style={{ color: C.textFaint || '#5B5F66' }} />
            </div>
            <button
              type="submit"
              disabled={isGeocoding}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: C.amber || '#F2B705', color: C.bg || '#15171B' }}
            >
              {isGeocoding ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {/* ── Quick Hubs Chips ── */}
        <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto flex-shrink-0" style={{ borderBottom: `1px solid ${C.border || '#33373D'}33` }}>
          <span className="font-mono text-2xs uppercase self-center flex-shrink-0 mr-1" style={{ color: C.textFaint || '#5B5F66' }}>
            Hubs:
          </span>
          {POPULAR_HUBS.map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelectPresetHub(hub)}
              className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors hover:brightness-110"
              style={{
                backgroundColor: `${C.surfaceRaised || '#262A30'}cc`,
                color: C.textMuted || '#9297A0',
                border: `1px solid ${C.border || '#33373D'}66`,
                fontSize: 10,
              }}
            >
              {hub.name.split(',')[0]}
            </button>
          ))}
        </div>

        {/* ── Map Container ── */}
        <div
          className="flex-1 relative min-h-0 bg-neutral-900 overflow-hidden cursor-crosshair"
          style={{ minHeight: 220, position: 'relative' }}
        >
          <div
            ref={mapContainerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Map Error Banner */}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/85 z-20 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <MapPin size={24} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Google Maps could not load</p>
              <p className="text-xs text-gray-400 mb-4 max-w-xs">{mapError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-black hover:brightness-110"
              >
                Reload App
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {loadingMap && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `3px solid ${C.amber || '#F2B705'}`,
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span className="mt-3 text-xs font-mono" style={{ color: C.textPrimary || '#F2EFE9' }}>
                Loading Map...
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Floating Instructions Banner */}
          <div className="absolute top-2.5 left-2.5 right-2.5 pointer-events-none flex justify-center z-10">
            <div
              className="px-3.5 py-1 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 border"
              style={{
                backgroundColor: 'rgba(21, 23, 27, 0.92)',
                color:
                  activeTarget === 'start'
                    ? (C.moss || '#7A9B5C')
                    : activeTarget === 'end'
                    ? (C.hardcoreRed || '#D9432E')
                    : (C.amber || '#F2B705'),
                borderColor:
                  activeTarget === 'start'
                    ? `${C.moss || '#7A9B5C'}77`
                    : activeTarget === 'end'
                    ? `${C.hardcoreRed || '#D9432E'}77`
                    : `${C.amber || '#F2B705'}77`,
              }}
            >
              <MapPin size={13} />
              <span>
                {activeTarget === 'start' && 'Click map to place Starting Point 🟢'}
                {activeTarget === 'end' && 'Click map to place Destination 🟠'}
                {activeTarget === 'add_stop' && `Click map along route to add Stop #${stops.length + 1} 🟡`}
                {!activeTarget && 'Route ready! Drag pins or click "Add Stop"'}
              </span>
            </div>
          </div>

          {/* Distance Indicator Pill (Real Road Calculation) */}
          <div className="absolute bottom-3 left-3 z-10">
            <div
              className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold shadow-lg backdrop-blur-md border flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(21, 23, 27, 0.94)',
                borderColor: `${C.amber || '#F2B705'}66`,
                color: C.amber || '#F2B705'
              }}
            >
              <Navigation size={13} />
              <span>
                {isComputingRoute
                  ? 'Calculating road route...'
                  : distanceKm
                  ? `Road Route: ${distanceKm} km`
                  : 'Select S & D for road distance'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom Controls ── */}
        <div
          className="p-3 flex items-center justify-between gap-2 flex-shrink-0 z-20"
          style={{
            borderTop: `1px solid ${C.border || '#33373D'}44`,
            backgroundColor: `${C.surface || '#1E2126'}f5`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="text-xs truncate flex-1 min-w-0 pr-1">
            <span style={{ color: C.textMuted || '#9297A0' }}>Route: </span>
            <strong style={{ color: C.textPrimary || '#F2EFE9' }}>
              {startName || 'Start'}
              {stops.length > 0 && ` ➔ ${stops.length} stop${stops.length > 1 ? 's' : ''}`}
              {' ➔ '}{endName || 'Destination'}
            </strong>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-full text-xs font-medium border cursor-pointer hover:brightness-110"
              style={{ backgroundColor: C.surfaceRaised || '#262A30', borderColor: C.border || '#33373D', color: C.textMuted || '#9297A0' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!startName || !endName}
              className="px-4 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer"
              style={{
                backgroundColor: startName && endName ? (C.amber || '#F2B705') : (C.surfaceRaised || '#262A30'),
                color: startName && endName ? (C.bg || '#15171B') : (C.textFaint || '#5B5F66'),
                cursor: startName && endName ? 'pointer' : 'not-allowed',
                boxShadow: startName && endName ? `0 2px 12px ${C.amber || '#F2B705'}50` : 'none',
              }}
            >
              Apply Route ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
