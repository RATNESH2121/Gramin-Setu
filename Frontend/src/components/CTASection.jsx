import { ArrowRight, Phone, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { contactApi } from '@/lib/api';
import { useState } from 'react';
const CTASection = () => {
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queryForm, setQueryForm] = useState({ name: '', email: '', phone: '', query: '' });
  const { toast } = useToast();

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.submitQuery(queryForm);
      toast({ title: "Success", description: "Your query has been sent to our experts." });
      setIsQueryOpen(false);
      setQueryForm({ name: '', email: '', phone: '', query: '' });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send query. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (<section className="dark relative py-20 lg:py-28 bg-section-dark overflow-hidden">
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
      backgroundSize: '50px 50px'
    }} />

    {/* Gradient orbs */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />

    <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
        <Sparkles className="w-4 h-4 text-white" />
        <span className="text-white/80 text-sm font-medium">Start Your Journey Today</span>
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
        Join the <span className="text-gradient-golden">Rural Transformation</span>
      </h2>

      <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
        Whether you're a farmer seeking better yields, a beneficiary tracking your housing progress, or an official managing schemes — GraminSetu is here to help.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Button variant="hero" size="lg" className="gap-2" onClick={() => setIsQueryOpen(true)}>
          Begin Your Transformation
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap justify-center gap-8 text-white/60">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm">Toll Free: 1800-XXX-XXXX</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span className="text-sm">support@graminsetu.gov.in</span>
        </div>
      </div>
    </div>

    <Dialog open={isQueryOpen} onOpenChange={setIsQueryOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Talk to an Expert</DialogTitle>
          <DialogDescription>
            Fill out the form below and our agricultural experts will get back to you shortly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleQuerySubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              placeholder="Your Name"
              value={queryForm.name}
              onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={queryForm.email}
              onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone (Optional)</label>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={queryForm.phone}
              onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="query" className="text-sm font-medium">Your Query</label>
            <Textarea
              id="query"
              placeholder="How can we help you?"
              value={queryForm.query}
              onChange={(e) => setQueryForm({ ...queryForm, query: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Submit Query'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  </section >);
};
export default CTASection;
