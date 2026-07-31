const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `{/* 3. HOME HERO INTUITION SLIDERS */}`;

const replacement = `{/* LIVE VIDEO SECTION (IF AVAILABLE) */}
      {shopConfig.liveVideoUrl && (
        <section className="bg-stone-950 py-10 relative overflow-hidden">
          {/* Animated decorative gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 via-brand-navy/10 to-brand-gold/10 animate-pulse pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border border-white"></span>
              </span>
              <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-widest text-center shadow-black drop-shadow-md">
                {lang === "bn" ? "লাইভ ভিডিও আপডেট" : "Live Video Updates"}
              </h2>
            </div>
            
            <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl shadow-brand-gold/5 relative pt-[56.25%]">
              <iframe 
                src={shopConfig.liveVideoUrl} 
                title="Live Video" 
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* 3. HOME HERO INTUITION SLIDERS */}`;

const newContent = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', newContent);
console.log("Successfully replaced hero section");
