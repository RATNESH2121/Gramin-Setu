const partners = [
    { abbr: 'MoA', name: 'Ministry of', sub: 'Agriculture' },
    { abbr: 'MoRD', name: 'Ministry of', sub: 'Rural Development' },
    { abbr: 'NITI', name: 'NITI Aayog', sub: '' },
    { abbr: 'DI', name: 'Digital India', sub: '' },
    { abbr: 'ISRO', name: 'ISRO', sub: '' },
    { abbr: 'ICAR', name: 'ICAR', sub: '' },
];
const PartnersSection = () => {
    return (<section className="py-16 bg-section-light border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-muted-foreground text-sm font-medium uppercase tracking-widest mb-10">
          Trusted by Government Bodies & Institutions
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {partners.map((partner, index) => (<div key={index} className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 min-w-[120px] hover:scale-105">
              <span className="text-xl font-bold text-foreground mb-1">{partner.abbr}</span>
              <span className="text-xs text-muted-foreground text-center">
                {partner.name}
                {partner.sub && <><br />{partner.sub}</>}
              </span>
            </div>))}
        </div>
      </div>
    </section>);
};
export default PartnersSection;
