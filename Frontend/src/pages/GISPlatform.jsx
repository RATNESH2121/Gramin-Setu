import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Map as MapIcon, Layers, ScanLine, Globe2 } from 'lucide-react';
import LeafletMap from '@/components/LeafletMap';
import { gisApi } from '@/lib/api';

const GISPlatform = () => {
    const [layers, setLayers] = useState([]);

    useEffect(() => {
        const fetchLayers = async () => {
            try {
                // Fetch public layers or default set since this is a public page
                const data = await gisApi.getLayers();
                if (Array.isArray(data)) {
                    // Activate all layers by default for the platform demo
                    setLayers(data.map(l => ({ ...l, active: true })));
                }
            } catch (error) {
                console.error("Failed to fetch layers", error);
            }
        };
        fetchLayers();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <div className="bg-slate-900 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                            <Globe2 className="w-4 h-4" /> The Power Weapon
                        </div>
                        <h1 className="text-5xl font-bold mb-6">Advanced GIS Platform</h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                            Geospatial intelligence for accurate land record management and validation.
                            We verify what users claim with satellite-backed data.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="container mx-auto px-4 -mt-16">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                <MapIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Land Parcel Mapping</h3>
                            <p className="text-slate-600">
                                Visualize individual farm plots on a global interactive map.
                                Every plot is geotagged with precise latitude and longitude.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                                <ScanLine className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Boundary Demarcation</h3>
                            <p className="text-slate-600">
                                Accurate digital fencing of land boundaries to prevent disputes
                                and calculate exact acreage for fertilizer estimation.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">GIS-Based Validation</h3>
                            <p className="text-slate-600">
                                Automated cross-checks of user-submitted land area against
                                satellite imagery to prevent fraud in benefit claims.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Representation */}
                <div className="container mx-auto px-4 py-20">
                    <div className="bg-slate-200 rounded-2xl h-[500px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative">
                        <LeafletMap layers={layers} className="z-0" />

                        {/* Mock UI Overlay */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-sm max-w-xs text-left z-[400]">
                            <div className="font-semibold text-sm mb-2">Platform Stats</div>
                            <div className="text-xs text-slate-600 space-y-1">
                                <div className="flex justify-between gap-4"><span>Active Layers:</span> <span className="font-medium">{layers.length}</span></div>
                                <div className="flex justify-between gap-4"><span>Mapped Points:</span> <span className="font-medium text-blue-600 cursor-help" title="Total land parcels">{layers.reduce((acc, l) => acc + (l.data?.length || 0), 0)}</span></div>
                                <div className="flex justify-between gap-4"><span>Status:</span> <span className="text-green-600 font-medium">Live</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default GISPlatform;
