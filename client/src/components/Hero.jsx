import { telemetryRows } from '../data/content.js';

export default function Hero({ society }) {
  const metrics = society?.metrics ?? {};

  return (
    <main
      id="top"
      className="mx-auto flex w-full max-w-[1400px] flex-grow flex-col justify-center px-6 py-12 lg:px-12 lg:py-20"
    >
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <span className="font-label-xs text-label-xs tracking-widest text-primary-container">
            [DIVISION: ECE]
          </span>
          <span className="text-label-xs text-outline-variant">/</span>
          <span className="font-label-xs text-label-xs tracking-wider text-on-surface-variant">
            01 // HARDWARE LABS &amp; SIGNAL SYSTEMS
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-label-xs text-label-xs tracking-wider text-outline">
            SECTOR: SALOH, UNA [HP]
          </span>
          <span className="border border-outline-variant bg-surface-container-lowest px-2 py-0.5 font-label-xs text-label-xs tracking-widest text-primary">
            EST. IIIT UNA
          </span>
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="font-headline-xl text-[64px] font-bold uppercase leading-[0.88] tracking-[-0.05em] text-primary sm:text-[96px] lg:text-[140px]">
            AAVESH
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-block h-px w-12 bg-primary-container" aria-hidden="true" />
            <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
              {society?.tagline ?? 'ELECTRONICS SOCIETY // IIIT UNA'}
            </p>
          </div>
        </div>

        <div className="corner-cross border border-outline-variant bg-surface-container-lowest p-6 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3 font-label-xs text-label-xs text-outline">
            <span>MODULE // STATUS</span>
            <span className="flex items-center gap-1.5 text-primary-container">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container"
                aria-hidden="true"
              />{' '}
              ACTIVE
            </span>
          </div>
          <div className="space-y-3 pt-4 font-label-xs text-label-xs text-on-surface-variant">
            {telemetryRows.map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-outline">{row.label}</span>
                <span className="font-mono text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-12 border-t border-outline-variant pt-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="mb-6 font-headline-md text-headline-md font-medium tracking-tight text-primary">
            Crafting silicon, signals, and systems at the edge of physical computing.
          </h2>
          <p className="max-w-2xl font-body-lg text-body-lg font-light text-on-surface-variant">
            {society?.mission}
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-8 lg:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-outline-variant bg-surface-container-lowest p-4">
              <span className="mb-1 block font-label-xs text-label-xs text-outline">
                01 / SUB-DOMAIN
              </span>
              <span className="block font-label-md text-label-md font-medium text-primary">
                VLSI &amp; SILICON
              </span>
              <span className="mt-2 block font-label-xs text-label-xs text-on-surface-variant">
                ASIC / FPGA Verification
              </span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-4">
              <span className="mb-1 block font-label-xs text-label-xs text-outline">
                02 / SUB-DOMAIN
              </span>
              <span className="block font-label-md text-label-md font-medium text-primary">
                EMBEDDED &amp; RF
              </span>
              <span className="mt-2 block font-label-xs text-label-xs text-on-surface-variant">
                SDR / Autonomous Nodes
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#hardware"
              className="flex items-center gap-2 bg-primary px-5 py-3 font-label-md text-label-md font-semibold tracking-wider text-background hover:bg-primary-container"
            >
              EXPLORE INITIATIVES <span aria-hidden="true">&rarr;</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-outline-variant bg-transparent px-4 py-3 font-label-md text-label-md tracking-wider text-on-surface hover:border-primary hover:text-primary"
            >
              GITHUB ARCHIVES <span aria-hidden="true">[&#8599;]</span>
            </a>
            <a
              href="#specs"
              className="border border-outline-variant bg-surface-container px-4 py-3 font-label-md text-label-md tracking-wider text-on-surface-variant hover:text-primary"
            >
              VIEW SPECS
            </a>
          </div>
        </div>
      </div>

      <div
        id="specs"
        className="grid grid-cols-2 divide-outline-variant border border-outline-variant bg-surface-container-lowest sm:grid-cols-4 sm:divide-x"
      >
        {[
          ['CLOCK RATE', metrics.clockRate ?? '50.000 Hz'],
          ['FACILITY', metrics.facility ?? 'Saloh Campus'],
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
    </main>
  );
}