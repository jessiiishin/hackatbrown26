import { useEffect, useRef } from 'react';
import type { Stop } from '../App';

interface Props {
  stops: Stop[];
}

// Mock coordinates for demonstration
const getCoordinates = (address: string, city: string) => {
  const coordinates: Record<string, Record<string, { lat: number; lng: number }>> = {
    'New York': {
      'Greenwich Village': { lat: 40.7336, lng: -74.0027 },
      'Liberty Island': { lat: 40.6892, lng: -74.0445 },
      'Lower East Side': { lat: 40.7209, lng: -73.9840 },
      'Midtown': { lat: 40.7549, lng: -73.9840 },
      'Chinatown': { lat: 40.7157, lng: -73.9970 },
      'Brooklyn Bridge': { lat: 40.7061, lng: -73.9969 },
      'Upper West Side': { lat: 40.7870, lng: -73.9754 }
    },
    'San Francisco': {
      'Mission District': { lat: 37.7599, lng: -122.4148 },
      'Golden Gate': { lat: 37.8199, lng: -122.4783 },
      'Fisherman\'s Wharf': { lat: 37.8080, lng: -122.4177 },
      'Nob Hill': { lat: 37.7923, lng: -122.4155 },
      'Alcatraz': { lat: 37.8267, lng: -122.4230 }
    },
    'Tokyo': {
      'Tsukiji': { lat: 35.6654, lng: 139.7707 },
      'Asakusa': { lat: 35.7148, lng: 139.7967 },
      'Shibuya': { lat: 35.6595, lng: 139.7004 },
      'Minato': { lat: 35.6586, lng: 139.7454 },
      'Harajuku': { lat: 35.6702, lng: 139.7027 },
      'Ginza': { lat: 35.6712, lng: 139.7650 }
    },
    'Paris': {
      'Le Marais': { lat: 48.8566, lng: 2.3626 },
      'Champ de Mars': { lat: 48.8556, lng: 2.2986 },
      'Louvre': { lat: 48.8606, lng: 2.3376 },
      'Saint-Germain-des-Prés': { lat: 48.8540, lng: 2.3330 },
      'Île de la Cité': { lat: 48.8556, lng: 2.3477 },
      '11th Arrondissement': { lat: 48.8566, lng: 2.3799 }
    },
    'London': {
      'London District 1': { lat: 51.5074, lng: -0.1278 },
      'London District 2': { lat: 51.5033, lng: -0.1195 },
      'London District 3': { lat: 51.5117, lng: -0.1233 },
      'London District 4': { lat: 51.5150, lng: -0.1419 }
    },
    'Rome': {
      'Rome District 1': { lat: 41.9028, lng: 12.4964 },
      'Rome District 2': { lat: 41.8902, lng: 12.4922 },
      'Rome District 3': { lat: 41.8986, lng: 12.4769 },
      'Rome District 4': { lat: 41.9009, lng: 12.4833 }
    }
  };

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

export function CrawlMap({ stops }: Props) {
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
      const position =
        stop.lat != null && stop.lng != null
          ? { lat: stop.lat, lng: stop.lng }
          : getCoordinates(stop.address, 'city');
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
              ${stop.type === 'restaurant' ? `<span>💰 ${stop.priceTier ?? '$' + stop.price}</span>` : '<span>📍 Free</span>'}
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
      const path = stops.map((stop) =>
        stop.lat != null && stop.lng != null
          ? { lat: stop.lat, lng: stop.lng }
          : getCoordinates(stop.address, 'city')
      );
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

// Load Google Maps script
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
      return;
    }

    // Check if API key is placeholder
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      reject(new Error('Please add your Google Maps API key'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script. Please check your API key.'));
    document.head.appendChild(script);
  });
}
