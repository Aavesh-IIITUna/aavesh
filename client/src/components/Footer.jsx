import BrandMark from "./BrandMark"

const navigation = [
  ["Home", "#top"],
  ["Events", "#events"],
  ["Gallery", "#gallery"],
  ["Team", "#team"],
  ["Sponsors", "#sponsors"],
  ["Contact", "#contact"],
]

export default function Footer({ onReplayIntro, society }) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <BrandMark className="h-8 w-auto inline-block" />
          <div>
            <strong>{society?.shortName || "AAVESH"}</strong>
            <span>{society?.tagline || "Electronics & Technology Society"}</span>
            <span>{society?.institute || "IIIT Una"}</span>
          </div>
        </div>

        <nav aria-label="Footer navigation" className="footer-nav">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              className="text-xs uppercase tracking-wider text-[#FF1238] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left font-mono"
            >
              [Replay Intro]
            </button>
          )}
        </nav>

        <div className="footer-social" aria-label="Social connections">
          <span>Official Lab Frequency</span>
          <p>{society?.email || "aavesh@iiitu.ac.in"}</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>AAVESH // Indian Institute of Information Technology Una</span>
        <span>
          {society?.accreditation ||
            "An Institute of National Importance under Ministry of Education, Govt. of India"}
        </span>
      </div>
    </footer>
  )
}