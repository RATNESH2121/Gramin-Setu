import { Star } from 'lucide-react';
const testimonials = [
    {
        stars: 5,
        quote: "GraminSetu's crop advisory helped me increase my wheat yield by 35%. The soil health card feature is incredibly helpful for planning my fertilizer usage.",
        name: 'Ramesh Kumar',
        role: 'Farmer, Madhya Pradesh',
        initials: 'RK',
        bgColor: 'bg-primary',
    },
    {
        stars: 5,
        quote: "I could track my housing construction progress in real-time. The transparency in fund disbursement gave me confidence that everything was on track.",
        name: 'Priya Devi',
        role: 'PMAY-G Beneficiary, Bihar',
        initials: 'PD',
        bgColor: 'bg-teal',
    },
    {
        stars: 5,
        quote: "The GIS dashboard has transformed how we plan development in our village. We can now see exactly where resources are needed most.",
        name: 'Suresh Patel',
        role: 'Village Sarpanch, Gujarat',
        initials: 'SP',
        bgColor: 'bg-teal',
    },
];
const TestimonialsSection = () => {
    return (<section className="py-20 lg:py-28 bg-section-light">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-golden/10 border border-golden/20 mb-6">
            <Star className="w-4 h-4 text-golden fill-golden"/>
            <span className="text-golden text-sm font-medium">Success Stories</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Voices from <span className="text-gradient-green">Rural India</span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from farmers, beneficiaries, and community leaders whose lives have been transformed by GraminSetu.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (<div key={index} className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 relative">
              {/* Quote mark */}
              <div className="absolute top-6 right-6 text-6xl text-muted/30 font-serif">"</div>
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (<Star key={i} className="w-5 h-5 text-golden fill-golden"/>))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6 relative z-10">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-semibold">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
};
export default TestimonialsSection;
