import { UserPlus, LayoutDashboard, CheckSquare, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        step: '01',
        title: 'Register & Verify',
        description: 'Create your digital identity with Aadhaar/Email verification to access personalized government schemes.'
    },
    {
        icon: LayoutDashboard,
        step: '02',
        title: 'Access Services',
        description: 'Use our GIS dashboard to map land, plan fertilizers, or apply for PMAY-G housing houses instantly.'
    },
    {
        icon: CheckSquare,
        step: '03',
        title: 'Track & Benefit',
        description: 'Monitor application status in real-time and receive direct benefit transfers transparently.'
    }
];

const HowItWorksSection = () => {
    return (
        <section className="py-20 bg-background border-t border-border/50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        How GraminSetu Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        A simple 3-step process to bridge the gap between farmers and government resources.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

                    {steps.map((item, index) => (
                        <div key={index} className="relative z-10 bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-shadow group">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <item.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                            </div>

                            <div className="text-center">
                                <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground mb-3">
                                    STEP {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
