import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const getGuestLinks = () => [
    { name: 'Home', href: '/' },
    { name: 'Modules', href: '/modules' },
    { name: 'GIS Platform', href: '/gis-platform' },
    { name: 'Housing MIS', href: '/housing-mis' },
    { name: 'Reports', href: '/reports' },
  ];

  const getAdminLinks = () => [
    { name: 'Dashboard', href: '/admin?tab=overview' },
    { name: 'Farmers', href: '/admin?tab=farmers' },
    { name: 'Lands', href: '/admin?tab=lands' },
    { name: 'Verify Soil', href: '/admin?tab=soil' },
    { name: 'Crops', href: '/admin?tab=crops' },
    { name: 'Housing', href: '/admin?tab=housing' },
    { name: 'GIS', href: '/gis-dashboard' },
    { name: 'Reports', href: '/admin?tab=reports' },
  ];

  const getFarmerLinks = () => [
    { name: 'Dashboard', href: '/farmer?tab=overview' },
    { name: 'My Land', href: '/farmer?tab=land' },
    { name: 'Fertilizer Planner', href: '/fertilizer-planner' },
    { name: 'Housing Scheme', href: '/farmer?tab=housing' },
    { name: 'GIS Map', href: '/farmer?tab=gis' },
    { name: 'Help', href: '/farmer?tab=help' },
  ];

  const links = user
    ? (user.role === 'admin' ? getAdminLinks() : getFarmerLinks())
    : getGuestLinks();

  const isLinkActive = (href) => {
    if (href.includes('?tab=')) {
      const tab = href.split('?tab=')[1];
      return location.pathname === '/admin' && location.search.includes(`tab=${tab}`);
    }
    return location.pathname === href;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-lg shadow-lg' : 'bg-background/80 backdrop-blur-lg'} border-b border-border`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-primary text-lg">🌾</span>
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-semibold text-lg">GraminSetu</span>
              <span className="text-muted-foreground text-xs hidden sm:block">Integrated Rural Development</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative text-sm font-medium transition-colors ${isLinkActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {link.name}
                {isLinkActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* User Button */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                  Farmer Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground hover:bg-accent rounded-lg transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`py-3 px-4 rounded-lg transition-colors ${isLinkActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <div className="px-4 pt-2 border-t border-border mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Logged in as {user.name}</p>
                  <Button variant="outline" size="sm" onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="default" size="default" className="gap-2 mt-4 w-full">
                    <User className="w-4 h-4" />
                    Farmer Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>);
};
export default Navbar;
