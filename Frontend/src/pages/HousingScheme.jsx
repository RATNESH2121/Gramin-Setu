import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, FileText, Banknote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HousingScheme = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                {/* Header */}
                <div className="container mx-auto px-4 mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium mb-6">
                        <Home className="w-4 h-4" /> Gramin Awas
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Pradhan Mantri Awas Yojana - Gramin</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Ensuring "Housing for All" by providing financial assistance to the rural poor for construction of pucca houses.
                    </p>
                </div>

                {/* Key Information */}
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" /> Eligibility Criteria
                        </h2>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                                Households without shelter or living in current kutcha houses.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                                SC/ST households, minorities, or landless households.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                                Families with no adult member between 16 and 59 years.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                                Must be part of the Socio-Economic Caste Census (SECC) 2011 list.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-500" /> Required Documents
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Aadhaar Card', 'Job Card (MGNREGA)', 'Bank Passbook', 'Swachh Bharat Mission Number', 'Land Documents', 'Income Certificate'].map((doc, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full" />
                                    <span className="font-medium text-sm">{doc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-muted/30 py-16 mb-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold mb-10 text-center">Scheme Benefits</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="bg-card border-border text-center pt-6">
                                <CardContent>
                                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Banknote className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">₹1.20 Lakh</h3>
                                    <p className="text-sm text-muted-foreground">Financial assistance in plain areas for house construction.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border text-center pt-6">
                                <CardContent>
                                    <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Banknote className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">₹1.30 Lakh</h3>
                                    <p className="text-sm text-muted-foreground">Assistance in hilly, difficult areas and IAP districts.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-border text-center pt-6">
                                <CardContent>
                                    <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">+ 90 Days</h3>
                                    <p className="text-sm text-muted-foreground">Additional wage employment support under MGNREGA.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* CTA Area */}
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground mb-6">Are you eligible? Log in to verify your status and track your application.</p>
                    <Link to="/login">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                            Login to Apply <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HousingScheme;
