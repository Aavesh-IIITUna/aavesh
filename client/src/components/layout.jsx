import Header from './Header.jsx';
import Footer from './Footer.jsx';

/**
 * Reusable Default Layout component for AAVESH
 * Wraps pages with standard Header, uplink telemetry banner, main content, and Footer.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to render within the layout
 * @param {Object} [props.society] - Society data (mission, socials, metrics)
 * @param {Array} [props.tracks] - Focus research tracks
 * @param {boolean} [props.live] - Status flag for server uplink
 * @param {boolean} [props.loading] - Whether society data is currently fetching
 * @param {boolean} [props.showStatus=true] - Whether to render top status uplink banner
 * @param {boolean} [props.showHeader=true] - Whether to render Header
 * @param {boolean} [props.showFooter=true] - Whether to render Footer
 * @param {string} [props.className] - Additional classes for root wrapper
 */
export default function DefaultLayout({
  children,
  society,
  tracks,
  live = false,
  loading = false,
  showStatus = true,
  showHeader = true,
  showFooter = true,
  className = '',
  onReplayIntro,
}) {
  return (
    <div
      className={`flex min-h-screen flex-col justify-between bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container ${className}`}
    >
      {showHeader && <Header />}

      {showStatus && !loading && (
        <aside
          aria-label="System uplink status"
          className="border-b border-outline-variant bg-surface-container-lowest px-6 py-1.5 text-center font-label-xs text-label-xs tracking-wider text-outline"
        >
          {live
            ? '[UPLINK: LIVE — SERVING FROM /api // TELEMETRY NORMAL]'
            : '[UPLINK: OFFLINE — SERVING STATIC FALLBACK // LOCAL CACHE ACTIVE]'}
        </aside>
      )}

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {showFooter && <Footer society={society} tracks={tracks} onReplayIntro={onReplayIntro} />}
    </div>
  );
}

// Named export alias for flexibility
export { DefaultLayout, DefaultLayout as Layout };
