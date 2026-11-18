import React from "react";
import { ECG_PATH, ECG_STYLES } from "./ecgWave";

type EcgLoaderProps = { color: string };

/** Animated sinus beat shared with the HTML shown before React boots. */
export default function EcgLoader({ color }: EcgLoaderProps) {
  return (
    <svg
      className="synapse-ecg"
      width="236"
      height="52"
      viewBox="0 0 236 52"
      aria-hidden="true"
      focusable="false"
      style={{ color }}
    >
      <style>{ECG_STYLES}</style>
      <path className="synapse-ecg-guide" d="M 2 26 L 234 26" />
      <path className="synapse-ecg-glow" d={ECG_PATH} pathLength={100} />
      <path className="synapse-ecg-trace" d={ECG_PATH} pathLength={100} />
    </svg>
  );
}
