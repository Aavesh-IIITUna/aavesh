export default function BrandMark({ className = "h-7 w-auto md:h-8", labelled = false }) {
  return (
    <img
      src="/images/aavesh-logo-white.png"
      alt={labelled ? "AAVESH" : ""}
      aria-hidden={labelled ? undefined : true}
      className={`inline-block object-contain max-h-10 align-middle ${className}`}
      loading="eager"
    />
  )
}
