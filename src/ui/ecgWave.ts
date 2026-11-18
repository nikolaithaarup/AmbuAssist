// Shared by the first-paint HTML splash and the hydrated web ECG loader.
export const ECG_PATH =
  "M 2 34 L 55 34 C 61 34 64 26 70 26 C 77 26 80 34 87 34 L 104 34 L 110 41 L 118 5 L 127 63 L 135 34 L 149 34 C 156 34 159 21 169 21 C 178 21 182 34 190 34 L 234 34";

export const ECG_STYLES = `
  .synapse-ecg { display: block; width: 236px; height: 68px; max-width: 100%; overflow: hidden; }
  .synapse-ecg path { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
  .synapse-ecg-guide { stroke-width: 1; stroke-opacity: 0.15; }
  .synapse-ecg-glow, .synapse-ecg-trace {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: synapse-ecg-draw 2.05s linear infinite;
  }
  .synapse-ecg-glow { stroke-width: 5; stroke-opacity: 0.18; }
  .synapse-ecg-trace { stroke-width: 2.2; }
  @keyframes synapse-ecg-draw {
    0%, 4% { stroke-dashoffset: 100; opacity: 1; }
    76%, 88% { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .synapse-ecg-glow, .synapse-ecg-trace {
      animation: none;
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
`;
