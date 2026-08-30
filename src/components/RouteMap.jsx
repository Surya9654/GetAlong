import React, { useEffect, useState, useRef } from 'react';
import { loadGoogleMapsScript, DARK_MAP_STYLE } from '../utils/googleMapsLoader.js';
import { computeDrivingRoute } from '../utils/routesService.js';

/**
 * RouteMap
 * Displays the route for a given ride.
 *
 * 1. Computes the real road driving route through Start -> Stops -> Destination
 *    using Google Routes API v2 / OSRM.
 * 2. Renders the road polyline and checkpoint markers on Google Map.
 * 3. Falls back gracefully to SVG if offline or unavailable.
 */
export default function RouteMap({ ride, colors, theme = 'night' }) {
  const [svg, setSvg] = useState(() => ride?.routeSvg || null);
  const [loading, setLoading] = useState(!ride?.routeSvg);
  const [useGoogleMap, setUseGoogleMap] = useState(false);
  const [googleMapError, setGoogleMapError] = useState(false);

  const googleMapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);

  const C = colors || {};

  // 1. Fetch SVG if not already attached to the ride object
  useEffect(() => {
    if (ride?.routeSvg) {
      setSvg(ride.routeSvg);
      setLoading(false);
      return;
    }
    if (!ride?.id) return;

    fetch(`/api/rides/${ride.id}/mock-map`)
      .then((r) => (r.ok ? r.json() : Promise.reject('No mock map')))
      .then((data) => {
        setSvg(data.svg);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [ride?.id, ride?.routeSvg]);

  // 2. Load Google Map and compute real road driving route
  useEffect(() => {
    if (!ride?.points || ride.points.length < 2 || googleMapError) return;

    let isMounted = true;

    loadGoogleMapsScript()
      .then((googleMaps) => {
        if (!isMounted || !googleMapContainerRef.current) return;

        const geocoder = new googleMaps.Geocoder();

        // Helper to geocode an address string
        const geocodePoint = (address) =>
          new Promise((resolve) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
              } else {
                resolve(null);
              }
            });
          });

        // Geocode start, stops, end in parallel
        const startAddr = ride.points[0];
        const endAddr = ride.points[ride.points.length - 1];
        const stopAddrs = ride.points.slice(1, -1);

        Promise.all([
          geocodePoint(startAddr),
          geocodePoint(endAddr),
          Promise.all(stopAddrs.map(s => geocodePoint(s)))
        ]).then(async ([startCoords, endCoords, stopCoordsArray]) => {
          if (!isMounted || !startCoords || !endCoords) {
            setGoogleMapError(true);
            return;
          }

          const validIntermediates = stopCoordsArray.filter(Boolean);

          try {
            const routeResult = await computeDrivingRoute(startCoords, endCoords, validIntermediates);
            if (!isMounted) return;

            setUseGoogleMap(true);

            // Initialize Map
            const map = new googleMaps.Map(googleMapContainerRef.current, {
              zoom: 9,
              styles: theme === 'night' ? DARK_MAP_STYLE : [],
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: 'greedy',
            });

            mapInstanceRef.current = map;

            // Draw Road Polyline
            const path = routeResult.path.map(p => new googleMaps.LatLng(p.lat, p.lng));
            if (polylineRef.current) polylineRef.current.setMap(null);
            polylineRef.current = new googleMaps.Polyline({
              path,
              geodesic: true,
              strokeColor: C.amber || '#F2B705',
              strokeWeight: 5,
              strokeOpacity: 0.9,
              map,
            });

            // Start Marker
            new googleMaps.Marker({
              position: startCoords,
              map,
              title: `Start: ${startAddr}`,
              label: { text: 'S', color: '#FFFFFF', fontWeight: 'bold', fontSize: '11px' },
              icon: {
                path: googleMaps.SymbolPath.CIRCLE,
                scale: 13,
                fillColor: C.moss || '#7A9B5C',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              },
            });

            // Intermediate Stop Markers
            validIntermediates.forEach((stopCoord, i) => {
              new googleMaps.Marker({
                position: stopCoord,
                map,
                title: `Stop ${i + 1}: ${stopAddrs[i] || ''}`,
                label: { text: String(i + 1), color: '#15171B', fontWeight: 'bold', fontSize: '10px' },
                icon: {
                  path: googleMaps.SymbolPath.CIRCLE,
                  scale: 11,
                  fillColor: C.amber || '#F2B705',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                },
              });
            });

            // Destination Marker
            new googleMaps.Marker({
              position: endCoords,
              map,
              title: `Destination: ${endAddr}`,
              label: { text: 'D', color: '#FFFFFF', fontWeight: 'bold', fontSize: '11px' },
              icon: {
                path: googleMaps.SymbolPath.CIRCLE,
                scale: 13,
                fillColor: C.hardcoreRed || '#D9432E',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              },
            });

            // Fit Bounds
            const bounds = new googleMaps.LatLngBounds();
            path.forEach(pt => bounds.extend(pt));
            map.fitBounds(bounds, { top: 35, bottom: 35, left: 35, right: 35 });
          } catch (routeErr) {
            console.warn('Could not compute road route for detail view:', routeErr);
            if (isMounted) setGoogleMapError(true);
          }
        });
      })
      .catch(() => {
        if (isMounted) setGoogleMapError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [ride?.points, theme, googleMapError, C.moss, C.amber, C.hardcoreRed]);

  if (loading) {
    return (
      <div
        className="animate-fadein w-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          height: 140,
          backgroundColor: `${C.surface || '#1E2126'}cc`,
          border: `1px solid ${C.border || '#33373D'}44`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `2px solid ${C.amber || '#F2B705'}`,
              borderTopColor: 'transparent',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <span style={{ fontSize: 11, color: C.textMuted || '#9297A0', fontFamily: 'IBM Plex Mono, monospace' }}>
            Loading route map…
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="animate-fadein w-full rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${C.amber || '#F2B705'}25`,
        boxShadow: `0 0 24px ${C.amber || '#F2B705'}10`,
      }}
    >
      {/* Interactive Google Map container */}
      <div
        ref={googleMapContainerRef}
        style={{
          width: '100%',
          height: 230,
          display: useGoogleMap ? 'block' : 'none',
        }}
      />

      {/* SVG Mock Map Fallback */}
      {!useGoogleMap && svg && (
        <img
          src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`}
          alt="Ride route map"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      )}

      {/* When neither is available */}
      {!useGoogleMap && !svg && (
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 90,
            backgroundColor: `${C.surface || '#1E2126'}aa`,
            border: `1px dashed ${C.border || '#33373D'}66`,
          }}
        >
          <span style={{ fontSize: 12, color: C.textFaint || '#5B5F66', fontFamily: 'IBM Plex Mono, monospace' }}>
            No route map available
          </span>
        </div>
      )}

      {/* Footer indicator tag */}
      <div
        style={{
          padding: '5px 12px',
          backgroundColor: `${C.surface || '#1E2126'}ee`,
          borderTop: `1px solid ${C.border || '#33373D'}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.08em',
            fontFamily: 'IBM Plex Mono, monospace',
            color: useGoogleMap ? (C.moss || '#7A9B5C') : (C.textFaint || '#5B5F66'),
            textTransform: 'uppercase',
          }}
        >
          {useGoogleMap ? '🗺️ Google Road Route' : '🗺️ Route Map'}
        </span>
        {ride?.distanceKm && (
          <span
            style={{
              fontSize: 10,
              fontFamily: 'IBM Plex Mono, monospace',
              color: C.amber || '#F2B705',
              fontWeight: 600,
            }}
          >
            {ride.distanceKm} km
          </span>
        )}
      </div>
    </div>
  );
}
