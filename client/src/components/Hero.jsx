import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';
import HeroCanvas from '../three/HeroCanvas.jsx';
import soundFX from '../utils/soundEffects.js';
import HeroContent from './HeroContent.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ society }) {
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [powerSurge, setPowerSurge] = useState(false);
  const [reverseFlow, setReverseFlow] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [burstRipple, setBurstRipple] = useState(0);
  const [chipHovered, setChipHovered] = useState(false);
  const [mouseSpotlight, setMouseSpotlight] = useState({ x: 50, y: 50 });
  const reducedMotion = useReducedMotion();

  const metrics = society?.metrics ?? {};

  // Track mouse for dynamic radial hero background spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMouseSpotlight({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP Coordinated entrance and bidirectional scroll scrub
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });

      if (reducedMotion) {
        gsap.set(
          [
            '.hero-grid-overlay',
            '.hero-3d-container',
            '.hero-line-inner',
            '.hero-supporting-copy',
            '.hero-actions-group',
            '.hero-interactive-deck',
            '.hero-telemetry-strip',
            '.hero-footer-bar',
          ],
          { opacity: 1, y: 0, scale: 1 },
        );
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.1,
      });

      gsap.set('.hero-grid-overlay', { opacity: 0 });
      gsap.set('.hero-3d-container', { opacity: 0, scale: 0.95 });
      gsap.set('.hero-line-inner', { opacity: 0, y: 44 });
      gsap.set('.hero-supporting-copy', { opacity: 0, y: 20 });
      gsap.set('.hero-actions-group', { opacity: 0, y: 16 });
      gsap.set('.hero-interactive-deck', { opacity: 0, y: 18 });
      gsap.set('.hero-telemetry-strip', { opacity: 0 });
      gsap.set('.hero-footer-bar', { opacity: 0 });

      tl.to('.hero-grid-overlay', {
        opacity: 0.22,
        duration: 0.8,
      })
        .to(
          '.hero-3d-container',
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: 'power2.out',
          },
          '-=0.4',
        )
        .to(
          '.hero-line-inner',
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
          },
          '-=0.7',
        )
        .to(
          '.hero-supporting-copy',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          '-=0.35',
        )
        .to(
          '.hero-actions-group',
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
          },
          '-=0.3',
        )
        .to(
          '.hero-interactive-deck',
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          '-=0.3',
        )
        .to(
          ['.hero-telemetry-strip', '.hero-footer-bar'],
          {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.25',
        );
    }, heroEl);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  const handleTogglePowerSurge = () => {
    setPowerSurge((prev) => !prev);
    setBurstRipple(Date.now());
  };

  const handleToggleReverseFlow = () => {
    setReverseFlow((prev) => !prev);
    setBurstRipple(Date.now());
  };

  const handleToggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  const handleChipClick = () => {
    soundFX.playSurge();
    setBurstRipple(Date.now());
    setPowerSurge((prev) => !prev);
  };

  const handleBoardClick = () => {
    soundFX.playClick();
    setBurstRipple(Date.now());
  };

  return (
    <section
      aria-labelledby="hero-headline"
      className="hero-section"
      id="top"
      ref={heroRef}
    >
      {/* Background Technical Grid with interactive cursor spotlight */}
      <div
        aria-hidden="true"
        className="hero-grid-overlay"
        style={{
          maskImage: `radial-gradient(circle 500px at ${mouseSpotlight.x}% ${mouseSpotlight.y}%, black 30%, rgba(0,0,0,0.15) 80%)`,
          WebkitMaskImage: `radial-gradient(circle 500px at ${mouseSpotlight.x}% ${mouseSpotlight.y}%, black 30%, rgba(0,0,0,0.15) 80%)`,
        }}
      />

      {/* Interactive Ambient Glow Orb that follows in reverse parallax */}
      <div
        aria-hidden="true"
        className="hero-ambient-orb"
        style={{
          transform: `translate3d(${(mouseSpotlight.x - 50) * 0.4}px, ${(mouseSpotlight.y - 50) * 0.4}px, 0)`,
        }}
      />

      {/* Interactive 3D PCB Canvas */}
      <div aria-hidden="true" className="hero-3d-container">
        <HeroCanvas
          autoRotate={autoRotate}
          burstRipple={burstRipple}
          onBoardClick={handleBoardClick}
          onChipClick={handleChipClick}
          onChipHover={setChipHovered}
          powerSurge={powerSurge}
          reducedMotion={reducedMotion}
          reverseFlow={reverseFlow}
          scrollProgress={scrollProgress}
        />
      </div>

      {/* Shadow Veil for text contrast protection */}
      <div aria-hidden="true" className="hero-contrast-veil" />

      {/* Foreground Hero Content */}
      <div className="hero-main-container">
        <HeroContent
          autoRotate={autoRotate}
          chipHovered={chipHovered}
          onToggleAutoRotate={handleToggleAutoRotate}
          onTogglePowerSurge={handleTogglePowerSurge}
          onToggleReverseFlow={handleToggleReverseFlow}
          powerSurge={powerSurge}
          reverseFlow={reverseFlow}
          society={society}
        />
      </div>

      {/* Bottom Specs & Indicator Bar */}
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 pb-8 pt-4">
        <div
          id="specs"
          className="grid grid-cols-2 divide-outline-variant border border-outline-variant bg-surface-container-lowest/90 backdrop-blur-md sm:grid-cols-4 sm:divide-x"
        >
          {[
            ['CLOCK RATE', metrics.clockRate ?? (powerSurge ? '480.000 MHz (OC)' : '240.000 MHz')],
            ['FACILITY', metrics.facility ?? 'Saloh Campus, Una [HP]'],
            ['INSTITUTION', metrics.institution ?? 'IIIT Una'],
            ['COUNCIL', metrics.council ?? 'Student Gymkhana'],
          ].map(([label, value]) => (
            <div key={label} className="border-outline-variant p-4 odd:border-r sm:odd:border-r-0">
              <span className="block font-label-xs text-label-xs uppercase tracking-widest text-outline">
                {label}
              </span>
              <span className="mt-1 block font-label-lg text-label-lg text-primary">{value}</span>
            </div>
          ))}
        </div>

        <div className="hero-footer-bar mt-6">
          <span>01 // SILICON ARCHITECTURE &amp; RF SIGNAL SYSTEMS</span>
          <a className="hero-scroll-indicator" href="#research">
            <span>SCROLL TO EXPLORE RESEARCH</span>
            <span className="hero-scroll-line" />
          </a>
        </div>
      </div>
    </section>
  );
}