import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Flame, Home, Castle, Utensils, AlertTriangle, Map as MapIcon } from "lucide-react";

// Fix for default marker icons in Leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LOCATION_TYPES = {
  haven: { icon: Home, color: "text-blue-500", label: "Refúgio" },
  elysium: { icon: Castle, color: "text-purple-500", label: "Elysium" },
  feeding_ground: { icon: Utensils, color: "text-red-500", label: "Área de Caça" },
  landmark: { icon: MapIcon, color: "text-yellow-500", label: "Ponto de Interesse" },
  danger_zone: { icon: AlertTriangle, color: "text-orange-500", label: "Zona de Perigo" },
  neutral: { icon: MapPin, color: "text-gray-500", label: "Neutro" },
  custom: { icon: MapPin, color: "text-gray-400", label: "Personalizado" }
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

export default function InteractiveMap({ 
  locations = [], 
  npcs = [], 
  events = [],
  onLocationClick,
  onNPCClick,
  onEventClick,
  onMapClick,
  addingMarker = false,
  center = [-23.5505, -46.6333], // São Paulo default
  zoom = 12
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  // Create markers for locations
  const locationMarkers = locations.map((location) => ({
    id: location.id,
    position: [location.latitude, location.longitude],
    type: "location",
    data: location,
    icon: LOCATION_TYPES[location.type] || LOCATION_TYPES.custom
  }));

  // Create markers for NPCs (if they have coordinates)
  const npcMarkers = npcs
    .filter(npc => npc.latitude && npc.longitude)
    .map((npc) => ({
      id: npc.id,
      position: [npc.latitude, npc.longitude],
      type: "npc",
      data: npc,
      icon: { icon: Users, color: "text-purple-400", label: "NPC" }
    }));

  // Create markers for events
  const eventMarkers = events
    .filter(event => event.latitude && event.longitude)
    .map((event) => ({
      id: event.id,
      position: [event.latitude, event.longitude],
      type: "event",
      data: event,
      icon: { icon: Flame, color: "text-red-400", label: "Evento" }
    }));

  const allMarkers = [...locationMarkers, ...npcMarkers, ...eventMarkers];

  const handleMarkerClick = (marker) => {
    setSelectedItem(marker);
    if (marker.type === "location" && onLocationClick) {
      onLocationClick(marker.data);
    } else if (marker.type === "npc" && onNPCClick) {
      onNPCClick(marker.data);
    } else if (marker.type === "event" && onEventClick) {
      onEventClick(marker.data);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {addingMarker && <MapClickHandler onMapClick={onMapClick} />}

        {allMarkers.map((marker) => {
          const IconComponent = marker.icon.icon;
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              eventHandlers={{
                click: () => handleMarkerClick(marker)
              }}
            >
              <Popup>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${marker.icon.color}`} />
                    <strong className="text-sm">{marker.data.name}</strong>
                  </div>
                  
                  {marker.data.description && (
                    <p className="text-xs text-gray-600">{marker.data.description}</p>
                  )}
                  
                  {marker.data.role && (
                    <p className="text-xs text-gray-500 italic">{marker.data.role}</p>
                  )}
                  
                  {marker.data.title && (
                    <p className="text-xs font-semibold text-red-600">{marker.data.title}</p>
                  )}
                  
                  <div className="text-xs text-gray-400">{marker.icon.label}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {addingMarker && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          Clique no mapa para adicionar um marcador
        </div>
      )}
    </div>
  );
}