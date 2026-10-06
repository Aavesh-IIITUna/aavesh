import { useClocks } from '../hooks/useClocks.js';

export default function Footer({ society, tracks }) {
  const { utc, ist } = useClocks(true);
  const socials = society?.socials ?? {};
  const socialEntries = [
    ['GITHUB', socials.github ?? 'https://github.com'],
    ['LINKEDIN', socials.linkedin ?? 'https://linkedin.com'],
    ['DISCORD', socials.discord ?? 'https://discord.com'],
    ['INSTAGRAM', socials.instagram ?? 'https://instagram.com'],
  ];

  return (
    <footer className="flex w-full flex-col items-start justify-between gap-8 border-t border-outline-variant bg-surface-container-lowest px-6 py-8">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-6 font-label-xs text-label-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-widest text-primary">[AAVESH_LABS]</span>
          <span className="text-outline">HARDWARE &amp; SIGNAL INTELLIGENCE DIVISION</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {[
            ['[INDEX]', '#top'],
            ['[VLSI_ARCH]', '#research'],
            ['[SIGNAL_LAB]', '#hardware'],
            ['[DOCS]', '#specs'],
            ['[GITHUB]', 'https://github.com'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-on-surface-variant underline hover:text-primary-fixed-dim"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 font-body-md text-body-md md:grid-cols-12">
        <div className="space-y-4 md:col-span-5">
          <span className="block font-label-xs text-label-xs uppercase tracking-widest text-primary-container">
            {'// SOCIETY MISSION'}
          </span>
          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            {society?.mission}
          </p>
          <div className="space-y-1 pt-2 font-label-xs text-label-xs text-outline">
            <p>{society?.institute ?? 'Indian Institute of Information Technology Una'}</p>
            <p>{society?.accreditation}</p>
          </div>
        </div>

        <div className="space-y-4 md:col-span-3">
          <span className="block font-label-xs text-label-xs uppercase tracking-widest text-primary-container">
            {'// FOCUS TRACKS'}
          </span>
          <ul className="space-y-2 font-label-xs text-label-xs text-on-surface-variant">
            {(tracks ?? []).map((track, i) => (
              <li key={track.code ?? track.title ?? i} className="flex items-center gap-2">
                <span className="font-mono text-outline-variant">
                  {track.code ?? String(i + 1).padStart(2, '0')}.
                </span>
                <span>{track.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 md:col-span-4">
          <span className="block font-label-xs text-label-xs uppercase tracking-widest text-primary-container">
            {'// TELEMETRY & COMMS'}
          </span>
          <div className="space-y-1 font-mono font-label-xs text-label-xs text-on-surface-variant">
            <p className="text-primary">COORDS: 31&deg;28&apos;48&quot;N 76&deg;11&apos;24&quot;E</p>
            <p>LOC: Saloh, Una, Himachal Pradesh - 177209</p>
            <p>
              COMM:{' '}
              <a className="text-primary hover:underline" href={`mailto:${society?.email}`}>
                {society?.email}
              </a>
            </p>
            <p>
              INSTITUTE:{' '}
              <a
                className="text-primary hover:underline"
                href={society?.instituteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                iiitu.ac.in
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 font-label-xs text-label-xs">
            {socialEntries.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-outline-variant px-2 py-1 text-on-surface hover:border-primary hover:text-primary"
              >
                [{label}]
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant pt-6 font-label-xs text-label-xs text-on-surface-variant sm:flex-row">
        <div>&copy; 2025 AAVESH IIIT UNA. ALL RIGHTS RESERVED. HARDWARE &amp; SIGNAL INTELLIGENCE DIVISION.</div>
        <div className="flex items-center gap-4 font-mono text-outline">
          <span>{utc}</span>
          <span aria-hidden="true">&bull;</span>
          <span>{ist}</span>
          <span className="border border-outline-variant bg-surface-container px-1.5 py-0.5 text-primary-container">
            [CORE_STABLE]
          </span>
        </div>
      </div>
    </footer>
  );
}