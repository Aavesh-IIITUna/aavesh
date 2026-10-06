import { useState } from 'react';
import { navLinks } from '../data/content.js';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex w-full max-w-full items-center justify-between border-b border-outline-variant bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <a
          href="#top"
          className="flex items-center gap-2 font-label-lg text-label-lg font-medium uppercase tracking-widest text-primary"
        >
          <span className="inline-block h-1.5 w-1.5 bg-primary-container" aria-hidden="true" />
          AAVESH // IIIT UNA
        </a>
        <span className="hidden border border-outline-variant bg-surface-container-lowest px-2 py-0.5 font-label-xs text-label-xs text-outline lg:inline-block">
          [SYS_OK: 24.8&deg;C / 50Hz]
        </span>
      </div>

      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
        {navLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className={
              link.active
                ? 'border-b-2 border-primary-container py-1 font-label-md text-label-md text-primary'
                : 'py-1 font-label-md text-label-md text-on-surface-variant hover:text-primary'
            }
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <span className="hidden font-label-xs text-label-xs tracking-wider text-on-surface-variant sm:inline">
          31&deg;28&apos;48&quot;N 76&deg;11&apos;24&quot;E
        </span>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button
            type="button"
            className="p-1 text-on-surface-variant hover:text-primary"
            title="Terminal Access"
            aria-label="Terminal access"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              terminal
            </span>
          </button>
          <button
            type="button"
            className="p-1 text-on-surface-variant hover:text-primary"
            title="Sensory Telemetry"
            aria-label="Sensory telemetry"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              sensors
            </span>
          </button>
          <span className="ml-1 cursor-default border border-outline-variant bg-surface-container px-2 py-1 font-label-xs text-label-xs text-primary-container">
            [SYS_ACT]
          </span>
          <button
            type="button"
            className="p-1 text-on-surface-variant hover:text-primary md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {open ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-outline-variant bg-surface-container-lowest px-6 py-4 md:hidden"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-outline-variant py-2 font-label-md text-label-md text-on-surface-variant last:border-0 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}