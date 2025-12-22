import { Leaf, Home, MapPin, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Leaf,
    iconBg: 'bg-primary',
    title: 'Precision Agriculture',
    description: 'AI-driven crop planning supporting PM-KISAN & PMFBY initiatives for maximum yield optimization.',
  },
  {
    icon: Home,
    iconBg: 'bg-teal',
    title: 'Housing Scheme Tracking',
    description: 'Transparent monitoring of PMAY-G (Pradhan Mantri Awas Yojana) with real-time fund utilization tracking.',
  },
  {
    icon: MapPin,
    iconBg: 'bg-golden',
    title: 'Geospatial Intelligence',
    description: 'Village-level mapping integrating SVAMITVA Scheme data for accurate land record management.',
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-section-light">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">Our Core Services</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Transforming Rural India with<br />
            <span className="text-gradient-green">Technology</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive digital solutions designed to empower farmers, streamline housing delivery, and drive sustainable development.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-10 border border-border/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 ease-out hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 ${service.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                {service.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed text-[15px]">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
