import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icons (standard Leaflet fix)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LeafletMap = ({
    layers = [],
    center = [20.5937, 78.9629],
    zoom = 5,
    className = "",
    interactive = true
}) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center,
            zoom,
            dragging: interactive,
            touchZoom: interactive,
            scrollWheelZoom: interactive,
            doubleClickZoom: interactive,
            boxZoom: interactive,
            keyboard: interactive,
            zoomControl: interactive
        });

        // Add Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [center, zoom, interactive]);

    // Update Markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Helper to get color
        const getColor = (layerId) => {
            switch (layerId) {
                case 'agricultural': return '#10b981';
                case 'housing': return '#14b8a6';
                case 'pending_housing': return '#fbbf24';
                case 'water': return '#3b82f6';
                case 'roads': return '#f59e0b';
                default: return '#6b7280';
            }
        };

        // Add new markers
        layers.filter(l => l.active !== false).forEach(layer => {
            if (layer.data && Array.isArray(layer.data)) {
                layer.data.forEach(point => {
                    // Check for custom color in point properties first, then generic layer color
                    const color = point.color || getColor(layer.id || layer.layerId);

                    const circle = L.circleMarker([point.lat, point.lng], {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.7,
                        radius: 8 // Slightly larger for better visibility
                    }).addTo(mapInstanceRef.current);

                    const props = point.properties || {};
                    let popupContent = `<b>${layer.name}</b><br>`;

                    // Generic property renderer
                    if (props.nitrogen) popupContent += `Nitrogen: ${props.nitrogen}<br>Status: ${props.status}`;
                    else if (props.crop) popupContent += `Crop: ${props.crop}<br>Area: ${props.area} ac<br>Status: ${props.status}`;
                    else if (props.village) {
                        popupContent += `Village: ${props.village}<br>Status: ${props.status}`;
                        if (props.beneficiary) popupContent += `<br>Beneficiary: ${props.beneficiary}`;
                    }

                    if (interactive) {
                        circle.bindPopup(popupContent);
                    }
                    markersRef.current.push(circle);
                });
            }
        });
    }, [layers, interactive]);

    return <div ref={mapContainerRef} className={`h-full w-full ${className}`} />;
};

export default LeafletMap;
