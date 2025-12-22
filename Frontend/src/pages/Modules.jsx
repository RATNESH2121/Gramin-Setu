import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sprout, ClipboardCheck, CloudSun } from 'lucide-react';

import { Link } from 'react-router-dom';

const Modules = () => {
    const modules = [
        {
            title: "Smart Fertilizer Planner",
            description: "AI-driven NPK recommendations based on soil health cards.",
            icon: <Leaf className="w-10 h-10 text-green-600" />,
            status: "Live",
            features: ["Custom NPK Ratios", "Cost Estimation", "Yield Prediction"],
            link: "/fertilizer-planner"
        },
        {
            title: "Precision Agriculture",
            description: "Satellite-based crop health monitoring and advisory.",
            icon: <Sprout className="w-10 h-10 text-emerald-600" />,
            status: "Beta",
            features: ["NDVI Analysis", "Irrigation Alerts", "Pest Detection"],
            link: "/agri-services"
        },
        {
            title: "Scheme Eligibility Engine",
            description: "Automated verification for government housing and farm schemes.",
            icon: <ClipboardCheck className="w-10 h-10 text-blue-600" />,
            status: "Live",
            features: ["PMAY Integration", "Aadhaar Verification", "Instant Status"],
            link: "/housing-scheme"
        },
        {
            title: "Weather Intelligence",
            description: "Hyper-local weather forecasting for farming decisions.",
            icon: <CloudSun className="w-10 h-10 text-yellow-500" />,
            status: "Coming Soon",
            features: ["7-Day Forecast", "Rainfall Alerts", "Humidity Tracking"],
            link: null
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="pt-24 pb-20 container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Project Modules</h1>
                    <p className="text-lg text-slate-600">A modular architecture designed for scalability and integration. Each component works independently yet acts as a unified system.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {modules.map((mod, index) => {
                        const ModuleCard = (
                            <Card className="hover:shadow-lg transition-shadow border-slate-200 h-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-slate-100 rounded-lg">{mod.icon}</div>
                                        <Badge variant={mod.status === 'Live' ? 'default' : 'secondary'} className={mod.status === 'Live' ? 'bg-green-600' : ''}>
                                            {mod.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl mt-4">{mod.title}</CardTitle>
                                    <CardDescription className="text-base">{mod.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {mod.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-slate-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );

                        return mod.link ? (
                            <Link key={index} to={mod.link} className="block h-full">
                                {ModuleCard}
                            </Link>
                        ) : (
                            <div key={index} className="h-full">
                                {ModuleCard}
                            </div>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Modules;
