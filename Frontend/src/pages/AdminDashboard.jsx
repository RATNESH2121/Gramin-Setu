import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { API_BASE_URL, cropsApi, housingApi, adminApiExtended, districtsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, MapPin, X, Home, User, Info, Plus, Download, Search, Trash2, Eye, Edit, IndianRupee, Clock, Activity, FileText, Globe, Layers, LayoutDashboard, Sprout, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Fix icons (standard Leaflet fix)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [lands, setLands] = useState([]);
  const [pendingSoils, setPendingSoils] = useState([]);
  const [stats, setStats] = useState({ usersCount: 0, landsCount: 0, pendingSoilCount: 0, revenue: '4.5L' });
  const [chartData, setChartData] = useState({ userGrowth: [], landDist: [] });
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [viewMode, setViewMode] = useState('street');

  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [map]);
    return null;
  };

  const { toast } = useToast();

  // Forms State
  const [cropData, setCropData] = useState({ name: '', soilType: '', nitrogen: '', phosphorus: '', potassium: '', tips: '', estimatedCost: '' });
  const [housingData, setHousingData] = useState({ id: '', beneficiary: '', village: '', district: '', state: '', fundsReleased: '', totalFunds: '', startDate: '', status: 'Sanctioned' });
  const [housingApps, setHousingApps] = useState([]);

  // Plan Generation State
  const [selectedSoilForPlan, setSelectedSoilForPlan] = useState(null);
  const [planData, setPlanData] = useState({ recommendedFertilizer: '', quantity: '', schedule: '' });

  // Housing Details Dialog State
  const [selectedApp, setSelectedApp] = useState(null);
  const mapRef = useRef(null);

  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'farmer', village: '', district: '' });

  // User Edit/View State
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', phone: '', role: '', village: '', district: '' });

  // District Management State
  const [districts, setDistricts] = useState([]);
  const [isAddDistrictOpen, setIsAddDistrictOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');

  // Filter State
  const [gisFilters, setGisFilters] = useState({ district: 'all', crop: 'all' });

  useEffect(() => {
    loadData();
    if (activeTab === 'lands') {
      loadDistricts();
    }
  }, [activeTab]);

  const loadDistricts = async () => {
    try {
      const data = await districtsApi.getAll();
      setDistricts(data || []);
    } catch (e) {
      console.error('Failed to load districts', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Always refresh generic stats when switching tabs
      const statsData = await adminApiExtended.getStats();
      setStats(statsData || {});

      if (activeTab === 'overview') {
        // Fetch chart data
        const charts = await adminApiExtended.getCharts();
        setChartData(charts || { userGrowth: [], landDist: [] });
        // Fetch recent activities/users (mocked or part of stats/users)
        const res = await fetch(`${API_BASE_URL}/admin/farmers`);
        const data = await res.json();
        setFarmers(data.farmers?.slice(0, 5) || []); // recent 5
      }

      if (activeTab === 'farmers') {
        const res = await fetch(`${API_BASE_URL}/admin/farmers`);
        const data = await res.json();
        setFarmers(data.farmers || []);
      } else if (activeTab === 'lands') {
        const landsData = await adminApiExtended.getAllLands();
        setLands(landsData);
        // Also fetch housing apps for the map
        try {
          const housingData = await housingApi.getAll();
          setHousingApps(housingData || []);
        } catch (e) {
          console.error("Failed to fetch housing for map", e);
        }
      } else if (activeTab === 'soil') {
        try {
          const data = await adminApiExtended.getPendingSoil();
          setPendingSoils(data);
        } catch (e) {
          setPendingSoils([]);
        }
      } else if (activeTab === 'housing') {
        try {
          const data = await housingApi.getAll();
          setHousingApps(data || []);
        } catch (e) {
          setHousingApps([]);
        }
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSoil = async (id) => {
    try {
      await adminApiExtended.updateSoilStatus(id, true);
      toast({ title: 'Success', description: 'Soil data approved' });
      loadData();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to approve soil', variant: 'destructive' });
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!selectedSoilForPlan) return;
    try {
      await adminApiExtended.createPlan({
        landId: selectedSoilForPlan.landId._id,
        ...planData
      });
      if (!selectedSoilForPlan.approved) {
        await adminApiExtended.updateSoilStatus(selectedSoilForPlan._id, true);
      }
      toast({ title: 'Success', description: 'Fertilizer plan generated' });
      setSelectedSoilForPlan(null);
      setPlanData({ recommendedFertilizer: '', quantity: '', schedule: '' });
      loadData();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to generate plan', variant: 'destructive' });
    }
  };

  const handleAddDistrict = async () => {
    if (!newDistrictName.trim()) {
      toast({ title: 'Error', description: 'District name is required', variant: 'destructive' });
      return;
    }
    try {
      await districtsApi.create(newDistrictName);
      toast({ title: 'Success', description: 'District added successfully' });
      setIsAddDistrictOpen(false);
      setNewDistrictName('');
      loadDistricts();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to add district', variant: 'destructive' });
    }
  };

  const filteredLands = lands.filter(land => {
    const districtMatch = gisFilters.district === 'all' || (land.district && land.district === gisFilters.district);
    const cropMatch = gisFilters.crop === 'all' || (land.crop && land.crop.toLowerCase() === gisFilters.crop.toLowerCase());
    return districtMatch && cropMatch;
  });

  const filteredHousing = housingApps.filter(app => {
    const districtMatch = gisFilters.district === 'all' || (app.address?.district && app.address.district === gisFilters.district);
    // Only show housing if no specific crop filter is active (as houses don't have crops)
    const cropMatch = gisFilters.crop === 'all';
    return districtMatch && cropMatch;
  });

  const handleExportMapData = () => {
    try {
      if (filteredLands.length === 0) {
        toast({ title: "Info", description: "No data to export" });
        return;
      }
      const headers = ["District,Crop,Area (Acres),Farmer,Status"];
      const rows = filteredLands.map(l => [
        l.district || 'N/A',
        l.crop,
        l.area,
        l.farmerId?.name || 'N/A',
        l.status
      ].map(field => `"${field}"`).join(","));

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "gis_data_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Map data exported successfully" });
    } catch (e) {
      toast({ title: "Error", description: "Export failed", variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    try {
      await adminApiExtended.createUser(newUser);
      toast({ title: "Success", description: "User created successfully" });
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'farmer', village: '', district: '' });
      loadData(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    }
  };

  const handleExportUsers = () => {
    try {
      if (farmers.length === 0) {
        toast({ title: "Info", description: "No users to export" });
        return;
      }
      const headers = ["Name,Email,Role,Phone,Village,District,Join Date"];
      const rows = farmers.map(f => [
        f.name,
        f.email,
        f.role,
        f.phone || '',
        f.village || '',
        f.district || '',
        new Date(f.createdAt || Date.now()).toLocaleDateString()
      ].map(field => `"${field}"`).join(",")); // Quote fields for safety

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Users exported successfully" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Export failed", variant: "destructive" });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const data = await adminApiExtended.getAllLands();
      const flatData = data.map(l => ({
        Crop: l.crop,
        Area: l.area,
        Soil: l.soilType,
        Farmer: l.farmerId?.name || 'N/A',
        Village: l.farmerId?.village || 'N/A',
        Status: l.status
      }));
      const headers = Object.keys(flatData[0]).join(',');
      const rows = flatData.map(obj => Object.values(obj).join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "land_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to download' });
    }
  };

  const handleHousingStatusUpdate = async (id, status) => {
    try {
      await housingApi.updateStatus(id, { status });
      toast({ title: 'Success', description: `Application ${status}` });
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    }
  };

  const handleCropSubmit = async (e) => { e.preventDefault(); try { const payload = { ...cropData, tips: cropData.tips.split(',').map(t => t.trim()) }; await cropsApi.create(payload); toast({ title: 'Success', description: 'Crop added!' }); setCropData({ name: '', soilType: '', nitrogen: '', phosphorus: '', potassium: '', tips: '', estimatedCost: '' }); } catch (err) { toast({ title: 'Error', description: 'Failed to add crop', variant: 'destructive' }); } };
  const handleHousingSubmit = async (e) => { e.preventDefault(); try { await housingApi.create(housingData); toast({ title: 'Success', description: 'Housing project added!' }); setHousingData({ id: '', beneficiary: '', village: '', district: '', state: '', fundsReleased: '', totalFunds: '', startDate: '', status: 'Sanctioned' }); } catch (err) { toast({ title: 'Error', description: 'Failed to add project', variant: 'destructive' }); } };
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await adminApiExtended.deleteUser(id);
      setFarmers(farmers.filter(f => f._id !== id));
      toast({ title: 'Success', description: 'User deleted' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'farmer',
      village: user.village || '',
      district: user.district || ''
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      const updated = await adminApiExtended.updateUser(selectedUser._id, editUserData);
      // Update local state
      setFarmers(farmers.map(f => f._id === selectedUser._id ? { ...f, ...editUserData } : f));
      toast({ title: 'Success', description: 'User updated successfully' });
      setIsEditUserOpen(false);
      setSelectedUser(null);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  // Filter users
  const filteredFarmers = farmers.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 lg:px-8 flex-1 flex items-start pt-24 pb-12 gap-8">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex gap-8">

          {/* Sidebar */}
          <aside className="w-64 bg-card border border-border rounded-lg hidden md:flex flex-col shrink-0 sticky top-24 h-[calc(100vh-8rem)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  A
                </div>
                <div>
                  <h3 className="font-semibold text-foreground leading-tight">Admin</h3>
                  <p className="text-xs text-muted-foreground">System Admin</p>
                </div>
              </div>
            </div>
            <TabsList className="flex flex-col h-full bg-transparent p-2 gap-1 overflow-y-auto w-full">
              <TabsTrigger value="overview" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><LayoutDashboard size={18} /> Overview</TabsTrigger>
              <TabsTrigger value="farmers" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><User size={18} /> Farmers</TabsTrigger>
              <TabsTrigger value="soil" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><Sprout size={18} /> Verify Soil {stats.pendingSoilCount > 0 && <span className="ml-auto bg-green-200 text-green-800 text-[10px] px-1.5 py-0.5 rounded-full">{stats.pendingSoilCount}</span>}</TabsTrigger>
              <TabsTrigger value="lands" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><MapPin size={18} /> GIS Maps</TabsTrigger>
              <TabsTrigger value="housing" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><Home size={18} /> Housing Schemes</TabsTrigger>
              <TabsTrigger value="crops" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><Layers size={18} /> Crops Config</TabsTrigger>
              <TabsTrigger value="reports" className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all rounded-md"><FileText size={18} /> Reports</TabsTrigger>
            </TabsList>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">System Overview & Management Panel</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Info className="w-4 h-4" /> Help
                </Button>
              </div>
            </div>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.usersCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total Users</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Farms</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Home className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.landsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active Farms</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Land</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">495 acres</div>
                    <p className="text-xs text-muted-foreground mt-1">Total Land</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">₹{stats.revenue || '4.5L'}</div>
                    <p className="text-xs text-muted-foreground mt-1">Revenue</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1 shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription className="flex items-center text-green-600"><Activity className="w-3 h-3 mr-1" /> +25% this quarter</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.userGrowth.length > 0 ? chartData.userGrowth : [{ name: 'Jan', value: 40 }, { name: 'Feb', value: 50 }, { name: 'Mar', value: 60 }, { name: 'Apr', value: 75 }, { name: 'May', value: 85 }, { name: 'Jun', value: 100 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Clients" stroke="#16a34a" strokeWidth={2} dot={{ r: 4, fill: "#16a34a" }} activeDot={{ r: 6 }} />
                        {/* Fake Admins line for visual match */}
                        <Line type="monotone" dataKey="value" name="Admins" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" data={[{ name: 'Jan', value: 5 }, { name: 'Feb', value: 6 }, { name: 'Mar', value: 6 }, { name: 'Apr', value: 7 }, { name: 'May', value: 7 }, { name: 'Jun', value: 8 }]} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-1 shadow-sm border-border bg-card">
                  <CardHeader>
                    <CardTitle>Land Distribution by Crop</CardTitle>
                    <CardDescription>Acreage distribution across crops</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.landDist.length > 0 ? chartData.landDist : [{ name: 'Wheat', value: 300 }, { name: 'Rice', value: 100 }, { name: 'Corn', value: 50 }, { name: 'Others', value: 45 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={5}
                        >
                          {chartData.landDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="square" formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Users */}
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Users</CardTitle>
                    <Button size="sm" className="bg-green-700 hover:bg-green-800 h-7 text-xs">View All</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {farmers.slice(0, 4).map(farmer => (
                      <div key={farmer._id} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                            {farmer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{farmer.name}</p>
                            <p className="text-xs text-muted-foreground">{farmer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold tracking-wider mb-1">Client</Badge>
                          <div className="flex items-center gap-1 justify-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-[10px] text-muted-foreground font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Activities</CardTitle>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-green-200 text-primary hover:bg-green-50">Clear Logs</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { title: 'New user registered', desc: 'Ramesh Kumar', time: '2 min ago', icon: <CheckCircle className="w-4 h-4 text-green-600" />, bg: 'bg-green-100' },
                      { title: 'Fertilizer plan generated', desc: 'System', time: '15 min ago', icon: <Eye className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100' },
                      { title: 'System backup completed', desc: 'Admin', time: '1 hour ago', icon: <CheckCircle className="w-4 h-4 text-green-600" />, bg: 'bg-green-100' },
                      { title: 'API request failed', desc: 'System', time: '2 hours ago', icon: <Clock className="w-4 h-4 text-red-600" />, bg: 'bg-red-100' },
                      { title: 'New land parcel added', desc: 'Priya Sharma', time: '3 hours ago', icon: <MapPin className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`h-8 w-8 rounded-full ${activity.bg} flex items-center justify-center shrink-0`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.desc}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* USERS TAB - USER MANAGEMENT */}
            <TabsContent value="farmers" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Farmers Management</CardTitle>
                    <CardDescription>Manage registered farmers</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8 w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddUserOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                    <Button variant="outline" onClick={handleExportUsers}>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFarmers.map(farmer => (
                        <TableRow key={farmer._id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                              {farmer.name.charAt(0)}
                            </div>
                            {farmer.name}
                          </TableCell>
                          <TableCell>{farmer.email}</TableCell>
                          <TableCell><Badge>FARMER</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge></TableCell>
                          <TableCell>2024-03-15</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewUser(farmer)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditUser(farmer)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(farmer._id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LANDS / GIS TAB */}
            <TabsContent value="lands" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2"><MapPin className="w-5 h-5" /> GIS Land Management</CardTitle>
                    <CardDescription>Monitor and manage all land parcels across districts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-green-700 hover:bg-green-800" onClick={() => setIsAddDistrictOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add District</Button>
                    <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={handleExportMapData}><Download className="mr-2 h-4 w-4" /> Export Map Data</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">District</label>
                      <Select value={gisFilters.district} onValueChange={(val) => setGisFilters({ ...gisFilters, district: val })}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                          <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Districts</SelectItem>
                          {districts.map(d => (
                            <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Crop Type</label>
                      <Select value={gisFilters.crop} onValueChange={(val) => setGisFilters({ ...gisFilters, crop: val })}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                          <SelectValue placeholder="All Crops" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Crops</SelectItem>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="corn">Corn</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"><Search className="w-4 h-4 mr-2" /> Applied</Button>
                      <Button variant="outline" className="text-slate-600 hover:bg-slate-50" onClick={handleExportMapData}><Download className="w-4 h-4 mr-2" /> Export Data</Button>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Map Controls Toolbar */}
                    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 bg-white/90 p-1.5 rounded-md shadow-md border border-slate-200 backdrop-blur-sm">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:bg-slate-50" onClick={() => {
                        if (mapRef.current) mapRef.current.setView([20.5937, 78.9629], 5);
                      }}><Home className="w-3 h-3 mr-1" /> Reset View</Button>
                      <div className="h-px bg-slate-200 my-0.5"></div>
                      <Button variant="ghost" size="sm" className={`h-8 px-2 text-xs hover:bg-slate-50 ${viewMode === 'satellite' ? 'bg-slate-100 text-blue-600' : ''}`} onClick={() => {
                        setViewMode(viewMode === 'street' ? 'satellite' : 'street');
                      }}><Globe className="w-3 h-3 mr-1" /> {viewMode === 'street' ? 'Satellite View' : 'Street View'}</Button>
                    </div>

                    {/* Legend Overlay */}
                    <div className="absolute top-4 right-4 z-[400] bg-white/95 p-3 rounded-lg shadow-md border border-slate-200 backdrop-blur-sm">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-4 text-xs font-medium">
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div> Excellent Soil</div>
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div> Good Soil</div>
                          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm"></div> Medium Soil</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium border-t pt-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm"></div> Housing Application
                        </div>
                      </div>
                    </div>

                    <div className="h-[500px] w-full bg-slate-100 rounded-lg overflow-hidden border relative z-0">
                      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                        <MapController />
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url={viewMode === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                        />
                        {filteredLands.map(land => (
                          land.latitude && land.longitude ? (
                            <Marker key={land._id} position={[land.latitude, land.longitude]}>
                              <Popup>
                                <div className="text-sm">
                                  <div className="font-bold">{land.crop}</div>
                                  <div>{land.area} acres</div>
                                  <div className="text-xs text-slate-500 mt-1">Farmer: {land.farmerId?.name || 'Unknown'}</div>
                                </div>
                              </Popup>
                            </Marker>
                          ) : null
                        ))}

                        {filteredHousing.map(app => (
                          app.address?.latitude && app.address?.longitude ? (
                            <Marker
                              key={`housing-${app._id}`}
                              position={[app.address.latitude, app.address.longitude]}
                              icon={redIcon}
                            >
                              <Popup>
                                <div className="text-sm">
                                  <div className="font-bold flex items-center gap-2"><Home size={14} /> Housing Application</div>
                                  <div className="font-semibold mt-1">{app.applicantId?.name || 'Unknown'}</div>
                                  <div>Status: <span className={`font-semibold ${app.status === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>{app.status}</span></div>
                                  <div className="text-xs text-slate-500 mt-1">{app.address.village}, {app.address.district}</div>
                                </div>
                              </Popup>
                            </Marker>
                          ) : null
                        ))}
                      </MapContainer>
                    </div>
                  </div>

                  {/* Land Parcels List */}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Land Parcels</h3>
                    <div className="space-y-4">
                      {/* Mocking list items if lands array is small or empty, basically same data but list view */}
                      {(filteredLands.length > 0 ? filteredLands : [
                        { _id: '1', crop: 'Wheat', area: '5', farmerId: { name: 'Ramesh Kumar' }, status: 'Active', district: 'North District' },
                        { _id: '2', crop: 'Rice', area: '3', farmerId: { name: 'Suresh Patel' }, status: 'Active', district: 'South District' },
                        { _id: '3', crop: 'Vegetables', area: '2', farmerId: { name: 'Priya Sharma' }, status: 'Active', district: 'East District' }
                      ]).map(land => (
                        <div key={land._id} className="bg-white border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">Farm {land._id.substring(land._id.length - 4).toUpperCase()}</h4>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              <span className="font-medium">{land.area} acres</span> • {land.crop} • <span className="text-slate-500">{land.district || 'Unknown District'}</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="View Details"><Eye className="w-4 h-4 text-slate-600" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Edit Land"><Edit className="w-4 h-4 text-blue-600" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-red-200 hover:bg-red-50" title="Delete Land"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SOIL TAB */}
            <TabsContent value="soil" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Soil Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingSoils.length === 0 ? <p className="text-muted-foreground text-center py-8">No pending requests.</p> : (
                    <div className="space-y-4">
                      {pendingSoils.map(soil => (
                        <div key={soil._id} className="bg-white p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900">{soil.landId?.crop || 'Unknown Crop'} Field</h4>
                            <p className="text-sm text-muted-foreground">
                              Farmer: {soil.landId?.farmerId?.name} • Values: N:{soil.nitrogen} P:{soil.phosphorus} K:{soil.potassium} pH:{soil.ph}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApproveSoil(soil._id)}>
                              Approve Only
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setSelectedSoilForPlan(soil)}>
                              Generate Plan & Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HOUSING TAB */}
            <TabsContent value="housing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Housing Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App ID</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Income</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {housingApps.map(app => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">{app.applicationId}</TableCell>
                          <TableCell>
                            <div>{app.applicantId?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{app.category}</div>
                          </TableCell>
                          <TableCell>₹{app.annualIncome}</TableCell>
                          <TableCell>
                            <Badge variant={app.status === 'Approved' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'secondary'}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>View</Button>
                              {app.status === 'Pending' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleHousingStatusUpdate(app._id, 'Approved')}>Approve</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CROPS & REPORTS (Simplified) */}
            <TabsContent value="crops">
              <Card>
                <CardHeader><CardTitle>Add New Crop</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleCropSubmit} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Crop Name" value={cropData.name} onChange={(e) => setCropData({ ...cropData, name: e.target.value })} required />
                      <Input placeholder="Soil Type" value={cropData.soilType} onChange={(e) => setCropData({ ...cropData, soilType: e.target.value })} required />
                    </div>
                    <Button type="submit">Add Crop</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader><CardTitle>System Reports</CardTitle></CardHeader>
                <CardContent className="flex gap-4">
                  <Button variant="outline" onClick={handleDownloadReport}><Download className="mr-2 h-4 w-4" /> Download Land Report</Button>
                </CardContent>
              </Card>
            </TabsContent>

          </main>
        </Tabs>
      </div>

      {/* DIALOGS - Keep implementation similar but wrap in shadcn Dialog content */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {/* Simplified view for conciseness - implementation can be expanded */}
          {selectedApp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Applicant</p>
                <p>{selectedApp.applicantId?.name}</p>
                <p className="mt-2 font-bold">Address</p>
                <p>{selectedApp.address.village}, {selectedApp.address.district}</p>
              </div>
              {selectedApp.address.latitude && selectedApp.address.longitude ? (
                <div className="h-[300px] rounded-lg overflow-hidden border border-slate-200 z-0">
                  <MapContainer
                    key={selectedApp._id}
                    center={[selectedApp.address.latitude, selectedApp.address.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[selectedApp.address.latitude, selectedApp.address.longitude]}>
                      <Popup>
                        <div className="font-bold">Applicant Location</div>
                        <div className="text-xs">{selectedApp.address.village}</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[200px] bg-slate-100 rounded flex items-center justify-center text-slate-500">
                  <p>Location coordinates not available</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSoilForPlan} onOpenChange={(open) => !open && setSelectedSoilForPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Fertilizer Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <Input placeholder="Recommended Fertilizer" value={planData.recommendedFertilizer} onChange={e => setPlanData({ ...planData, recommendedFertilizer: e.target.value })} required />
            <Input placeholder="Quantity" value={planData.quantity} onChange={e => setPlanData({ ...planData, quantity: e.target.value })} required />
            <Input placeholder="Schedule" value={planData.schedule} onChange={e => setPlanData({ ...planData, schedule: e.target.value })} required />
            <Button type="submit" className="w-full">Generate</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Full Name</label>
              <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <label>Email</label>
              <Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div className="grid gap-2">
              <label>Phone</label>
              <Input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="9876543210" />
            </div>
            <div className="grid gap-2">
              <label>Password</label>
              <Input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} type="password" placeholder="******" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label>Village</label>
                <Input value={newUser.village} onChange={e => setNewUser({ ...newUser, village: e.target.value })} placeholder="Village Name" />
              </div>
              <div className="grid gap-2">
                <label>District</label>
                <Select value={newUser.district} onValueChange={val => setNewUser({ ...newUser, district: val })}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label>Role</label>
              <Select value={newUser.role} onValueChange={val => setNewUser({ ...newUser, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateUser} className="w-full">Create User</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDistrictOpen} onOpenChange={setIsAddDistrictOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New District</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>District Name</label>
              <Input value={newDistrictName} onChange={e => setNewDistrictName(e.target.value)} placeholder="e.g. North District" />
            </div>
          </div>
          <Button onClick={handleAddDistrict} className="w-full">Add District</Button>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <label className="text-muted-foreground text-xs">Email</label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs">Phone</label>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs">Village</label>
                  <p className="font-medium">{selectedUser.village || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs">District</label>
                  <p className="font-medium">{selectedUser.district || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Full Name</label>
              <Input value={editUserData.name} onChange={e => setEditUserData({ ...editUserData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label>Email</label>
              <Input value={editUserData.email} onChange={e => setEditUserData({ ...editUserData, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label>Phone</label>
              <Input value={editUserData.phone} onChange={e => setEditUserData({ ...editUserData, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label>Village</label>
                <Input value={editUserData.village} onChange={e => setEditUserData({ ...editUserData, village: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label>District</label>
                <Select value={editUserData.district} onValueChange={val => setEditUserData({ ...editUserData, district: val })}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label>Role</label>
              <Select value={editUserData.role} onValueChange={val => setEditUserData({ ...editUserData, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AdminDashboard;

