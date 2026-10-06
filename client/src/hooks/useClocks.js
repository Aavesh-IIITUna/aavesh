import { useEffect, useState } from 'react';

function formatClocks(now = new Date()) {
  const utc = `${now.toUTCString().split(' ')[4]}Z`;
  const ist = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
  });
  return { utc: `UTC: ${utc}`, ist: `IST: ${ist}` };
}

export function useClocks(enabled = true) {
  const [clocks, setClocks] = useState(() => formatClocks());

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setClocks(formatClocks()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return clocks;
}