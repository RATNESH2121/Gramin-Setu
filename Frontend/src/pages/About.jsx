import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Globe, Shield } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4">

                    {/* Vision Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-6">About GraminSetu</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Bridging the gap between government resources and rural citizens through digital innovation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                GraminSetu operates on the core philosophy of <strong>"Antyodaya"</strong> — reaching the last person in the line.
                                By digitizing land records, fertilizer planning, and housing schemes, we aim to eliminate corruption,
                                reduce delays, and empower farmers with data-driven decision making.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">Good Governance</Badge>
                                <Badge variant="outline">Digital India</Badge>
                                <Badge variant="outline">Sustainable Farming</Badge>
                                <Badge variant="outline">Transparency</Badge>
                            </div>
                        </div>
                        <div className="bg-muted p-8 rounded-2xl border border-border">
                            <h3 className="text-lg font-semibold mb-4">Core Objectives</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3 items-start">
                                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1">1</span>
                                    <span>To provide a single-window portal for all rural development schemes.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1">2</span>
                                    <span>To integrate GIS mapping with land records for accurate verification.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1">3</span>
                                    <span>To promote scientific agriculture practices via AI-driven advisories.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-8 text-center">Technology Stack</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                                <CardContent className="p-6 text-center">
                                    <Globe className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                                    <h3 className="font-semibold">MERN Stack</h3>
                                    <p className="text-xs text-muted-foreground">Full-Stack Javascript</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                                <CardContent className="p-6 text-center">
                                    <Database className="w-8 h-8 mx-auto mb-3 text-green-500" />
                                    <h3 className="font-semibold">MongoDB</h3>
                                    <p className="text-xs text-muted-foreground">Scalable NoSQL Data</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                                <CardContent className="p-6 text-center">
                                    <Code className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                                    <h3 className="font-semibold">Tailwind CSS</h3>
                                    <p className="text-xs text-muted-foreground">Rapid UI Development</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border hover:bg-muted/50 transition-colors">
                                <CardContent className="p-6 text-center">
                                    <Shield className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                                    <h3 className="font-semibold">JWT Auth</h3>
                                    <p className="text-xs text-muted-foreground">Secure Access Control</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
