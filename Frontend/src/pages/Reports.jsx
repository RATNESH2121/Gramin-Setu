import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoveDown } from 'lucide-react';
import LeafletMap from '@/components/LeafletMap';

const Reports = () => {
    // Mock Data
    const districtData = [
        { district: "Nashik", farmers: 1240, landArea: "4500 acres", soilHealth: "Good" },
        { district: "Pune", farmers: 980, landArea: "3200 acres", soilHealth: "Average" },
        { district: "Nagpur", farmers: 1560, landArea: "5100 acres", soilHealth: "Poor" },
        { district: "Aurangabad", farmers: 870, landArea: "2800 acres", soilHealth: "Good" },
    ];

    const schemeData = [
        { scheme: "Soil Health Card", target: 5000, achieved: 3200, status: 64 },
        { scheme: "PM Kisan", target: 10000, achieved: 8500, status: 85 },
        { scheme: "PMAY-G (Housing)", target: 200, achieved: 45, status: 22 },
    ];

    // Simulated Heatmap Data (Nitrogen Levels)
    const heatmapLayer = [{
        id: 'soil_health',
        name: 'Nitrogen Levels',
        active: true,
        data: Array.from({ length: 50 }, (_, i) => {
            const lat = 20.5937 + (Math.random() - 0.5) * 4;
            const lng = 78.9629 + (Math.random() - 0.5) * 4;
            // Generate random nitrogen level (Low, Medium, High)
            const level = Math.random();
            let color, status, nitrogen;

            if (level > 0.66) {
                color = '#ef4444'; // Red (Low/Poor)
                status = 'Critical Low';
                nitrogen = 'Low (< 200 kg/ha)';
            } else if (level > 0.33) {
                color = '#eab308'; // Yellow (Medium)
                status = 'Moderate';
                nitrogen = 'Medium (280-560 kg/ha)';
            } else {
                color = '#22c55e'; // Green (Good)
                status = 'Optimal';
                nitrogen = 'High (> 560 kg/ha)';
            }

            return {
                lat, lng, color,
                properties: { nitrogen, status }
            };
        })
    }];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="pt-24 pb-20 container mx-auto px-4 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Impact Reports</h1>
                    <p className="text-slate-600">Data-driven insights into rural development progress.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>District-wise Registration</CardTitle>
                            <CardDescription>Farmer outreach and land coverage.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>District</TableHead>
                                        <TableHead className="text-right">Farmers</TableHead>
                                        <TableHead className="text-right">Land Area</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {districtData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{row.district}</TableCell>
                                            <TableCell className="text-right">{row.farmers}</TableCell>
                                            <TableCell className="text-right">{row.landArea}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Scheme Progress</CardTitle>
                            <CardDescription>Target vs Achievement stats.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {schemeData.map((scheme, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">{scheme.scheme}</span>
                                            <span className="text-sm text-slate-500">{scheme.achieved} / {scheme.target}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${scheme.status > 70 ? 'bg-green-500' : scheme.status > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${scheme.status}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Heatmap Section */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Soil Health Heatmap</CardTitle>
                                <CardDescription>GIS-based visualization of nitrogen levels.</CardDescription>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Low (Critical)</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Medium</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Optimal</span>
                            </div>
                        </div>
                    </CardHeader>
                    {/* Fixed Height Map Container */}
                    <CardContent className="h-[500px] p-0 overflow-hidden relative rounded-b-xl">
                        <LeafletMap layers={heatmapLayer} zoom={6} />
                    </CardContent>
                </Card>

            </main>
            <Footer />
        </div>
    );
};

export default Reports;
