import { useEffect, useRef } from 'react';
import type { Stop } from './Home';
import { coordinates } from './utils/citymock'

interface Props {
  stops: Stop[];
}

// Mock coordinates for demonstration
const computeCoords = (address: string, city: string) => {
  // Determine city from the stops
  for (const [cityName, locations] of Object.entries(coordinates)) {
    if (locations[address]) {
      return locations[address];
    }
  }

  // Pseudo-random deterministic coordinates for ANY city
  // We use the city and address name to seed a small offset
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h;
  };

  const baseLat = (Math.abs(hash(city)) % 100) - 30; // Random lat -30 to 70
  const baseLng = (Math.abs(hash(city + "lng")) % 200) - 100; // Random lng -100 to 100
  const offset = (hash(address) % 1000) / 10000; // Small offset for markers in same city

  return { 
    lat: baseLat + offset, 
    lng: baseLng + offset 
  };
};

export function ResultMap({ stops }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;

    // Initialize the map with mapId for Advanced Markers
    const bounds = new google.maps.LatLngBounds();
    const markers: any[] = [];

    const map = new google.maps.Map(mapRef.current, {
      zoom: 13,
      mapId: 'FOOD_CRAWL_MAP', // Required for Advanced Markers
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add markers for each stop using AdvancedMarkerElement
    stops.forEach(async (stop, index) => {
      const position = computeCoords(stop.address, 'city');
      bounds.extend(position);

      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background-color: ${stop.type === 'restaurant' ? '#f97316' : '#a855f7'};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${index + 1}
        </div>
      `;

      // Create advanced marker
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      
      const marker = new AdvancedMarkerElement({
        map,
        position,
        content: markerContent,
        title: stop.name,
      });

      // Info window content
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111827;">
              ${index + 1}. ${stop.name}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
              ${stop.description}
            </p>
            <div style="display: flex; gap: 12px; font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
              <span>⏱️ ${stop.duration} min</span>
              ${stop.type === 'restaurant' ? `<span>💰 $${stop.price}</span>` : '<span>📍 Free</span>'}
            </div>
            ${stop.cuisine ? `<span style="background: #fed7aa; color: #9a3412; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">${stop.cuisine}</span>` : ''}
          </div>
        `
      });

      // Add click listener
      marker.addListener('gmp-click', () => {
        // Close all other info windows
        markers.forEach((m: any) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        infoWindow.open({
          anchor: marker,
          map,
        });
      });

      (marker as any).infoWindow = infoWindow;
      markers.push(marker);
    });

    // Fit map to show all markers
    map.fitBounds(bounds);

    // Add polyline to show the route
    if (stops.length > 1) {
      const path = stops.map(stop => computeCoords(stop.address, 'city'));
      new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#f97316',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map
      });
    }

  }, [stops]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[500px] rounded-2xl border-4 border-white shadow-lg"
      />
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-700 font-medium">Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-gray-700 font-medium">Landmark</span>
          </div>
        </div>
      </div>
    </div>
  );
}
