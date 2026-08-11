'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';
import { LocationData } from '@/types';
import { reverseGeocodeLocation } from '@/lib/locationService';

interface FieldMapProps {
  location: LocationData;
  onLocationChange: (newLoc: LocationData) => void;
}

export const FieldMap: React.FC<FieldMapProps> = ({ location, onLocationChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Dynamically load Leaflet script & CSS if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);

    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJs.onload = () => setMapLoaded(true);
    document.head.appendChild(leafletJs);
  }, []);

  // Initialize and update Leaflet map instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;

    // Check if map container is already initialized
    if ((mapRef.current as any)._leaflet_id) {
      const existingMap = (mapRef.current as any)._map;
      if (existingMap) {
        existingMap.setView([location.latitude, location.longitude], 12);
        if (existingMap._marker) {
          existingMap._marker.setLatLng([location.latitude, location.longitude]);
        }
        return;
      }
    }

    // Create Leaflet Map instance
    const map = L.map(mapRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 12,
      zoomControl: true,
    });
    (mapRef.current as any)._map = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom Icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #09130e; box-shadow: 0 0 10px #f59e0b; display: flex; align-items: center; justify-content: center; color: #09130e; font-weight: bold;">📍</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([location.latitude, location.longitude], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);
    map._marker = marker;

    // Marker drag end listener
    marker.on('dragend', async (e: any) => {
      const latLng = e.target.getLatLng();
      handleMapClickOrDrag(latLng.lat, latLng.lng);
    });

    // Map click listener
    map.on('click', async (e: any) => {
      marker.setLatLng(e.latlng);
      handleMapClickOrDrag(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      (mapRef.current as any)._leaflet_id = null;
    };
  }, [mapLoaded, location.latitude, location.longitude]);

  const handleMapClickOrDrag = async (lat: number, lon: number) => {
    setIsUpdating(true);
    try {
      const details = await reverseGeocodeLocation(lat, lon);
      onLocationChange({
        latitude: lat,
        longitude: lon,
        accuracy: 10,
        village: details.village,
        district: details.district,
        state: details.state,
        country: details.country,
        displayName: details.displayName,
        isGpsLocked: true,
        isCustom: true,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (e) {
      console.warn('Map pin position reverse geocode error:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-amber-400" /> Interactive Field Location Map
        </span>
        <span className="text-[11px] text-emerald-400/80 font-mono">
          Drag pin or click map to adjust GPS target
        </span>
      </div>

      {/* Map Viewport Container */}
      <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 h-48 bg-black/40">
        <div ref={mapRef} className="w-full h-full z-10" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-emerald-950 flex items-center justify-center text-xs text-emerald-300 gap-2">
            <Compass className="w-4 h-4 animate-spin text-amber-400" /> Loading Field Satellite & Tile Map...
          </div>
        )}

        {isUpdating && (
          <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-emerald-950/90 border border-emerald-500/40 rounded text-[10px] text-amber-300 font-bold animate-pulse">
            Updating Weather Coordinates...
          </div>
        )}
      </div>

      {/* Address Metadata Bar */}
      <div className="flex items-center justify-between text-xs text-emerald-200 bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-500/20">
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate font-medium">{location.displayName || `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`}</span>
        </div>
        <span className="text-[10px] text-emerald-400/70 font-mono shrink-0">
          Accuracy: ±{location.accuracy || 15}m
        </span>
      </div>
    </div>
  );
};
