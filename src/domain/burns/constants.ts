export type BurnAgeGroup = "adult" | "child";

export type BurnZone = {
  id: string;
  labelDa: string;
  labelEn: string;
  percent: number;
};

export const ADULT_FLUID_THRESHOLD_PERCENT = 20;
export const CHILD_FLUID_THRESHOLD_PERCENT = 10;
export const MODIFIED_PARKLAND_ML_PER_KG_PERCENT = 3;

export const ADULT_BURN_ZONES: BurnZone[] = [
  { id: "head", labelDa: "Hoved/hals", labelEn: "Head/neck", percent: 9 },
  { id: "frontTorso", labelDa: "Forbryst/mave", labelEn: "Anterior trunk", percent: 18 },
  { id: "backTorso", labelDa: "Ryg", labelEn: "Posterior trunk", percent: 18 },
  { id: "leftArm", labelDa: "Venstre arm", labelEn: "Left arm", percent: 9 },
  { id: "rightArm", labelDa: "Højre arm", labelEn: "Right arm", percent: 9 },
  { id: "leftLeg", labelDa: "Venstre ben", labelEn: "Left leg", percent: 18 },
  { id: "rightLeg", labelDa: "Højre ben", labelEn: "Right leg", percent: 18 },
  { id: "perineum", labelDa: "Perineum", labelEn: "Perineum", percent: 1 },
];

export const CHILD_BURN_ZONES: BurnZone[] = [
  { id: "head", labelDa: "Hoved/hals", labelEn: "Head/neck", percent: 18 },
  { id: "frontTorso", labelDa: "Forbryst/mave", labelEn: "Anterior trunk", percent: 18 },
  { id: "backTorso", labelDa: "Ryg", labelEn: "Posterior trunk", percent: 18 },
  { id: "leftArm", labelDa: "Venstre arm", labelEn: "Left arm", percent: 9 },
  { id: "rightArm", labelDa: "Højre arm", labelEn: "Right arm", percent: 9 },
  { id: "leftLeg", labelDa: "Venstre ben", labelEn: "Left leg", percent: 14 },
  { id: "rightLeg", labelDa: "Højre ben", labelEn: "Right leg", percent: 14 },
];
