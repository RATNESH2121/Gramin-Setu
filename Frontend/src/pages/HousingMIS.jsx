import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Home, FileText, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Users, Building2, Search
} from 'lucide-react';

const HousingMIS = () => {
    // Mock Data for Charts
    const yearlyData = [
        { year: '2020', sanctioned: 450, completed: 380 },
        { year: '2021', sanctioned: 520, completed: 490 },
        { year: '2022', sanctioned: 600, completed: 550 },
        { year: '2023', sanctioned: 750, completed: 600 },
        { year: '2024', sanctioned: 900, completed: 820 },
    ];

    const statusData = [
        { name: 'Completed', value: 65, color: '#10b981' }, // emerald-500
        { name: 'In Progress', value: 25, color: '#3b82f6' }, // blue-500
        { name: 'Pending', value: 10, color: '#f59e0b' }, // amber-500
    ];

    const recentProjects = [
        { id: "HS-2024-001", beneficiary: "Ramesh Kumar", village: "Rampur", stage: "Roofing", progress: 75, status: "Active" },
        { id: "HS-2024-004", beneficiary: "Sita Devi", village: "Lakhanpur", stage: "Completed", progress: 100, status: "Completed" },
        { id: "HS-2024-007", beneficiary: "Mohan Singh", village: "Rampur", stage: "Foundation", progress: 25, status: "Active" },
        { id: "HS-2024-012", beneficiary: "Gita Patel", village: "Sonpur", stage: "Lintel", progress: 50, status: "Delayed" },
        { id: "HS-2024-015", beneficiary: "Abdul Khan", village: "Lakhanpur", stage: "Sanctioned", progress: 10, status: "New" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />

            <main className="pt-24 pb-20">
                {/* Hero Header */}
                <div className="bg-slate-900 text-white pb-24 pt-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <Badge className="mb-4 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-none">
                                    PMAY-G Transparency Portal
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">Housing MIS Overview</h1>
                                <p className="text-slate-400 max-w-2xl">
                                    Real-time monitoring of rural housing projects, fund utilization, and beneficiary progress.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button className="bg-white text-slate-900 hover:bg-slate-200 border-none">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download Reports
                                </Button>
                                <a href="/register">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Search className="w-4 h-4 mr-2" />
                                        Check Status
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Key Metrics Cards - Overlapping Hero */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 -mb-16">
                            <StatsCard
                                title="Total Sanctioned"
                                value="12,450"
                                change="+12% this month"
                                icon={<Home className="w-5 h-5 text-blue-500" />}
                            />
                            <StatsCard
                                title="Houses Completed"
                                value="8,932"
                                change="+5.4% vs last year"
                                icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                            />
                            <StatsCard
                                title="Funds Released"
                                value="₹ 45.2 Cr"
                                change="98% utilization"
                                icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
                            />
                            <StatsCard
                                title="Active Beneficiaries"
                                value="3,518"
                                change="Active construction"
                                icon={<Users className="w-5 h-5 text-purple-500" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 mt-24">
                    <Tabs defaultValue="overview" className="space-y-8">
                        <TabsList className="bg-white border">
                            <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
                            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics & Trends</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-8">
                            {/* Charts Row */}
                            <div className="grid md:grid-cols-7 gap-8">
                                <Card className="md:col-span-4 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Construction Trends</CardTitle>
                                        <CardDescription>Sanctioned vs Completed houses over the last 5 years.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={yearlyData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                        cursor={{ fill: 'transparent' }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="sanctioned" name="Sanctioned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-3 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Project Status</CardTitle>
                                        <CardDescription>Current distribution of active housing projects.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {statusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                    <Legend verticalAlign="bottom" height={36} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Projects Table - Hidden for Public */}
                            <Card className="shadow-sm border-dashed border-2 bg-slate-50/50">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Building2 className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Details Protected</h3>
                                    <p className="text-slate-500 max-w-sm mb-6">
                                        Beneficiary details and rreal-time project statuses are restricted to authorized government officials.
                                    </p>
                                    <a href="/login">
                                        <Button variant="outline">Login to View Details</Button>
                                    </a>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="projects">
                            <Card className="h-[400px] flex items-center justify-center text-slate-500">
                                Full project list would appear here...
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Helper Component for Stats
const StatsCard = ({ title, value, change, icon }) => (
    <Card className="border shadow-lg">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className="p-2 bg-slate-100 rounded-lg">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className="text-xs text-slate-500">{change}</p>
        </CardContent>
    </Card>
);

export default HousingMIS;
