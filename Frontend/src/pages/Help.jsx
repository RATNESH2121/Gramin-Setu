import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from 'lucide-react';

const Help = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
                        <p className="text-muted-foreground">Browse frequently asked questions or contact our support team.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Who can register on GraminSetu?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Any resident of participation rural blocks with valid Agricultural land or housing requirements can register. You will need a mobile number and basic identification details.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Is the land registration official?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        The land details you enter are provisionally saved in our MIS. However, they are verified by the Block Administration against official records before benefits are released.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How do I get fertilizer recommendations?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Login to your account, add your land parcel, submit your latest soil health card data, and wait for Admin approval. Once approved, the system generates a tailored plan.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>I forgot my password. What to do?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Currently, password reset is handled by the block administrator for security. Please visit your local office or contact the helpline.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div>
                            <Card className="bg-card border-border sticky top-24">
                                <CardHeader>
                                    <CardTitle>Contact Support</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500"><Phone className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Toll Free</p>
                                            <p className="font-semibold">1800-KISSAN-HEL</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><Mail className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-semibold">support@gramin.gov.in</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500"><MapPin className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Headquarters</p>
                                            <p className="font-semibold text-sm">Rural Development Ministry, New Delhi</p>
                                        </div>
                                    </div>
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

export default Help;
