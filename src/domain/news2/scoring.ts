export type SpO2Scale = 1 | 2;
export type Avpu = "A" | "V" | "P" | "U";

export function scoreRR(rr: number): number {
  if (!Number.isFinite(rr)) return 0;
  if (rr <= 8) return 3;
  if (rr <= 11) return 1;
  if (rr <= 20) return 0;
  if (rr <= 24) return 2;
  return 3;
}

export function scoreSBP(sbp: number): number {
  if (!Number.isFinite(sbp)) return 0;
  if (sbp <= 90) return 3;
  if (sbp <= 100) return 2;
  if (sbp <= 110) return 1;
  if (sbp <= 219) return 0;
  return 3;
}

export function scoreHR(hr: number): number {
  if (!Number.isFinite(hr)) return 0;
  if (hr <= 40) return 3;
  if (hr <= 50) return 1;
  if (hr <= 90) return 0;
  if (hr <= 110) return 1;
  if (hr <= 130) return 2;
  return 3;
}

export function scoreTemp(temp: number): number {
  if (!Number.isFinite(temp)) return 0;
  if (temp <= 35.0) return 3;
  if (temp <= 36.0) return 1;
  if (temp <= 38.0) return 0;
  if (temp <= 39.0) return 1;
  return 2;
}

export function scoreSpO2(
  scale: SpO2Scale,
  spo2: number,
  onO2: boolean,
): { spo2Points: number; o2Points: number } {
  const o2Points = onO2 ? 2 : 0;

  if (!Number.isFinite(spo2)) return { spo2Points: 0, o2Points };

  if (scale === 1) {
    if (spo2 <= 91) return { spo2Points: 3, o2Points };
    if (spo2 <= 93) return { spo2Points: 2, o2Points };
    if (spo2 <= 95) return { spo2Points: 1, o2Points };
    return { spo2Points: 0, o2Points };
  }

  if (spo2 <= 83) return { spo2Points: 3, o2Points };
  if (spo2 <= 85) return { spo2Points: 2, o2Points };
  if (spo2 <= 87) return { spo2Points: 1, o2Points };
  if (spo2 <= 92) return { spo2Points: 0, o2Points };
  if (spo2 <= 94) return { spo2Points: 1, o2Points };
  if (spo2 <= 96) return { spo2Points: 2, o2Points };
  return { spo2Points: 3, o2Points };
}

export function scoreConsciousness(avpu: Avpu): number {
  return avpu === "A" ? 0 : 3;
}

export function calculateNews2Total(parts: number[]): number {
  return parts.reduce((total, points) => total + points, 0);
}

export function hasAnyThree(parts: number[]): boolean {
  return parts.some((points) => points === 3);
}

export type News2Input = {
  rr: number;
  spo2: number;
  sbp: number;
  hr: number;
  temp: number;
  onO2: boolean;
  scale: SpO2Scale;
  avpu: Avpu;
};

export function calculateNews2(input: News2Input) {
  const pRR = scoreRR(input.rr);
  const { spo2Points, o2Points } = scoreSpO2(
    input.scale,
    input.spo2,
    input.onO2,
  );
  const pSBP = scoreSBP(input.sbp);
  const pHR = scoreHR(input.hr);
  const pT = scoreTemp(input.temp);
  const pC = scoreConsciousness(input.avpu);
  const parts = [pRR, spo2Points, o2Points, pSBP, pHR, pC, pT];

  return {
    total: calculateNews2Total(parts),
    anyThree: hasAnyThree(parts),
    pRR,
    spo2Points,
    o2Points,
    pSBP,
    pHR,
    pC,
    pT,
  };
}

export function classifyNews2Escalation(total: number, anyThree: boolean) {
  if (total === 0) return "news2_guidance_0";
  if (total >= 7) return "news2_guidance_high";
  if (anyThree) return "news2_guidance_any3";
  if (total >= 5) return "news2_guidance_med";
  return "news2_guidance_low";
}
