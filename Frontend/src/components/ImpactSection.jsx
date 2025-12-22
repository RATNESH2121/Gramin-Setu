import { Leaf, Home, Users, Globe, FileText, TrendingUp, Search } from 'lucide-react';
import indiaMap from '@/assets/india-map.jpg';
const metrics = [
  { icon: Leaf, value: '1,200+', label: 'Acres Optimized' },
  { icon: Home, value: '450+', label: 'Homes Completed' },
  { icon: Users, value: '2,500+', label: 'Farmers Served' },
  { icon: Globe, value: '85+', label: 'Villages Covered' },
  { icon: FileText, value: '15K+', label: 'Data Points' },
];
const ImpactSection = () => {
  return (<section className="py-20 lg:py-28 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* GIS Dashboard Preview */}
        <div className="relative">
          <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
            {/* Window Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-golden" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">GIS Dashboard</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">Live</span>
              </div>
            </div>

            {/* Map Content */}
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Active Parcels: 12,456</span>
              </div>

              <img src={indiaMap} alt="India GIS Map" className="w-full h-[300px] object-cover" />

              {/* Search Bar */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-border shadow-lg">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Search by Village, Block, or Parcel ID...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Impact Metrics
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Track the real impact of our initiatives across India with live data updated every hour.
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {metrics.slice(0, 3).map((metric, index) => (<div key={index} className="stat-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <metric.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {metrics.slice(3).map((metric, index) => (<div key={index} className="stat-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-teal/10 flex items-center justify-center">
                <metric.icon className="w-6 h-6 text-teal" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>))}
          </div>

          {/* Accuracy Badge */}
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">97.3% Accuracy Rate</div>
              <div className="text-sm text-muted-foreground">Our GIS data is verified through multiple sources</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>);
};
export default ImpactSection;
