import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gisApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Layers, Filter, Download, RefreshCw, Locate, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icons (standard Leaflet fix)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const GISDashboard = () => {
  const [layers, setLayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get('embed') === 'true';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); // To keep track of content markers
  const userMarkerRef = useRef(null);
  const selectedLandMarkerRef = useRef(null);

  // 1. Fetch Layers
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role;
        const userId = user.id;

        const data = await gisApi.getLayers({ role, userId });
        if (Array.isArray(data)) {
          setLayers(data.map(l => ({ ...l, id: l.layerId || l.id }))); // Ensure ID consistency
        }
      } catch (error) {
        console.error("Failed to fetch layers", error);
      }
    };
    fetchLayers();
  }, []);

  // 2. Initialize Map (Vanilla Leaflet)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    console.log("Initializing Leaflet Map...");

    // Create Map
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Click Handler for "Choose Land"
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLand({ lat, lng });
      toast({ title: "Land Selected", description: `Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });

      // Update Marker
      if (selectedLandMarkerRef.current) {
        selectedLandMarkerRef.current.setLatLng([lat, lng]);
      } else {
        selectedLandMarkerRef.current = L.marker([lat, lng])
          .addTo(map)
          .bindPopup("Selected Land")
          .openPopup();
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 3. Render/Update Data Points
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Generate and Add New Markers
    layers.filter(l => l.active).forEach(layer => {
      // Use real data from backend if available
      if (layer.data && Array.isArray(layer.data)) {
        layer.data.forEach(point => {
          const color = getColor(layer.id);
          const circle = L.circleMarker([point.lat, point.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 6
          }).addTo(mapInstanceRef.current);

          const props = point.properties || {};
          let popupContent = `<b>${layer.name}</b><br>`;
          if (props.crop) popupContent += `Crop: ${props.crop}<br>Area: ${props.area} ac<br>Status: ${props.status}`;
          if (props.village) {
            popupContent += `Village: ${props.village}<br>Status: ${props.status}`;
            if (props.beneficiary) popupContent += `<br>Beneficiary: ${props.beneficiary}`;
          }

          circle.bindPopup(popupContent);
          markersRef.current.push(circle);
        });
      }
    });

  }, [layers]); // Re-run when layer selection changes

  // Helper Functions
  const getColor = (layerId) => {
    switch (layerId) {
      case 'agricultural': return '#10b981';
      case 'housing': return '#14b8a6';
      case 'pending_housing': return '#fbbf24'; // Yellow
      case 'water': return '#3b82f6';
      case 'roads': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const toggleLayer = (id) => {
    setLayers(layers.map(layer => layer.id === id ? { ...layer, active: !layer.active } : layer));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Refreshed", description: "Map data updated." });
    }, 1000);
  };

  const handleExport = () => {
    toast({ title: "Export Started", description: "Downloading data..." });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo([latitude, longitude], 13);

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude]).addTo(map).bindPopup("You are here").openPopup();
        }
      }
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([lat, lon], 12);
        }
      } else {
        toast({ title: "Not Found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const activeLayersCount = layers.filter(l => l.active).length;
  const totalDataPoints = layers.filter(l => l.active).reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {!isEmbedded && <Navbar />}

      {/* Main Content Area - Fills remaining height */}
      <main className={`flex-1 flex ${!isEmbedded ? 'pt-20' : ''} relative h-full`}>

        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border flex flex-col z-20 shadow-xl h-full overflow-y-auto shrink-0">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">GIS Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Layers */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Layers
                </h3>
                <span className="text-xs text-muted-foreground">{activeLayersCount} active</span>
              </div>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <label key={layer.id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${layer.active ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                    <input type="checkbox" checked={layer.active} onChange={() => toggleLayer(layer.id)} className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(layer.id) }} />
                    <span className="text-sm text-foreground flex-1">{layer.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Land Info */}
            {selectedLand && (
              <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Selected Land</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Latitude: {selectedLand.lat.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground">Longitude: {selectedLand.lng.toFixed(6)}</p>
                <Button className="w-full mt-3 h-8 text-xs" onClick={() => toast({ title: "Action", description: "Proceeding with selected land..." })}>
                  Use This Location
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Filter className="w-4 h-4" /> Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-2 rounded text-center">
                  <div className="text-xl font-bold text-primary">{totalDataPoints > 1000 ? (totalDataPoints / 1000).toFixed(1) + 'K' : totalDataPoints}</div>
                  <div className="text-[10px] text-muted-foreground">Points</div>
                </div>
                <div className="bg-muted p-2 rounded text-center">
                  <div className="text-xl font-bold text-teal">{layers.length}</div>
                  <div className="text-[10px] text-muted-foreground">Layers</div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" /> Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-full bg-slate-100">
          {/* Map Search & Tools */}
          <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
            <form onSubmit={handleSearch} className="pointer-events-auto bg-card/90 backdrop-blur shadow-lg rounded-full flex items-center p-1 pl-4 w-full max-w-md border border-border">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input
                className="bg-transparent border-none outline-none text-sm flex-1 h-8"
                placeholder="Search location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm" className="rounded-full h-8 px-4">Search</Button>
            </form>

            <div className="flex flex-col gap-2 pointer-events-auto">
              <Button variant="secondary" size="icon" className="shadow-lg rounded-full w-10 h-10 bg-card hover:bg-muted" onClick={handleLocateMe} title="My Location">
                <Locate className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>

          {/* Vanilla Leaflet Container */}
          <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />
        </div>
      </main>
    </div>
  );
};

export default GISDashboard;
