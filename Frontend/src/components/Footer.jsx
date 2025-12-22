import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { contactApi } from '@/lib/api';
const footerLinks = {
  platform: [
    { name: 'Fertilizer Planner', href: '/fertilizer-planner' },
    { name: 'Housing Tracker', href: '/housings' },
    { name: 'GIS Dashboard', href: '/gis-dashboard' },
    { name: 'Crop Advisory', href: '/crop-advisory' },
    { name: 'Weather Alerts', href: '/weather-alerts' },
  ],
  schemes: [
    { name: 'PM-Kisan', href: '/schemes/pm-kisan' },
    { name: 'PMAY-G', href: '/schemes/pmay-g' },
    { name: 'Soil Health Card', href: '/schemes/soil-health' },
    { name: 'Kisan Credit Card', href: '/schemes/kcc' },
    { name: 'MGNREGA', href: '/schemes/mgnrega' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Access', href: '/api' },
    { name: 'Training Videos', href: '/training' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Support', href: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Data Security', href: '/security' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};
const socialLinks = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Linkedin, href: '#' },
  { icon: Youtube, href: '#' },
  { icon: Instagram, href: '#' },
];
const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await contactApi.subscribe(email);
      toast({
        title: "Subscribed!",
        description: "You'll receive updates on rural development schemes.",
      });
      setEmail('');
    } catch (error) {
      toast({ title: "Error", description: "Subscription failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="dark bg-background border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Stay Updated</h3>
              <p className="text-muted-foreground">Get the latest updates on rural development schemes and initiatives.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-muted/50 border-input text-foreground placeholder:text-muted-foreground h-12"
                />
              </div>
              <Button variant="golden" size="lg" type="submit" className="gap-2" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-primary text-lg">🌾</span>
              </div>
              <span className="text-foreground font-semibold text-xl">GraminSetu</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Integrated Rural Development Platform empowering millions of farmers and citizens across India through technology-driven solutions.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <social.icon className="w-5 h-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Schemes Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Schemes</h4>
            <ul className="space-y-3">
              {footerLinks.schemes.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 GraminSetu. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              A <span className="text-golden font-medium">Government of India</span> Initiative
            </p>
          </div>
        </div>
      </div>
    </footer>);
};
export default Footer;
