import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Sprout, FileText, Settings, LogOut, Plus, MapPin, Droplets, Home, CheckCircle2, HelpCircle, BookOpen, Phone, Mail, PlayCircle, Bell, Globe, Shield, User } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { fertilizerApi, housingApi, tasksApi, authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import LeafletMap from '@/components/LeafletMap';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const FarmerDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || "overview";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showTutorial, setShowTutorial] = useState(true);

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ lands: 0, apps: 0, plans: 0 });
    const [lands, setLands] = useState([]);
    const [housingApps, setHousingApps] = useState([]);
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [newLand, setNewLand] = useState({
        crop: '',
        soilType: '',
        area: '',
        latitude: '',
        longitude: ''
    });
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [selectedLand, setSelectedLand] = useState(null);

    // Soil Health State
    const [soilTests, setSoilTests] = useState([]);
    const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
    const [newSoilTest, setNewSoilTest] = useState({
        landId: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        ph: ''
    });

    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: true,
            weather: true,
            schemes: true
        },
        language: 'en'
    });

    // Profile Edit State
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        phone: '',
        village: '',
        district: ''
    });

    useEffect(() => {
        if (user) {
            setEditFormData({
                name: user.name || '',
                phone: user.phone || '',
                village: user.village || '',
                district: user.district || ''
            });
        }
    }, [user]);

    const handleEditProfileSubmit = async () => {
        try {
            const updatedData = await authApi.updateProfile({
                id: user.id,
                ...editFormData
            });

            // Update local state and storage
            const newUser = { ...user, ...updatedData.user };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));

            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
                className: "bg-green-500 text-white"
            });
            setIsEditProfileOpen(false);
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update profile.",
                variant: "destructive"
            });
        }
    };

    // Mock User Data for Profile
    const profile = {
        name: user?.name || "Rajesh Kumar",
        email: user?.email || "rajesh@example.com",
        phone: user?.phone || "+91 98765 43210",
        village: "Rampur, Uttar Pradesh",
        id: "FMR-2024-8921"
    };

    // Sync state with URL.
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Help Guides Data
    const GUIDES = {
        registration: {
            title: "How to register your land?",
            steps: [
                "Go to the 'My Land' tab using the sidebar menu.",
                "Click on the 'Register New Land' button at the top right.",
                "Fill in the details like Crop, Area, and Soil Type in the form.",
                "Use the interactive map to pin-point your exact land location.",
                "Click 'Register Land' to save your details.",
                "Your land will now appear in the list and on the GIS map."
            ]
        },
        housing: {
            title: "Applying for Housing Schemes",
            steps: [
                "Navigate to the 'Housing Scheme' tab.",
                "Click on 'Apply for PMAY-G'.",
                "Fill in your personal and household details.",
                "Upload necessary documents (Aadhaar, Income Certificate, etc.).",
                "Submit the application.",
                "You can track the status of your application in the 'My Applications' list."
            ]
        },
        soil: {
            title: "Understanding Soil Health",
            steps: [
                "Go to the 'Soil Health' tab.",
                "View your recent soil health cards.",
                "Check the N, P, K values to understand nutrient levels.",
                "Read the recommended fertilizer dosage.",
                "If you haven't tested your soil, click 'Request Soil Test'.",
                "Follow the instructions to submit a soil sample to the nearest lab."
            ]
        }
    };

    const [selectedGuide, setSelectedGuide] = useState(null);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, activeTab]);

    const fetchDashboardData = async () => {
        try {
            // Load all data regardless of tab for now to support cross-tab features
            // The following block is added based on the instruction to conditionally fetch lands
            if (activeTab === 'overview' || activeTab === 'land') {
                const myLands = await fertilizerApi.getMyLands();
                setLands(myLands || []);
                setStats(prev => ({ ...prev, lands: myLands?.length || 0 }));
            }

            // Original fetching logic, adjusted to avoid re-fetching lands if already done conditionally
            const [appsData, soilData] = await Promise.all([
                housingApi.getMyApps(user.id),
                fertilizerApi.getSoilTests()
            ]);
            // If lands were not fetched conditionally, fetch them here
            if (activeTab !== 'overview' && activeTab !== 'land') {
                const landsData = await fertilizerApi.getMyLands();
                setLands(landsData || []);
                setStats(prev => ({ ...prev, lands: landsData?.length || 0 }));
            }

            setHousingApps(appsData || []);
            setSoilTests(soilData || []);

            // Stats
            setStats({
                lands: lands.length || 0,
                apps: appsData?.length || 0,
                plans: 0
            });

            // Tasks (Mock or real)
            const myTasks = await tasksApi.getAll(user.id).catch(() => []);
            setTasks(myTasks || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const handleViewDetails = (land) => {
        setSelectedLand(land);
        setViewDetailsOpen(true);
    };

    const handleSoilSubmit = async () => {
        if (!newSoilTest.landId || !newSoilTest.ph) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please select a land and enter at least the pH value.",
            });
            return;
        }

        try {
            await fertilizerApi.addSoilData(newSoilTest);
            toast({
                title: "Success",
                description: "Soil test data submitted successfully!",
            });
            setIsSoilModalOpen(false);
            setNewSoilTest({ landId: '', nitrogen: '', phosphorus: '', potassium: '', ph: '' });
            fetchDashboardData();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to submit soil test.",
            });
        }
    };

    const handleRegisterLand = async () => {
        if (!newLand.crop || !newLand.soilType || !newLand.area) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            await fertilizerApi.addLand(newLand);
            toast({
                title: "Success",
                description: "Land parcel registered successfully!",
            });
            setIsRegisterOpen(false);
            setNewLand({ crop: '', soilType: '', area: '', latitude: '', longitude: '' });
            fetchDashboardData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to register land. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper to transform farmer's lands to map layers
    const getMapLayers = () => {
        if (!lands || lands.length === 0) return [];
        return [{
            id: 'agricultural',
            name: 'My Properties',
            active: true,
            data: lands.filter(l => l.latitude && l.longitude).map(l => ({
                lat: l.latitude,
                lng: l.longitude,
                properties: {
                    crop: l.crop,
                    area: l.area,
                    status: l.status,
                    soilType: l.soilType
                }
            }))
        }];
    };

    const TutorialOverlay = () => {
        if (!showTutorial) return null;
        return (
            <div className="absolute top-4 right-4 z-[1000] bg-white p-6 rounded-xl shadow-2xl max-w-sm border border-slate-200 animate-in slide-in-from-right">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <HelpCircle className="w-5 h-5" />
                        <h3>How to use GIS Map</h3>
                    </div>
                    <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2">
                        <span className="bg-green-100 text-green-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">1</span>
                        Your registered lands appear as green markers on the map.
                    </li>
                    <li className="flex gap-2">
                        <span className="bg-green-100 text-green-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">2</span>
                        Click on any marker to view crop details and status.
                    </li>
                    <li className="flex gap-2">
                        <span className="bg-green-100 text-green-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">3</span>
                        Use the zoom controls (+/-) to explore the surrounding area.
                    </li>
                </ul>
                <Button onClick={() => setShowTutorial(false)} className="w-full mt-4" size="sm">Got it!</Button>
            </div>
        );
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => handleTabChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${activeTab === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 flex-1 flex items-start pt-24 pb-12 gap-8">
                {/* Vertical Sidebar */}
                <aside className="w-64 bg-card border border-border rounded-lg hidden md:flex flex-col shrink-0 sticky top-24 h-[calc(100vh-8rem)] shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground leading-tight">{user.name}</h3>
                                <p className="text-xs text-muted-foreground">Farmer</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                        <SidebarItem id="land" icon={Sprout} label="My Land" />
                        <SidebarItem id="gis" icon={MapPin} label="GIS Map" />
                        <SidebarItem id="housing" icon={Home} label="Housing Scheme" />
                        <SidebarItem id="soil" icon={Droplets} label="Soil Health" />
                        <SidebarItem id="help" icon={HelpCircle} label="Help & Support" />
                        <SidebarItem id="settings" icon={Settings} label="Settings" />
                    </nav>

                    <div className="p-4 border-t border-border">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-5xl mx-auto">

                        {/* GIS Map Tab */}
                        {activeTab === 'gis' && (
                            <div className="space-y-6 animate-fade-in h-[calc(100vh-12rem)] min-h-[500px] relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">My GIS Map</h2>
                                        <p className="text-muted-foreground">Visualize all your land parcels in one place.</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowTutorial(true)} className="gap-2">
                                        <HelpCircle className="w-4 h-4" /> Help
                                    </Button>
                                </div>
                                <div className="h-full w-full rounded-xl border border-border overflow-hidden relative shadow-sm bg-muted/50">
                                    <LeafletMap
                                        layers={getMapLayers()}
                                        zoom={6}
                                        className="z-0"
                                    />
                                    <TutorialOverlay />
                                    {lands.length === 0 && (
                                        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                                            <div className="text-center p-6 bg-card rounded-xl shadow-lg border border-border">
                                                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-foreground">No lands to map</h3>
                                                <p className="text-muted-foreground mb-4">Register a land parcel to see it here.</p>
                                                <Button onClick={() => setIsRegisterOpen(true)}>Register Land</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                                    <p className="text-muted-foreground">Welcome back, here's what's happening on your farm.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                <Sprout className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">Registered Lands</p>
                                                <h3 className="text-2xl font-bold text-foreground">{stats.lands}</h3>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <Home className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">Housing Apps</p>
                                                <h3 className="text-2xl font-bold text-foreground">{stats.apps}</h3>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">Pending Tasks</p>
                                                <h3 className="text-2xl font-bold text-foreground">{tasks.length}</h3>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Overview: Quick Actions & Recent Lands */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle>Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setIsRegisterOpen(true)}>
                                                <Plus className="w-4 h-4" /> Add New Land Parcel
                                            </Button>
                                            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/apply-housing')}>
                                                <Home className="w-4 h-4" /> Apply for Housing Scheme
                                            </Button>
                                            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setActiveTab('gis')}>
                                                <MapPin className="w-4 h-4" /> View My GIS Map
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle>My Lands</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {lands.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No lands registered yet.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {lands.slice(0, 3).map((land, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-10 bg-green-500 rounded-full"></div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{land.crop || 'Unknown Crop'}</p>
                                                                    <p className="text-xs text-muted-foreground">{land.area} acres</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline">{land.status || 'Active'}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Land Tab */}
                        {activeTab === 'land' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900">My Farm Lands</h2>
                                    <Button onClick={() => setIsRegisterOpen(true)} className="gap-2">
                                        <Plus className="w-4 h-4" /> Register New Land
                                    </Button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {lands.map((land, index) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg">{land.crop}</CardTitle>
                                                <Badge>{land.status}</Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex justify-between">
                                                        <span>Area:</span>
                                                        <span className="font-medium">{land.area} Acres</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Soil Type:</span>
                                                        <span className="font-medium capitalize">{land.soilType}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Location:</span>
                                                        <span className="font-medium flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <button onClick={() => {
                                                                // Switch to GIS tab and maybe focus on this land later
                                                                // For now just switching tab
                                                                handleTabChange('gis');
                                                            }} className="hover:underline text-primary">
                                                                View on Map
                                                            </button>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-border">
                                                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetails(land)}>View Details</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Housing Tab */}
                        {activeTab === 'housing' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Housing Applications</h2>
                                        <p className="text-slate-500">Track your PMAY-G application status.</p>
                                    </div>
                                    <Button onClick={() => navigate('/apply-housing')} className="gap-2">
                                        <Plus className="w-4 h-4" /> New Application
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {housingApps.map((app, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-bold text-lg">Application #{app.applicationId || 'PMAY-2024-001'}</h3>
                                                            <Badge variant={app.status === 'Approved' ? 'default' : 'secondary'}>
                                                                {app.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500">Submitted on {new Date(app.createdAt || Date.now()).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-2 w-16 rounded-full ${['Pending', 'Approved', 'Completed'].includes(app.status) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                                        <div className={`h-2 w-16 rounded-full ${['Approved', 'Completed'].includes(app.status) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                                        <div className={`h-2 w-16 rounded-full ${['Completed'].includes(app.status) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {housingApps.length === 0 && (
                                        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                            <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900">No applications</h3>
                                            <p className="text-slate-500 mb-6">You haven't applied for any housing schemes yet.</p>
                                            <Button onClick={() => navigate('/apply-housing')}>Apply Now</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Soil Health Tab */}
                        {activeTab === 'soil' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Soil Health Records</h2>
                                        <p className="text-muted-foreground">Track soil nutrients and get expert recommendations.</p>
                                    </div>
                                    <Button onClick={() => setIsSoilModalOpen(true)} className="gap-2">
                                        <div className="bg-white/20 p-1 rounded">
                                            <Droplets className="w-4 h-4" />
                                        </div>
                                        Request Soil Test
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {soilTests.map((test, index) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg">
                                                    {test.landId?.crop || 'Unnamed Land'}
                                                </CardTitle>
                                                <Badge variant={test.recommendation ? "default" : "outline"}>
                                                    {test.recommendation ? "Reviewed" : "Pending"}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="bg-muted/40 p-2 rounded">
                                                            <div className="text-muted-foreground text-xs">pH Level</div>
                                                            <div className="font-semibold">{test.ph}</div>
                                                        </div>
                                                        <div className="bg-muted/40 p-2 rounded">
                                                            <div className="text-muted-foreground text-xs">Nitrogen</div>
                                                            <div className="font-semibold">{test.nitrogen} <span className="text-xs font-normal">kg/ha</span></div>
                                                        </div>
                                                        <div className="bg-muted/40 p-2 rounded">
                                                            <div className="text-muted-foreground text-xs">Phosphorus</div>
                                                            <div className="font-semibold">{test.phosphorus} <span className="text-xs font-normal">kg/ha</span></div>
                                                        </div>
                                                        <div className="bg-muted/40 p-2 rounded">
                                                            <div className="text-muted-foreground text-xs">Potassium</div>
                                                            <div className="font-semibold">{test.potassium} <span className="text-xs font-normal">kg/ha</span></div>
                                                        </div>
                                                    </div>

                                                    {test.recommendation && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-1 text-green-700 font-medium text-sm">
                                                                <CheckCircle2 className="w-4 h-4" /> Expert Recommendation
                                                            </div>
                                                            <p className="text-sm text-green-800 leading-relaxed">
                                                                {test.recommendation}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="text-xs text-slate-400 pt-2 text-right">
                                                        Submitted on {new Date(test.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {soilTests.length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                            <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900">No soil tests found</h3>
                                            <p className="text-slate-500 mb-6">Submit your soil data to get recommendations.</p>
                                            <Button onClick={() => setIsSoilModalOpen(true)}>Add Soil Data</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Help Tab */}
                        {activeTab === 'help' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">Help & Support</h2>
                                    <p className="text-slate-500">Guides, FAQs, and support for using the dashboard.</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-green-600" /> User Guides
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-lg flex gap-4 items-start">
                                                    <div className="bg-white p-2 rounded shadow-sm">
                                                        <MapPin className="w-6 h-6 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">How to register your land?</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">Learn how to add your land parcels and view them on the GIS map.</p>
                                                        <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setSelectedGuide('registration')}>Read Guide →</Button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg flex gap-4 items-start">
                                                    <div className="bg-white p-2 rounded shadow-sm">
                                                        <Home className="w-6 h-6 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">Applying for Housing Schemes</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">Step-by-step guide to apply for PMAY-G and track status.</p>
                                                        <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setSelectedGuide('housing')}>Read Guide →</Button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg flex gap-4 items-start">
                                                    <div className="bg-white p-2 rounded shadow-sm">
                                                        <Droplets className="w-6 h-6 text-teal-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">Understanding Soil Health</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">How to interpret your soil test results and recommendations.</p>
                                                        <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setSelectedGuide('soil')}>Read Guide →</Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="border-b pb-4">
                                                    <h4 className="font-medium text-slate-900 mb-1">Is the soil test free?</h4>
                                                    <p className="text-sm text-slate-500">Yes, the basic soil health card generation is free for all registered farmers.</p>
                                                </div>
                                                <div className="border-b pb-4">
                                                    <h4 className="font-medium text-slate-900 mb-1">How long does housing approval take?</h4>
                                                    <p className="text-sm text-slate-500">Typically, it takes 3-4 weeks for initial verification by the Gram Panchayat.</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-900 mb-1">Can I edit my land details?</h4>
                                                    <p className="text-sm text-slate-500">Currently, you need to contact the district admin to modify registered land details for security reasons.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-6">
                                        <Card className="bg-green-50 border-green-100">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                                    <Phone className="w-5 h-5" /> Need Assistance?
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium">Kisan Call Center: 1800-180-1551</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Mail className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium">support@graminsetu.gov.in</span>
                                                </div>
                                                <p className="text-xs text-green-700 mt-2">
                                                    Available Mon-Sat, 9:00 AM - 6:00 PM
                                                </p>
                                                <Button className="w-full bg-green-600 hover:bg-green-700">Contact Support</Button>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Video Tutorials</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                                                    <PlayCircle className="w-12 h-12 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-medium text-center text-slate-600">Platform Overview</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
                                    <p className="text-slate-500">Manage your profile and preferences.</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-6">
                                        {/* Profile Card */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <User className="w-5 h-5 text-green-600" /> Profile
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex flex-col items-center pb-4 border-b">
                                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                                        <span className="text-2xl font-bold text-green-700">
                                                            {profile.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-lg">{profile.name}</h3>
                                                    <Badge variant="outline" className="mt-1">Farmer ID: {profile.id}</Badge>
                                                </div>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <Label className="text-xs text-slate-500">Phone Number</Label>
                                                        <div className="font-medium">{profile.phone}</div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-slate-500">Email Address</Label>
                                                        <div className="font-medium">{profile.email}</div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-slate-500">Village</Label>
                                                        <div className="font-medium">{profile.village}</div>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="w-full mt-2" onClick={() => setIsEditProfileOpen(true)}>Edit Profile</Button>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="md:col-span-2 space-y-6">
                                        {/* Notifications */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Bell className="w-5 h-5 text-blue-600" /> Notifications
                                                </CardTitle>
                                                <CardDescription>Choose how you want to be updated.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Email Alerts</Label>
                                                        <p className="text-sm text-slate-500">Receive updates via email.</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.email}
                                                        onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, email: checked } })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">SMS Alerts</Label>
                                                        <p className="text-sm text-slate-500">Receive critical alerts via SMS.</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.sms}
                                                        onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, sms: checked } })}
                                                    />
                                                </div>
                                                <div className="border-t pt-4 flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Weather Forecasts</Label>
                                                        <p className="text-sm text-slate-500">Daily weather updates for your region.</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.weather}
                                                        onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, weather: checked } })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Scheme Updates</Label>
                                                        <p className="text-sm text-slate-500">Notifications about new government schemes.</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.notifications.schemes}
                                                        onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, schemes: checked } })}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Preferences */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Globe className="w-5 h-5 text-purple-600" /> Platform Preferences
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="language">Language</Label>
                                                    <Select
                                                        value={settings.language}
                                                        onValueChange={(value) => setSettings({ ...settings, language: value })}
                                                    >
                                                        <SelectTrigger id="language">
                                                            <SelectValue placeholder="Select Language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                                                            <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                                                            <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Security */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-red-600" /> Security
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">Password</h4>
                                                        <p className="text-sm text-slate-500">Last changed 3 months ago.</p>
                                                    </div>
                                                    <Button variant="outline">Change Password</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* Guide Modal */}
            <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            {selectedGuide && GUIDES[selectedGuide]?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <ol className="list-decimal list-inside space-y-3 text-slate-600">
                            {selectedGuide && GUIDES[selectedGuide]?.steps.map((step, index) => (
                                <li key={index} className="pl-2">
                                    <span className="ml-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedGuide(null)}>Close Guide</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modals */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Register New Land Parcel</DialogTitle>
                        <DialogDescription>
                            Enter the details of your land to get personalized recommendations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="crop">Crop Type</Label>
                            <Select
                                value={newLand.crop}
                                onValueChange={(value) => setNewLand({ ...newLand, crop: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wheat">Wheat</SelectItem>
                                    <SelectItem value="rice">Rice</SelectItem>
                                    <SelectItem value="cotton">Cotton</SelectItem>
                                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                                    <SelectItem value="maize">Maize</SelectItem>
                                    <SelectItem value="potato">Potato</SelectItem>
                                    <SelectItem value="tomato">Tomato</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="soil">Soil Type</Label>
                            <Select
                                value={newLand.soilType}
                                onValueChange={(value) => setNewLand({ ...newLand, soilType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Soil Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="alluvial">Alluvial Soil</SelectItem>
                                    <SelectItem value="black">Black Soil</SelectItem>
                                    <SelectItem value="red">Red Soil</SelectItem>
                                    <SelectItem value="laterite">Laterite Soil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="area">Area (in acres)</Label>
                            <Input
                                id="area"
                                type="number"
                                placeholder="e.g 2.5"
                                value={newLand.area}
                                onChange={(e) => setNewLand({ ...newLand, area: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Location (Click on map)</Label>
                            <div className="h-[300px] w-full rounded-md border overflow-hidden">
                                <MapContainer
                                    center={[20.5937, 78.9629]}
                                    zoom={5}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationPicker onLocationSelect={(latlng) => {
                                        setNewLand(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
                                    }} />
                                    {newLand.latitude && newLand.longitude && (
                                        <Marker position={[newLand.latitude, newLand.longitude]} />
                                    )}
                                </MapContainer>
                            </div>
                            <div className="flex gap-4 text-xs text-slate-500">
                                <span>Lat: {newLand.latitude ? newLand.latitude.toFixed(4) : 'Not selected'}</span>
                                <span>Lng: {newLand.longitude ? newLand.longitude.toFixed(4) : 'Not selected'}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                        <Button onClick={handleRegisterLand}>Register Land</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Land Details</DialogTitle>
                        <DialogDescription>
                            Comprehensive information about your registered land parcel.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLand && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Crop Type</Label>
                                    <div className="font-semibold text-lg capitalize">{selectedLand.crop}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Soil Type</Label>
                                    <div className="font-semibold text-lg capitalize">{selectedLand.soilType}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Area</Label>
                                    <div className="font-semibold text-lg">{selectedLand.area} Acres</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge variant={selectedLand.status === 'Approved' ? 'default' : 'secondary'}>
                                        {selectedLand.status || 'Pending'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Location Map</Label>
                                <div className="h-[250px] w-full rounded-md border overflow-hidden relative">
                                    <MapContainer
                                        center={[selectedLand.latitude || 20.5937, selectedLand.longitude || 78.9629]}
                                        zoom={selectedLand.latitude ? 13 : 5}
                                        style={{ height: '100%', width: '100%' }}
                                        key={selectedLand._id}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {selectedLand.latitude && selectedLand.longitude && (
                                            <Marker position={[selectedLand.latitude, selectedLand.longitude]} />
                                        )}
                                    </MapContainer>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {selectedLand.latitude
                                            ? `${selectedLand.latitude.toFixed(6)}, ${selectedLand.longitude.toFixed(6)}`
                                            : 'Location not set'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your personal information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={editFormData.phone}
                                onChange={(e) => {
                                    // Numeric only for phone
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setEditFormData({ ...editFormData, phone: val });
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="village">Village</Label>
                            <Input
                                id="village"
                                value={editFormData.village}
                                onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="district">District</Label>
                            <Input
                                id="district"
                                value={editFormData.district}
                                onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditProfileSubmit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isSoilModalOpen} onOpenChange={setIsSoilModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Submit Soil Data</DialogTitle>
                        <DialogDescription>
                            Enter NPK values and pH from your soil health card.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="landSelect">Select Land Parcel</Label>
                            <Select
                                value={newSoilTest.landId}
                                onValueChange={(val) => setNewSoilTest({ ...newSoilTest, landId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a land..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {lands.map((land) => (
                                        <SelectItem key={land._id} value={land._id}>
                                            {land.crop} ({land.area} acres) - {land.soilType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ph">pH Level</Label>
                                <Input
                                    id="ph"
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g 6.5"
                                    value={newSoilTest.ph}
                                    onChange={(e) => setNewSoilTest({ ...newSoilTest, ph: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                                <Input
                                    id="nitrogen"
                                    type="number"
                                    placeholder="kg/ha"
                                    value={newSoilTest.nitrogen}
                                    onChange={(e) => setNewSoilTest({ ...newSoilTest, nitrogen: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                                <Input
                                    id="phosphorus"
                                    type="number"
                                    placeholder="kg/ha"
                                    value={newSoilTest.phosphorus}
                                    onChange={(e) => setNewSoilTest({ ...newSoilTest, phosphorus: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="potassium">Potassium (K)</Label>
                                <Input
                                    id="potassium"
                                    type="number"
                                    placeholder="kg/ha"
                                    value={newSoilTest.potassium}
                                    onChange={(e) => setNewSoilTest({ ...newSoilTest, potassium: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSoilModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSoilSubmit}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default FarmerDashboard;
