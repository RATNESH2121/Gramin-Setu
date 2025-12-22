import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, MapPin, CheckCircle, Clock, IndianRupee, ArrowRight, Building, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { housingApi } from '@/lib/api';
const allHousings = []; // Replaced by state

const statusConfig = {
  'Completed': { bg: 'bg-primary/10', text: 'text-primary', icon: CheckCircle },
  'In Progress': { bg: 'bg-golden/10', text: 'text-golden', icon: Clock },
  'Foundation': { bg: 'bg-teal/10', text: 'text-teal', icon: Building },
  'Sanctioned': { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: AlertCircle },
};
const Housings = () => {
  const [allHousings, setAllHousings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHousings, setFilteredHousings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchHousings = async () => {
      try {
        const data = await housingApi.getAll();
        setAllHousings(data);
        setFilteredHousings(data);
      } catch (error) {
        console.error("Failed to fetch housings", error);
        toast({
          title: "Error",
          description: "Failed to load housing data.",
          variant: "destructive",
        });
      }
    };
    fetchHousings();
  }, []);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      let results = allHousings.filter(h => h.id.toLowerCase().includes(query) ||
        h.beneficiary.toLowerCase().includes(query) ||
        h.village.toLowerCase().includes(query) ||
        h.district.toLowerCase().includes(query));
      if (statusFilter !== 'all') {
        results = results.filter(h => h.status === statusFilter);
      }
      setFilteredHousings(results);
      setIsSearching(false);
      if (results.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try a different search term or filter.",
          variant: "destructive",
        });
      }
      else {
        toast({
          title: `${results.length} Result(s) Found`,
          description: "Housing records matching your search are displayed below.",
        });
      }
    }, 800);
  };
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredHousings(allHousings);
    }
    else {
      setFilteredHousings(allHousings.filter(h => h.status === status));
    }
  };
  const stats = {
    total: allHousings.length,
    completed: allHousings.filter(h => h.status === 'Completed').length,
    inProgress: allHousings.filter(h => h.status === 'In Progress').length,
    sanctioned: allHousings.filter(h => h.status === 'Sanctioned').length,
  };
  return (<div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 mb-6">
            <Home className="w-4 h-4 text-teal" />
            <span className="text-teal text-sm font-medium">Government Transparency Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            PMAY-G Housing <span className="text-gradient-green">Tracker</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Official public dashboard for tracking Pradhan Mantri Awaas Yojana (Gramin) implementation progress.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-primary">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-golden">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.sanctioned}</div>
            <div className="text-sm text-muted-foreground">Sanctioned</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="text" placeholder="Enter Beneficiary ID, Name, or Location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 text-lg" />
            </div>
            <Button type="submit" variant="hero" size="xl" className="gap-2" disabled={isSearching}>
              {isSearching ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : (<>
                Search
                <ArrowRight className="w-5 h-5" />
              </>)}
            </Button>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['all', 'Completed', 'In Progress', 'Foundation', 'Sanctioned'].map((status) => (<button key={status} onClick={() => handleFilterChange(status)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === status
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {status === 'all' ? 'All Projects' : status}
          </button>))}
        </div>

        {/* Housing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHousings.map((housing) => {
            const StatusIcon = statusConfig[housing.status].icon;
            return (<div key={housing.id} className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[housing.status].bg} ${statusConfig[housing.status].text}`}>
                  <StatusIcon className="w-3 h-3" />
                  {housing.status}
                </span>
                <span className="text-xs text-muted-foreground">{housing.id}</span>
              </div>

              {/* Beneficiary Info */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{housing.beneficiary}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                {housing.village}, {housing.district}, {housing.state}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{housing.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${housing.progress === 100 ? 'bg-primary' : 'bg-gradient-to-r from-primary to-teal'}`} style={{ width: `${housing.progress}%` }} />
                </div>
              </div>

              {/* Funds Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-3">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Funds Released</span>
                </div>
                <span className="font-semibold text-foreground">{housing.fundsReleased}</span>
              </div>

              {/* Timeline */}
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Started: {housing.startDate}</span>
                <span>Total: {housing.totalFunds}</span>
              </div>
            </div>);
          })}
        </div>

        {/* Empty State */}
        {filteredHousings.length === 0 && (<div className="text-center py-16">
          <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Housing Projects Found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setFilteredHousings(allHousings);
          }}>
            Clear Filters
          </Button>
        </div>)}
      </div>
    </main>
    <Footer />
  </div>);
};
export default Housings;
