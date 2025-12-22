import { ArrowRight, Leaf, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
const stats = [
  { value: '10M+', label: 'Farmers Benefited' },
  { value: '500K+', label: 'Homes Built' },
  { value: '28', label: 'States Covered' },
  { value: '₹50Cr+', label: 'Funds Disbursed' },
];
const HeroSection = () => {
  return (<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background Image */}
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }} />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 dark:from-black/90 dark:via-black/70 dark:to-black/40" />

    {/* Grid pattern overlay */}
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
      backgroundSize: '50px 50px'
    }} />

    <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-24">
      <div className="max-w-3xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-white/80 text-sm font-medium">Government of India Initiative</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Empowering{' '}
          <span className="text-gradient-golden">Rural India</span>
          <br />
          Through Intelligent Growth
        </h1>

        {/* Description */}
        <p className="text-lg text-white/70 max-w-xl mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Harnessing advanced GIS technology and AI-powered insights to revolutionize agriculture and ensure dignified, geolocated housing for every citizen.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button variant="hero" size="lg" className="gap-2" asChild>
            <Link to="/modules">
              <Leaf className="w-5 h-5" />
              Explore Agricultural Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button variant="heroOutline" size="lg" className="gap-2" asChild>
            <Link to="/housing-mis">
              <Home className="w-5 h-5" />
              Track Housing Progress
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {stats.map((stat, index) => (<div key={index} className="text-left">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-white/60">{stat.label}</div>
          </div>))}
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
      <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
      <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
      </div>
    </div>
  </section>);
};
export default HeroSection;
