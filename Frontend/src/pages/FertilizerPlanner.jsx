import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Droplets, Sun, Wind, ArrowRight, Calculator, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cropsApi } from '@/lib/api';

const FertilizerPlanner = () => {
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [area, setArea] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const handleCalculate = async () => {
    if (!cropType || !soilType || !area) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to get recommendations.",
        variant: "destructive",
      });
      return;
    }
    setIsCalculating(true);
    try {
      const rec = await cropsApi.getRecommendation(cropType, soilType);
      if (rec) {
        setRecommendation(rec);
        toast({
          title: "Recommendations Ready!",
          description: "Your personalized fertilizer plan has been generated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  const calculateTotalCost = () => {
    if (!recommendation || !area)
      return null;
    const costPerAcre = parseInt(recommendation.estimatedCost.replace(/[^0-9]/g, ''));
    const totalCost = costPerAcre * parseFloat(area);
    return `₹${totalCost.toLocaleString('en-IN')}`;
  };
  return (<div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Demo Banner */}
        {/* Demo Banner */}
        {!user && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg mb-8 text-center text-sm font-medium">
            ⚠️ You are using the Public Demo Mode. To save field data and get official government-approved recommendations, please <a href="/login" className="underline hover:text-yellow-400">Login as a Farmer</a>.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">AI-Powered Planning</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Fertilizer <span className="text-gradient-green">Planner</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get personalized fertilizer recommendations based on your soil type, crop, and local weather conditions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Enter Your Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Crop Type</label>
                <select value={cropType} onChange={(e) => {
                  setCropType(e.target.value);
                  setRecommendation(null);
                }} className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select Crop</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="maize">Maize</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Soil Type</label>
                <select value={soilType} onChange={(e) => {
                  setSoilType(e.target.value);
                  setRecommendation(null);
                }} className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select Soil Type</option>
                  <option value="alluvial">Alluvial Soil</option>
                  <option value="black">Black Soil</option>
                  <option value="red">Red Soil</option>
                  <option value="laterite">Laterite Soil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Field Area (in acres)</label>
                <Input type="number" placeholder="Enter area" value={area} onChange={(e) => setArea(e.target.value)} className="h-12" min="0.1" step="0.1" />
              </div>

              <Button variant="hero" size="lg" className="w-full gap-2" onClick={handleCalculate} disabled={isCalculating}>
                {isCalculating ? (<>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>) : (<>
                  <Calculator className="w-5 h-5" />
                  Calculate Recommendations
                  <ArrowRight className="w-4 h-4" />
                </>)}
              </Button>
            </div>

            {/* Results */}
            {recommendation && (<div className="mt-8 pt-8 border-t border-border animate-fade-in">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Your Fertilizer Recommendations
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{recommendation.nitrogen}</div>
                  <div className="text-xs text-muted-foreground mt-1">Nitrogen (N)</div>
                </div>
                <div className="bg-teal/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-teal">{recommendation.phosphorus}</div>
                  <div className="text-xs text-muted-foreground mt-1">Phosphorus (P)</div>
                </div>
                <div className="bg-golden/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-golden">{recommendation.potassium}</div>
                  <div className="text-xs text-muted-foreground mt-1">Potassium (K)</div>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Total Cost ({area} acres)</span>
                  <span className="text-xl font-bold text-foreground">{calculateTotalCost()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-golden" />
                  Application Tips
                </h4>
                <ul className="space-y-2">
                  {recommendation.tips.map((tip, index) => (<li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>))}
                </ul>
              </div>
            </div>)}
          </div>

          {/* Info Cards */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border flex gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Soil Health Card Integration</h3>
                <p className="text-sm text-muted-foreground">Connect your Soil Health Card for personalized recommendations based on actual soil analysis.</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border flex gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sun className="w-6 h-6 text-teal" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Weather-Based Adjustments</h3>
                <p className="text-sm text-muted-foreground">Real-time weather data to optimize fertilizer application timing and quantity.</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border flex gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-golden/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wind className="w-6 h-6 text-golden" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Cost Optimization</h3>
                <p className="text-sm text-muted-foreground">Compare prices from nearby dealers and find subsidized fertilizers available in your area.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary/10 to-teal/10 rounded-2xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-4">Why Use Our Planner?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">35%</div>
                  <div className="text-xs text-muted-foreground">Avg. Yield Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal">25%</div>
                  <div className="text-xs text-muted-foreground">Cost Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-golden">50K+</div>
                  <div className="text-xs text-muted-foreground">Farmers Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">97%</div>
                  <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>);
};
export default FertilizerPlanner;
