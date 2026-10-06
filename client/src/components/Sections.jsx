import { useState } from 'react';
import { api, ApiRequestError } from '../lib/api.js';

function SectionShell({ id, index, eyebrow, title, blurb, children }) {
  return (
    <section id={id} className="mx-auto w-full max-w-[1400px] scroll-mt-20 px-6 lg:px-12">
      <div className="border-t border-outline-variant py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-label-xs text-label-xs tracking-widest text-primary-container">
              {`[${index} // ${eyebrow}]`}
            </p>
            <h2 className="font-headline-md text-headline-md font-medium tracking-tight text-primary">
              {title}
            </h2>
          </div>
          {blurb && (
            <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">{blurb}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function ResearchSection({ tracks }) {
  return (
    <SectionShell
      id="research"
      index="02"
      eyebrow="RESEARCH TRACKS"
      title="Four lanes from atoms to autonomy."
      blurb="Each track pairs theory with tapeouts, bench time, and field deployments led by student nodes."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(tracks ?? []).map((track, i) => (
          <article
            key={track.code ?? track.title ?? i}
            className="border border-outline-variant bg-surface-container-lowest p-5"
          >
            <p className="mb-3 font-label-xs text-label-xs text-outline">
              {(track.code ?? String(i + 1).padStart(2, '0'))} / TRACK
            </p>
            <h3 className="font-label-md text-label-md font-medium text-primary">{track.title}</h3>
            {track.description && (
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                {track.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function HardwareSection({ projects }) {
  return (
    <SectionShell
      id="hardware"
      index="03"
      eyebrow="HARDWARE INITIATIVES"
      title="Built on benches, validated in the field."
      blurb="Live registry is served from MongoDB via /api/projects with a static fallback for offline builds."
    >
      <div id="initiatives" className="grid scroll-mt-20 grid-cols-1 gap-4 lg:grid-cols-3">
        {(projects ?? []).map((project) => (
          <article
            key={project.slug ?? project.title}
            className="flex flex-col justify-between border border-outline-variant bg-surface-container-lowest p-5"
          >
            <div>
              <div className="mb-3 flex items-center justify-between font-label-xs text-label-xs">
                <span className="text-outline">{project.track ?? 'GENERAL'}</span>
                <span className="border border-outline-variant px-1.5 py-0.5 text-primary-container">
                  [{(project.status ?? 'active').toUpperCase()}]
                </span>
              </div>
              <h3 className="font-label-lg text-label-lg font-medium text-primary">
                {project.title}
              </h3>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                {project.summary}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(project.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="border border-outline-variant px-1.5 py-0.5 font-label-xs text-label-xs text-on-surface-variant"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function RegistrySection({ members }) {
  return (
    <SectionShell
      id="registry"
      index="04"
      eyebrow="NODE REGISTRY"
      title="128 validated nodes. Core maintainers below."
      blurb="Membership roster is served from MongoDB via /api/members."
    >
      <div className="overflow-x-auto border border-outline-variant">
        <table className="w-full min-w-[560px] border-collapse bg-surface-container-lowest font-label-xs text-label-xs">
          <thead>
            <tr className="border-b border-outline-variant text-left text-outline">
              <th className="px-4 py-3 font-medium">NODE</th>
              <th className="px-4 py-3 font-medium">ROLE</th>
              <th className="px-4 py-3 font-medium">TRACK</th>
              <th className="px-4 py-3 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-variant">
            {(members ?? []).map((member) => (
              <tr
                key={member.name}
                className="border-b border-outline-variant last:border-0 hover:bg-surface-container"
              >
                <td className="px-4 py-3 text-primary">{member.name}</td>
                <td className="px-4 py-3">{member.role ?? '—'}</td>
                <td className="px-4 py-3">{member.track ?? '—'}</td>
                <td className="px-4 py-3 text-primary-container">[ACTIVE]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}

const initialForm = { name: '', email: '', subject: 'General', message: '' };

export function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ kind: 'idle', text: '' });

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    setStatus({ kind: 'busy', text: 'TRANSMITTING…' });
    try {
      await api.sendMessage(form);
      setForm(initialForm);
      setStatus({ kind: 'ok', text: '[ACK] MESSAGE LOGGED. WE RESPOND WITHIN 48H.' });
    } catch (err) {
      const detail =
        err instanceof ApiRequestError && err.details
          ? ` — ${err.details.join('; ')}`
          : ' — API OFFLINE. RETRY AFTER `npm run dev`.';
      setStatus({ kind: 'error', text: `[NACK] ${err.message}${detail}` });
    }
  }

  const inputClass =
    'w-full border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary placeholder:text-outline focus:border-primary-container focus:outline-none';

  return (
    <SectionShell
      id="contact"
      index="05"
      eyebrow="UPLINK // CONTACT"
      title="Open a channel to the lab."
      blurb="POST /api/contact persists to MongoDB. Validation errors surface inline without losing input."
    >
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-4 border border-outline-variant bg-surface-container-lowest p-6 lg:grid-cols-2"
      >
        <label className="block">
          <span className="mb-1.5 block font-label-xs text-label-xs text-outline">CALLSIGN / NAME *</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={set('name')}
            placeholder="Ada Lovelace"
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-label-xs text-label-xs text-outline">FREQUENCY / EMAIL *</span>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@iiitu.ac.in"
            required
            autoComplete="email"
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block font-label-xs text-label-xs text-outline">SUBJECT</span>
          <input
            className={inputClass}
            value={form.subject}
            onChange={set('subject')}
            placeholder="Collaboration / Sponsorship / Join request"
            maxLength={140}
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block font-label-xs text-label-xs text-outline">PAYLOAD / MESSAGE *</span>
          <textarea
            className={`${inputClass} min-h-[140px] resize-y`}
            value={form.message}
            onChange={set('message')}
            placeholder="Describe your build, timeline, and what you need from the lab…"
            required
            maxLength={4000}
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
          <button
            type="submit"
            disabled={status.kind === 'busy'}
            className="bg-primary px-5 py-3 font-label-md text-label-md font-semibold tracking-wider text-background hover:bg-primary-container disabled:opacity-60"
          >
            {status.kind === 'busy' ? 'TRANSMITTING…' : 'TRANSMIT MESSAGE →'}
          </button>
          <p
            role="status"
            aria-live="polite"
            className={
              status.kind === 'error'
                ? 'font-label-xs text-label-xs text-error'
                : 'font-label-xs text-label-xs text-primary-container'
            }
          >
            {status.text || '[IDLE] CHANNEL OPEN.'}
          </p>
        </div>
      </form>
    </SectionShell>
  );
}