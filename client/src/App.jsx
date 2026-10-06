import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import { ContactSection, HardwareSection, RegistrySection, ResearchSection } from './components/Sections.jsx';
import { useSociety } from './hooks/useSociety.js';

export default function App() {
  const { society, tracks, projects, members, live, loading } = useSociety();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Header />
      {!loading && (
        <p className="border-b border-outline-variant bg-surface-container-lowest px-6 py-1.5 text-center font-label-xs text-label-xs tracking-wider text-outline">
          {live ? '[UPLINK: LIVE — SERVING FROM /api]' : '[UPLINK: OFFLINE — SERVING STATIC FALLBACK]'}
        </p>
      )}
      <Hero society={society} />
      <ResearchSection tracks={tracks} />
      <HardwareSection projects={projects} />
      <RegistrySection members={members} />
      <div className="pb-14">
        <ContactSection />
      </div>
      <Footer society={society} tracks={tracks} />
    </div>
  );
}