import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sprout, Brain, CloudRain, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgricultureServices = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                {/* Hero Section */}
                <div className="container mx-auto px-4 mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-6">
                        <Sprout className="w-4 h-4" /> Next-Gen Farming
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        Precision Agriculture for Every Farmer
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Leverage AI, soil data, and weather analytics to maximize your crop yield.
                        GraminSetu brings scientific farming advice directly to your phone.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/login">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                Login to Save Land <Lock className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/fertilizer-planner">
                            <Button variant="outline" size="lg" className="gap-2">
                                Try Public Demo <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                    <Card className="bg-card border-border hover:border-green-500/50 transition-colors">
                        <CardHeader>
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                                <Sprout className="w-6 h-6 text-green-500" />
                            </div>
                            <CardTitle>Soil-Based Advisory</CardTitle>
                            <CardDescription>Customized NPK plans</CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Input your soil test results (Nitrogen, Phosphorus, Potassium, pH) and get a government-approved fertilizer schedule tailored to your exact soil needs.
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border hover:border-blue-500/50 transition-colors">
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-blue-500" />
                            </div>
                            <CardTitle>AI Crop Planning</CardTitle>
                            <CardDescription>Smart predictive models</CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Our AI analyzes historical yield data and market trends to recommend the most profitable crops for your specific region and season.
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border hover:border-yellow-500/50 transition-colors">
                        <CardHeader>
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                                <CloudRain className="w-6 h-6 text-yellow-500" />
                            </div>
                            <CardTitle>Weather Integration</CardTitle>
                            <CardDescription>Real-time forecasts</CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Get sowing and harvesting advice based on real-time monsoon tracking and local weather predictions to avoid crop loss.
                        </CardContent>
                    </Card>
                </div>

                {/* Call to Action */}
                <div className="container mx-auto px-4 mt-20">
                    <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/20 rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to modernize your farm?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Join thousands of farmers who are saving costs and increasing income with GraminSetu's digital tools.
                        </p>
                        <Link to="/login">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 font-semibold px-8">
                                Register Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AgricultureServices;
