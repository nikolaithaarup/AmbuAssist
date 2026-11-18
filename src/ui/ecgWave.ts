// Shared by the first-paint HTML splash and the hydrated web ECG loader.
export const ECG_PATH =
  "M 2 26 L 55 26 C 61 26 64 20 70 20 C 77 20 80 26 87 26 L 104 26 L 110 31 L 118 5 L 127 47 L 135 26 L 149 26 C 156 26 159 16 169 16 C 178 16 182 26 190 26 L 234 26";

export const ECG_STYLES = `
  .synapse-ecg { display: block; width: 236px; height: 52px; max-width: 100%; overflow: hidden; }
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
