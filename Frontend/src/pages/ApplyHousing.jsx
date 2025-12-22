import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { housingApi } from '@/lib/api';

import { Loader2, CheckCircle, MapPin, Home, User, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef } from 'react';

// Fix icons (standard Leaflet fix)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ApplyHousing = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        applicantId: '',
        familySize: '',
        annualIncome: '',
        category: '',
        // Address
        state: '',
        district: '',
        block: '',
        gramPanchayat: '',
        village: '',
        houseNumber: '',
        landmark: '',
        latitude: '',
        longitude: '',
        // Housing Status
        ownsHouse: false,
        houseCondition: 'No House',
        ownsLand: false,
        landParcelId: '', // Optional
        // Documents
        identityProof: 'dummy_url',
        housePhoto: 'dummy_url'
    });

    const [showMap, setShowMap] = useState(false);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // Initialize Map for Picker
    useEffect(() => {
        if (!showMap) return;

        // Delay initialization to allow Dialog to mount and animate
        const initTimer = setTimeout(() => {
            if (!mapContainerRef.current) return;
            if (mapInstanceRef.current) return; // Already initialized

            console.log("Initializing Map...");
            const initialLat = formData.latitude || 20.5937;
            const initialLng = formData.longitude || 78.9629;

            const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Click to pick
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
                else markerRef.current = L.marker([lat, lng]).addTo(map);

                setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
                toast({ description: "Location updated" });
            });

            // Show initial marker if exists
            if (formData.latitude && formData.longitude) {
                markerRef.current = L.marker([formData.latitude, formData.longitude]).addTo(map);
                map.flyTo([formData.latitude, formData.longitude], 12);
            }

            mapInstanceRef.current = map;

            // Force invalidate size after init
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

        }, 300); // Wait 300ms for Dialog to open

        return () => {
            clearTimeout(initTimer);
            if (mapInstanceRef.current && !showMap) { // Only cleanup if we are closing
                // Note: We might want to keep the map instance if we just hid it, 
                // but Shadcn Dialog likely unmounts content.
                // Safe to destroy.
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [showMap]);



    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.id) {
            toast({ title: 'Error', description: 'Please login first', variant: 'destructive' });
            navigate('/login');
            return;
        }
        setUser(storedUser);
        setFormData(prev => ({
            ...prev,
            applicantId: storedUser.id,
            state: 'Punjab', // Default state or fetch
            district: storedUser.district || '',
            village: storedUser.village || '',
            category: 'General' // Default
        }));

        // Get Geo Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    }));
                },
                (err) => console.error("Geo Error", err)
            );
        }
    }, [navigate, toast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Structure data for API match
            const apiPayload = {
                applicantId: formData.applicantId,
                familySize: formData.familySize,
                annualIncome: formData.annualIncome,
                category: formData.category,
                address: {
                    state: formData.state,
                    district: formData.district,
                    block: formData.block,
                    gramPanchayat: formData.gramPanchayat,
                    village: formData.village,
                    houseNumber: formData.houseNumber,
                    landmark: formData.landmark,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                },
                currentHousingStatus: {
                    ownsHouse: formData.ownsHouse === 'true' || formData.ownsHouse === true, // Handle string/bool from Select/Checkbox
                    houseCondition: formData.houseCondition,
                    ownsLand: formData.ownsLand === 'true' || formData.ownsLand === true
                },
                documents: {
                    identityProof: formData.identityProof,
                    housePhoto: formData.housePhoto
                }
            };

            await housingApi.apply(apiPayload); // We will add this to api.js
            toast({ title: 'Success', description: 'Application Submitted Successfully!' });
            navigate('/farmer?tab=housing');
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: err.message || 'Submission Failed', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
                <Card className="border-border bg-card">
                    <CardHeader className="bg-primary/5 border-b border-border mb-6">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Home className="w-6 h-6 text-primary" />
                            Apply for Garib Awas Yojana
                        </CardTitle>
                        <CardDescription>
                            Complete the form to apply for housing benefits. Step {step} of 3.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* SECTION A: APPLICANT DETAILS */}
                            <div className={`space-y-4 ${step !== 1 ? 'hidden' : ''}`}>
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary border-b border-border pb-2">
                                    <User className="w-4 h-4" /> Section A: Applicant Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input value={user.name || ''} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mobile Number</Label>
                                        <Input value={user.phone || ''} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Size</Label>
                                        <Input
                                            type="number"
                                            name="familySize"
                                            value={formData.familySize}
                                            onChange={handleChange}
                                            required
                                            placeholder="Total members"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Annual Income (₹)</Label>
                                        <Input
                                            type="number"
                                            name="annualIncome"
                                            value={formData.annualIncome}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. 120000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select onValueChange={(val) => handleSelectChange('category', val)} defaultValue={formData.category}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="SC">SC</SelectItem>
                                                <SelectItem value="ST">ST</SelectItem>
                                                <SelectItem value="OBC">OBC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="button" onClick={() => setStep(2)} className="w-full mt-4">Next Step →</Button>
                            </div>

                            {/* SECTION B: ADDRESS DETAILS */}
                            <div className={`space-y-4 ${step !== 2 ? 'hidden' : ''}`}>
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary border-b border-border pb-2">
                                    <MapPin className="w-4 h-4" /> Section B: Address Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input name="state" value={formData.state} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>District</Label>
                                        <Input name="district" value={formData.district} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Block / Tehsil</Label>
                                        <Input name="block" value={formData.block} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gram Panchayat</Label>
                                        <Input name="gramPanchayat" value={formData.gramPanchayat} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Village</Label>
                                        <Input name="village" value={formData.village} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>House No.</Label>
                                        <Input name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Landmark</Label>
                                        <Input name="landmark" value={formData.landmark} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 col-span-2 bg-muted p-4 rounded-lg relative">
                                        <div className="col-span-2 flex justify-between items-center mb-2">
                                            <Label className="text-base font-semibold">Location Coordinates</Label>
                                            <Button type="button" size="sm" variant="outline" onClick={() => setShowMap(true)} className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                                                <Crosshair className="w-4 h-4" /> Pick on Map
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Latitude</Label>
                                            <Input name="latitude" type="number" value={formData.latitude} onChange={handleChange} placeholder="e.g. 30.1234" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Longitude</Label>
                                            <Input name="longitude" type="number" value={formData.longitude} onChange={handleChange} placeholder="e.g. 75.1234" />
                                        </div>
                                        <p className="text-xs text-muted-foreground col-span-2">* Enter manually or select from the map.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/2">← Back</Button>
                                    <Button type="button" onClick={() => setStep(3)} className="w-1/2">Next Step →</Button>
                                </div>
                            </div>

                            {/* SECTION C: HOUSING STATUS */}
                            <div className={`space-y-4 ${step !== 3 ? 'hidden' : ''}`}>
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary border-b border-border pb-2">
                                    <Home className="w-4 h-4" /> Section C: Housing Status
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Do you own a house?</Label>
                                        <Select onValueChange={(val) => handleSelectChange('ownsHouse', val === 'yes')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Current House Condition</Label>
                                        <Select onValueChange={(val) => handleSelectChange('houseCondition', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Condition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Kutcha">Kutcha (Mud)</SelectItem>
                                                <SelectItem value="Semi-Pucca">Semi-Pucca</SelectItem>
                                                <SelectItem value="Pucca">Pucca (Concrete)</SelectItem>
                                                <SelectItem value="No House">No House</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Do you own Land?</Label>
                                        <Select onValueChange={(val) => handleSelectChange('ownsLand', val === 'yes')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        By submitting, you agree that the information provided is true to the best of your knowledge.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/2">← Back</Button>
                                        <Button type="submit" className="w-1/2" disabled={loading}>
                                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Submit Application
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </CardContent>
                </Card>
                <Dialog open={showMap} onOpenChange={setShowMap}>
                    <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col p-0 gap-0 bg-background">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>Select Location</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 relative bg-slate-100 min-h-[400px]">
                            <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 1 }} />
                            {/* Hint Overlay */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium">
                                Click anywhere to set location
                            </div>
                        </div>
                        <DialogFooter className="p-4 border-t">
                            <div className="mr-auto text-sm text-muted-foreground flex items-center gap-4">
                                <span>Lat: {formData.latitude || '-'}</span>
                                <span>Lng: {formData.longitude || '-'}</span>
                            </div>
                            <Button onClick={() => setShowMap(false)}>Confirm Location</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ApplyHousing;
