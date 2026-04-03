import { siteContent } from "@/content/site";
import Button from "@/components/ui/Button";
import HeroVideo from "@/components/ui/HeroVideo";
import FloatingParticles from "@/components/ui/FloatingParticles";

export default function Hero() {
  const { hero } = siteContent;

  return (
    <header className="relative min-h-screen flex items-center justify-center bg-brand-dark overflow-hidden">
      {/* Background video — muted, autoplay, looped */}
      <HeroVideo videoId="g1EqOBpu2mM" />

      {/* Warm floating particles — dust in studio light */}
      <FloatingParticles count={25} />

      {/* Ambient glow — breathing warmth */}
      <div
        className="ambient-glow absolute top-1/3 left-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196, 149, 106, 0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative text-center px-6">
        <p className="hero-descriptor text-xs font-sans tracking-[0.3em] uppercase text-brand-amber mb-6">
          {hero.descriptor}
        </p>

        <h1 className="hero-name font-serif text-5xl md:text-7xl lg:text-8xl font-normal tracking-wide text-brand-cream">
          {hero.name}
        </h1>

        {/* Decorative line under the name */}
        <div className="hero-line w-24 h-px bg-brand-amber/40 mx-auto mt-6" aria-hidden="true" />

        <p className="hero-quote mt-6 text-base md:text-lg text-brand-gold italic max-w-md mx-auto leading-relaxed font-serif">
          {hero.quote}
        </p>

        <div className="hero-cta mt-10">
          <Button href={hero.cta.href}>{hero.cta.label}</Button>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="text-[10px] tracking-[0.2em] uppercase text-brand-gold/50">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-brand-amber/40 to-transparent" />
      </div>
    </header>
  );
}
