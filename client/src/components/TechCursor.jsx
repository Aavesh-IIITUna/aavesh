import AaveshCursor from "./AaveshCursor"

/**
 * Backward compatibility wrapper:
 * Forwards TechCursor to the pixel-accurate AAVESH Custom Cursor System
 */
export default function TechCursor(props) {
  return <AaveshCursor {...props} />
}

export { AaveshCursor }
